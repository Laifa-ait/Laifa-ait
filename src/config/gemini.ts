import { GoogleGenAI } from "@google/genai";
import { safeLogger } from "../utils/logger";

// Determine the active API key: prioritize user's custom key if provided, then fallback to default
const activeApiKey = process.env.GEMINI_API_KEY || "missing_key_force_error";

// Initialize Gemini - force api key mode to prevent ADC Vertex AI fallback
export const ai = new GoogleGenAI({
  apiKey: activeApiKey,
  httpOptions: { headers: { "User-Agent": "aistudio-build" } },
});

// Decorate generateContent to add automatic retries (exponential backoff) and fallback models on 503/429 errors
const originalGenerateContent = ai.models.generateContent.bind(ai.models);

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

ai.models.generateContent = async function (params: Parameters<typeof originalGenerateContent>[0]) {
  let attempt = 0;
  const maxAttempts = 3;
  let delay = 1000; // start with 1s delay
  let lastError: unknown = null;

  // Keep a copy of original params to manipulate
  const localParams = { ...params };
  const requestedModel = localParams.model;

  while (attempt < maxAttempts) {
    try {
      return await originalGenerateContent(localParams);
    } catch (err: unknown) {
      lastError = err;
      const errObj = (err && typeof err === 'object') ? (err as Record<string, unknown>) : {};
      const status = errObj.status || errObj.statusCode || errObj.code;
      const message = typeof errObj.message === 'string' ? errObj.message : String(err || '');
      
      const isRateLimit = status === 429 || message.includes("429") || message.includes("ResourceExhausted") || message.includes("quota");
      const is503 = status === 503 || message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand") || message.includes("overloaded");

      if (isRateLimit || is503) {
        attempt++;
        if (attempt >= maxAttempts) {
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
    }
  }

  throw lastError;
};
