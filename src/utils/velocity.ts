import { admin, db } from "../config/firebase-admin";
import { firestore } from "firebase-admin";
import { safeLogger } from "./logger";

export async function checkSellerVelocityLimit(sellerId: string, transaction?: firestore.Transaction) {
  try {
    const ordersSnap = await db.collection("orders")
      .where("sellerIds", "array-contains", sellerId)
      .orderBy("createdAt", "desc")
      .limit(300)
      .get();
    
    const pendingStatuses = ['pending', 'confirmed', 'preparing', 'processing'];
    
    // Filter pending order documents
    const pendingDocs = ordersSnap.docs.filter(doc => {
      const orderData = doc.data();
      const status = (orderData.status || '').toLowerCase();
      return pendingStatuses.includes(status);
    });

    // Cache buyer verification Promises during this run to eliminate both sequential and concurrent duplicate queries
    const buyerPromiseCache = new Map<string, Promise<boolean>>();

    const checkBuyerVerified = (buyerId: string): Promise<boolean> => {
      if (buyerPromiseCache.has(buyerId)) {
        return buyerPromiseCache.get(buyerId)!;
      }

      const promise = (async (): Promise<boolean> => {
        try {
          // Fetch buyer's orders history
          const buyerOrdersSnap = await db.collection("orders")
            .where("userId", "==", buyerId)
            .orderBy("createdAt", "desc")
            .limit(20)
            .get();
          
          const hasSuccessfulPurchase = buyerOrdersSnap.docs.some(d => {
            const dData = d.data();
            const dStatus = (dData.status || '').toLowerCase();
            return ['shipped', 'delivered', 'completed', 'received'].includes(dStatus);
          });

          if (hasSuccessfulPurchase) {
            return true;
          }

          // Fetch buyer's profile creation date for age check as a fallback
          const buyerRef = db.collection("users").doc(buyerId);
          const buyerSnap = await buyerRef.get();
          const buyerData = buyerSnap.exists ? buyerSnap.data() : null;
          let isOldAccount = false;
          if (buyerData && buyerData.createdAt) {
            const createdAtTime = buyerData.createdAt.toDate 
              ? buyerData.createdAt.toDate().getTime() 
              : new Date(buyerData.createdAt).getTime();
            isOldAccount = (Date.now() - createdAtTime) > 2 * 24 * 60 * 60 * 1000; // Account > 2 days old
          }

          return isOldAccount;
        } catch (err) {
          safeLogger.error("Failed to check buyer verification in velocity check", { buyerId, err: err instanceof Error ? err.message : String(err) });
          return false;
        }
      })();

      buyerPromiseCache.set(buyerId, promise);
      return promise;
    };

    // Evaluate pending orders in bounded concurrency batches (concurrency capped at 10)
    const results: boolean[] = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < pendingDocs.length; i += BATCH_SIZE) {
      const batch = pendingDocs.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (doc) => {
          const orderData = doc.data();
          const paymentStatus = (orderData.paymentStatus || '').toLowerCase();
          
          // 1. If it's prepaid (Card, etc.) and already paid, it's safe to count towards velocity limit
          if (paymentStatus === 'paid') {
            return true;
          }

          // 2. Otherwise (COD or Split COD), check if the buyer is established to prevent competitor spam DoS
          const buyerId = orderData.userId || orderData.buyerId;
          if (!buyerId) {
            safeLogger.info("Velocity defense: Ignored untracked buyer order", { orderId: doc.id, sellerId });
            return false;
          }

          const isVerified = await checkBuyerVerified(buyerId);
          if (!isVerified) {
            safeLogger.info("Velocity defense: Ignored unverified COD order", { orderId: doc.id, sellerId });
          }
          return isVerified;
        })
      );
      results.push(...batchResults);
    }

    const pendingCount = results.filter(Boolean).length;
    
    const sellerRef = db.collection("users").doc(sellerId);
    const sellerSnap = await sellerRef.get();
    if (!sellerSnap.exists) return;
    const sellerData = sellerSnap.data();
    
    const updateData = {
      isActive: pendingCount <= 5,
      is_active: pendingCount <= 5,
      velocitySuspended: pendingCount > 5,
      bgSuspended_reason: pendingCount > 5 ? `Alerte Rouge : Limite de vélocité dépassée (${pendingCount} commandes en attente non expédiées).` : null
    };

    if (pendingCount > 5) {
      if (transaction) {
        transaction.update(sellerRef, updateData);
        const alertRef = db.collection("admin_alerts").doc();
        transaction.set(alertRef, {
          type: 'velocity_kill_switch',
          sellerId,
          shopName: sellerData?.shopName || sellerData?.displayName || sellerId,
          pendingCount,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          resolved: false
        });
      } else {
        await sellerRef.update(updateData);
        await db.collection("admin_alerts").add({
          type: 'velocity_kill_switch',
          sellerId,
          shopName: sellerData?.shopName || sellerData?.displayName || sellerId,
          pendingCount,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          resolved: false
        });
      }
      safeLogger.warn("Kill switch: Suspended seller exceeding velocity limit", { sellerId, pendingCount });
    } else if (pendingCount <= 5 && sellerData?.velocitySuspended) {
      if (transaction) {
        transaction.update(sellerRef, updateData);
      } else {
        await sellerRef.update(updateData);
      }
      safeLogger.info("Kill switch: Realigned seller within velocity limit", { sellerId, pendingCount });
    }
  } catch (err) {
    safeLogger.error("Error in checkSellerVelocityLimit", { sellerId, err: err instanceof Error ? err.message : String(err) });
  }
}
