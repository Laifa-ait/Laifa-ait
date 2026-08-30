import { Router, Response } from "express";
import { optionalAuthenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { SettingsService } from "../home/services/settings.service";
import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";

const router = Router();

/**
 * GET /api/v1/bootstrap
 * Single-pass consolidated initialization endpoint for ultra-fast mobile & desktop startup.
 * Aggregates mega menu, category hierarchy, featured products, user profile, active cart, and wishlist.
 */
router.get("/bootstrap", optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid;

  try {
    const [megamenuRes, categoriesRes, featuredRes, profileRes, cartRes, wishlistRes] = await Promise.allSettled([
      SettingsService.getSettingById("megamenu"),
      SettingsService.getCategoriesHierarchy(),
      db.collection("products")
        .where("isPublished", "==", true)
        .limit(20)
        .get()
        .then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      uid ? db.collection("users").doc(uid).get().then((doc) => (doc.exists ? { uid: doc.id, ...doc.data() } : null)) : Promise.resolve(null),
      uid ? db.collection("users").doc(uid).collection("cart").doc("active").get().then((doc) => (doc.exists ? doc.data()?.items || [] : [])) : Promise.resolve([]),
      uid ? db.collection("users").doc(uid).collection("wishlist").doc("active").get().then((doc) => (doc.exists ? doc.data()?.items || [] : [])) : Promise.resolve([]),
    ]);

    const megamenu = megamenuRes.status === "fulfilled" ? megamenuRes.value : {};
    const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : {};
    const featuredProducts = featuredRes.status === "fulfilled" ? featuredRes.value : [];
    const profile = profileRes.status === "fulfilled" ? profileRes.value : null;
    const cart = cartRes.status === "fulfilled" ? cartRes.value : [];
    const wishlist = wishlistRes.status === "fulfilled" ? wishlistRes.value : [];

    return res.json({
      success: true,
      data: {
        megamenu,
        categories,
        featuredProducts,
        profile,
        cart,
        wishlist,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    safeLogger.error("[Bootstrap API] Error aggregating initial payload", { err: msg });
    return res.status(500).json({ error: "Erreur lors de l'initialisation de l'application." });
  }
});

export default router;
