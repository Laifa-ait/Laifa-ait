import { Router, Response } from "express";
import { db, admin } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { sellerCouponCreateSchema, sellerCouponStatusSchema } from "../validators/seller.validators";
import { safeLogger } from "../../../utils/logger";

const router = Router();

const getDocMillis = (docData: Record<string, unknown>): number => {
  const val = docData.createdAt;
  if (!val) return 0;
  if (typeof val === "object" && val !== null) {
    if ("toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().getTime();
    }
    if ("seconds" in val && typeof (val as { seconds: number }).seconds === "number") {
      return (val as { seconds: number }).seconds * 1000;
    }
    if (val instanceof Date) {
      return val.getTime();
    }
  }
  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }
  return 0;
};

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

      // Sort by creation descending in memory if missing composite index
      coupons.sort((a, b) => getDocMillis(b) - getDocMillis(a));

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

      const upperCode = String(code).trim().toUpperCase();
      const parsedExpiry = new Date(expiryDate);
      const minOrder = Number(minOrderAmount) || 0;
      const parsedMaxUses = maxUses ? Number(maxUses) : null;

      const codeLockRef = db.collection("coupon_codes").doc(upperCode);
      const newCouponRef = db.collection("coupons").doc();

      const createdCoupon = await db.runTransaction(async (transaction) => {
        const lockDoc = await transaction.get(codeLockRef);
        if (lockDoc.exists) {
          throw new Error("Ce code promo existe déjà. Veuillez choisir un autre code.");
        }

        const existingQuery = await transaction.get(
          db.collection("coupons").where("code", "==", upperCode).limit(1)
        );
        if (!existingQuery.empty) {
          throw new Error("Ce code promo existe déjà. Veuillez choisir un autre code.");
        }

        const couponData = {
          code: upperCode,
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: minOrder,
          minOrderAmount: minOrder,
          maxDiscountAmount: null,
          maxDiscount: null,
          startAt: admin.firestore.FieldValue.serverTimestamp(),
          startsAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: admin.firestore.Timestamp.fromDate(parsedExpiry),
          expiryDate: admin.firestore.Timestamp.fromDate(parsedExpiry),
          usageLimit: parsedMaxUses,
          maxUses: parsedMaxUses,
          maxUsesPerUser: null,
          singleUsePerClient: false,
          limitedToCategories: [],
          limitedToSellers: [sellerId],
          sellerId: sellerId,
          usageCount: 0,
          usedCount: 0,
          usedBy: [],
          userUsages: {},
          isActive: true,
          createdBy: sellerId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        transaction.set(codeLockRef, {
          couponId: newCouponRef.id,
          code: upperCode,
          sellerId: sellerId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        transaction.set(newCouponRef, couponData);

        return { id: newCouponRef.id, ...couponData };
      });

      safeLogger.info("[SellerCouponController] 🟢 Seller coupon created", {
        sellerId,
        couponId: createdCoupon.id,
        code: upperCode,
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
      const couponDoc = await couponRef.get();

      if (!couponDoc.exists) {
        return res.status(404).json({ error: "Coupon introuvable." });
      }

      const couponData = couponDoc.data();
      if (!couponData || couponData.sellerId !== sellerId) {
        return res.status(403).json({
          error: "Accès refusé : vous ne pouvez modifier que vos propres coupons (IDOR Guard).",
        });
      }

      await couponRef.update({
        isActive: Boolean(isActive),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      safeLogger.info("[SellerCouponController] 🟢 Seller coupon status updated", {
        sellerId,
        couponId,
        isActive,
      });

      return res.json({
        success: true,
        message: isActive ? "Coupon activé avec succès." : "Coupon désactivé avec succès.",
      });
    } catch (error: unknown) {
      safeLogger.error("[SellerCouponController] ❌ Error updating seller coupon status", {
        err: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
    }
  }
);

// DELETE /api/v1/seller/coupons/:id - Delete seller coupon (Anti-IDOR & Atomic Lock Release)
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
      const couponDoc = await couponRef.get();

      if (!couponDoc.exists) {
        return res.status(404).json({ error: "Coupon introuvable." });
      }

      const couponData = couponDoc.data();
      if (!couponData || couponData.sellerId !== sellerId) {
        return res.status(403).json({
          error: "Accès refusé : vous ne pouvez supprimer que vos propres coupons (IDOR Guard).",
        });
      }

      const couponCode = couponData.code;
      const codeLockRef = couponCode ? db.collection("coupon_codes").doc(couponCode) : null;

      const batch = db.batch();
      batch.delete(couponRef);
      if (codeLockRef) {
        batch.delete(codeLockRef);
      }
      await batch.commit();

      safeLogger.info("[SellerCouponController] 🟢 Seller coupon deleted", {
        sellerId,
        couponId,
      });

      return res.json({
        success: true,
        message: "Coupon supprimé avec succès.",
      });
    } catch (error: unknown) {
      safeLogger.error("[SellerCouponController] ❌ Error deleting seller coupon", {
        err: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la suppression du coupon." });
    }
  }
);

export default router;
