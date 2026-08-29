import { Router, Request, Response } from "express";
import { db, admin } from "../../config/firebase-admin";
import { optionalAuthenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { CouponService } from "./coupon.service";
import { safeLogger } from "../../utils/logger";
import nodeCache from "node-cache";

const cache = new nodeCache({ stdTTL: 300, maxKeys: 1000, useClones: false });
const router = Router();

// POST analytics track
router.post("/api/v1/analytics/track", async (req: Request, res: Response) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid events payload" });
    }

    const batch = admin.firestore().batch();
    events.forEach((evt: Record<string, unknown>) => {
      const ref = admin.firestore().collection("analytics_events").doc();
      batch.set(ref, {
        ...evt,
        serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return res.json({ success: true, count: events.length });
  } catch (error) {
    safeLogger.error("Analytics track error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Failed to track events" });
  }
});

// POST sponsorship analytics track
router.post("/api/v1/sponsorship/analytics/track", async (req: Request, res: Response) => {
  try {
    const { productId, action } = req.body;
    if (!productId || !["impression", "click"].includes(action)) {
      return res.status(400).json({ error: "productId and valid action required" });
    }

    const snap = await db.collection("sponsorship_requests")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .limit(1)
      .get();

    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      const fieldToIncrement = action === "impression" ? "impressionsCount" : "clicksCount";
      await docRef.update({
        [fieldToIncrement]: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Sponsorship analytics error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Failed to record sponsorship event" });
  }
});

// GET campaign products
router.get("/api/v1/campaigns/:bannerId/products", async (req: Request, res: Response) => {
  try {
    const bannerId = req.params.bannerId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 24));

    const cacheKey = `campaigns_products_${bannerId}`;
    const campaignData = cache.get(cacheKey) as { banner: Record<string, unknown>; products: Record<string, unknown>[] } | undefined;
    if (campaignData) {
      const totalProducts = campaignData.products.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedProducts = campaignData.products.slice(startIndex, endIndex);

      return res.json({
        banner: campaignData.banner,
        products: paginatedProducts,
        page,
        limit,
        total: totalProducts,
        hasMore: endIndex < totalProducts,
      });
    }

    const bannerSnap = await db.collection("banners").doc(bannerId).get();
    if (!bannerSnap.exists) {
      return res.status(404).json({ error: "Bannière introuvable" });
    }

    const bannerData = { id: bannerSnap.id, ...bannerSnap.data() } as Record<string, unknown>;
    const tagId = bannerData.tag_id as string | undefined;
    const featuredIds: string[] = Array.isArray(bannerData.featured_products)
      ? (bannerData.featured_products as string[])
      : [];

    const productsMap = new Map<string, Record<string, unknown>>();

    if (featuredIds.length > 0) {
      for (let i = 0; i < featuredIds.length; i += 10) {
        const chunk = featuredIds.slice(i, i + 10);
        const chunkSnap = await db.collection("products").where("__name__", "in", chunk).get();
        chunkSnap.docs.forEach((doc) => {
          const prodData = { id: doc.id, ...doc.data(), isBannerFeatured: true };
          productsMap.set(doc.id, prodData);
        });
      }
    }

    if (tagId) {
      const tagSnap = await db.collection("tags").doc(tagId).get();
      if (tagSnap.exists) {
        const tagName = tagSnap.data()?.name;
        const prodSnap1 = await db.collection("products").where("tag_id", "==", tagId).limit(50).get();
        const prodSnap2 = await db.collection("products").where("tags", "array-contains", tagId).limit(50).get();
        const prodSnap3 = tagName
          ? await db.collection("products").where("tags", "array-contains", tagName).limit(50).get()
          : { docs: [] };

        [...prodSnap1.docs, ...prodSnap2.docs, ...prodSnap3.docs].forEach((doc) => {
          if (!productsMap.has(doc.id)) {
            productsMap.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });
      }
    }

    const finalProducts: Record<string, unknown>[] = [];
    featuredIds.forEach((id) => {
      const p = productsMap.get(id);
      if (p) {
        finalProducts.push(p);
        productsMap.delete(id);
      }
    });
    finalProducts.push(...Array.from(productsMap.values()));

    const responseData = { banner: bannerData, products: finalProducts };
    cache.set(cacheKey, responseData, 600);

    const totalProducts = finalProducts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = finalProducts.slice(startIndex, endIndex);

    return res.json({
      banner: bannerData,
      products: paginatedProducts,
      page,
      limit,
      total: totalProducts,
      hasMore: endIndex < totalProducts,
    });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST validate coupon
router.post("/api/v1/checkout/validate-coupon", optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, items } = req.body;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "Code requis" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Panier requis pour valider ce code promo." });
    }

    const upperCode = code.trim().toUpperCase();
    const qSnap = await db.collection("coupons").where("code", "==", upperCode).get();
    
    const resolveResult = CouponService.resolveActiveCouponFromDocs(qSnap.docs);
    if (!resolveResult.couponDoc) {
      return res.status(400).json({ error: resolveResult.error || "Code promo ou coupon invalide." });
    }

    const couponDoc = resolveResult.couponDoc;
    const couponData = couponDoc.data() as Record<string, unknown>;
    const userId = req.user?.uid;
    const isGuest = !req.user;

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
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

export default router;
