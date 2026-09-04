import { Router, Request, Response } from "express";
import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";

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
    if (!sellerId) {
      return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    }

    const [pubSnap, userSnap] = await Promise.all([
      db.collection("publicProfiles").doc(sellerId).get().catch(() => null),
      db.collection("users").doc(sellerId).get().catch(() => null),
    ]);

    if ((pubSnap && pubSnap.exists) || (userSnap && userSnap.exists)) {
      const pubData = pubSnap && pubSnap.exists ? pubSnap.data() : {};
      const userData = userSnap && userSnap.exists ? userSnap.data() : {};
      const merged = { ...userData, ...pubData };

      const logoUrl = pubData?.logoUrl || pubData?.photoURL || pubData?.avatarUrl ||
                      userData?.logoUrl || userData?.photoURL || userData?.avatarUrl || userData?.photoUrl || "";
      const bannerUrl = pubData?.bannerUrl || pubData?.coverUrl || pubData?.coverImage ||
                        userData?.bannerUrl || userData?.coverUrl || userData?.coverImage || userData?.bannerImage || "";

      return res.json({
        success: true,
        shop: {
          id: sellerId,
          sellerId: sellerId,
          shopName: merged.shopName || merged.displayName || "Boutique Olmart",
          slogan: merged.slogan || "",
          description: merged.description || merged.shopDescription || "Bienvenue dans ma boutique sur Olmart.",
          shopDescription: merged.shopDescription || merged.description || "Bienvenue dans ma boutique sur Olmart.",
          wilaya: merged.wilaya || "16 - Alger",
          category: merged.category || merged.specialty || "Général",
          rating: merged.rating !== undefined ? merged.rating : null,
          sellerTrustScore: merged.sellerTrustScore !== undefined ? merged.sellerTrustScore : null,
          reviewsCount: merged.reviewsCount ?? 0,
          productsCount: merged.productsCount ?? 0,
          isVerified: true,
          status: merged.status || "ACTIVE",
          avgPreparationTime: merged.avgPreparationTime || "24h",
          returnPolicy: merged.returnPolicy || "Retours acceptés sous 7 jours.",
          legalStatus: merged.legalStatus || "Artisan / Commerçant",
          followersCount: merged.followersCount || 0,
          ...merged,
          logoUrl,
          bannerUrl,
        },
      });
    }

    const decodedId = decodeURIComponent(sellerId);
    const nameFromId = decodedId.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return res.json({
      success: true,
      shop: {
        id: sellerId,
        sellerId: sellerId,
        shopName: nameFromId || "Boutique Vendeur",
        shopDescription: "Boutique enregistrée sur la Marketplace Olmart Algérie.",
        description: "Boutique enregistrée sur la Marketplace Olmart Algérie.",
        logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFromId)}&background=0F766E&color=fff&bold=true`,
        bannerUrl: "",
        wilaya: "16 - Alger",
        rating: null,
        sellerTrustScore: null,
        isVerified: true,
        status: "ACTIVE",
      },
    });
  } catch (error: unknown) {
    safeLogger.error("Error fetching single public shop", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne" });
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

        return {
          id: doc.id,
          code: d.code,
          discountType: d.discountType,
          discountValue: Number(d.discountValue) || 0,
          minOrderAmount: Number(d.minOrderAmount ?? d.minOrderValue) || 0,
          expiresAt: expiresAtIso,
          sellerId: d.sellerId,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    // Deterministic sort: highest discount value first, lowest min order amount, earliest expiry, deterministic id
    activeCoupons.sort((a, b) => {
      if (b.discountValue !== a.discountValue) {
        return b.discountValue - a.discountValue;
      }
      if (a.minOrderAmount !== b.minOrderAmount) {
        return a.minOrderAmount - b.minOrderAmount;
      }
      if (a.expiresAt && b.expiresAt) {
        const cmp = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        if (cmp !== 0) return cmp;
      }
      return a.id.localeCompare(b.id);
    });

    return res.json({ success: true, coupons: activeCoupons });
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
