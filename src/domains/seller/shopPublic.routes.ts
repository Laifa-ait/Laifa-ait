import { Router, Request, Response } from "express";
import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import { PublicShopDTO } from "./shop.types";

const router = Router();

// Helper function to project authoritative shop DTO with strict whitelist and sanitized values
function buildWhitelistedShopDTO(
  sellerId: string,
  userData: Record<string, unknown>,
  pubData: Record<string, unknown>
): PublicShopDTO {
  // Authoritative verification from 'users' ONLY
  const isVerified = userData.isVerified === true;

  // Authoritative trust score from 'users' ONLY (never client-writable publicProfiles)
  let sellerTrustScore: number | null = null;
  if (typeof userData.sellerTrustScore === "number" && !Number.isNaN(userData.sellerTrustScore)) {
    sellerTrustScore = Math.max(0, Math.min(100, Math.round(userData.sellerTrustScore)));
  } else if (typeof userData.trustScore === "number" && !Number.isNaN(userData.trustScore)) {
    sellerTrustScore = Math.max(0, Math.min(100, Math.round(userData.trustScore)));
  }

  // Server-derived badge based on authoritative state
  const badge = isVerified ? "Vendeur Vérifié" : "";

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

  // Validated rating (number between 0 and 5, or null)
  let rating: number | null = null;
  if (typeof pubData.rating === "number" && !Number.isNaN(pubData.rating) && pubData.rating >= 0 && pubData.rating <= 5) {
    rating = Number(pubData.rating.toFixed(1));
  } else if (typeof userData.rating === "number" && !Number.isNaN(userData.rating) && userData.rating >= 0 && userData.rating <= 5) {
    rating = Number(userData.rating.toFixed(1));
  }

  // Validated reviewsCount (integer >= 0)
  let reviewsCount = 0;
  if (typeof pubData.reviewsCount === "number" && !Number.isNaN(pubData.reviewsCount) && pubData.reviewsCount >= 0) {
    reviewsCount = Math.floor(pubData.reviewsCount);
  } else if (typeof userData.reviewsCount === "number" && !Number.isNaN(userData.reviewsCount) && userData.reviewsCount >= 0) {
    reviewsCount = Math.floor(userData.reviewsCount);
  }

  // Validated productsCount (integer >= 0)
  let productsCount = 0;
  if (typeof pubData.productsCount === "number" && !Number.isNaN(pubData.productsCount) && pubData.productsCount >= 0) {
    productsCount = Math.floor(pubData.productsCount);
  } else if (typeof userData.productsCount === "number" && !Number.isNaN(userData.productsCount) && userData.productsCount >= 0) {
    productsCount = Math.floor(userData.productsCount);
  }

  // Validated followersCount (integer >= 0)
  let followersCount = 0;
  if (typeof pubData.followersCount === "number" && !Number.isNaN(pubData.followersCount) && pubData.followersCount >= 0) {
    followersCount = Math.floor(pubData.followersCount);
  } else if (typeof userData.followersCount === "number" && !Number.isNaN(userData.followersCount) && userData.followersCount >= 0) {
    followersCount = Math.floor(userData.followersCount);
  }

  return {
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
    rating,
    reviewsCount,
    sellerTrustScore,
    productsCount,
    isVerified,
    status: "ACTIVE",
    avgPreparationTime,
    returnPolicy,
    legalStatus,
    followersCount,
    badge,
  };
}

// GET explore top sellers
router.get("/api/v1/explore/sellers", async (_req: Request, res: Response) => {
  try {
    const [usersSnap, publicProfilesSnap] = await Promise.all([
      db.collection("users").where("role", "==", "seller").limit(100).get(),
      db.collection("publicProfiles").limit(100).get(),
    ]);

    const pubProfilesMap = new Map<string, Record<string, unknown>>();
    publicProfilesSnap.docs.forEach((d) => {
      pubProfilesMap.set(d.id, d.data() || {});
    });

    const sellers: PublicShopDTO[] = [];
    for (const userDoc of usersSnap.docs) {
      if (!userDoc.exists) continue;
      const userData = userDoc.data() || {};
      const userRole = typeof userData.role === "string" ? userData.role.trim() : "";
      if (userRole !== "seller") continue;
      const userStatus = typeof userData.status === "string" ? userData.status.trim() : "";
      if (userStatus !== "active" && userStatus !== "ACTIVE") continue;

      const pubData = pubProfilesMap.get(userDoc.id) || {};
      sellers.push(buildWhitelistedShopDTO(userDoc.id, userData, pubData));
    }

    return res.json({ success: true, sellers });
  } catch (error: unknown) {
    safeLogger.error("Error fetching explore sellers", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des vendeurs" });
  }
});

// GET public shops directory
router.get("/api/v1/public/shops", async (_req: Request, res: Response) => {
  try {
    const [usersSnap, publicProfilesSnap] = await Promise.all([
      db.collection("users").where("role", "==", "seller").limit(200).get(),
      db.collection("publicProfiles").limit(200).get(),
    ]);

    const pubProfilesMap = new Map<string, Record<string, unknown>>();
    publicProfilesSnap.docs.forEach((d) => {
      pubProfilesMap.set(d.id, d.data() || {});
    });

    const shops: PublicShopDTO[] = [];
    for (const userDoc of usersSnap.docs) {
      if (!userDoc.exists) continue;
      const userData = userDoc.data() || {};
      const userRole = typeof userData.role === "string" ? userData.role.trim() : "";
      if (userRole !== "seller") continue;
      const userStatus = typeof userData.status === "string" ? userData.status.trim() : "";
      if (userStatus !== "active" && userStatus !== "ACTIVE") continue;

      const pubData = pubProfilesMap.get(userDoc.id) || {};
      shops.push(buildWhitelistedShopDTO(userDoc.id, userData, pubData));
    }

    safeLogger.info("/api/v1/public/shops fetched public shop profiles", { count: shops.length });
    return res.json({ success: true, shops });
  } catch (error: unknown) {
    safeLogger.error("Error fetching public shops", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des boutiques" });
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

    // Strict requirement 1: The authoritative 'users' document MUST exist
    if (!userSnap.exists) {
      return res.status(404).json({ success: false, error: "Boutique introuvable" });
    }

    const userData = userSnap.data() || {};
    const pubData = pubSnap.exists ? (pubSnap.data() || {}) : {};

    // Strict requirement 2: Explicit role requirement -> must be 'seller'
    const userRole = typeof userData.role === "string" ? userData.role.trim() : "";
    if (userRole !== "seller") {
      return res.status(404).json({ success: false, error: "Boutique non disponible" });
    }

    // Strict requirement 3: Explicit status requirement -> must be 'active' or 'ACTIVE'
    const userStatus = typeof userData.status === "string" ? userData.status.trim() : "";
    if (userStatus !== "active" && userStatus !== "ACTIVE") {
      return res.status(404).json({ success: false, error: "Boutique non disponible" });
    }

    // Construct whitelisted DTO using authoritative projection
    const shop = buildWhitelistedShopDTO(sellerId, userData, pubData);

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
