import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeResilientCall, resilientFetch, CircuitBreaker, CircuitState, googleCircuitBreaker, geminiCircuitBreaker } from "../utils/resilientFetch";
import { withExponentialBackoff } from "../utils/retry";
import { readFileAsDataUrlWithTimeout } from "../services/googleWorkspace";
import { ai, setInternalGenerateContentForTesting, setGeminiTimeoutsForTesting, DEFAULT_GEMINI_MODEL } from "../config/gemini";
import {
  verifyAndFixDb,
  db,
  FirebaseInitState,
  getFirebaseInitState,
  isFirebaseReady,
  setFirebaseInitStateForTesting,
} from "../config/firebase-admin";
import { validateExternalUrl } from "../utils/security";

describe("Network Resiliency, Timeouts, AbortSignal & Circuit Breaker Suite (LOT 2A)", () => {
  beforeEach(() => {
    vi.useRealTimers();
    googleCircuitBreaker.reset();
    geminiCircuitBreaker.reset();
    setFirebaseInitStateForTesting(FirebaseInitState.READY, null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. executeResilientCall & AbortSignal Propagation", () => {
    it("propagates AbortSignal to underlying operation on per-attempt timeout", async () => {
      let abortedReceived = false;

      const slowOperation = async (signal: AbortSignal) => {
        return new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => {
            abortedReceived = true;
            reject(new Error("aborted"));
          });
        });
      };

      await expect(
        executeResilientCall(slowOperation, {
          timeoutMs: 50,
          maxRetries: 1,
          totalDeadlineMs: 200,
        })
      ).rejects.toThrow();

      expect(abortedReceived).toBe(true);
    });

    it("enforces total global deadline even if retries have not reached maxRetries", async () => {
      let attemptsCount = 0;

      const failingOperation = async () => {
        attemptsCount++;
        const err = Object.assign(new Error("Simulated network drop"), { status: 503 });
        throw err;
      };

      const start = Date.now();
      await expect(
        executeResilientCall(failingOperation, {
          timeoutMs: 500,
          baseDelayMs: 40,
          maxRetries: 10,
          totalDeadlineMs: 120, // Deadline shorter than doing 10 retries
          operationName: "TestDeadline",
        })
      ).rejects.toThrow(/deadline/i);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500); // Proves it didn't do 10 retries
      expect(attemptsCount).toBeGreaterThanOrEqual(1);
    });

    it("does not retry non-transient errors like 400 or permission-denied", async () => {
      let attempts = 0;
      const nonTransientOp = async () => {
        attempts++;
        const err = Object.assign(new Error("Bad Request"), { status: 400 });
        throw err;
      };

      await expect(
        executeResilientCall(nonTransientOp, {
          maxRetries: 3,
          timeoutMs: 100,
        })
      ).rejects.toThrow("Bad Request");

      expect(attempts).toBe(1);
    });
  });

  describe("2. withExponentialBackoff Adapter", () => {
    it("successfully runs operation with default resilient parameters", async () => {
      let count = 0;
      const res = await withExponentialBackoff(async () => {
        count++;
        return `success-${count}`;
      });
      expect(res).toBe("success-1");
    });
  });

  describe("3. Circuit Breaker Mechanics", () => {
    it("transitions from CLOSED to OPEN after failure threshold", () => {
      const cb = new CircuitBreaker("TestService", { failureThreshold: 3, resetTimeoutMs: 100 });
      expect(cb.getState()).toBe(CircuitState.CLOSED);

      cb.recordFailure();
      expect(cb.getState()).toBe(CircuitState.CLOSED);
      cb.recordFailure();
      expect(cb.getState()).toBe(CircuitState.CLOSED);
      cb.recordFailure();
      expect(cb.getState()).toBe(CircuitState.OPEN);
    });

    it("fast-fails immediately when Circuit is OPEN without invoking network", async () => {
      const cb = new CircuitBreaker("TestService", { failureThreshold: 1, resetTimeoutMs: 5000 });
      cb.recordFailure();
      expect(cb.getState()).toBe(CircuitState.OPEN);

      let fetchInvoked = false;
      const mockFetch = vi.fn().mockImplementation(() => {
        fetchInvoked = true;
        return Promise.resolve(new Response(JSON.stringify({ ok: true })));
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(
        resilientFetch("https://api.example.com/test", {}, { circuitBreaker: cb })
      ).rejects.toThrow(/Circuit is OPEN/);

      expect(fetchInvoked).toBe(false);
    });

    it("maintains independent states between Google and Gemini circuit breakers", () => {
      googleCircuitBreaker.reset();
      geminiCircuitBreaker.reset();

      for (let i = 0; i < 5; i++) {
        geminiCircuitBreaker.recordFailure();
      }

      expect(geminiCircuitBreaker.getState()).toBe(CircuitState.OPEN);
      expect(googleCircuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe("4. Gemini AI Resiliency & AbortSignal Suite", () => {
    afterEach(() => {
      setInternalGenerateContentForTesting(undefined);
      setGeminiTimeoutsForTesting(12000, 25000);
    });

    it("successfully generates content when upstream model responds normally", async () => {
      const mockGenerate = vi.fn().mockResolvedValue({
        text: "Generated response from Gemini",
      });
      setInternalGenerateContentForTesting(mockGenerate as unknown as Parameters<typeof setInternalGenerateContentForTesting>[0]);

      const result = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: "Test prompt",
      });

      expect(result.text).toBe("Generated response from Gemini");
      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    it("passes config.abortSignal to @google/genai on every attempt", async () => {
      let receivedSignal: AbortSignal | undefined;

      const mockGenerate = vi.fn().mockImplementation(async (params) => {
        receivedSignal = params.config?.abortSignal;
        return { text: "Signal validated" };
      });
      setInternalGenerateContentForTesting(mockGenerate as unknown as Parameters<typeof setInternalGenerateContentForTesting>[0]);

      const res = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: "Test",
      });

      expect(res.text).toBe("Signal validated");
      expect(receivedSignal).toBeDefined();
      expect(receivedSignal?.aborted).toBe(false);
      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    it("immediately throws non-transient 400 Bad Request without retry loops", async () => {
      const mockGenerate = vi.fn().mockImplementation(async () => {
        const err = Object.assign(new Error("Invalid prompt arguments"), { status: 400 });
        throw err;
      });
      setInternalGenerateContentForTesting(mockGenerate as unknown as Parameters<typeof setInternalGenerateContentForTesting>[0]);

      await expect(
        ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents: "Bad input",
        })
      ).rejects.toThrow("Invalid prompt arguments");

      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    it("retries with fallback model on transient 503 error", async () => {
      let attempt = 0;
      const mockGenerate = vi.fn().mockImplementation(async (params) => {
        attempt++;
        if (attempt === 1) {
          const err = Object.assign(new Error("503 Service Unavailable"), { status: 503 });
          throw err;
        }
        return { text: `Success on fallback model: ${params.model}` };
      });
      setInternalGenerateContentForTesting(mockGenerate as unknown as Parameters<typeof setInternalGenerateContentForTesting>[0]);

      const res = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: "Prompt",
      });

      expect(res.text).toContain("Success on fallback model");
      expect(mockGenerate).toHaveBeenCalledTimes(2);
    });

    it("aborts underlying request via AbortSignal when per-request timeout triggers", async () => {
      setGeminiTimeoutsForTesting(60, 200);
      let abortedCaught = false;

      const slowGenerate = vi.fn().mockImplementation(async (params) => {
        const signal: AbortSignal = params.config?.abortSignal;
        return new Promise((resolve, reject) => {
          signal?.addEventListener("abort", () => {
            abortedCaught = true;
            reject(new Error("Request aborted by client timeout"));
          });
        });
      });
      setInternalGenerateContentForTesting(slowGenerate as unknown as Parameters<typeof setInternalGenerateContentForTesting>[0]);

      await expect(
        ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents: "Hanging prompt",
        })
      ).rejects.toThrow();

      expect(abortedCaught).toBe(true);
    });

    it("fast-fails when Gemini Circuit Breaker is in OPEN state", async () => {
      for (let i = 0; i < 5; i++) {
        geminiCircuitBreaker.recordFailure();
      }
      expect(geminiCircuitBreaker.getState()).toBe(CircuitState.OPEN);

      const mockGenerate = vi.fn();
      setInternalGenerateContentForTesting(mockGenerate as unknown as Parameters<typeof setInternalGenerateContentForTesting>[0]);

      await expect(
        ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents: "Prompt while circuit open",
        })
      ).rejects.toThrow(/Gemini AI Circuit is OPEN/);

      expect(mockGenerate).not.toHaveBeenCalled();
    });
  });

  describe("5. Firestore Resiliency, Deadlines & Verification", () => {
    it("successfully verifies connection when Firestore responds within deadline", async () => {
      if (db) {
        vi.spyOn(db, "collection").mockReturnValue({
          limit: () => ({
            get: vi.fn().mockResolvedValue({ docs: [] }),
          }),
        } as unknown as ReturnType<typeof db.collection>);

        await expect(verifyAndFixDb(2000)).resolves.not.toThrow();
      }
    });

    it("rejects with clear timeout error when Firestore connection ping exceeds deadline", async () => {
      if (db) {
        vi.spyOn(db, "collection").mockReturnValue({
          limit: () => ({
            get: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 500))),
          }),
        } as unknown as ReturnType<typeof db.collection>);

        await expect(verifyAndFixDb(50)).rejects.toThrow(/exceeded deadline of 50ms/);
      }
    });

    it("throws clear error when verifyAndFixDb is invoked while DB is in non-READY state", async () => {
      setFirebaseInitStateForTesting(FirebaseInitState.FAILED, "Simulated initialization outage");

      await expect(verifyAndFixDb(1000)).rejects.toThrow(/Firestore Admin SDK DB is not ready/);
    });
  });

  describe("6. Firebase Admin Initialization State Tracking", () => {
    it("tracks READY state when properly initialized", () => {
      setFirebaseInitStateForTesting(FirebaseInitState.READY, null);
      expect(getFirebaseInitState()).toBe(FirebaseInitState.READY);
      expect(isFirebaseReady()).toBe(true);
    });

    it("tracks FAILED state and reflects in isFirebaseReady()", () => {
      setFirebaseInitStateForTesting(FirebaseInitState.FAILED, "Invalid credentials provided");
      expect(getFirebaseInitState()).toBe(FirebaseInitState.FAILED);
      expect(isFirebaseReady()).toBe(false);
    });
  });

  describe("7. FileReader Safety & Timeout", () => {
    it("rejects immediately if file size exceeds MAX_UPLOAD_SIZE_BYTES", async () => {
      const largeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)]);
      const fakeFile = new File([largeBlob], "huge.pdf", { type: "application/pdf" });

      await expect(readFileAsDataUrlWithTimeout(fakeFile)).rejects.toThrow(/dépasse la limite/i);
    });

    it("rejects cleanly if file is null/undefined", async () => {
      await expect(readFileAsDataUrlWithTimeout(null as unknown as File)).rejects.toThrow(/invalide/i);
    });
  });

  describe("8. SSRF Protection & URL Validation", () => {
    it("blocks localhost, loopback, private IP ranges and cloud metadata endpoints", () => {
      const blockedUrls = [
        "http://localhost:3000/api/secret",
        "http://localhost.localdomain/data",
        "http://127.0.0.1:8080/internal",
        "http://10.0.0.1/admin",
        "http://192.168.1.1/router",
        "http://172.16.0.1/private",
        "http://169.254.169.254/latest/meta-data",
        "http://metadata.google.internal/computeMetadata/v1",
        "ftp://example.com/file.txt",
      ];

      for (const url of blockedUrls) {
        expect(() => validateExternalUrl(url)).toThrow();
      }
    });

    it("allows valid public HTTPS URLs", () => {
      const validUrl = "https://images.unsplash.com/photo-123456789";
      const parsed = validateExternalUrl(validUrl);
      expect(parsed.protocol).toBe("https:");
      expect(parsed.hostname).toBe("images.unsplash.com");
    });
  });
});
