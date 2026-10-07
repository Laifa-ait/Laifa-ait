import { Response, Router } from "express";
import crypto from "crypto";
import { db } from "../../../config/firebase-admin";
import { optionalAuthenticateToken, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { strictLimiter } from "../../../middlewares/rateLimiters";
import { placeOrderSchema } from "../../../utils/validation";
import { safeLogger } from "../../../utils/logger";
import { OrderPlacementService } from "../services/orderPlacement.service";
import { OrderPostPlacementService } from "../services/orderPostPlacement.service";
import { couponValidationRouter } from "./CouponValidationController";

const router = Router();

// Mount coupon validation
router.use(couponValidationRouter);

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
          const isOwner =
            (!isGuest && keyData?.userId === userId) ||
            (isGuest && keyData?.guestTokenHash && keyData?.guestTokenHash === guestTokenHash);

          if (!isOwner) {
            safeLogger.warn("[Security Alert] ⚠️ Idempotency key ownership mismatch", {
              idempotencyKey,
              attemptedBy: userId,
              keyOwner: keyData?.userId,
            });
            return res.status(409).json({
              error: "Conflit sur la clé d'idempotence: cette clé appartient à un autre utilisateur.",
            });
          }

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

      OrderPostPlacementService.dispatchPostPlacementTasks({
        result,
        shippingEmail: shippingAddress.email || "",
        shippingFullName: shippingAddress.fullName || shippingAddress.name || "",
      });

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

export default router;
