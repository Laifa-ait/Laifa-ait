import { admin, db } from "../../../config/firebase-admin";
import { enqueueSellerVelocityCheck } from "../../../utils/velocity";
import { safeLogger } from "../../../utils/logger";
import { TrendingSearchesService } from "../../../services/TrendingSearchesService";
import { sendLowStockEmail, sendOrderConfirmationEmails, OrderEmailSubOrder } from "./orderEmailNotifier";
import { PlaceOrderResult } from "./orderPlacement.service";

interface PostPlacementParams {
  result: PlaceOrderResult;
  shippingEmail: string;
  shippingFullName: string;
}

export class OrderPostPlacementService {
  static dispatchPostPlacementTasks(params: PostPlacementParams): void {
    const { result, shippingEmail, shippingFullName } = params;

    // 1. Commit batch notifications
    if (result.internalNotificationsToCreate.length > 0 || result.pushQueueToCreate.length > 0) {
      setImmediate(async () => {
        try {
          const batch = db.batch();
          for (const notif of result.internalNotificationsToCreate) {
            batch.set(notif.ref, notif.data);
          }
          for (const push of result.pushQueueToCreate) {
            batch.set(push.ref, push.data);
          }
          await batch.commit();
        } catch (err) {
          safeLogger.error("Failed to commit post-transaction notifications batch", {
            err: err instanceof Error ? err.message : String(err),
          });
        }
      });
    }

    // 2. Velocity checks for sellers
    for (const sellerId of result.sellerIdsSet) {
      enqueueSellerVelocityCheck(sellerId);
    }

    // 3. Trending searches
    try {
      const purchasedItemsForTrends = result.subOrdersForEmail.flatMap((so: OrderEmailSubOrder) =>
        so.items.map((it: { name?: string; quantity?: number; [key: string]: unknown }) => ({
          name: it.name,
          quantity: it.quantity,
        }))
      );
      TrendingSearchesService.recordPurchase(purchasedItemsForTrends);
    } catch {
      // Non-blocking
    }

    // 4. Order confirmation emails
    sendOrderConfirmationEmails(
      shippingEmail || "",
      shippingFullName || "",
      result.orderId,
      result.total,
      result.subOrdersForEmail
    ).catch((e) =>
      safeLogger.error("Failed to process order confirmation emails", {
        err: e instanceof Error ? e.message : String(e),
      })
    );

    // 5. In-app notifications for each seller
    if (result.subOrdersForEmail && result.subOrdersForEmail.length > 0) {
      Promise.all(
        result.subOrdersForEmail.map(async (so: OrderEmailSubOrder) => {
          try {
            if (!so.sellerId) return;
            const subId = so.subOrderId || result.orderId;
            await db.collection("user_notifications").add({
              recipientId: so.sellerId,
              title: {
                fr: "Nouvelle commande reçue !",
                ar: "طلب جديد وارد !",
                en: "New order received!",
              },
              message: {
                fr: `Nouvelle commande #${subId.substring(0, 8).toUpperCase()} de ${so.total} DZD en attente de préparation.`,
                ar: `طلب جديد #${subId.substring(0, 8).toUpperCase()} بمبلغ ${so.total} د.ج في انتظار التحضير.`,
                en: `New order #${subId.substring(0, 8).toUpperCase()} for ${so.total} DZD awaiting fulfillment.`,
              },
              type: "new_order",
              orderId: subId,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } catch (notifErr) {
            safeLogger.warn("Failed creating seller order notification", {
              err: notifErr instanceof Error ? notifErr.message : String(notifErr),
            });
          }
        })
      ).catch(() => {});
    }

    // 6. Low stock alert emails
    if (result.emailAlerts.length > 0) {
      Promise.all(
        result.emailAlerts.map(async (alert: { sellerId: string; message: string }) => {
          try {
            const userSnap = await db.collection("users").doc(alert.sellerId).get();
            const email = userSnap.data()?.email;
            if (email) {
              await sendLowStockEmail(email, alert.message);
            }
          } catch (e) {
            safeLogger.error("Erreur lors de l'envoi de l'email de stock bas", {
              err: e instanceof Error ? e.message : String(e),
            });
          }
        })
      ).catch((e) =>
        safeLogger.error("Failed to send low stock alert emails", {
          err: e instanceof Error ? e.message : String(e),
        })
      );
    }
  }
}
