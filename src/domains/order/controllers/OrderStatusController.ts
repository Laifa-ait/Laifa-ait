import { Response, Router } from "express";
import { firestore } from "firebase-admin";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, optionalAuthenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { checkSellerVelocityLimit } from "../../../utils/velocity";
import nodemailer from "nodemailer";
import { Product, ProductVariant } from "../../product/product.types";

export class BusinessError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

interface FirestoreProduct extends Partial<Product> {
  hasOutOfStockVariants?: boolean;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendLowStockEmail = async (sellerEmail: string, message: string): Promise<void> => {
  try {
    if (!process.env.SMTP_USER) {
      console.log("Mock Email Sent (SMTP not configured). To:", sellerEmail, "Message:", message);
      return;
    }
    await transporter.sendMail({
      from: '"Olmart" <noreply@olmart.dz>',
      to: sellerEmail,
      subject: "⚠️ Alerte Stock Critique - Olmart",
      text: message,
    });
  } catch (err) {
    console.error("Failed to send stock alert email", err);
  }
};

const router = Router();

// Update Order Status Securely
router.post(
  "/seller/orders/status",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderIds, status } = req.body as { orderIds?: string[]; status?: string };
    const sellerId = req.user?.uid || "";
    const isUserAdmin = req.user?.role === 'admin';
    const authUid = req.user?.uid || "";
    const { deliveryPin, deliveryPhoto, latitude, longitude } = req.body as {
      deliveryPin?: string | number;
      deliveryPhoto?: string;
      latitude?: number;
      longitude?: number;
    };

    if (
      !orderIds ||
      !Array.isArray(orderIds) ||
      orderIds.length === 0 ||
      !status
    ) {
      return res
         .status(400)
         .json({ error: "orderIds list and status are required" });
    }

    try {
      await db.runTransaction(async (t: firestore.Transaction) => {
        let globalCommissionRate = 0;
        
        try {
          const commDoc = await t.get(db.collection("settings").doc("commission"));
          if (commDoc && commDoc.exists) {
              globalCommissionRate = Number(commDoc.data()?.globalRate) || 0;
          }
        } catch (err) {
          console.warn("Failed retrieving global commission", err);
        }

        // Structure to collect read results safely before doing any write operations
        const ordersData: Array<{
          id: string;
          orderRef: firestore.DocumentReference;
          data: Record<string, unknown>;
          targetSellerUid: string;
          sellerCommissionRate: number;
          productSnaps?: firestore.DocumentSnapshot[];
        }> = [];

        // PHASE 1: READ PHASE (All reads executed first)
        for (const id of orderIds) {
          const orderRef = db.collection("orders").doc(id);
          const orderSnap = await t.get(orderRef);
          if (!orderSnap.exists) {
            throw new BusinessError(404, `La commande #${id} est introuvable.`);
          }
          const data = (orderSnap.data() || {}) as Record<string, unknown>;

          const sellerIds = data.sellerIds as string[] | undefined;
          const isUserSeller = sellerIds?.includes(sellerId) || data.sellerId === sellerId;
          
          if (!isUserAdmin && !isUserSeller) {
            throw new BusinessError(403, `Accès non autorisé pour la commande #${id}.`);
          }

          const actualSellerId = (sellerIds && sellerIds[0]) || (data.sellerId as string) || sellerId;
          const targetSellerUid = isUserAdmin ? actualSellerId : sellerId;

          const currentStatus = (data.status as string) || "NEW";
          const targetStatus = status;
          const cStatus = currentStatus.toLowerCase();
          const tStatus = targetStatus.toLowerCase();

          let sellerCommissionRate = globalCommissionRate;
          let productSnaps: firestore.DocumentSnapshot[] = [];

          if (tStatus === "delivered" && cStatus !== "delivered") {
            const sellerSnap = await t.get(db.collection("users").doc(targetSellerUid));
            if (sellerSnap.exists) {
              const sellerData = sellerSnap.data();
              if (typeof sellerData?.commissionRate === 'number') {
                sellerCommissionRate = sellerData.commissionRate;
              }
            }
          }

          if ((tStatus === "returned" || tStatus === "canceled") && !data.restocked) {
            const items = (data.items as Array<{ id?: string; quantity?: number; selectedVariant?: string }>) || [];
            const productIds = [
              ...new Set(
                items
                  .map((item) => item.id)
                  .filter((pId): pId is string => typeof pId === "string" && pId !== "")
              ),
            ];

            if (productIds.length > 0) {
              const productRefs = productIds.map((pId) => db.collection("products").doc(pId));
              productSnaps = await t.getAll(...productRefs);
            }
          }

          ordersData.push({
            id,
            orderRef,
            data,
            targetSellerUid,
            sellerCommissionRate,
            productSnaps,
          });
        }

        // PHASE 2: WRITE PHASE (All writes executed, absolutely zero reads)
        for (const orderInfo of ordersData) {
          const { id, orderRef, data, targetSellerUid, sellerCommissionRate, productSnaps } = orderInfo;

          const sellerIds = data.sellerIds as string[] | undefined;
          const isUserSeller = sellerIds?.includes(sellerId) || data.sellerId === sellerId;

          const currentStatus = (data.status as string) || "NEW";
          const targetStatus = status;

          // Strict state machine transitions (seller-managed direct delivery)
          const validTransitions: Record<string, string[]> = {
            new: ["processing", "confirmed", "picked_up", "in_transit", "delivered", "canceled"],
            pending: ["processing", "confirmed", "picked_up", "in_transit", "delivered", "canceled"],
            confirmed: ["processing", "preparing", "shipped", "picked_up", "in_transit", "delivered", "canceled"],
            preparing: ["processing", "picked_up", "shipped", "in_transit", "delivered", "canceled"],
            processing: ["picked_up", "shipped", "in_transit", "delivered", "canceled"],
            picked_up: ["in_transit", "shipped", "delivered", "canceled", "returned"],
            in_transit: ["delivered", "returned", "canceled"],
            shipped: ["delivered", "returned", "canceled"],
            delivered: ["return_requested", "dispute_open", "returned"],
            return_requested: ["return_approved", "return_rejected"],
            return_approved: ["returning"],
            returning: ["returned"],
            returned: ["refunded"],
            canceled: [],
            dispute_open: ["dispute_resolved"],
          };

          const cStatus = currentStatus.toLowerCase();
          const tStatus = targetStatus.toLowerCase();

          if (isUserSeller && !isUserAdmin) {
            const allowedBySeller = ['confirmed', 'processing', 'preparing', 'shipped', 'picked_up', 'in_transit', 'delivered', 'canceled', 'returned', 'return_requested', 'returning'];
            if (!allowedBySeller.includes(tStatus)) {
              throw new BusinessError(403, "Statut non autorisé.");
            }
          }

          if (cStatus !== tStatus) {
            if (
              !validTransitions[cStatus] ||
              !validTransitions[cStatus].includes(tStatus)
            ) {
              throw new BusinessError(400, `Transition de statut invalide : de ${cStatus} vers ${tStatus}.`);
            }
          }

          const updatePayload: Record<string, firestore.FieldValue | string | number | boolean | undefined> = {
            status: tStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          if (tStatus === "return_approved") {
            updatePayload["returnRequest.status"] = "approved";
          } else if (tStatus === "return_rejected") {
            updatePayload["returnRequest.status"] = "rejected";
          } else if (tStatus === "returned") {
            updatePayload["returnRequest.status"] = "received";
          }

          // Automatic Return Stock Restoration (RTO)
          if ((tStatus === "returned" || tStatus === "canceled") && !data.restocked && productSnaps) {
            const productUpdates = new Map<string, FirestoreProduct>();
            for (const snap of productSnaps) {
              if (snap.exists) {
                productUpdates.set(snap.id, snap.data() as FirestoreProduct);
              }
            }

            const items = (data.items as Array<{ id?: string; quantity?: number; selectedVariant?: string }>) || [];
            for (const item of items) {
              if (!item.id || !item.quantity) continue;
              const pData = productUpdates.get(item.id);
              if (pData) {
                if (item.selectedVariant) {
                  pData.variants = (pData.variants || []).map((v: ProductVariant) => {
                    if (v.name === item.selectedVariant) {
                      return {
                        ...v,
                        stock: Number(v.stock || 0) + Number(item.quantity || 1),
                      };
                    }
                    return v;
                  });
                  pData.stock = (pData.variants || []).reduce(
                    (acc: number, curr: ProductVariant) => acc + Math.max(0, Number(curr.stock) || 0),
                    0
                  );
                  pData.hasOutOfStockVariants = (pData.variants || []).some(
                    (v: ProductVariant) => Math.max(0, Number(v.stock) || 0) <= 0
                  );
                } else {
                  pData.stock = Number(pData.stock || 0) + Number(item.quantity || 1);
                }
              }
            }

            for (const [pId, pData] of productUpdates.entries()) {
              t.update(db.collection("products").doc(pId), pData as firestore.UpdateData<FirestoreProduct>);
            }
            updatePayload.restocked = true;
            updatePayload.restockedAt = admin.firestore.FieldValue.serverTimestamp();
            console.log(`[Olmart Workers] 📦 RTO Stock Restored automatically for order #${id}`);
          }

          if (tStatus === "refunded" && cStatus !== "refunded") {
            updatePayload["returnRequest.status"] = "completed";
            updatePayload.paymentStatus = "refunded";
          }

          if (tStatus === "delivered" && cStatus !== "delivered") {
            const orderPin = data.deliveryPin as string | undefined;
            if (!orderPin) {
              throw new BusinessError(400, "La commande ne possède pas de code PIN de livraison valide.");
            }
            
            const hasValidPin = deliveryPin && String(deliveryPin).trim() === String(orderPin).trim();
            const hasValidPhoto = deliveryPhoto && typeof deliveryPhoto === 'string' && latitude !== undefined && longitude !== undefined;

            if (!isUserAdmin && !hasValidPin && !hasValidPhoto) {
              throw new BusinessError(400, "La confirmation de livraison requiert soit le code PIN de l'acheteur (deliveryPin), soit une photo de livraison géolocalisée (deliveryPhoto, latitude, longitude).");
            }

            const subtotal = Number(data.subtotal || 0);
            const commissionToDeduct = (subtotal * sellerCommissionRate) / 100;
            const amountToCredit = Number(data.total || 0) - commissionToDeduct;

            updatePayload.commissionRateApplied = sellerCommissionRate;
            updatePayload.commissionAmount = commissionToDeduct;
            updatePayload.payoutAmount = amountToCredit;
            updatePayload.paymentStatus = "paid";
          }

          t.update(orderRef, updatePayload);

          const logRef = orderRef.collection("order_logs").doc();
          t.set(logRef, {
            status: status,
            type: "status_update",
            date: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          // --- Agent Alert / Centre de Notifications ---
          if (data.userId && cStatus !== tStatus && authUid !== data.userId) {
            const statusDict: Record<string, {fr: string, ar: string, en: string}> = {
              processing: { fr: "En préparation", ar: "جاري التحضير", en: "Processing" },
              picked_up: { fr: "Prise en charge / Colis ramassé", ar: "تم الاستلام من البائع", en: "Picked up" },
              in_transit: { fr: "En cours d'acheminement (En transit)", ar: "في الطريق إليك", en: "In transit" },
              shipped: { fr: "Expédiée", ar: "تم الشحن", en: "Shipped" },
              delivered: { fr: "Livrée à destination", ar: "تم التوصيل بنجاح", en: "Delivered" },
              canceled: { fr: "Annulée par le vendeur", ar: "ملغاة من قبل البائع", en: "Canceled" },
              returned: { fr: "Retournée au vendeur", ar: "تم الإرجاع للبائع", en: "Returned" },
            };
            const translatedStatus = statusDict[tStatus] || { fr: tStatus, ar: tStatus, en: tStatus };
            
            const notifRef = db.collection("user_notifications").doc();
            t.set(notifRef, {
              recipientId: data.userId,
              userId: data.userId,
              title: {
                fr: "Mise à jour de votre livraison Olmart",
                ar: "تحديث حالة التوصيل في أولmarth",
                en: "Olmart Delivery Update",
              },
              message: {
                fr: `Le vendeur a mis à jour le statut de votre commande #${id.substring(0,8).toUpperCase()} : ${translatedStatus.fr}`,
                ar: `قام البائع بتحديث حالة طلبك #${id.substring(0,8).toUpperCase()} : ${translatedStatus.ar}`,
                en: `The seller updated your order #${id.substring(0,8).toUpperCase()} : ${translatedStatus.en}`
              },
              type: "order_status",
              orderId: id,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const notifLegacyRef = db.collection("notifications").doc();
            t.set(notifLegacyRef, {
              recipientId: data.userId,
              userId: data.userId,
              title: `Livraison Olmart : ${translatedStatus.fr}`,
              message: `Votre commande #${id.substring(0,8).toUpperCase()} est désormais en statut : ${translatedStatus.fr}.`,
              type: "order_status",
              orderId: id,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          
          await checkSellerVelocityLimit(targetSellerUid, t);
        }
      });

      // Automatically check / lift velocity limit suspension when backlog decreases
      if (req.user?.role !== 'admin') {
        await checkSellerVelocityLimit(sellerId);
      }

      res.json({ success: true });
    } catch (err: unknown) {
      console.error("Order update error:", err);
      if (err instanceof BusinessError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
    }
  }
);

// Cancel Order Securely for Buyer (Module 3 - Data Tampering Prevention)
router.post(
  "/buyer/orders/cancel",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderId } = req.body as { orderId?: string };
    const userId = req.user?.uid || "";

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    try {
      const orderRef = db.collection("orders").doc(orderId);

      await db.runTransaction(async (t: firestore.Transaction) => {
        const orderTxSnap = await t.get(orderRef);
        if (!orderTxSnap.exists) {
          throw new BusinessError(404, "Commande introuvable");
        }
        const oData = orderTxSnap.data();
        if (!oData) {
          throw new BusinessError(404, "Données de la commande introuvables");
        }
        if (oData.userId !== userId) {
          throw new BusinessError(403, "Accès non autorisé");
        }

        if ((oData.status || "") !== "pending") {
          throw new BusinessError(
            400,
            "Seules les commandes en attente peuvent être annulées"
          );
        }

        // Restore Stock (Optimized for multiple variants)
        const productUpdates = new Map<string, FirestoreProduct>();
        const items = (oData.items as Array<{ id?: string; quantity?: number; selectedVariant?: string }>) || [];
        const productIds = [
          ...new Set(
            items
              .map((item) => item.id)
              .filter((pId): pId is string => typeof pId === "string" && pId !== "")
          ),
        ];

        if (productIds.length > 0) {
          const productRefs = productIds.map((pId) => db.collection("products").doc(pId));
          const productSnaps = await t.getAll(...productRefs);
          for (const snap of productSnaps) {
            if (snap.exists) {
              productUpdates.set(snap.id, snap.data() as FirestoreProduct);
            }
          }
        }

        for (const item of items) {
          if (!item.id || !item.quantity) continue;
          const pData = productUpdates.get(item.id);
          if (pData) {
            if (item.selectedVariant) {
              pData.variants = (pData.variants || []).map((v: ProductVariant) => {
                if (v.name === item.selectedVariant) {
                  return {
                    ...v,
                    stock: Number(v.stock || 0) + Number(item.quantity || 1),
                  };
                }
                return v;
              });
              pData.stock = (pData.variants || []).reduce(
                (acc: number, curr: ProductVariant) => acc + Math.max(0, Number(curr.stock) || 0),
                0
              );
              pData.hasOutOfStockVariants = (pData.variants || []).some(
                (v: ProductVariant) => Math.max(0, Number(v.stock) || 0) <= 0
              );
            } else {
              pData.stock = (Number(pData.stock) || 0) + Number(item.quantity || 1);
            }
          }
        }

        for (const [pId, pData] of productUpdates.entries()) {
          t.update(db.collection("products").doc(pId), pData as firestore.UpdateData<FirestoreProduct>);
        }
        
        t.update(orderRef, {
          status: "cancelled_by_client",
          paymentStatus: oData.paymentStatus || "unpaid",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const logRef = orderRef.collection("order_logs").doc();
        t.set(logRef, {
          status: "cancelled_by_client",
          type: "status_update",
          date: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      res.json({ success: true });
    } catch (err: unknown) {
      console.error("Order cancel error:", err);
      if (err instanceof BusinessError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
    }
  }
);

router.post("/checkout/confirm-delivery", optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, fullName, email, phone, wilaya, commune, address, deliveryMethod, items, total, userId } = req.body as {
      id?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      wilaya?: string;
      commune?: string;
      address?: string;
      deliveryMethod?: string;
      items?: unknown;
      total?: number;
      userId?: string;
    };

    if (!id || !fullName || !phone || !wilaya || !commune || !address || !deliveryMethod || !items || total === undefined) {
      return res.status(400).json({ error: "Certains champs obligatoires sont manquants pour la livraison." });
    }

    // Verify constraints matching validation expectations
    if (id.length > 30 || fullName.length > 150 || phone.length > 50 || wilaya.length > 100 || commune.length > 100 || address.length > 500 || deliveryMethod.length > 50 || total < 0) {
      return res.status(400).json({ error: "Certains champs de livraison dépassent les limites de taille ou de valeur autorisées." });
    }

    const deliveryPayload = {
      id,
      fullName,
      email: email || "",
      phone,
      wilaya,
      commune,
      address,
      deliveryMethod,
      items,
      total,
      userId: req.user?.uid ? req.user.uid : (userId || "guest"),
      createdAt: admin.firestore.Timestamp.now(),
    };

    // Save to Firestore via Admin SDK (fully trusted, bypasses security rules)
    await db.collection("confirmed_delivery_info").doc(id).set(deliveryPayload);

    return res.status(200).json({ success: true, registrationId: id });
  } catch (err: unknown) {
    console.error("Server-side delivery confirmation failed:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne lors de la validation." });
  }
});

export default router;
