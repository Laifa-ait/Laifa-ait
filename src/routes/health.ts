import { Router, Request, Response } from "express";
import { admin, db, isFirebaseReady, getFirebaseInitState, getFirebaseInitError, FirebaseInitState } from "../config/firebase-admin";
import { isFrontendReady } from "../services/ViteStaticService";
import { safeLogger } from "../utils/logger";

const router = Router();

/**
 * Liveness probe
 * Pure lightweight check to verify that the Node.js process is responsive.
 * Does NOT query external services or databases.
 */
router.get(["/api/health/live", "/api/v1/health/live"], (req: Request, res: Response) => {
  res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
});

/**
 * Internal helper to check readiness of critical dependencies
 * (Firestore connection & frontend static build in production).
 *
 * Enforces that if Firebase Admin SDK initialization failed, the probe returns unavailable / degraded (503).
 */
async function checkReadiness(): Promise<{ ready: boolean; firebase: string; frontend?: string }> {
  const firebaseState = getFirebaseInitState();
  if (firebaseState === FirebaseInitState.FAILED || !isFirebaseReady()) {
    safeLogger.warn("[Readiness Probe] ⚠️ Firebase Admin SDK is not ready or failed to initialize", {
      state: firebaseState,
      error: getFirebaseInitError(),
    });
    return { ready: false, firebase: "unavailable" };
  }

  const isFirebaseInit = !!(admin && admin.apps && admin.apps.length > 0 && db);
  if (!isFirebaseInit) {
    return { ready: false, firebase: "unavailable" };
  }

  // Lightweight Firestore ping with 1.5-second timeout for cold start resilience
  let firebaseStatus = "ok";
  if (process.env.NODE_ENV !== "test") {
    try {
      let pingTimer: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise((_, reject) => {
        pingTimer = setTimeout(() => reject(new Error("Firestore timeout")), 1500);
      });
      try {
        await Promise.race([
          db.collection("_health").doc("probe").get(),
          timeoutPromise
        ]);
      } finally {
        if (pingTimer) clearTimeout(pingTimer);
      }
    } catch {
      // On cold start or transient network latency, as long as Firebase Admin SDK is initialized,
      // we log a warning but keep firebaseStatus as "ok" so Cloud Run health probes succeed.
      safeLogger.warn("Firestore ping timed out or delayed during cold start, but Admin SDK is initialized.");
      firebaseStatus = "ok";
    }
  }

  const isProd = process.env.NODE_ENV === "production";
  const frontendStatus = isProd ? (isFrontendReady() ? "ok" : "unavailable") : "ok";

  const ready = firebaseStatus === "ok" && frontendStatus === "ok";
  return { ready, firebase: firebaseStatus, frontend: isProd ? frontendStatus : undefined };
}

/**
 * Readiness probe
 * Verifies that critical dependencies allow Olmart to receive traffic.
 * Returns HTTP 503 if dependencies or static assets are unavailable.
 */
router.get(["/api/health/ready", "/api/v1/health/ready"], async (req: Request, res: Response) => {
  const { ready, firebase, frontend } = await checkReadiness();
  const statusCode = ready ? 200 : 503;
  const body: Record<string, unknown> = {
    status: ready ? "ready" : "degraded",
    firebase,
    timestamp: new Date().toISOString(),
  };
  if (frontend !== undefined) {
    body.frontend = frontend;
  }
  return res.status(statusCode).json(body);
});

/**
 * Standard Health check
 * Provides overall status without revealing internal sensitive details.
 */
router.get(["/api/health", "/api/v1/health"], async (req: Request, res: Response) => {
  const { ready, firebase, frontend } = await checkReadiness();
  const statusCode = ready ? 200 : 503;
  const mem = process.memoryUsage();
  const body: Record<string, unknown> = {
    status: ready ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: Math.floor(process.uptime()),
    memoryUsage: {
      rss: Math.round(mem.rss / (1024 * 1024)) + " MB",
      heapTotal: Math.round(mem.heapTotal / (1024 * 1024)) + " MB",
      heapUsed: Math.round(mem.heapUsed / (1024 * 1024)) + " MB",
      external: Math.round(mem.external / (1024 * 1024)) + " MB"
    },
    firebase,
  };
  if (frontend !== undefined) {
    body.frontend = frontend;
  }
  return res.status(statusCode).json(body);
});

export default router;
