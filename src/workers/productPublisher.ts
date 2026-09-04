import { admin, db } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";

const CHECK_INTERVAL = 60 * 1000; // 1 minute
let workerInterval: NodeJS.Timeout | null = null;
let isJobRunning = false;

export const executeProductPublisherJob = async (): Promise<number> => {
  if (isJobRunning) {
    safeLogger.warn("[Olmart Workers] ⏳ Product Publisher Worker skip: previous cycle still in progress.");
    return 0;
  }

  isJobRunning = true;
  try {
    const firestoreDb = db || admin.firestore();
    const now = Date.now();
    
    const snapshot = await firestoreDb.collection("products")
      .where("publishAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return 0;
    }

    const batch = firestoreDb.batch();
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
        const activityRef = firestoreDb.collection("admin_activities").doc();
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
    clearInterval(workerInterval);
    workerInterval = null;
    safeLogger.info("[Olmart Workers] 🛑 Product Publisher Worker stopped.");
  }
};
