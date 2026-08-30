import { safeLogger } from "../logger";

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

export function defaultIsRetryable(error: unknown): boolean {
  if (!error) return false;

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.includes("aborted")) {
      return false;
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
    const totalElapsed = Date.now() - startTime;
    if (totalElapsed >= totalDeadlineMs) {
      const deadlineError = new Error(`[ResilientCall:${operationName}] Global deadline of ${totalDeadlineMs}ms exceeded after ${attempt} attempts`);
      safeLogger.error(deadlineError.message, { totalElapsed, attempt });
      throw deadlineError;
    }

    if (parentSignal?.aborted) {
      throw new Error(`[ResilientCall:${operationName}] Operation aborted by caller`);
    }

    const remainingTime = totalDeadlineMs - totalElapsed;
    const effectiveAttemptTimeout = Math.min(timeoutMs, remainingTime);

    const attemptController = new AbortController();
    let timeoutTimer: NodeJS.Timeout | null = null;

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

      const retryAllowed = isRetryable(err);
      if (!retryAllowed) {
        safeLogger.warn(`[ResilientCall:${operationName}] Non-retryable error encountered, aborting retry sequence`, {
          err: err instanceof Error ? err.message : String(err),
          attempt,
        });
        throw err;
      }

      const currentDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
      const jitter = currentDelay * 0.25 * Math.random();
      const sleepTime = currentDelay + jitter;

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

export async function withExponentialBackoff<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  timeoutMs = 10000,
  totalDeadlineMs = 25000
): Promise<T> {
  return executeResilientCall(
    (signal) => fn(signal),
    {
      maxRetries,
      baseDelayMs: baseDelay,
      timeoutMs,
      totalDeadlineMs,
      isRetryable: defaultIsRetryable,
      operationName: "withExponentialBackoff",
    }
  );
}
