import { Router, Request, Response } from "express";
import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import { PublicShopDTO } from "./shop.types";

const router = Router();

// GET explore top sellers
router.get("/api/v1/explore/sellers", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("publicProfiles").limit(100).get();
    const sellers = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ sellers });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// GET public shops directory
router.get("/api/v1/public/shops", async (_req: Request, res: Response) => {
  try {
    const [publicProfilesSnap, sellersSnap] = await Promise.all([
      db.collection("publicProfiles").limit(200).get().catch(() => ({ docs: [] })),
      db.collection("users").where("role", "==", "seller").limit(200).get().catch(() => ({ docs: [] })),
    ]);

    const shopsMap = new Map<string, Record<string, unknown>>();

    publicProfilesSnap.docs.forEach((d) => {
      const data = d.data();
      shopsMap.set(d.id, {
        id: d.id,
        sellerId: d.id,
        shopName: data.shopName || data.displayName || "Boutique Olmart",
        slogan: data.slogan || "",
        description: data.description || data.shopDescription || "",
        logoUrl: data.logoUrl || data.photoURL || "",
        bannerUrl: data.bannerUrl || data.coverUrl || "",
        wilaya: data.wilaya || "16 - Alger",
        category: data.category || data.specialty || "Général",
        categories: data.categories || [data.category || "Général"],
        rating: data.rating !== undefined ? data.rating : null,
        sellerTrustScore: data.sellerTrustScore !== undefined ? data.sellerTrustScore : null,
        reviewsCount: data.reviewsCount ?? 0,
        productsCount: data.productsCount ?? 0,
        isVerified: data.status === "ACTIVE" || data.status === "active" || data.isVerified !== false,
        status: data.status || "ACTIVE",
        avgPreparationTime: data.avgPreparationTime || "24h",
        badge: data.badge || "Vendeur Vérifié",
        createdAt: data.createdAt || Date.now(),
      });
    });

    sellersSnap.docs.forEach((d) => {
      const data = d.data();
      const existing = shopsMap.get(d.id);
      if (!existing) {
        shopsMap.set(d.id, {
          id: d.id,
          sellerId: d.id,
          shopName: data.shopName || data.displayName || "Boutique Indépendante",
          slogan: data.slogan || "",
          description: data.description || data.shopDescription || "",
          logoUrl: data.logoUrl || data.photoURL || data.avatarUrl || "",
          bannerUrl: data.bannerUrl || data.coverUrl || data.coverImage || "",
          wilaya: data.wilaya || "16 - Alger",
          category: data.category || "Général",
          categories: [data.category || "Général"],
          rating: null,
          sellerTrustScore: null,
          reviewsCount: 0,
          productsCount: 0,
          isVerified: true,
          status: data.status || "ACTIVE",
          avgPreparationTime: "24h",
          badge: "Boutique Certifiée",
          createdAt: data.createdAt || Date.now(),
        });
      } else {
        if (data.shopName && (existing.shopName === "Boutique Olmart" || !existing.shopName)) {
          existing.shopName = data.shopName;
        }
        if (!existing.logoUrl && (data.logoUrl || data.photoURL || data.avatarUrl)) {
          existing.logoUrl = data.logoUrl || data.photoURL || data.avatarUrl;
        }
        if (!existing.bannerUrl && (data.bannerUrl || data.coverUrl || data.coverImage)) {
          existing.bannerUrl = data.bannerUrl || data.coverUrl || data.coverImage;
        }
      }
    });

    const shops = Array.from(shopsMap.values());
    safeLogger.info("/api/v1/public/shops fetched public shop profiles", { count: shops.length });
    return res.json({ success: true, shops });
  } catch (error: unknown) {
    safeLogger.error("Error fetching public shops", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// GET single public shop profile
router.get("/api/v1/public/shops/:sellerId", async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId || typeof sellerId !== "string" || !sellerId.trim()) {
      return res.status(400).json({ success: false, error: "Identifiant vendeur manquant" });
    }

    const [pubSnap, userSnap] = await Promise.all([
      db.collection("publicProfiles").doc(sellerId).get(),
      db.collection("users").doc(sellerId).get(),
    ]);

    // Check existence
    if (!pubSnap.exists && !userSnap.exists) {
      return res.status(404).json({ success: false, error: "Boutique introuvable" });
    }

    const pubData = pubSnap.exists ? (pubSnap.data() || {}) : {};
    const userData = userSnap.exists ? (userSnap.data() || {}) : {};

    // Validate account eligibility: non-seller accounts (e.g. buyer/customer) are not public shops
    if (userSnap.exists) {
      const userRole = userData.role;
      if (userRole && userRole !== "seller") {
        return res.status(404).json({ success: false, error: "Boutique non disponible" });
      }

      const userStatus = userData.status;
      if (userStatus && userStatus !== "active" && userStatus !== "ACTIVE") {
        return res.status(404).json({ success: false, error: "Boutique non disponible" });
      }
    } else if (pubSnap.exists) {
      const pubStatus = pubData.status;
      if (pubStatus && pubStatus !== "active" && pubStatus !== "ACTIVE") {
        return res.status(404).json({ success: false, error: "Boutique non disponible" });
      }
    }

    // Authoritative verification flag: cannot be forged via client-writable publicProfiles alone
    const isVerified = userSnap.exists
      ? Boolean(userData.isVerified === true && (userData.status === "active" || userData.status === "ACTIVE"))
      : Boolean(pubData.isVerified === true && (pubData.status === "active" || pubData.status === "ACTIVE"));

    // Whitelist extraction for categories
    let categories: string[] = ["Général"];
    if (Array.isArray(pubData.categories)) {
      const filtered = pubData.categories.filter((c: unknown): c is string => typeof c === "string" && Boolean(c.trim()));
      if (filtered.length > 0) categories = filtered;
    } else if (Array.isArray(userData.categories)) {
      const filtered = userData.categories.filter((c: unknown): c is string => typeof c === "string" && Boolean(c.trim()));
      if (filtered.length > 0) categories = filtered;
    } else if (typeof pubData.category === "string" && pubData.category.trim()) {
      categories = [pubData.category.trim()];
    } else if (typeof userData.category === "string" && userData.category.trim()) {
      categories = [userData.category.trim()];
    }

    const shopName =
      (typeof pubData.shopName === "string" && pubData.shopName.trim()) ||
      (typeof userData.shopName === "string" && userData.shopName.trim()) ||
      (typeof pubData.displayName === "string" && pubData.displayName.trim()) ||
      (typeof userData.displayName === "string" && userData.displayName.trim()) ||
      "Boutique Olmart";

    const slogan =
      (typeof pubData.slogan === "string" && pubData.slogan.trim()) ||
      (typeof userData.slogan === "string" && userData.slogan.trim()) ||
      "";

    const description =
      (typeof pubData.description === "string" && pubData.description.trim()) ||
      (typeof pubData.shopDescription === "string" && pubData.shopDescription.trim()) ||
      (typeof userData.description === "string" && userData.description.trim()) ||
      (typeof userData.shopDescription === "string" && userData.shopDescription.trim()) ||
      "Bienvenue dans ma boutique sur Olmart.";

    const logoUrl =
      (typeof pubData.logoUrl === "string" && pubData.logoUrl.trim()) ||
      (typeof pubData.photoURL === "string" && pubData.photoURL.trim()) ||
      (typeof userData.logoUrl === "string" && userData.logoUrl.trim()) ||
      (typeof userData.photoURL === "string" && userData.photoURL.trim()) ||
      "";

    const bannerUrl =
      (typeof pubData.bannerUrl === "string" && pubData.bannerUrl.trim()) ||
      (typeof pubData.coverUrl === "string" && pubData.coverUrl.trim()) ||
      (typeof userData.bannerUrl === "string" && userData.bannerUrl.trim()) ||
      (typeof userData.coverUrl === "string" && userData.coverUrl.trim()) ||
      "";

    const wilaya =
      (typeof pubData.wilaya === "string" && pubData.wilaya.trim()) ||
      (typeof userData.wilaya === "string" && userData.wilaya.trim()) ||
      "16 - Alger";

    const commune =
      (typeof pubData.commune === "string" && pubData.commune.trim()) ||
      (typeof userData.commune === "string" && userData.commune.trim()) ||
      "";

    const category =
      (typeof pubData.category === "string" && pubData.category.trim()) ||
      (typeof userData.category === "string" && userData.category.trim()) ||
      categories[0] ||
      "Général";

    const avgPreparationTime =
      (typeof pubData.avgPreparationTime === "string" && pubData.avgPreparationTime.trim()) ||
      (typeof userData.avgPreparationTime === "string" && userData.avgPreparationTime.trim()) ||
      "24h";

    const returnPolicy =
      (typeof pubData.returnPolicy === "string" && pubData.returnPolicy.trim()) ||
      (typeof userData.returnPolicy === "string" && userData.returnPolicy.trim()) ||
      "Retours acceptés sous 7 jours.";

    const legalStatus =
      (typeof pubData.legalStatus === "string" && pubData.legalStatus.trim()) ||
      (typeof userData.legalStatus === "string" && userData.legalStatus.trim()) ||
      "Artisan / Commerçant";

    // Strictly construct Whitelisted DTO
    const shop: PublicShopDTO = {
      id: String(sellerId),
      sellerId: String(sellerId),
      shopName,
      slogan,
      description,
      shopDescription: description,
      logoUrl,
      bannerUrl,
      wilaya,
      commune,
      category,
      categories,
      rating: typeof pubData.rating === "number" ? pubData.rating : (typeof userData.rating === "number" ? userData.rating : null),
      reviewsCount: typeof pubData.reviewsCount === "number" ? pubData.reviewsCount : (typeof userData.reviewsCount === "number" ? userData.reviewsCount : 0),
      sellerTrustScore: typeof pubData.sellerTrustScore === "number" ? pubData.sellerTrustScore : (typeof userData.sellerTrustScore === "number" ? userData.sellerTrustScore : null),
      productsCount: typeof pubData.productsCount === "number" ? pubData.productsCount : (typeof userData.productsCount === "number" ? userData.productsCount : 0),
      isVerified,
      status: "ACTIVE",
      avgPreparationTime,
      returnPolicy,
      legalStatus,
      followersCount: typeof pubData.followersCount === "number" ? pubData.followersCount : (typeof userData.followersCount === "number" ? userData.followersCount : 0),
      badge: isVerified ? ((typeof pubData.badge === "string" && pubData.badge.trim()) || "Vendeur Vérifié") : "",
      ...(typeof pubData.supportPhone === "string" && pubData.supportPhone.trim()
        ? { supportPhone: pubData.supportPhone.trim() }
        : typeof userData.supportPhone === "string" && userData.supportPhone.trim()
        ? { supportPhone: userData.supportPhone.trim() }
        : {}),
    };

    return res.json({
      success: true,
      shop,
    });
  } catch (error: unknown) {
    safeLogger.error("Error fetching single public shop", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération de la boutique" });
  }
});

// GET public products for shop
router.get("/api/v1/public/shops/:sellerId/products", async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) {
      return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    }

    const productMap = new Map<string, Record<string, unknown>>();
    const candidateFields = ["sellerId", "sellerUid", "userId", "storeId", "shopId"];
    for (const f of candidateFields) {
      try {
        const snap = await db.collection("products").where(f, "==", sellerId).limit(100).get();
        snap.docs.forEach((doc) => productMap.set(doc.id, { id: doc.id, ...doc.data() }));
      } catch {
        // Ignore single field query error
      }
    }

    const products = Array.from(productMap.values());
    return res.json({ success: true, products, count: products.length });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop products", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne", products: [] });
  }
});

// GET public active coupons for a shop
router.get("/api/v1/public/shops/:sellerId/coupons", async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) {
      return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    }

    const snap = await db
      .collection("coupons")
      .where("sellerId", "==", sellerId)
      .where("isActive", "==", true)
      .get();

    const now = new Date();
    const activeCoupons = snap.docs
      .map((doc) => {
        const d = doc.data();

        // Check if usage limit reached
        const maxUses = typeof d.maxUses === "number" ? d.maxUses : (typeof d.usageLimit === "number" ? d.usageLimit : null);
        const currentUses = Number(d.usedCount ?? d.usageCount) || 0;
        if (maxUses !== null && maxUses > 0 && currentUses >= maxUses) {
          return null;
        }

        let expiresAtIso: string | null = null;
        if (d.expiresAt?.toDate) {
          expiresAtIso = d.expiresAt.toDate().toISOString();
        } else if (d.expiryDate?.toDate) {
          expiresAtIso = d.expiryDate.toDate().toISOString();
        } else if (typeof d.expiresAt === "string") {
          expiresAtIso = d.expiresAt;
        }

        const isExpired = expiresAtIso ? new Date(expiresAtIso) <= now : false;
        if (isExpired) return null;

        let createdAtMs = 0;
        if (d.createdAt?.toDate) {
          createdAtMs = d.createdAt.toDate().getTime();
        } else if (d.createdAt?.seconds) {
          createdAtMs = d.createdAt.seconds * 1000;
        } else if (d.createdAt) {
          createdAtMs = new Date(d.createdAt).getTime() || 0;
        }

        return {
          id: doc.id,
          code: d.code,
          discountType: d.discountType,
          discountValue: Number(d.discountValue) || 0,
          minOrderAmount: Number(d.minOrderAmount ?? d.minOrderValue) || 0,
          expiresAt: expiresAtIso,
          sellerId: d.sellerId,
          createdAtMs,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    // Deterministic sort: creation descending, then expiration, then id ascending
    activeCoupons.sort((a, b) => {
      if (b.createdAtMs !== a.createdAtMs) {
        return b.createdAtMs - a.createdAtMs;
      }
      if (a.expiresAt && b.expiresAt) {
        const cmp = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        if (cmp !== 0) return cmp;
      }
      return a.id.localeCompare(b.id);
    });

    const publicCoupons = activeCoupons.map(({ createdAtMs: _ignored, ...dto }) => dto);

    return res.json({ success: true, coupons: publicCoupons });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop public coupons", {
      sellerId,
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur interne",
      coupons: [],
    });
  }
});

// GET explore top products
router.get("/api/v1/explore/products", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("products").where("status", "==", "active").limit(120).get();
    const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ products });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

export default router;
