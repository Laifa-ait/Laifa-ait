import { Router, Response } from "express";
import { db, admin } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { sellerCouponCreateSchema, sellerCouponStatusSchema } from "../validators/seller.validators";
import { safeLogger } from "../../../utils/logger";
import { SellerCouponService } from "../services/sellerCoupon.service";

const router = Router();

// GET /api/v1/seller/coupons - Fetch only the authenticated seller's coupons
router.get(
  "/api/v1/seller/coupons",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const sellerId = req.user.uid;

      const snap = await db
        .collection("coupons")
        .where("sellerId", "==", sellerId)
        .get();

      const coupons: Record<string, unknown>[] = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });

      coupons.sort((a, b) => SellerCouponService.getDocMillis(b) - SellerCouponService.getDocMillis(a));

      return res.json({ success: true, coupons });
    } catch (error: unknown) {
      safeLogger.error("[SellerCouponController] ❌ Error fetching seller coupons", {
        err: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Impossible de récupérer vos codes promo." });
    }
  }
);

// POST /api/v1/seller/coupons - Create a new seller coupon with ACID uniqueness & IDOR prevention
router.post(
  "/api/v1/seller/coupons",
  authenticateToken,
  authorizeSeller,
  validateRequest(sellerCouponCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const sellerId = req.user.uid;
      const { code, discountType, discountValue, expiryDate, minOrderAmount, maxUses } = req.body;

      const createdCoupon = await SellerCouponService.createCoupon({
        sellerId,
        code,
        discountType,
        discountValue,
        expiryDate,
        minOrderAmount,
        maxUses,
      });

      safeLogger.info("[SellerCouponController] 🟢 Seller coupon created", {
        sellerId,
        couponId: createdCoupon.id,
        code: createdCoupon.code,
      });

      return res.status(201).json({
        success: true,
        message: "Code promo créé avec succès.",
        coupon: createdCoupon,
      });
    } catch (error: unknown) {
      safeLogger.error("[SellerCouponController] ❌ Error creating seller coupon", {
        err: error instanceof Error ? error.message : String(error),
      });
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Erreur lors de la création du code promo.",
      });
    }
  }
);

// PUT /api/v1/seller/coupons/:id/status - Toggle coupon active status (Anti-IDOR)
router.put(
  "/api/v1/seller/coupons/:id/status",
  authenticateToken,
  authorizeSeller,
  validateRequest(sellerCouponStatusSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const sellerId = req.user.uid;
      const couponId = req.params.id;
      const { isActive } = req.body;

      const couponRef = db.collection("coupons").doc(couponId);
      const couponSnap = await couponRef.get();

      if (!couponSnap.exists) {
        return res.status(404).json({ error: "Code promo introuvable." });
      }

      const couponData = couponSnap.data();

      // Strict IDOR ownership check: ensure this coupon belongs exclusively to the calling seller
      if (couponData?.sellerId !== sellerId && couponData?.createdBy !== sellerId) {
        safeLogger.warn("[SellerCouponController] ⚠️ IDOR attempt blocked on coupon status update", {
          attemptedBy: sellerId,
          couponId,
          actualOwner: couponData?.sellerId,
        });
        return res.status(403).json({ error: "Action non autorisée sur ce code promo." });
      }

      await couponRef.update({
        isActive: Boolean(isActive),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      safeLogger.info("[SellerCouponController] 🔄 Coupon status updated", {
        sellerId,
        couponId,
        isActive,
      });

      return res.json({
        success: true,
        message: `Code promo ${isActive ? "activé" : "désactivé"} avec succès.`,
        isActive: Boolean(isActive),
      });
    } catch (error: unknown) {
      safeLogger.error("[SellerCouponController] ❌ Error updating coupon status", {
        err: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
    }
  }
);

// DELETE /api/v1/seller/coupons/:id - Delete a seller coupon & release lock (Anti-IDOR)
router.delete(
  "/api/v1/seller/coupons/:id",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const sellerId = req.user.uid;
      const couponId = req.params.id;

      const couponRef = db.collection("coupons").doc(couponId);
      const couponSnap = await couponRef.get();

      if (!couponSnap.exists) {
        return res.status(404).json({ error: "Code promo introuvable." });
      }

      const couponData = couponSnap.data();

      // Strict IDOR ownership check
      if (couponData?.sellerId !== sellerId && couponData?.createdBy !== sellerId) {
        safeLogger.warn("[SellerCouponController] ⚠️ IDOR attempt blocked on coupon deletion", {
          attemptedBy: sellerId,
          couponId,
          actualOwner: couponData?.sellerId,
        });
        return res.status(403).json({ error: "Action non autorisée sur ce code promo." });
      }

      const couponCode = couponData?.code;

      await db.runTransaction(async (transaction) => {
        if (couponCode) {
          const lockRef = db.collection("coupon_codes").doc(couponCode);
          transaction.delete(lockRef);
        }
        transaction.delete(couponRef);
      });

      safeLogger.info("[SellerCouponController] 🗑️ Seller coupon deleted & lock released", {
        sellerId,
        couponId,
        couponCode,
      });

      return res.json({
        success: true,
        message: "Code promo supprimé avec succès.",
      });
    } catch (error: unknown) {
      safeLogger.error("[SellerCouponController] ❌ Error deleting seller coupon", {
        err: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la suppression du code promo." });
    }
  }
);

export default router;
