import "dotenv/config";
import http from "http";
import crypto from "crypto";
import { app } from "./app";
import { verifyAndFixDb } from "./src/config/firebase-admin";
import { startProductPublisherWorker, stopProductPublisherWorker } from "./src/workers/productPublisher";
import { startVelocityWorker, stopVelocityWorker, drainVelocityChecks } from "./src/utils/velocity";
import { startProductCacheCleanupTimer, stopProductCacheCleanupTimer } from "./src/services/ProductSeoService";
import { setupViteAndStaticServing } from "./src/services/ViteStaticService";
import { validateCsrfConfiguration } from "./src/middlewares/csrf";
import { TrendingSearchesService } from "./src/services/TrendingSearchesService";
import { safeLogger } from "./src/utils/logger";

const getEffectivePort = (): number => {
  // In production (Cloud Run), bind to process.env.PORT (e.g. 8080 or 3000)
  if (process.env.NODE_ENV === "production" && process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  // In development, port 3000 is required for dev server & iframe ingress
  return 3000;
};

const PORT = getEffectivePort();
const bootStartTime = Date.now();

export const httpServer = http.createServer(app);
export let secondaryHttpServer: http.Server | null = null;

let isShuttingDown = false;
let startServerPromise: Promise<http.Server> | null = null;

export const shutdown = (signal: string): void => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (process.env.NODE_ENV !== "production") {
    safeLogger.info(`[Olmart Gateway] 🛑 Received ${signal}. Shutting down gracefully...`);
  }

  try {
    stopProductCacheCleanupTimer();
  } catch (err) {
    safeLogger.warn("[Shutdown] Error stopping product cache timer", { err: String(err) });
  }

  try {
    stopProductPublisherWorker();
  } catch (err) {
    safeLogger.warn("[Shutdown] Error stopping publisher worker", { err: String(err) });
  }

  try {
    stopVelocityWorker();
  } catch (err) {
    safeLogger.warn("[Shutdown] Error stopping velocity worker", { err: String(err) });
  }

  if (secondaryHttpServer && secondaryHttpServer.listening) {
    try {
      secondaryHttpServer.close();
    } catch (err) {
      safeLogger.warn("[Shutdown] Error closing secondary HTTP server", { err: String(err) });
    }
    secondaryHttpServer = null;
  }

  if (httpServer.listening) {
    httpServer.close(async () => {
      try {
        await drainVelocityChecks(4000);
      } catch (err) {
        safeLogger.warn("[Shutdown] Error draining velocity checks", { err: String(err) });
      }

      if (process.env.NODE_ENV !== "production") {
        safeLogger.info("[Olmart Gateway] 💤 Closed remaining active connections.");
      }
      if (process.env.NODE_ENV !== "test") {
        process.exit(0);
      }
    });

    if (process.env.NODE_ENV !== "test") {
      const forceTimer = setTimeout(() => {
        safeLogger.error("[Olmart Gateway] ❌ Forcefully shutting down after 10s timeout.");
        process.exit(1);
      }, 10000);
      if (forceTimer.unref) {
        forceTimer.unref();
      }
    }
  } else {
    if (process.env.NODE_ENV !== "test") {
      process.exit(0);
    }
  }
};

/**
 * Teardown propre pour les tests unitaires et d'intégration Vitest.
 * Ferme le serveur HTTP, tous les workers et timers sans appeler process.exit().
 */
export async function stopServerForTesting(): Promise<void> {
  // Wait for any in-flight startup to settle before shutting down to prevent race condition
  if (startServerPromise) {
    try {
      await startServerPromise;
    } catch {
      // Safe no-op if startup threw or rejected (e.g., EADDRINUSE)
    }
  }

  try {
    stopProductCacheCleanupTimer();
  } catch {
    // Safe no-op in test teardown
  }
  try {
    stopProductPublisherWorker();
  } catch {
    // Safe no-op in test teardown
  }
  try {
    stopVelocityWorker();
  } catch {
    // Safe no-op in test teardown
  }

  if (secondaryHttpServer && secondaryHttpServer.listening) {
    if (typeof secondaryHttpServer.closeAllConnections === "function") {
      secondaryHttpServer.closeAllConnections();
    }
    await new Promise<void>((resolve) => {
      if (secondaryHttpServer) {
        secondaryHttpServer.close(() => resolve());
      } else {
        resolve();
      }
    });
    secondaryHttpServer = null;
  }

  if (httpServer && httpServer.listening) {
    if (typeof httpServer.closeAllConnections === "function") {
      httpServer.closeAllConnections();
    }
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  }

  startServerPromise = null;
  isShuttingDown = false;
}

export function startServer(portOverride?: number): Promise<http.Server> {
  if (startServerPromise) {
    return startServerPromise;
  }

  const bindPort = typeof portOverride === "number" ? portOverride : PORT;

  startServerPromise = (async () => {
    try {
      const logDev = (msg: string) => {
        if (process.env.NODE_ENV !== "production") {
          safeLogger.info(msg);
        }
      };

    // 0. Security Configuration Guard: Validate CSRF configuration.
    // In development/test environments: generate an ephemeral 256-bit secret if not configured.
    // In production (Cloud Run multi-instance): NEVER generate an ephemeral random secret!
    // A shared secret across all instances (via Google Cloud Secret Manager or environment variable) is strictly required.
    // Fails closed immediately if missing or insecure to prevent desynchronized multi-instance HMAC verification failures.
    if (process.env.NODE_ENV !== "production") {
      if (!process.env.CSRF_SECRET || process.env.CSRF_SECRET.trim().length < 32) {
        process.env.CSRF_SECRET = crypto.randomBytes(32).toString("hex");
      }
    }
    validateCsrfConfiguration();

    try {
      // 1. Setup Vite dev middleware or production static asset pipeline
      await setupViteAndStaticServing(app);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      safeLogger.error("[Olmart Gateway] ❌ Failed to initialize Vite/static serving pipeline", { err: errorMsg });
    }

    // 2. Start Product SEO cache cleanup timer with rollback guard
    try {
      startProductCacheCleanupTimer();
    } catch (err: unknown) {
      safeLogger.error("[Olmart Gateway] ❌ Failed to start SEO cache timer", { err: String(err) });
    }

    // 3. Database migrations - Off by default on web instances to prevent race conditions across cluster nodes
    if (process.env.RUN_MIGRATIONS === "true") {
      logDev("[Database] 🔄 Running startup database checks and migrations...");
      try {
        await verifyAndFixDb();
        logDev("[Database] ✅ Startup database checks completed successfully.");
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        safeLogger.error("[Database] ❌ Firestore Admin verification/migration failed", { err: errorMsg });
      }
    }

    // 4. Background workers & Reconciliation (Dedicated worker instances only)
    if (process.env.ENABLE_WORKERS === "true" || process.env.ENABLE_BACKGROUND_WORKERS === "true") {
      try {
        startVelocityWorker();
      } catch (err: unknown) {
        safeLogger.error("[Olmart Workers] ❌ Failed to initialize velocity reconciliation worker", { err: String(err) });
      }

      try {
        startProductPublisherWorker();
      } catch (err: unknown) {
        safeLogger.error("[Olmart Workers] ❌ Failed to initialize background worker", { err: String(err) });
      }
    }

    // 5. Bind and listen with explicit error rejection and cleanup rollback
    safeLogger.info(`[Olmart Gateway] 🚀 Booting Express HTTP Server...`);
    return new Promise<http.Server>((resolve, reject) => {
      const onError = (err: Error) => {
        httpServer.off("error", onError);
        startServerPromise = null;

        // Rollback all initialized subsystems on listen failure
        try {
          stopProductCacheCleanupTimer();
        } catch {
          // Safe no-op
        }
        try {
          stopProductPublisherWorker();
        } catch {
          // Safe no-op
        }

        safeLogger.error("[Olmart Gateway] ❌ HTTP Listen error during startup, all subsystems rolled back", { err: err.message });
        reject(err);
      };

      httpServer.once("error", onError);

      httpServer.listen(bindPort, "0.0.0.0", () => {
        httpServer.off("error", onError);
        const startupDuration = ((Date.now() - bootStartTime) / 1000).toFixed(2);
        safeLogger.info(`OLMART STARTUP READY - Port: ${bindPort}, Environment: ${process.env.NODE_ENV || "development"}, Startup Time: ${startupDuration}s`);

        // If bound to a non-3000 port in production (e.g. Cloud Run 8080), also bind secondary listener on 3000 for dual-ingress compatibility
        if (process.env.NODE_ENV === "production" && bindPort !== 3000) {
          try {
            secondaryHttpServer = http.createServer(app);
            secondaryHttpServer.listen(3000, "0.0.0.0", () => {
              safeLogger.info(`[Olmart Gateway] 🚀 Also listening on secondary port 3000 for dual-ingress compatibility`);
            });
            secondaryHttpServer.on("error", (secErr: unknown) => {
              safeLogger.warn("[Olmart Gateway] Secondary port 3000 listener non-fatal error", { err: String(secErr) });
            });
          } catch (secErr) {
            safeLogger.warn("[Olmart Gateway] Could not bind secondary port 3000", { err: String(secErr) });
          }
        }

        // Asynchronously warm-up trending searches cache without blocking the HTTP server or readiness probe
        TrendingSearchesService.warmupTrendingSearches().catch((warmupErr: unknown) => {
          safeLogger.warn("[Startup] Trending searches warm-up non-fatal failure", {
            err: warmupErr instanceof Error ? warmupErr.message : String(warmupErr),
          });
        });

        resolve(httpServer);
      });
    });
    } catch (bootErr: unknown) {
      startServerPromise = null;
      throw bootErr;
    }
  })();

  return startServerPromise;
}

process.on("SIGTERM", () => {
  if (process.env.NODE_ENV !== "test") shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  if (process.env.NODE_ENV !== "test") shutdown("SIGINT");
});

process.on("unhandledRejection", (reason: unknown) => {
  const errorMsg = reason instanceof Error ? reason.stack || reason.message : String(reason);
  const errorCode = reason && typeof reason === "object" && "code" in reason ? String((reason as { code: unknown }).code) : "";
  safeLogger.error("[Olmart Gateway] ❌ Unhandled Promise Rejection at process level", { err: errorMsg, code: errorCode });

  if (process.env.NODE_ENV === "test") {
    return;
  }

  // If unhandled rejection indicates a fatal system/driver error with structured error code or critical corruption
  const criticalCodes = ["EADDRINUSE", "EACCES", "MODULE_NOT_FOUND", "ERR_SERVER_ALREADY_LISTEN"];
  if (
    criticalCodes.includes(errorCode) ||
    (typeof errorMsg === "string" && errorMsg.includes("FATAL_DB_CORRUPTION"))
  ) {
    safeLogger.error("[Olmart Gateway] 🚨 Critical unhandled rejection encountered. Initiating emergency shutdown...", { code: errorCode });
    shutdown("CRITICAL_UNHANDLED_REJECTION");
  }
});

process.on("uncaughtException", (error: Error) => {
  safeLogger.error("[Olmart Gateway] ❌ Uncaught Exception at process level", { err: error.stack || error.message });
  shutdown("UNCAUGHT_EXCEPTION");
});

// Boot the server when executed directly as primary entrypoint
if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  const attemptBoot = async (retries = 3, delayMs = 1500): Promise<void> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await startServer();
        return;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const errorCode = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "";
        safeLogger.error(`[Olmart Gateway] ❌ Boot attempt ${attempt}/${retries} failed`, { err: errorMsg, code: errorCode });
        if (attempt < retries && (errorCode === "EADDRINUSE" || errorCode === "EAGAIN")) {
          safeLogger.info(`[Olmart Gateway] ⏳ Port in use, retrying startup in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          process.exit(1);
        }
      }
    }
  };
  attemptBoot();
}
