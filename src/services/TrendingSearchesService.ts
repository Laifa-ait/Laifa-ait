import { db } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";

interface ProductTrendDoc {
  id: string;
  name?: string;
  category?: string;
  subcategory?: string;
  salesCount?: number;
  rating?: number;
  viewsCount?: number;
  status?: string;
  [key: string]: unknown;
}

export interface PurchasedItemTrend {
  name?: string;
  category?: string;
  subcategory?: string;
  quantity?: number;
}

export class TrendingSearchesService {
  // In-memory real-time search term tracker (zero DB cost)
  private static inMemorySearchCounts: Map<string, number> = new Map();

  // In-memory real-time purchase tracker (zero DB cost)
  private static inMemoryPurchaseCounts: Map<string, number> = new Map();

  // In-memory cache for trending keywords (TTL: 30 minutes)
  private static cachedTrends: string[] = [];
  private static cachedTimestamp = 0;
  private static readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Cleans and normalizes a search/purchase term.
   */
  private static cleanTerm(raw: string): string | null {
    if (!raw) return null;
    const clean = raw
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, " ");

    if (clean.length < 2 || clean.length > 40) return null;

    const stopWords = new Set([
      "le", "la", "les", "un", "une", "des", "du", "de", "pour", "and", "the", "in", "on", "avec", "sans", "sur", "sous", "par",
    ]);
    if (stopWords.has(clean)) return null;

    return clean;
  }

  /**
   * Capitalizes first letter of each major word cleanly.
   */
  private static formatDisplayTerm(term: string): string {
    return term
      .split(" ")
      .map((word) => (word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
      .join(" ");
  }

  /**
   * Records a user search query in memory (ZERO Firestore write costs).
   */
  public static recordSearch(query: string): void {
    const clean = this.cleanTerm(query);
    if (!clean) return;

    const current = this.inMemorySearchCounts.get(clean) || 0;
    this.inMemorySearchCounts.set(clean, current + 1);

    if (this.inMemorySearchCounts.size > 500) {
      const oldestKey = this.inMemorySearchCounts.keys().next().value;
      if (oldestKey) this.inMemorySearchCounts.delete(oldestKey);
    }
  }

  /**
   * Records completed purchases in memory (ZERO Firestore write costs).
   */
  public static recordPurchase(items: PurchasedItemTrend[]): void {
    if (!items || !Array.isArray(items)) return;

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);

      // Track by category
      if (item.category) {
        const cleanCat = this.cleanTerm(item.category);
        if (cleanCat) {
          const cur = this.inMemoryPurchaseCounts.get(cleanCat) || 0;
          this.inMemoryPurchaseCounts.set(cleanCat, cur + qty * 2);
        }
      }

      // Track by subcategory
      if (item.subcategory) {
        const cleanSub = this.cleanTerm(item.subcategory);
        if (cleanSub) {
          const cur = this.inMemoryPurchaseCounts.get(cleanSub) || 0;
          this.inMemoryPurchaseCounts.set(cleanSub, cur + qty * 2);
        }
      }

      // Track by short product title (first 3 words)
      if (item.name) {
        const shortName = item.name.trim().split(/\s+/).slice(0, 3).join(" ");
        const cleanName = this.cleanTerm(shortName);
        if (cleanName) {
          const cur = this.inMemoryPurchaseCounts.get(cleanName) || 0;
          this.inMemoryPurchaseCounts.set(cleanName, cur + qty * 3);
        }
      }
    }

    if (this.inMemoryPurchaseCounts.size > 500) {
      const oldestKey = this.inMemoryPurchaseCounts.keys().next().value;
      if (oldestKey) this.inMemoryPurchaseCounts.delete(oldestKey);
    }
  }

  /**
   * Computes top platform trends by calculating popularity from:
   * 1. Real-time in-memory purchases (Weight: 10 pts per buy)
   * 2. Historical sales volume from Firestore (Weight: 5 pts per salesCount)
   * 3. Real-time in-memory search frequency (Weight: 3 pts per search)
   * 4. Product ratings & customer satisfaction (Weight: 1-5 pts)
   *
   * Cached for 30 minutes in RAM: ZERO external costs, maximum performance.
   */
  public static async getTrendingSearches(): Promise<string[]> {
    const now = Date.now();

    // 1. Serve from in-memory cache if fresh (0 Firestore reads, instant response)
    if (this.cachedTrends.length > 0 && now - this.cachedTimestamp < this.CACHE_TTL_MS) {
      return this.cachedTrends;
    }

    try {
      const scoreMap: Map<string, { term: string; score: number }> = new Map();

      const addScore = (term: string, points: number) => {
        const clean = this.cleanTerm(term);
        if (!clean) return;

        const existing = scoreMap.get(clean);
        if (existing) {
          existing.score += points;
        } else {
          scoreMap.set(clean, { term: this.formatDisplayTerm(clean), score: points });
        }
      };

      // 2. Real-time purchases (10 points per purchase unit)
      for (const [term, count] of this.inMemoryPurchaseCounts.entries()) {
        addScore(term, count * 10);
      }

      // 3. Real-time searches (3 points per search query)
      for (const [term, count] of this.inMemorySearchCounts.entries()) {
        addScore(term, count * 3);
      }

      // 4. Lightweight read of top purchased products (Max 25 documents, executed once per 30 mins)
      try {
        const topProductsSnap = await db
          .collection("products")
          .where("status", "==", "active")
          .orderBy("salesCount", "desc")
          .limit(25)
          .get()
          .catch(async () => {
            return db.collection("products").where("status", "==", "active").limit(25).get();
          });

        topProductsSnap.docs.forEach((doc) => {
          const p = doc.data() as ProductTrendDoc;
          const sales = Number(p.salesCount) || 0;
          const rating = Number(p.rating) || 0;
          const points = 5 + sales * 5 + rating * 2;

          if (p.category) addScore(p.category, points * 1.5);
          if (p.subcategory) addScore(p.subcategory, points * 1.2);
          if (p.name) {
            const shortTitle = p.name.trim().split(/\s+/).slice(0, 3).join(" ");
            addScore(shortTitle, points);
          }
        });
      } catch (prodErr: unknown) {
        safeLogger.warn("[TrendingSearches] Could not read top products, relying on memory counts", {
          err: prodErr instanceof Error ? prodErr.message : String(prodErr),
        });
      }

      // 5. Fallback defaults if initial platform activity is very fresh
      if (scoreMap.size < 5) {
        const platformDefaults = [
          "Smartphones & Accessoires",
          "Mode & Vêtements",
          "Chaussures & Baskets",
          "Électroménager",
          "Bricolage & Outillage",
          "Informatique & PC",
          "Maison & Décoration",
          "Beauté & Soins",
        ];
        platformDefaults.forEach((def, index) => {
          addScore(def, 20 - index * 2);
        });
      }

      // 6. Sort and pick top 8 trends
      const sortedTrends = Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((item) => item.term);

      this.cachedTrends = sortedTrends;
      this.cachedTimestamp = now;

      safeLogger.info("[TrendingSearches] ⚡ Top platform trends recalculated", {
        count: sortedTrends.length,
        top: sortedTrends.slice(0, 4),
      });

      return sortedTrends;
    } catch (err: unknown) {
      safeLogger.error("[TrendingSearches] ❌ Calculation error fallback", {
        err: err instanceof Error ? err.message : String(err),
      });

      return this.cachedTrends.length > 0
        ? this.cachedTrends
        : [
            "Smartphones & Accessoires",
            "Mode & Vêtements",
            "Chaussures & Baskets",
            "Électroménager",
            "Bricolage & Outillage",
            "Informatique & PC",
            "Maison & Décoration",
            "Beauté & Soins",
          ];
    }
  }
}

