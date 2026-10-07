import crypto from "node:crypto";
import type { Express } from "express";
import { verifyAndFixDb } from "../config/firebase-admin";
import { startProductPublisherWorker, stopProductPublisherWorker } from "../workers/productPublisher";
import { startVelocityWorker, stopVelocityWorker, drainVelocityChecks } from "../utils/velocity";
import { startProductCacheCleanupTimer, stopProductCacheCleanupTimer } from "./ProductSeoService";
import { setupViteAndStaticServing } from "./ViteStaticService";
import { validateCsrfConfiguration } from "../middlewares/csrf";
import { safeLogger } from "../utils/logger";

export async function initializeSubsystems(app: Express): Promise<void> {
  const logDev = (msg: string) => {
    if (process.env.NODE_ENV !== "production") {
      safeLogger.info(msg);
    }
  };

  // 0. Security Configuration Guard: Validate CSRF configuration.
  if (!process.env.CSRF_SECRET || process.env.CSRF_SECRET.trim().length < 32) {
    process.env.CSRF_SECRET = crypto.randomBytes(32).toString("hex");
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
}

export function rollbackSubsystems(): void {
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
}

export async function drainAndStopSubsystems(): Promise<void> {
  rollbackSubsystems();
  try {
    await drainVelocityChecks(4000);
  } catch (err) {
    safeLogger.warn("[Shutdown] Error draining velocity checks", { err: String(err) });
  }
}
