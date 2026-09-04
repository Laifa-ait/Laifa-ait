import { admin, db } from "../../config/firebase-admin";
import { safeLogger } from "../logger";
import { checkSellerVelocityLimit } from "./velocityCore";

// In-flight velocity check tracker for graceful shutdown draining
const inFlightVelocityChecks = new Set<Promise<void>>();
let velocityWorkerInterval: NodeJS.Timeout | null = null;

export async function processVelocityJob(sellerId: string): Promise<void> {
  try {
    await checkSellerVelocityLimit(sellerId);
    // Delete completed job from durable Firestore queue
    await db.collection("velocity_jobs").doc(sellerId).delete().catch((deleteErr) => {
      safeLogger.warn("Failed to delete completed velocity job from Firestore queue", {
        sellerId,
        err: deleteErr instanceof Error ? deleteErr.message : String(deleteErr)
      });
    });
  } catch (err) {
    safeLogger.error("Error processing velocity job", { sellerId, err: err instanceof Error ? err.message : String(err) });
  }
}

/**
 * Enqueues a velocity check to the background queue.
 * Decoupled from the HTTP request cycle: writes job asynchronously to Firestore
 * and schedules processing on setImmediate without blocking the HTTP response thread.
 */
export function enqueueSellerVelocityCheck(sellerId: string): void {
  if (!db || !admin || !admin.apps || admin.apps.length === 0) {
    safeLogger.warn("Skipping enqueueSellerVelocityCheck: Firebase Admin / db is not ready");
    return;
  }
  // 1. Write job to durable Firestore queue asynchronously
  db.collection("velocity_jobs").doc(sellerId).set({
    sellerId,
    status: "pending",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }).catch(err => {
    safeLogger.error("Failed to persist velocity job in velocity_jobs collection", { sellerId, err: err instanceof Error ? err.message : String(err) });
  });

  // 2. Decoupled execution scheduled via setImmediate (runs after HTTP response is dispatched)
  setImmediate(() => {
    const checkPromise = processVelocityJob(sellerId);
    inFlightVelocityChecks.add(checkPromise);
    checkPromise.finally(() => {
      inFlightVelocityChecks.delete(checkPromise);
    });
  });
}

export async function reconcileVelocityJobs(): Promise<void> {
  if (!db || !admin || !admin.apps || admin.apps.length === 0) {
    return;
  }
  try {
    const pendingJobsSnap = await db.collection("velocity_jobs")
      .where("status", "==", "pending")
      .limit(100)
      .get();

    if (pendingJobsSnap.empty) return;

    safeLogger.info(`[Velocity Worker] Reconciling ${pendingJobsSnap.size} pending velocity jobs from queue...`);
    const promises = pendingJobsSnap.docs.map(doc => {
      const sellerId = doc.id;
      return processVelocityJob(sellerId);
    });

    await Promise.allSettled(promises);
  } catch (err) {
    safeLogger.error("Error reconciling velocity jobs queue", { err: err instanceof Error ? err.message : String(err) });
  }
}

export function startVelocityWorker(intervalMs = 300000): void {
  // Run initial reconciliation on boot
  reconcileVelocityJobs().catch((err) => {
    safeLogger.error("Failed to run initial velocity reconciliation on boot", {
      err: err instanceof Error ? err.message : String(err)
    });
  });

  if (velocityWorkerInterval) return;
  velocityWorkerInterval = setInterval(() => {
    reconcileVelocityJobs().catch((err) => {
      safeLogger.error("Failed to run periodic velocity reconciliation in background worker", {
        err: err instanceof Error ? err.message : String(err)
      });
    });
  }, intervalMs);
  if (velocityWorkerInterval.unref) {
    velocityWorkerInterval.unref();
  }
}

export function stopVelocityWorker(): void {
  if (velocityWorkerInterval) {
    clearInterval(velocityWorkerInterval);
    velocityWorkerInterval = null;
  }
}

export async function drainVelocityChecks(timeoutMs = 5000): Promise<void> {
  if (inFlightVelocityChecks.size === 0) return;
  
  safeLogger.info(`[Velocity Drain] Waiting for ${inFlightVelocityChecks.size} active velocity checks to complete...`);
  const drainPromise = Promise.allSettled(Array.from(inFlightVelocityChecks));
  
  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      safeLogger.warn("[Velocity Drain] Timeout reached while waiting for in-flight velocity checks.");
      resolve();
    }, timeoutMs);
  });

  await Promise.race([drainPromise, timeoutPromise]);
  if (timer) clearTimeout(timer);
}
