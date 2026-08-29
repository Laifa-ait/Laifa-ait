import { executeResilientCall, defaultIsRetryable } from "./resilientFetch";

/**
 * Executes a promise-returning function with exponential backoff, deadline budgeting, and signal propagation.
 * @param fn The function to execute (accepts optional AbortSignal).
 * @param maxRetries Maximum number of retries.
 * @param baseDelay Initial delay in milliseconds (default: 1000ms).
 * @param timeoutMs Per-attempt timeout in milliseconds (default: 10000ms).
 * @param totalDeadlineMs Global deadline across all attempts (default: 25000ms).
 * @returns The result of the function.
 */
export async function withExponentialBackoff<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  timeoutMs: number = 10000,
  totalDeadlineMs: number = 25000
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

