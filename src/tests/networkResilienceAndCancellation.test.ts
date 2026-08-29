import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeResilientCall, resilientFetch, CircuitBreaker, CircuitState, googleCircuitBreaker, geminiCircuitBreaker } from "../utils/resilientFetch";
import { withExponentialBackoff } from "../utils/retry";
import { readFileAsDataUrlWithTimeout } from "../services/googleWorkspace";

describe("Network Resiliency, Timeouts, AbortSignal & Circuit Breaker Suite", () => {
  beforeEach(() => {
    vi.useRealTimers();
    googleCircuitBreaker.reset();
    geminiCircuitBreaker.reset();
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
  });

  describe("4. FileReader Safety & Timeout", () => {
    it("rejects immediately if file size exceeds MAX_UPLOAD_SIZE_BYTES", async () => {
      const largeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)]);
      const fakeFile = new File([largeBlob], "huge.pdf", { type: "application/pdf" });

      await expect(readFileAsDataUrlWithTimeout(fakeFile)).rejects.toThrow(/dépasse la limite/i);
    });

    it("rejects cleanly if file is null/undefined", async () => {
      await expect(readFileAsDataUrlWithTimeout(null as unknown as File)).rejects.toThrow(/invalide/i);
    });
  });
});
