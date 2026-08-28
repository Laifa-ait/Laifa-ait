import * as Sentry from "@sentry/react";
import { safeLogger } from "../utils/logger";

const isProduction = typeof import.meta !== "undefined" && import.meta.env?.PROD;

if (isProduction) {
  try {
    const dsn = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SENTRY_DSN : undefined;
    if (dsn && dsn !== "https://dummy@sentry.io/1" && !dsn.includes("dummy")) {
      Sentry.init({
        dsn: dsn,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        tracesSampleRate: 0.1, // 10% des transactions
        replaysSessionSampleRate: 0.01, // 1% des sessions
        replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
      });
    } else {
      // Skipped Sentry initialization (no real DSN provided)
    }
  } catch (error) {
    safeLogger.error("[Sentry] Failed to initialize safely", { err: error instanceof Error ? error.message : String(error) });
  }
}

