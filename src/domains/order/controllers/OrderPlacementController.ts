import { Response, Router } from "express";
import crypto from "crypto";
import { db } from "../../../config/firebase-admin";
import { optionalAuthenticateToken, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { strictLimiter } from "../../../middlewares/rateLimiters";
import { placeOrderSchema } from "../../../utils/validation";
import { enqueueSellerVelocityCheck } from "../../../utils/velocity";
import { CouponService } from "../../marketing/coupon.service";
import { safeLogger } from "../../../utils/logger";
import { TrendingSearchesService } from "../../../services/TrendingSearchesService";
import { sendLowStockEmail, sendOrderConfirmationEmails } from "../services/orderEmailNotifier";
import { OrderPlacementService } from "../services/orderPlacement.service";

const router = Router();

// Place order endpoint
router.post(
  "/place-order",
  strictLimiter,
  optionalAuthenticateToken,
  validateRequest(placeOrderSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const { cart, shippingAddress, billingAddress, couponCode, deliveryMethod, idempotencyKey } = req.body;
    const isGuest = !req.user;
    const userId = req.user ? req.user.uid : `guest_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
    const guestRecoveryToken = isGuest ? crypto.randomBytes(32).toString("hex") : null;
    const guestTokenHash = guestRecoveryToken
      ? crypto.createHash("sha256").update(guestRecoveryToken).digest("hex")
      : null;

    if (idempotencyKey) {
      try {
        const keyRef = db.collection("idempotency_keys").doc(idempotencyKey);
        const keySnap = await keyRef.get();
        if (keySnap.exists) {
          const keyData = keySnap.data();
          return res.json({
            orderId: keyData?.orderId,
            status: "already_processed",
            message: "Commande déjà traitée",
          });
        }
      } catch (e) {
        safeLogger.error("Error reading idempotency_keys collection, falling back", {
          err: e instanceof Error ? e.message : String(e),
        });
      }

      const existingOrder = await db
        .collection("orders")
        .where("idempotencyKey", "==", idempotencyKey)
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (!existingOrder.empty) {
        const existingDoc = existingOrder.docs[0];
        return res.json({
          orderId: existingDoc.id,
          status: "already_processed",
          message: "Commande déjà traitée",
        });
      }
    }

    try {
      const result = await OrderPlacementService.executeOrderPlacement({
        cart,
        shippingAddress,
        billingAddress,
        couponCode,
        deliveryMethod,
        idempotencyKey,
        userId,
        isGuest,
        guestRecoveryToken,
        guestTokenHash,
      });

      if (result.alreadyProcessed) {
        return res.json({
          orderId: result.orderId,
          grandTotal: result.total || 0,
          status: "already_processed",
          message: "Commande déjà traitée",
        });
      }

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

      for (const sellerId of result.sellerIdsSet) {
        enqueueSellerVelocityCheck(sellerId);
      }

      try {
        const purchasedItemsForTrends = result.subOrdersForEmail.flatMap((so) =>
          so.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
          }))
        );
        TrendingSearchesService.recordPurchase(purchasedItemsForTrends);
      } catch {
        // Non-blocking
      }

      sendOrderConfirmationEmails(
        shippingAddress.email || "",
        shippingAddress.fullName || shippingAddress.name || "",
        result.orderId,
        result.total,
        result.subOrdersForEmail
      ).catch((e) =>
        safeLogger.error("Failed to process order confirmation emails", {
          err: e instanceof Error ? e.message : String(e),
        })
      );

      if (result.emailAlerts.length > 0) {
        Promise.all(
          result.emailAlerts.map(async (alert) => {
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

      if (isGuest && guestRecoveryToken) {
        res.cookie("olmart_guest_claim_token", `${userId}:${guestRecoveryToken}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      }

      res.json({
        success: true,
        orderId: result.orderId,
        grandTotal: result.total,
        codAmount: result.codAmount,
        guestUserId: isGuest ? userId : undefined,
        guestRecoveryToken: isGuest && guestRecoveryToken ? guestRecoveryToken : undefined,
      });
    } catch (error: unknown) {
      safeLogger.error("Place order err", { err: error instanceof Error ? error.message : String(error) });
      const errObj = error as { code?: string; message?: string };
      if (errObj.code === "PRICE_CONFLICT") {
        return res.status(409).json({ error: errObj.message });
      }
      const message =
        error instanceof Error ? error.message : typeof errObj.message === "string" ? errObj.message : "Erreur de la commande.";
      res.status(400).json({ error: message });
    }
  }
);

// Validate coupon endpoint
router.post(
  "/validate-coupon",
  strictLimiter,
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { code, items } = req.body;
    const userId = req.user?.uid;
    const isGuest = !req.user;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "Code requis" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Panier requis pour valider ce code promo." });
    }

    try {
      const upperCode = code.trim().toUpperCase();
      const q = await db.collection("coupons").where("code", "==", upperCode).get();

      const resolveResult = CouponService.resolveActiveCouponFromDocs(q.docs);
      if (!resolveResult.couponDoc) {
        return res.status(400).json({ error: resolveResult.error || "Code promo invalide ou expiré." });
      }

      const couponDoc = resolveResult.couponDoc;
      const couponData = couponDoc.data() as Record<string, unknown>;

      const reconstructed = await CouponService.reconstructVerifiedCartFromFirestore(items, db);
      if (!reconstructed.valid) {
        return res.status(400).json({ error: reconstructed.error || "Panier requis pour valider ce code promo." });
      }

      const validation = CouponService.validateCoupon({
        couponDocId: couponDoc.id,
        couponData,
        subtotal: reconstructed.serverSubtotal,
        userId,
        isGuest,
        items: reconstructed.verifiedItems,
      });

      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      return res.json({
        success: true,
        coupon: validation.coupon,
        discountAmount: validation.discountAmount,
        eligibleSubtotal: validation.eligibleSubtotal,
      });
    } catch (error: unknown) {
      safeLogger.error("Coupon validation error", { err: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "Erreur serveur lors de la validation." });
    }
  }
);

export default router;
