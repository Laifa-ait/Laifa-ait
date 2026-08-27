import { admin } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";

const CHECK_INTERVAL = 60 * 1000; // 1 minute
let workerInterval: NodeJS.Timeout | null = null;

export const startProductPublisherWorker = () => {
  if (workerInterval) return;

  workerInterval = setInterval(async () => {
    try {
      const now = Date.now();
      
      const snapshot = await admin.firestore().collection("products")
        .where("publishAt", "<=", now)
        .get();

      if (snapshot.empty) {
        return;
      }

      const batch = admin.firestore().batch();
      let updatedCount = 0;

      snapshot.forEach((doc) => {
        // Double check publishAt is set and valid, and status is pending/draft
        const data = doc.data();
        if (["pending", "draft"].includes(data.status) && data.publishAt && typeof data.publishAt === 'number' && data.publishAt <= now) {
          batch.update(doc.ref, { 
            status: "active",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Optionally, clear publishAt after publishing so we don't query it again unnecessarily
            publishAt: admin.firestore.FieldValue.delete()
          });
          
          // Log activity
          const activityRef = admin.firestore().collection("admin_activities").doc();
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
    } catch (err) {
      safeLogger.error("[Olmart Workers] Product publisher worker error", { err: err instanceof Error ? err.message : String(err) });
    }
  }, CHECK_INTERVAL);
  
  safeLogger.info("[Olmart Workers] ⚡ Product Publisher Worker active.");
};

export const stopProductPublisherWorker = () => {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    safeLogger.info("[Olmart Workers] 🛑 Product Publisher Worker stopped.");
  }
};
