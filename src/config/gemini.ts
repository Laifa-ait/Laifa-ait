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

// Decorate generateContent to add automatic retries (exponential backoff) and fallback models on 503/429 errors
const originalGenerateContent = ai.models.generateContent.bind(ai.models);

export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

const GEMINI_TOTAL_DEADLINE_MS = 25000; // 25s max for full retry/fallback sequence
const GEMINI_REQUEST_TIMEOUT_MS = 12000; // 12s per request

ai.models.generateContent = async function (params: Parameters<typeof originalGenerateContent>[0]) {
  if (geminiCircuitBreaker.getState() === CircuitState.OPEN) {
    throw new Error("[CircuitBreaker:GeminiAI] Fast-fail: Gemini AI Circuit is OPEN due to repeated upstream failures");
  }

  let attempt = 0;
  const maxAttempts = 3;
  let delay = 1000; // start with 1s delay
  let lastError: unknown = null;
  const startTime = Date.now();

  // Keep a copy of original params to manipulate
  const localParams = { ...params };
  const requestedModel = localParams.model;

  while (attempt < maxAttempts) {
    const elapsedTotal = Date.now() - startTime;
    if (elapsedTotal >= GEMINI_TOTAL_DEADLINE_MS) {
      geminiCircuitBreaker.recordFailure();
      const deadlineError = new Error(`[Gemini Resiliency] Total deadline of ${GEMINI_TOTAL_DEADLINE_MS}ms exceeded after ${attempt} attempts`);
      safeLogger.error(deadlineError.message, { elapsedTotal, attempt });
      throw deadlineError;
    }

    const remainingBudget = GEMINI_TOTAL_DEADLINE_MS - elapsedTotal;
    const effectiveTimeout = Math.min(GEMINI_REQUEST_TIMEOUT_MS, remainingBudget);

    // Timeout-guarded invocation
    let timeoutTimer: NodeJS.Timeout | null = null;
    try {
      const callPromise = originalGenerateContent(localParams);
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(() => {
          reject(new Error(`[Gemini Resiliency] Per-request timeout exceeded (${effectiveTimeout}ms)`));
        }, effectiveTimeout);
      });

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
      const isTimeout = message.includes("timeout") || message.includes("ETIMEDOUT");

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

        safeLogger.warn("[Gemini Resiliency] Attempt failed, retrying", {
          attempt,
          status: String(status),
          delayMs: delay,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        // Non-transient error, throw immediately
        throw err;
      }
    } finally {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    }
  }

  geminiCircuitBreaker.recordFailure();
  throw lastError || new Error("[Gemini Resiliency] Failed after maximum attempts");
};

