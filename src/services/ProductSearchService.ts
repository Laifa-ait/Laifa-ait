import { db, admin } from "../config/firebase-admin";
import Fuse from "fuse.js";
import { Request } from "express";
import { safeLogger } from "../utils/logger";

export interface SearchableProduct {
  id: string;
  name?: string;
  category?: string;
  subcategory?: string;
  subSubCategory?: string;
  subsubcategory?: string;
  price?: number;
  wilaya?: string;
  stock?: number;
  gender?: string;
  brand?: string;
  sku?: string;
  season?: string;
  shopName?: string;
  sellerName?: string;
  sellerId?: string;
  sellerTrustScore?: number;
  salesCount?: number;
  rating?: number;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  stats?: {
    reviewCount?: number;
    averageRating?: number;
    totalRatingSum?: number;
  };
}

export interface StoreProfile {
  id?: string;
  uid?: string;
  shopName?: string;
  displayName?: string;
  shopDescription?: string;
  [key: string]: unknown;
}

export interface SearchStoresContainer {
  stores: StoreProfile[];
}

export interface SearchRequestExpress extends Request {
  user?: { uid: string; [key: string]: unknown };
}

// Local cache for products and synonyms to speed up searches
let cachedProducts: SearchableProduct[] = [];
let cachedStores: SearchStoresContainer | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export class ProductSearchService {
  // Normalize text logic (extracted from route)
  static normalizeText(text?: string): string {
    if (!text) return "";
    return text.toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[\u064B-\u065F]/g, "") // Remove Arabic diacritics
      .replace(/[أإآا]/g, "ا") // Normalize Alef
      .replace(/ة/g, "ه") // Normalize Teh Marbuta to Heh
      .toLowerCase()
      .trim();
  }

  // Soundex generator for French / Transliterated Arabic
  static getSoundex(word: string): string {
    const w = word.toLowerCase().trim().replace(/[^a-z]/g, "");
    if (w.length === 0) return "";
    const first = w.charAt(0).toUpperCase();
    const codes: Record<string, number> = {
      b: 1, f: 1, p: 1, v: 1,
      c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
      d: 3, t: 3,
      l: 4,
      m: 5, n: 5,
      r: 6
    };
    let res = first;
    for (let i = 1; i < w.length; i++) {
      const char = w.charAt(i);
      const code = codes[char];
      if (code && code !== codes[w.charAt(i - 1)]) {
        res += code;
      }
    }
    return (res + "0000").slice(0, 4);
  }

  static async performSearch(req: SearchRequestExpress) {
    const queryStr = (req.query.q as string) || "";
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : null;
    const wilayaFilter = req.query.wilaya as string;
    const categoryFilter = req.query.category as string;
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limitVal = Math.min(parseInt((req.query.limit as string) || "24", 10), 100);

    const now = Date.now();
    let productsToIndex = cachedProducts;
    let allStores = cachedStores;

    if (productsToIndex.length === 0 || now - lastCacheUpdate > CACHE_TTL) {
      try {
        const port = process.env.PORT || 3000;
        const host = req.hostname || "localhost";
        const protocol = req.protocol || "http";
        const [productsRes, storesRes] = await Promise.all([
          fetch(`${protocol}://${host}:${port}/api/v1/products`),
          fetch(`${protocol}://${host}:${port}/api/v1/public-profiles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [] }) // getPublicProfiles might not return all without ids, adjust later
          }).catch(() => null)
        ]);

        if (productsRes.ok) {
          const data = (await productsRes.json()) as { products?: SearchableProduct[] };
          productsToIndex = data.products || [];
          cachedProducts = productsToIndex;
          lastCacheUpdate = now;
        }

        if (storesRes && storesRes.ok) {
          const sData = (await storesRes.json()) as SearchStoresContainer;
          allStores = sData;
          cachedStores = allStores;
        }
      } catch (err: unknown) {
        safeLogger.warn("Failed to fetch via HTTP for cache, falling back to db", { err: err instanceof Error ? err.message : String(err) });
        const [prodSnap, profilesSnap] = await Promise.all([
          db.collection("products").where("status", "==", "active").get(),
          db.collection("publicProfiles").get()
        ]);
        productsToIndex = prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SearchableProduct[];
        cachedProducts = productsToIndex;
        
        allStores = { stores: profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StoreProfile[] };
        cachedStores = allStores;
        lastCacheUpdate = now;
      }
    }

    if (!queryStr || queryStr.trim().length === 0) {
      let finalProducts = productsToIndex;
      if (minPrice !== null) finalProducts = finalProducts.filter((p) => (p.price ?? 0) >= minPrice);
      if (maxPrice !== null) finalProducts = finalProducts.filter((p) => (p.price ?? 0) <= maxPrice);
      if (wilayaFilter) finalProducts = finalProducts.filter((p) => p.wilaya === wilayaFilter);
      if (categoryFilter) finalProducts = finalProducts.filter((p) => p.category === categoryFilter);

      const offset = (page - 1) * limitVal;
      const paginatedProducts = finalProducts.slice(offset, offset + limitVal);
      return {
        products: paginatedProducts,
        stores: [],
        total: finalProducts.length,
        page,
        limit: limitVal,
        hasMore: offset + limitVal < finalProducts.length
      };
    }

    const fuseOptions = {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "category", weight: 0.2 },
        { name: "subcategory", weight: 0.1 },
        { name: "tags", weight: 0.1 },
        { name: "shopName", weight: 0.05 },
        { name: "brand", weight: 0.05 },
      ],
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true,
      useExtendedSearch: true
    };

    const fuse = new Fuse(productsToIndex, fuseOptions);
    const searchResults = fuse.search(queryStr);

    const synonymGroups = [
      ["homme", "men", "garçon", "boy", "masculin"],
      ["femme", "women", "fille", "girl", "féminin"],
      ["enfant", "kids", "bébé", "baby", "garçon", "fille"],
      ["chaussure", "basket", "sneaker", "soulier", "shoes", "botte"],
      ["t-shirt", "tricot", "chemise", "shirt", "haut"],
      ["pantalon", "jeans", "serwal", "pants", "short"],
      ["téléphone", "smartphone", "portable", "mobile", "iphone", "samsung"],
      ["pc", "ordinateur", "laptop", "macbook", "computer"]
    ];

    const queryTokens = this.normalizeText(queryStr).split(/\s+/).filter(Boolean);

    if (queryTokens.length > 0 && searchResults.length < 15) {
      const fallbackResults = productsToIndex
        .map((p) => {
          const searchableText = this.normalizeText([
            p.name, p.category, p.subcategory, p.subSubCategory, p.subsubcategory,
            p.gender, p.brand, p.sku, p.season, p.shopName, p.sellerName,
            ...(p.tags || []), ...(p.colors || []), ...(p.sizes || []), ...(p.materials || [])
          ].filter(Boolean).join(" "));

          let matchScore = 0;
          queryTokens.forEach((term) => {
            if (searchableText.includes(term)) {
              matchScore += 1.0; return;
            }
            for (const group of synonymGroups) {
              if (group.some(g => g.includes(term) || term.includes(g))) {
                 if (group.some(syn => searchableText.includes(syn))) {
                   matchScore += 0.7; return;
                 }
              }
            }
            const querySoundex = this.getSoundex(term);
            if (querySoundex) {
              const productWords = searchableText.split(/\s+/);
              for (const word of productWords) {
                if (this.getSoundex(word) === querySoundex) {
                  matchScore += 0.6; return;
                }
              }
            }
            if (term.endsWith('s') || term.endsWith('x')) {
              const singular = term.slice(0, -1);
              if (searchableText.includes(singular)) {
                matchScore += 0.9; return;
              }
            }
            if (term.length > 4 && searchableText.includes(term.slice(0, -1))) {
              matchScore += 0.8; return;
            }
          });
          return { product: p, score: matchScore };
        })
        .filter((r) => r.score >= 0.5)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.product);

      const existingIds = new Set(searchResults.map((r) => r.item.id));
      fallbackResults.forEach((p) => {
        if (!existingIds.has(p.id)) {
          searchResults.push({ item: p, refIndex: 0, score: 0.5 });
          existingIds.add(p.id);
        }
      });
    }

    const processedResults = searchResults.map((r) => {
       const p = r.item;
       const textScore = 1 - (r.score ?? 0.5);
       const salesScore = Math.min((p.salesCount ?? 0) / 100, 1.0);
       const productRating = p.stats?.averageRating ?? p.rating ?? null;
       const ratingScore = productRating !== null ? Math.min(productRating / 5.0, 1.0) : 0.0;
       const trustScore = Math.min((p.sellerTrustScore ?? 50) / 100, 1.0);
       const combinedRankingScore = (textScore * 0.6) + ((salesScore * 0.5 + ratingScore * 0.5) * 0.2) + (trustScore * 0.2);
       return { item: p, ranking: combinedRankingScore };
    });

    processedResults.sort((a, b) => b.ranking - a.ranking);
    let finalProducts = processedResults.map((r) => r.item);

    if (minPrice !== null) finalProducts = finalProducts.filter((p) => (p.price ?? 0) >= minPrice);
    if (maxPrice !== null) finalProducts = finalProducts.filter((p) => (p.price ?? 0) <= maxPrice);
    if (wilayaFilter) finalProducts = finalProducts.filter((p) => p.wilaya === wilayaFilter);
    if (categoryFilter) finalProducts = finalProducts.filter((p) => p.category === categoryFilter);

    let matchedStores: StoreProfile[] = [];
    if (allStores && allStores.stores && queryStr) {
        const queryTokensStore = this.normalizeText(queryStr).split(/\s+/).filter(Boolean);
        if (queryTokensStore.length > 0) {
            matchedStores = allStores.stores.filter((store) => {
                const searchableStoreText = this.normalizeText([
                    store.shopName, store.displayName, store.shopDescription
                ].filter(Boolean).join(" "));
                return queryTokensStore.every(term => searchableStoreText.includes(term));
            });
        }
    }

    finalProducts = finalProducts.map((p) => {
        if (!p.shopName && p.sellerId) {
            const store = allStores?.stores?.find((s) => s.id === p.sellerId) || allStores?.stores?.find((s) => s.uid === p.sellerId);
            if (store && (store.shopName || store.displayName)) {
               return { ...p, shopName: store.shopName || store.displayName };
            }
        }
        return p;
    });

    try {
      const logData = {
        query: queryStr,
        resultsCount: finalProducts.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId: req.user?.uid || "anonymous",
        userAgent: req.headers["user-agent"] || "unknown",
        filters: { minPrice, maxPrice, wilaya: wilayaFilter, category: categoryFilter }
      };
      admin.firestore().collection("search_logs").add(logData).catch(() => {});
    } catch (logErr: unknown) {
      safeLogger.error("[ProductSearchService] Failed to log search", { err: logErr instanceof Error ? logErr.message : String(logErr) });
    }

    const totalCount = finalProducts.length;
    const offset = (page - 1) * limitVal;
    const paginatedProducts = finalProducts.slice(offset, offset + limitVal);

    return {
       products: paginatedProducts,
       stores: matchedStores.slice(0, 5),
       total: totalCount,
       page,
       limit: limitVal,
       hasMore: offset + limitVal < totalCount
    };
  }
}

