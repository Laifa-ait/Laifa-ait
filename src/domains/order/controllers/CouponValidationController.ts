import { Response, Router } from "express";
import { db } from "../../../config/firebase-admin";
import { optionalAuthenticateToken, AuthenticatedRequest } from "../../../middlewares/auth";
import { strictLimiter } from "../../../middlewares/rateLimiters";
import { CouponService } from "../../marketing/coupon.service";
import { safeLogger } from "../../../utils/logger";

const router = Router();

router.post("/validate-coupon", strictLimiter, optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
});

export default router;
