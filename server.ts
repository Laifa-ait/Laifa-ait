import "dotenv/config";
import http from "http";
import { app } from "./app";
import { verifyAndFixDb } from "./src/config/firebase-admin";
import { startProductPublisherWorker, stopProductPublisherWorker } from "./src/workers/productPublisher";
import { startVelocityWorker, stopVelocityWorker, drainVelocityChecks } from "./src/utils/velocity";
import { startProductCacheCleanupTimer, stopProductCacheCleanupTimer } from "./src/services/ProductSeoService";
import { setupViteAndStaticServing } from "./src/services/ViteStaticService";
import { validateCsrfConfiguration } from "./src/middlewares/csrf";
import { safeLogger } from "./src/utils/logger";

const PORT = Number(process.env.PORT) || 3000;
const bootStartTime = Date.now();

export const httpServer = http.createServer(app);

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
    const logDev = (msg: string) => {
      if (process.env.NODE_ENV !== "production") {
        safeLogger.info(msg);
      }
    };

    // 0. Security Configuration Guard: Fail-closed CSRF validation in production
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

    // 4. Background workers & Reconciliation
    try {
      startVelocityWorker();
    } catch (err: unknown) {
      safeLogger.error("[Olmart Workers] ❌ Failed to initialize velocity reconciliation worker", { err: String(err) });
    }

    if (process.env.ENABLE_WORKERS === "true") {
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
        resolve(httpServer);
      });
    });
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
  startServer().catch((err: unknown) => {
    const errorMsg = err instanceof Error ? err.message : String(err);
    safeLogger.error("[Olmart Gateway] ❌ Fatal error during server startup", { err: errorMsg });
    process.exit(1);
  });
}
