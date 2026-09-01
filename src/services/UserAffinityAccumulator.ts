import { Product } from "../domains/product/product.types";

export interface UserInteractionEvent {
  productId?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  tags?: string[];
  type: "view" | "click" | "cart" | "wishlist" | "search";
  query?: string;
  timestamp: number;
}

export interface UserAffinityDigest {
  preferredCategories: Record<string, number>;
  preferredSubcategories: Record<string, number>;
  viewedProductIds: string[];
  clickedProductIds: string[];
  searchedTerms: string[];
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  totalInteractions: number;
  firstInteractionAt: number;
  lastInteractionAt: number;
  syncedAt?: number;
}

const STORAGE_KEY = "olma_affinity_digest_v2";
const SYNC_LOCK_KEY = "olma_affinity_last_synced";
const MIN_INTERACTIONS_FOR_SYNC = 5; // Accumulate minimum interactions before syncing
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // Strictly 1 sync per 24 hours maximum

export class UserAffinityAccumulator {
  private static getStoredDigest(): UserAffinityDigest {
    if (typeof window === "undefined") {
      return this.createEmptyDigest();
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return this.createEmptyDigest();
  }

  private static saveStoredDigest(digest: UserAffinityDigest): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(digest));
    } catch {
      // Storage quota or private mode protection
    }
  }

  private static createEmptyDigest(): UserAffinityDigest {
    const now = Date.now();
    return {
      preferredCategories: {},
      preferredSubcategories: {},
      viewedProductIds: [],
      clickedProductIds: [],
      searchedTerms: [],
      priceRange: {
        min: 0,
        max: 0,
        avg: 0,
      },
      totalInteractions: 0,
      firstInteractionAt: now,
      lastInteractionAt: now,
    };
  }

  /**
   * Records an interaction locally in localStorage with ZERO backend / DB cost.
   */
  public static track(event: UserInteractionEvent): void {
    const digest = this.getStoredDigest();
    const now = Date.now();
    digest.lastInteractionAt = now;
    digest.totalInteractions += 1;

    // Weight score table
    const weights: Record<UserInteractionEvent["type"], number> = {
      click: 2,
      view: 1,
      wishlist: 5,
      cart: 8,
      search: 3,
    };
    const score = weights[event.type] || 1;

    // 1. Accumulate Category
    if (event.category) {
      const cat = event.category.trim();
      if (cat) {
        digest.preferredCategories[cat] = (digest.preferredCategories[cat] || 0) + score;
      }
    }

    // 2. Accumulate Subcategory
    if (event.subcategory) {
      const sub = event.subcategory.trim();
      if (sub) {
        digest.preferredSubcategories[sub] = (digest.preferredSubcategories[sub] || 0) + score;
      }
    }

    // 3. Accumulate Product IDs (Bounded to last 30 distinct products)
    if (event.productId) {
      if (event.type === "click" || event.type === "view") {
        if (!digest.viewedProductIds.includes(event.productId)) {
          digest.viewedProductIds.unshift(event.productId);
          if (digest.viewedProductIds.length > 30) {
            digest.viewedProductIds.pop();
          }
        }
      }
      if (event.type === "click") {
        if (!digest.clickedProductIds.includes(event.productId)) {
          digest.clickedProductIds.unshift(event.productId);
          if (digest.clickedProductIds.length > 20) {
            digest.clickedProductIds.pop();
          }
        }
      }
    }

    // 4. Accumulate Search queries (Bounded to last 10 queries)
    if (event.query) {
      const clean = event.query.trim().toLowerCase();
      if (clean && !digest.searchedTerms.includes(clean)) {
        digest.searchedTerms.unshift(clean);
        if (digest.searchedTerms.length > 10) {
          digest.searchedTerms.pop();
        }
      }
    }

    // 5. Accumulate Price distribution
    if (event.price && event.price > 0) {
      if (digest.priceRange.min === 0 || event.price < digest.priceRange.min) {
        digest.priceRange.min = event.price;
      }
      if (event.price > digest.priceRange.max) {
        digest.priceRange.max = event.price;
      }
      if (digest.priceRange.avg === 0) {
        digest.priceRange.avg = event.price;
      } else {
        // Moving average
        digest.priceRange.avg = Math.round((digest.priceRange.avg * 0.8) + (event.price * 0.2));
      }
    }

    this.saveStoredDigest(digest);
  }

  /**
   * Retrieves the current local accumulated profile for instant zero-latency recommendations.
   */
  public static getLocalDigest(): UserAffinityDigest {
    return this.getStoredDigest();
  }

  /**
   * Returns top preferred category from accumulated interactions.
   */
  public static getTopCategory(): string | null {
    const digest = this.getStoredDigest();
    const entries = Object.entries(digest.preferredCategories);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  /**
   * Checks if daily sync threshold is reached (1 single write per 24 hours).
   */
  public static shouldSync(): boolean {
    if (typeof window === "undefined") return false;
    const digest = this.getStoredDigest();
    if (digest.totalInteractions < MIN_INTERACTIONS_FOR_SYNC) return false;

    const lastSyncStr = localStorage.getItem(SYNC_LOCK_KEY);
    const lastSyncTime = lastSyncStr ? Number(lastSyncStr) : 0;
    const now = Date.now();

    return now - lastSyncTime >= SYNC_INTERVAL_MS;
  }

  /**
   * Marks sync completed for the next 24 hours.
   */
  public static markSyncCompleted(): void {
    if (typeof window === "undefined") return;
    const now = Date.now();
    localStorage.setItem(SYNC_LOCK_KEY, String(now));
  }

  /**
   * Computes personalized "Pour Vous" products tailored to user's preferences
   * with heavy scoring on categories, subcategories, price proximity, and social proof.
   */
  public static scoreAndSortProducts(products: Product[], digest: UserAffinityDigest): Product[] {
    if (!products || products.length === 0) return [];

    const catScores = digest.preferredCategories || {};
    const subCatScores = digest.preferredSubcategories || {};
    const targetPrice = digest.priceRange?.avg || 0;
    const viewedSet = new Set(digest.viewedProductIds || []);

    return [...products]
      .map((p) => {
        let score = 0;

        // 1. Category affinity match (Weight: 40%)
        if (p.category && catScores[p.category]) {
          score += Math.min(50, catScores[p.category] * 5);
        }

        // 2. Subcategory affinity match (Weight: 20%)
        if (p.subcategory && subCatScores[p.subcategory]) {
          score += Math.min(30, subCatScores[p.subcategory] * 4);
        }

        // 3. Price proximity score (Weight: 15%)
        const price = Number(p.promoPrice || p.price) || 0;
        if (targetPrice > 0 && price > 0) {
          const ratio = Math.abs(price - targetPrice) / Math.max(targetPrice, 1);
          if (ratio <= 0.3) score += 20;
          else if (ratio <= 0.6) score += 10;
        }

        // 4. Social proof & High conversion factors (Weight: 15%)
        const sales = Number(p.salesCount) || 0;
        const rating = Number(p.rating) || 0;
        score += Math.min(20, sales * 2 + rating * 2);

        // 5. Promo boost (Weight: 10%)
        if (p.promoPrice && p.promoPrice < p.price) {
          score += 15;
        }

        // 6. Anti-fatigue penalty
        if (viewedSet.has(p.id)) {
          score -= 5;
        }

        return {
          product: p,
          relevanceScore: score,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map((item) => item.product);
  }
}
