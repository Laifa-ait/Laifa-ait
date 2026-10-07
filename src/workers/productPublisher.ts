import { admin, db } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";

const CHECK_INTERVAL = 60 * 1000; // 1 minute
let workerInterval: NodeJS.Timeout | null = null;
let isJobRunning = false;

export const executeProductPublisherJob = async (): Promise<number> => {
  if (!db || !admin || !admin.apps || admin.apps.length === 0) {
    return 0;
  }
  if (isJobRunning) {
    safeLogger.warn("[Olmart Workers] ⏳ Product Publisher Worker skip: previous cycle still in progress.");
    return 0;
  }

  isJobRunning = true;
  try {
    // Multi-instance distributed lease lock for Cloud Run container scaling
    try {
      const locksCol = db.collection("system_locks");
      if (typeof locksCol?.doc === "function" && typeof db.runTransaction === "function") {
        const lockRef = locksCol.doc("product_publisher");
        const acquired = await db.runTransaction(async (transaction) => {
          const lockDoc = await transaction.get(lockRef);
          const data = lockDoc.data ? lockDoc.data() : undefined;
          const expiresAt = data?.expiresAt?.toMillis ? data.expiresAt.toMillis() : (typeof data?.expiresAt === "number" ? data.expiresAt : 0);
          if (Date.now() < expiresAt) {
            return false;
          }
          transaction.set(lockRef, {
            instanceId: process.env.K_REVISION || `instance_${process.pid}`,
            expiresAt: admin.firestore.Timestamp ? admin.firestore.Timestamp.fromMillis(Date.now() + 50000) : Date.now() + 50000,
            acquiredAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          return true;
        });

        if (!acquired) {
          safeLogger.info("[Olmart Workers] ⏳ Another Cloud Run instance holds the publisher lease. Skipping cycle.");
          return 0;
        }
      }
    } catch (lockError: unknown) {
      // In testing environments or restricted permissions, safely continue with in-memory mutex
      safeLogger.debug("[Olmart Workers] Distributed lock bypass", { reason: lockError instanceof Error ? lockError.message : String(lockError) });
    }

    const now = Date.now();
    
    const snapshot = await db.collection("products")
      .where("publishAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return 0;
    }

    const batch = db.batch();
    let updatedCount = 0;

    snapshot.forEach((doc) => {
      // Double check publishAt is set and valid, and status is pending/draft
      const data = doc.data();
      if (["pending", "draft"].includes(data.status) && data.publishAt && typeof data.publishAt === 'number' && data.publishAt <= now) {
        batch.update(doc.ref, { 
          status: "active",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Clear publishAt after publishing so we don't query it again unnecessarily
          publishAt: admin.firestore.FieldValue.delete()
        });
        
        // Log activity
        const activityRef = db.collection("admin_activities").doc();
        batch.set(activityRef, {
          type: "product_published",
          message: `Produit publié automatiquement (Cron): ${data.name || doc.id}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          productId: doc.id
        });
        
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      safeLogger.info("[Olmart Workers] Published scheduled products", { updatedCount });
    }
    return updatedCount;
  } catch (err) {
    safeLogger.error("[Olmart Workers] Product publisher worker error", { err: err instanceof Error ? err.message : String(err) });
    return 0;
  } finally {
    isJobRunning = false;
  }
};

export const startProductPublisherWorker = () => {
  if (workerInterval) return;

  workerInterval = setInterval(() => {
    executeProductPublisherJob().catch((err: unknown) => {
      safeLogger.error("[Olmart Workers] Unhandled error in publisher worker loop", { err: String(err) });
    });
  }, CHECK_INTERVAL);

  if (workerInterval.unref) {
    workerInterval.unref();
  }
  
  safeLogger.info("[Olmart Workers] ⚡ Product Publisher Worker active.");
};

export const stopProductPublisherWorker = () => {
  if (workerInterval) {
    try {
      clearInterval(workerInterval);
    } catch {
      // Safe no-op
    }
    workerInterval = null;
    safeLogger.info("[Olmart Workers] 🛑 Product Publisher Worker stopped.");
  }
};
