import { GoogleGenAI } from "@google/genai";
import { safeLogger } from "../utils/logger";
import { geminiCircuitBreaker, CircuitState } from "../utils/resilientFetch";

// Determine the active API key: prioritize user's custom key if provided, then fallback to default
const activeApiKey = process.env.GEMINI_API_KEY || "missing_key_force_error";

// Initialize Gemini - force api key mode to prevent ADC Vertex AI fallback
export const ai = new GoogleGenAI({
  apiKey: activeApiKey,
  httpOptions: { headers: { "User-Agent": "aistudio-build" } },
});

// Decorate generateContent to add automatic retries (exponential backoff), native AbortSignal cancellation, and fallback models
export const originalGenerateContent = ai.models.generateContent.bind(ai.models);
let delegateGenerateContent = originalGenerateContent;

export const setInternalGenerateContentForTesting = (fn?: typeof originalGenerateContent): void => {
  delegateGenerateContent = fn || originalGenerateContent;
};

export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

export const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export const GEMINI_TOTAL_DEADLINE_MS = 25000; // 25s max for full retry/fallback sequence
export const GEMINI_REQUEST_TIMEOUT_MS = 12000; // 12s per request

export let currentGeminiTotalDeadlineMs = GEMINI_TOTAL_DEADLINE_MS;
export let currentGeminiRequestTimeoutMs = GEMINI_REQUEST_TIMEOUT_MS;

export const setGeminiTimeoutsForTesting = (requestTimeoutMs = GEMINI_REQUEST_TIMEOUT_MS, totalDeadlineMs = GEMINI_TOTAL_DEADLINE_MS): void => {
  currentGeminiRequestTimeoutMs = requestTimeoutMs;
  currentGeminiTotalDeadlineMs = totalDeadlineMs;
};

/**
 * Executes a Gemini generateContent call with:
 * 1. Native AbortSignal client-side cancellation (@google/genai 2.19.0 config.abortSignal).
 * 2. Per-attempt timeout and total global deadline (25s max).
 * 3. Exponential backoff with jitter and model fallback (gemini-2.0-flash -> 1.5-flash -> 1.5-pro).
 * 4. Circuit Breaker protection (fast-fails if Gemini is experiencing persistent outages).
 *
 * NOTE ON CANCELLATION:
 * @google/genai v2.19.0 supports client-side cancellation via `config.abortSignal`.
 * Triggering abort physically aborts the underlying Node.js HTTP fetch request and frees network sockets.
 */
ai.models.generateContent = async function (params: Parameters<typeof originalGenerateContent>[0]) {
  if (geminiCircuitBreaker.getState() === CircuitState.OPEN) {
    throw new Error("[CircuitBreaker:GeminiAI] Fast-fail: Gemini AI Circuit is OPEN due to repeated upstream failures");
  }

  let attempt = 0;
  const maxAttempts = 3;
  let delay = 50; // fast base delay for retries, max bounded by deadline
  let lastError: unknown = null;
  const startTime = Date.now();

  // Keep a copy of original params to manipulate
  const localParams = { ...params };
  const requestedModel = localParams.model;
  const parentSignal = params.config?.abortSignal;

  while (attempt < maxAttempts) {
    if (parentSignal?.aborted) {
      throw new Error("[Gemini Resiliency] Operation aborted by caller's AbortSignal");
    }

    const elapsedTotal = Date.now() - startTime;
    if (elapsedTotal >= currentGeminiTotalDeadlineMs) {
      geminiCircuitBreaker.recordFailure();
      const deadlineError = new Error(`[Gemini Resiliency] Total deadline of ${currentGeminiTotalDeadlineMs}ms exceeded after ${attempt} attempts`);
      safeLogger.error(deadlineError.message, { elapsedTotal, attempt });
      throw deadlineError;
    }

    const remainingBudget = currentGeminiTotalDeadlineMs - elapsedTotal;
    const effectiveTimeout = Math.min(currentGeminiRequestTimeoutMs, remainingBudget);

    // Native AbortController per attempt, wired to @google/genai config.abortSignal
    const attemptController = new AbortController();
    
    // Wire parent signal listener if provided
    const onParentAbort = () => attemptController.abort();
    if (parentSignal) {
      parentSignal.addEventListener("abort", onParentAbort, { once: true });
    }

    // Attach abortSignal to localParams.config
    localParams.config = {
      ...(localParams.config || {}),
      abortSignal: attemptController.signal,
    };

    let timeoutTimer: NodeJS.Timeout | null = null;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(() => {
          attemptController.abort();
          reject(new Error(`[Gemini Resiliency] Per-request timeout exceeded (${effectiveTimeout}ms)`));
        }, effectiveTimeout);
      });

      const callPromise = delegateGenerateContent(localParams);
      const response = await Promise.race([callPromise, timeoutPromise]);
      geminiCircuitBreaker.recordSuccess();
      return response;
    } catch (err: unknown) {
      lastError = err;
      const errObj = (err && typeof err === 'object') ? (err as Record<string, unknown>) : {};
      const status = errObj.status || errObj.statusCode || errObj.code;
      const message = typeof errObj.message === 'string' ? errObj.message : String(err || '');
      
      const isRateLimit = status === 429 || message.includes("429") || message.includes("ResourceExhausted") || message.includes("quota");
      const is503 = status === 503 || message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand") || message.includes("overloaded");
      const isTimeout = message.includes("timeout") || message.includes("ETIMEDOUT") || message.includes("Per-request timeout exceeded");

      if (isRateLimit || is503 || isTimeout) {
        attempt++;
        if (attempt >= maxAttempts) {
          geminiCircuitBreaker.recordFailure();
          break;
        }

        // Try model fallback on 503 or 429 to avoid getting stuck on overloaded/quota-exhausted models
        const availableFallbacks = FALLBACK_MODELS.filter((m) => m !== requestedModel);
        if (attempt <= availableFallbacks.length) {
          const fallbackModel = availableFallbacks[attempt - 1];
          if (fallbackModel) {
            safeLogger.warn("[Gemini Resiliency] Model experienced transient error, falling back", {
              currentModel: localParams.model,
              fallbackModel,
              status: String(status),
            });
            localParams.model = fallbackModel;
          }
        }

        const currentElapsed = Date.now() - startTime;
        if (currentElapsed + delay >= GEMINI_TOTAL_DEADLINE_MS) {
          safeLogger.warn("[Gemini Resiliency] Insufficient deadline budget left to sleep before retry", {
            currentElapsed,
            delay,
            totalDeadline: GEMINI_TOTAL_DEADLINE_MS,
          });
          geminiCircuitBreaker.recordFailure();
          break;
        }

        safeLogger.warn("[Gemini Resiliency] Attempt failed, retrying with backoff", {
          attempt,
          status: String(status),
          delayMs: delay,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        // Non-transient error, throw immediately without retrying
        throw err;
      }
    } finally {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
      if (parentSignal) {
        parentSignal.removeEventListener("abort", onParentAbort);
      }
    }
  }

  geminiCircuitBreaker.recordFailure();
  throw lastError || new Error("[Gemini Resiliency] Failed after maximum attempts");
};

