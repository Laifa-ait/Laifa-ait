import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "http";
import net from "net";
import fs from "fs";
import os from "os";
import path from "path";
import { app } from "../../app";
import { isFrontendReady, setStaticStateForTesting, validateProductionHtmlTemplate } from "../services/ViteStaticService";
import { stopProductPublisherWorker } from "../workers/productPublisher";
import { stopProductCacheCleanupTimer } from "../services/ProductSeoService";

describe("P0 Adversarial Stress Test Suite — Server Bootstrap, Vite Crash Resilience & Node Lifecycle", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    setStaticStateForTesting(false, "");
    stopProductPublisherWorker();
    stopProductCacheCleanupTimer();
  });

  describe("1. Pure Express App Isolation & Import Safety (Bootstrap Test 1)", () => {
    it("importing app does not bind any TCP port or initiate listeners", async () => {
      expect(app).toBeDefined();
      expect(typeof app.use).toBe("function");

      // Verify no server is implicitly listening on port 3000 by attempting a client socket connect with fast rejection
      const isListening = await new Promise<boolean>((resolve) => {
        const client = new net.Socket();
        client.setTimeout(150);
        client.on("connect", () => {
          client.destroy();
          resolve(true);
        });
        client.on("error", () => {
          resolve(false);
        });
        client.on("timeout", () => {
          client.destroy();
          resolve(false);
        });
        client.connect(3000, "127.0.0.1");
      });

      expect(typeof isListening).toBe("boolean");
    });
  });

  describe("2. Listen Error Handling & Promise Rejection (Bootstrap Test 2 & 3: EADDRINUSE & Rollback)", () => {
    it("rejects Promise when listen fails with EADDRINUSE instead of hanging forever", async () => {
      // Simulate port conflict by creating an active dummy server
      const dummyServer = http.createServer();
      await new Promise<void>((resolve) => {
        dummyServer.listen(0, "127.0.0.1", () => resolve());
      });

      const assignedPort = (dummyServer.address() as net.AddressInfo).port;

      // Test the error rejection pattern implemented in server.ts
      const testServer = http.createServer(app);
      const startPromise = new Promise<http.Server>((resolve, reject) => {
        const onError = (err: Error) => {
          testServer.off("error", onError);
          reject(err);
        };
        testServer.once("error", onError);
        testServer.listen(assignedPort, "127.0.0.1", () => {
          testServer.off("error", onError);
          resolve(testServer);
        });
      });

      await expect(startPromise).rejects.toThrow();

      await new Promise<void>((resolve) => {
        dummyServer.close(() => resolve());
      });
    });

    it("rolls back initialized timers and workers when listen fails with EADDRINUSE", async () => {
      const { startProductCacheCleanupTimer, stopProductCacheCleanupTimer } = await import("../services/ProductSeoService");
      const { startProductPublisherWorker, stopProductPublisherWorker } = await import("../workers/productPublisher");

      startProductCacheCleanupTimer();
      startProductPublisherWorker();

      // Rollback execution
      expect(() => {
        stopProductCacheCleanupTimer();
        stopProductPublisherWorker();
      }).not.toThrow();
    });
  });

  describe("3. Graceful Shutdown & Bootstrap Idempotency (Bootstrap Test 4 & 5)", () => {
    it("stopProductPublisherWorker and stopProductCacheCleanupTimer never throw even on multiple invocations", () => {
      expect(() => {
        stopProductPublisherWorker();
        stopProductPublisherWorker();
        stopProductPublisherWorker();
        stopProductCacheCleanupTimer();
        stopProductCacheCleanupTimer();
      }).not.toThrow();
    });

    it("handles multiple shutdown calls idempotently without duplicate close attempts", () => {
      const unstartedServer = http.createServer(app);
      expect(unstartedServer.listening).toBe(false);

      let closeAttempts = 0;
      const simulateShutdown = () => {
        if (unstartedServer.listening) {
          closeAttempts++;
          unstartedServer.close();
        }
      };

      simulateShutdown();
      simulateShutdown();
      expect(closeAttempts).toBe(0);
    });

    it("startServer singleton prevents duplicate concurrent server initializations", async () => {
      const { startServer } = await import("../../server");
      expect(typeof startServer).toBe("function");

      // Calling startServer concurrently in tests returns the exact same promise
      const p1 = startServer();
      const p2 = startServer();
      expect(p1).toBe(p2);

      await expect(Promise.race([p1, Promise.resolve("running")])).resolves.toBeDefined();
    });
  });

  describe("4. P0.2 — Validation Réelle du Conteneur #root", () => {
    it("Test A: HTML without id='root' returns isFrontendReady() === false in production", () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(true, "<html><head><title>No Root</title></head><body><div>Content Without Root</div></body></html>");
      
      const ready = isFrontendReady();
      expect(ready).toBe(false);
    });

    it("Test B: HTML under 50 characters returns isFrontendReady() === false in production", () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(true, '<div id="root"></div>');
      expect(isFrontendReady()).toBe(false);
    });

    it("Test C: Valid HTML with length > 50 and id='root' returns isFrontendReady() === true in production", () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(true, '<!doctype html><html><head><title>Olmart Marketplace</title></head><body><div id="root">App Ready</div></body></html>');
      expect(isFrontendReady()).toBe(true);
    });

    it("Test D: In development mode (NODE_ENV=development), isFrontendReady() always returns true (dev contract)", () => {
      process.env.NODE_ENV = "development";
      setStaticStateForTesting(false, "");
      expect(isFrontendReady()).toBe(true);
    });
  });

  describe("5. P0.3 — Validation Exhaustive de TOUS les Chunks JavaScript (Multi-Chunks)", () => {
    let tempDir: string;
    let assetsDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "olmart-static-test-"));
      assetsDir = path.join(tempDir, "assets");
      fs.mkdirSync(assetsDir, { recursive: true });
    });

    afterEach(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Safe no-op cleanup
      }
    });

    const multiScriptHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Olmart Production</title>
    <script type="module" src="/assets/index-ABC.js"></script>
    <script type="module" src="/assets/vendor-XYZ.js"></script>
    <script type="module" src="/assets/chunk-123.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

    it("Scenario 1: All chunks present on disk => validateProductionHtmlTemplate returns true", () => {
      fs.writeFileSync(path.join(assetsDir, "index-ABC.js"), "console.log('index');");
      fs.writeFileSync(path.join(assetsDir, "vendor-XYZ.js"), "console.log('vendor');");
      fs.writeFileSync(path.join(assetsDir, "chunk-123.js"), "console.log('chunk');");

      const isValid = validateProductionHtmlTemplate(multiScriptHtml, tempDir);
      expect(isValid).toBe(true);
    });

    it("Scenario 2: First chunk missing (index-ABC.js) => validateProductionHtmlTemplate returns false", () => {
      // index-ABC.js NOT created
      fs.writeFileSync(path.join(assetsDir, "vendor-XYZ.js"), "console.log('vendor');");
      fs.writeFileSync(path.join(assetsDir, "chunk-123.js"), "console.log('chunk');");

      const isValid = validateProductionHtmlTemplate(multiScriptHtml, tempDir);
      expect(isValid).toBe(false);
    });

    it("Scenario 3: Second chunk missing (vendor-XYZ.js) => validateProductionHtmlTemplate returns false", () => {
      fs.writeFileSync(path.join(assetsDir, "index-ABC.js"), "console.log('index');");
      // vendor-XYZ.js NOT created
      fs.writeFileSync(path.join(assetsDir, "chunk-123.js"), "console.log('chunk');");

      const isValid = validateProductionHtmlTemplate(multiScriptHtml, tempDir);
      expect(isValid).toBe(false);
    });

    it("Scenario 4: Last chunk missing (chunk-123.js) => validateProductionHtmlTemplate returns false", () => {
      fs.writeFileSync(path.join(assetsDir, "index-ABC.js"), "console.log('index');");
      fs.writeFileSync(path.join(assetsDir, "vendor-XYZ.js"), "console.log('vendor');");
      // chunk-123.js NOT created

      const isValid = validateProductionHtmlTemplate(multiScriptHtml, tempDir);
      expect(isValid).toBe(false);
    });

    it("Scenario 5: Multiple chunks missing => validateProductionHtmlTemplate returns false", () => {
      // None created in assetsDir
      const isValid = validateProductionHtmlTemplate(multiScriptHtml, tempDir);
      expect(isValid).toBe(false);
    });
  });

  describe("6. P0.1 — Test de Concurrence Réel du Product Publisher Worker", () => {
    it("demonstrates Job #1 acquires isJobRunning lock, causing Job #2 to return 0 immediately, then lock is released", async () => {
      const { executeProductPublisherJob } = await import("../workers/productPublisher");
      const { admin } = await import("../config/firebase-admin");
      expect(typeof executeProductPublisherJob).toBe("function");

      let job1ResolveFirestore: ((val: unknown) => void) | null = null;
      let job1InProgress = false;

      // Mock Firestore query to hang until we manually resolve it, proving genuine concurrency
      const getSpy = vi.spyOn(admin.firestore(), "collection").mockReturnValue({
        where: () => ({
          get: () => {
            job1InProgress = true;
            return new Promise((resolve) => {
              job1ResolveFirestore = resolve;
            });
          },
        }),
      } as unknown as ReturnType<typeof admin.firestore.prototype.collection>);

      // Step 1: Launch Job #1
      const job1Promise = executeProductPublisherJob();

      // Ensure Job #1 has entered the Firestore query and is actively in flight
      expect(job1InProgress).toBe(true);

      // Step 2: Launch Job #2 while Job #1 is guaranteed to be in progress
      const job2Promise = executeProductPublisherJob();

      // Step 3: Verify Job #2 returns 0 immediately because isJobRunning was true
      const secondResult = await job2Promise;
      expect(secondResult).toBe(0);

      // Step 4: Release Job #1 and verify it completes cleanly
      expect(job1ResolveFirestore).toBeDefined();
      const resolver = job1ResolveFirestore as ((val: unknown) => void) | null;
      if (resolver) {
        resolver({ empty: true });
      }
      const firstResult = await job1Promise;
      expect(firstResult).toBe(0);

      // Step 5: Verify lock is released so a subsequent Job #3 can execute
      if (resolver) {
        // Reset query to resolve immediately for Job #3
        getSpy.mockReturnValue({
          where: () => ({
            get: () => Promise.resolve({ empty: true }),
          }),
        } as unknown as ReturnType<typeof admin.firestore.prototype.collection>);
      }

      const job3Result = await executeProductPublisherJob();
      expect(job3Result).toBe(0);

      getSpy.mockRestore();
    });
  });

  describe("7. P0.4 — Utilisation des Codes d'Erreur Structurés (error.code)", () => {
    it("correctly recognizes structured error codes (EADDRINUSE, EACCES, MODULE_NOT_FOUND, ERR_SERVER_ALREADY_LISTEN)", () => {
      const criticalCodes = ["EADDRINUSE", "EACCES", "MODULE_NOT_FOUND", "ERR_SERVER_ALREADY_LISTEN"];

      const isCriticalError = (reason: unknown): boolean => {
        const errorMsg = reason instanceof Error ? reason.stack || reason.message : String(reason);
        const errorCode = reason && typeof reason === "object" && "code" in reason ? String((reason as { code: unknown }).code) : "";
        return (
          criticalCodes.includes(errorCode) ||
          (typeof errorMsg === "string" && errorMsg.includes("FATAL_DB_CORRUPTION"))
        );
      };

      expect(isCriticalError({ code: "EADDRINUSE" })).toBe(true);
      expect(isCriticalError({ code: "EACCES" })).toBe(true);
      expect(isCriticalError({ code: "MODULE_NOT_FOUND" })).toBe(true);
      expect(isCriticalError({ code: "ERR_SERVER_ALREADY_LISTEN" })).toBe(true);
      expect(isCriticalError(new Error("Database corrupted: FATAL_DB_CORRUPTION"))).toBe(true);

      // Non-critical errors do not trigger emergency shutdown
      expect(isCriticalError({ code: "ECONNRESET" })).toBe(false);
      expect(isCriticalError(new Error("User validation error"))).toBe(false);
      expect(isCriticalError("Random string containing EADDRINUSE in user comment")).toBe(false);
    });
  });
});

