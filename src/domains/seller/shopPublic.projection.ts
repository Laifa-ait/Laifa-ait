import { PublicShopDTO } from "./shop.types";

/**
 * Helper function to project authoritative shop DTO with strict whitelist and sanitized values.
 * Authoritative fields (isVerified, sellerTrustScore, status) are derived strictly from the
 * server-controlled 'users' record, ensuring no client or unverified write can spoof them.
 */
export function buildWhitelistedShopDTO(
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
