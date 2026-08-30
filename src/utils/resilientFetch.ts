import { CircuitBreaker, CircuitState } from "./resilient/circuitBreakerCore";
import { executeResilientCall, ResilientCallOptions } from "./resilient/resilientExecutor";

export * from "./resilient/circuitBreakerCore";
export * from "./resilient/resilientExecutor";

export async function resilientFetch(
  url: string,
  init: RequestInit = {},
  options: ResilientCallOptions & { circuitBreaker?: CircuitBreaker } = {}
): Promise<Response> {
  const cb = options.circuitBreaker;

  if (cb && cb.getState() === CircuitState.OPEN) {
    throw new Error(`[CircuitBreaker:${cb.name}] Fast-fail: Circuit is OPEN`);
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
