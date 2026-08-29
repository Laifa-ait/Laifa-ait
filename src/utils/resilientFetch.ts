import { safeLogger } from "./logger";

export interface ResilientCallOptions {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  totalDeadlineMs?: number;
  signal?: AbortSignal;
  isRetryable?: (error: unknown) => boolean;
  operationName?: string;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of consecutive failures to open circuit
  resetTimeoutMs?: number;   // Time to wait before attempting half-open probe
  halfOpenMaxProbes?: number; // Max probes allowed in half-open
}

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

/**
 * Standard lightweight in-memory Circuit Breaker for protecting downstream external services.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures: number = 0;
  private lastFailureTime: number = 0;
  private consecutiveSuccesses: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenMaxProbes: number;
  private readonly name: string;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000; // 30s
    this.halfOpenMaxProbes = options.halfOpenMaxProbes || 2;
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.consecutiveSuccesses = 0;
        safeLogger.warn(`[CircuitBreaker:${this.name}] 🟡 Circuit transitioning from OPEN to HALF_OPEN probe state`);
      }
    }
    return this.state;
  }

  public recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= this.halfOpenMaxProbes) {
        this.state = CircuitState.CLOSED;
        this.consecutiveFailures = 0;
        safeLogger.info(`[CircuitBreaker:${this.name}] 🟢 Circuit closed: downstream service recovered.`);
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.consecutiveFailures = 0;
    }
  }

  public recordFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN || this.consecutiveFailures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      safeLogger.error(`[CircuitBreaker:${this.name}] 🔴 Circuit OPENED: downstream service failing. Fast-failing requests.`, {
        consecutiveFailures: this.consecutiveFailures,
        threshold: this.failureThreshold,
      });
    }
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Global circuit breaker registry for core downstream services
 */
export const googleCircuitBreaker = new CircuitBreaker("GoogleWorkspace", { failureThreshold: 4, resetTimeoutMs: 25000 });
export const geminiCircuitBreaker = new CircuitBreaker("GeminiAI", { failureThreshold: 5, resetTimeoutMs: 30000 });

/**
 * Helper to determine if an error is considered transient/retryable.
 */
export function defaultIsRetryable(error: unknown): boolean {
  if (!error) return false;

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.includes("aborted")) {
      return false; // Don't retry user/caller intentional aborts
    }
    if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT") || error.message.includes("ECONNRESET") || error.message.includes("ECONNREFUSED")) {
      return true;
    }
  }

  const errObj = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : {};
  const status = Number(errObj.status || errObj.statusCode || 0);
  const code = String(errObj.code || "");
  const msg = String(errObj.message || "").toLowerCase();

  if (status === 429 || status === 502 || status === 503 || status === 504) return true;
  if (code === "resource-exhausted" || code === "unavailable" || code === "deadline-exceeded") return true;
  if (msg.includes("network") || msg.includes("overloaded") || msg.includes("transient") || msg.includes("high demand")) return true;

  return false;
}

/**
 * Resilient caller that provides:
 * 1. AbortSignal passed into operation for real underlying cancellation
 * 2. Per-attempt timeout AND Total Global Deadline enforcement
 * 3. Exponential backoff with random jitter
 * 4. Circuit Breaker integration
 */
export async function executeResilientCall<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: ResilientCallOptions = {}
): Promise<T> {
  const {
    timeoutMs = 10000,
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 8000,
    totalDeadlineMs = 25000,
    signal: parentSignal,
    isRetryable = defaultIsRetryable,
    operationName = "AnonymousOperation",
  } = options;

  const startTime = Date.now();
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < maxRetries) {
    // Check if total deadline is exceeded before starting attempt
    const totalElapsed = Date.now() - startTime;
    if (totalElapsed >= totalDeadlineMs) {
      const deadlineError = new Error(`[ResilientCall:${operationName}] Global deadline of ${totalDeadlineMs}ms exceeded after ${attempt} attempts`);
      safeLogger.error(deadlineError.message, { totalElapsed, attempt });
      throw deadlineError;
    }

    // Check if external parent signal is already aborted
    if (parentSignal?.aborted) {
      throw new Error(`[ResilientCall:${operationName}] Operation aborted by caller`);
    }

    // Calculate budget remaining for this attempt (cannot exceed totalDeadline remaining)
    const remainingTime = totalDeadlineMs - totalElapsed;
    const effectiveAttemptTimeout = Math.min(timeoutMs, remainingTime);

    // Create per-attempt AbortController
    const attemptController = new AbortController();
    let timeoutTimer: NodeJS.Timeout | null = null;

    // Link parent abort signal to child controller if provided
    const onParentAbort = () => {
      attemptController.abort();
    };
    if (parentSignal) {
      parentSignal.addEventListener("abort", onParentAbort, { once: true });
    }

    timeoutTimer = setTimeout(() => {
      attemptController.abort();
    }, effectiveAttemptTimeout);

    try {
      const result = await operation(attemptController.signal);
      return result;
    } catch (err: unknown) {
      lastError = err;
      attempt++;

      if (parentSignal?.aborted) {
        throw new Error(`[ResilientCall:${operationName}] Operation aborted by caller`);
      }

      if (attempt >= maxRetries) {
        break;
      }

      // Check if error is transient
      const retryAllowed = isRetryable(err);
      if (!retryAllowed) {
        safeLogger.warn(`[ResilientCall:${operationName}] Non-retryable error encountered, aborting retry sequence`, {
          err: err instanceof Error ? err.message : String(err),
          attempt,
        });
        throw err;
      }

      // Calculate backoff with jitter
      const currentDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
      const jitter = currentDelay * 0.25 * Math.random();
      const sleepTime = currentDelay + jitter;

      // Check if we have enough time to sleep before total deadline expires
      const elapsedSoFar = Date.now() - startTime;
      if (elapsedSoFar + sleepTime >= totalDeadlineMs) {
        safeLogger.warn(`[ResilientCall:${operationName}] Insufficient time left before total deadline (${totalDeadlineMs}ms) to perform retry sleep`, {
          elapsedSoFar,
          sleepTime,
        });
        throw new Error(`[ResilientCall:${operationName}] Global deadline of ${totalDeadlineMs}ms reached before retry could execute`);
      }

      safeLogger.warn(`[ResilientCall:${operationName}] Attempt ${attempt}/${maxRetries} failed, retrying in ${Math.round(sleepTime)}ms`, {
        err: err instanceof Error ? err.message : String(err),
      });

      await new Promise((resolve) => setTimeout(resolve, sleepTime));
    } finally {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
      if (parentSignal) {
        parentSignal.removeEventListener("abort", onParentAbort);
      }
    }
  }

  throw lastError || new Error(`[ResilientCall:${operationName}] Operation failed after ${attempt} attempts`);
}

/**
 * Resilient HTTP Fetch with AbortController, retries, deadline, and Circuit Breaker
 */
export async function resilientFetch(
  url: string,
  init: RequestInit = {},
  options: ResilientCallOptions & { circuitBreaker?: CircuitBreaker } = {}
): Promise<Response> {
  const cb = options.circuitBreaker;

  if (cb && cb.getState() === CircuitState.OPEN) {
    throw new Error(`[CircuitBreaker:${cb["name"]}] Fast-fail: Circuit is OPEN`);
  }

  try {
    const response = await executeResilientCall(async (signal) => {
      return await fetch(url, {
        ...init,
        signal,
      });
    }, {
      operationName: `fetch(${url})`,
      ...options,
    });

    if (cb) {
      if (response.ok || response.status < 500) {
        cb.recordSuccess();
      } else {
        cb.recordFailure();
      }
    }

    return response;
  } catch (err) {
    if (cb) {
      cb.recordFailure();
    }
    throw err;
  }
}
