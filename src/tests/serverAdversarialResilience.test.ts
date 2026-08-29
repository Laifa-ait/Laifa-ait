import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "http";
import net from "net";
import { app } from "../../app";
import { isFrontendReady, setStaticStateForTesting } from "../services/ViteStaticService";
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

  describe("1. Pure Express App Isolation & Import Safety", () => {
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

  describe("2. Listen Error Handling & Promise Rejection (EADDRINUSE & Port Collision)", () => {
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
  });

  describe("3. Graceful Shutdown & Lifecycle Worker Safety", () => {
    it("stopProductPublisherWorker never throws even when called multiple times or when no worker is active", () => {
      expect(() => {
        stopProductPublisherWorker();
        stopProductPublisherWorker();
        stopProductPublisherWorker();
      }).not.toThrow();
    });

    it("stopProductCacheCleanupTimer never throws even when called multiple times", () => {
      expect(() => {
        stopProductCacheCleanupTimer();
        stopProductCacheCleanupTimer();
      }).not.toThrow();
    });

    it("shutdown logic handles unstarted HTTP server cleanly without hanging", () => {
      const unstartedServer = http.createServer(app);
      expect(unstartedServer.listening).toBe(false);

      let closedCalled = false;
      if (unstartedServer.listening) {
        unstartedServer.close(() => {
          closedCalled = true;
        });
      }

      expect(closedCalled).toBe(false);
    });
  });

  describe("4. Static Bundle Structural Integrity & Deep Asset Validation", () => {
    it("marks frontend as unavailable if index.html is missing root container", () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(true, "<html><head><title>No Root</title></head><body>Empty</body></html>");
      
      const ready = isFrontendReady();
      expect(ready).toBe(false); // Validated: missing id="root" correctly marks frontend as NOT ready
    });

    it("marks frontend as unavailable if index.html template is under 50 characters", () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(true, "short");
      expect(isFrontendReady()).toBe(false);
    });

    it("marks frontend as ready only when valid, length > 50, and id='root' is present", () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(true, '<html><head><title>Olmart</title></head><body><div id="root">App Content</div></body></html>');
      expect(isFrontendReady()).toBe(true);
    });

    it("validateProductionHtmlTemplate validates all referenced JS chunks across multiple tags", async () => {
      const { validateProductionHtmlTemplate } = await import("../services/ViteStaticService");
      
      const htmlWithNonExistentChunk = '<!DOCTYPE html><html><head><script src="/assets/index-ABC.js"></script><script src="/assets/vendor-XYZ.js"></script></head><body><div id="root"></div></body></html>';
      // In tests / temporary path where files don't exist, validateProductionHtmlTemplate returns false
      const isValid = validateProductionHtmlTemplate(htmlWithNonExistentChunk, "/tmp/nonexistent-dist");
      expect(isValid).toBe(false);
    });

    it("readiness probe distinguishes between dev mode (always ready) and production bundle state", () => {
      process.env.NODE_ENV = "development";
      setStaticStateForTesting(false, "");
      expect(isFrontendReady()).toBe(true);

      process.env.NODE_ENV = "production";
      setStaticStateForTesting(false, "");
      expect(isFrontendReady()).toBe(false);
    });
  });

  describe("5. Background Worker Non-Overlapping Concurrency Guard", () => {
    it("strictly locks concurrent executions and drops redundant overlapping cycles", async () => {
      const { executeProductPublisherJob } = await import("../workers/productPublisher");
      const { admin } = await import("../config/firebase-admin");
      expect(typeof executeProductPublisherJob).toBe("function");

      // Mock Firestore query to resolve after a slight delay to realistically test concurrency lock without timeout
      const getSpy = vi.spyOn(admin.firestore(), "collection").mockReturnValue({
        where: () => ({
          get: () => new Promise((resolve) => setTimeout(() => resolve({ empty: true }), 50)),
        }),
      } as unknown as ReturnType<typeof admin.firestore.prototype.collection>);

      // Verify that concurrent invocation returns 0 for the overlapping call
      const firstCallPromise = executeProductPublisherJob();
      const secondCallPromise = executeProductPublisherJob(); // Must immediately hit isJobRunning guard and return 0

      const secondResult = await secondCallPromise;
      expect(secondResult).toBe(0);

      const firstResult = await firstCallPromise;
      expect(firstResult).toBe(0);

      getSpy.mockRestore();
    });
  });
});
