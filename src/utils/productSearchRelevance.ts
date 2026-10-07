import Fuse from "fuse.js";
import { Product } from "../domains/product/product.types";

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  onlyInStock?: boolean;
}

/**
 * Normalizes text: lowercases, removes diacritics (accents), and trims whitespace
 */
export function normalizeSearchTerm(term: string): string {
  if (!term) return "";
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Intelligent multi-field product search and relevance ranking engine
 */
export function filterAndRankProducts(
  products: Product[],
  filters: ProductSearchFilters
): Product[] {
  const { query = "", category = "", sortBy = "relevance", onlyInStock = false } = filters;
  const cleanQuery = normalizeSearchTerm(query);
  const cleanCat = normalizeSearchTerm(category);

  // 1. Initial category & stock filtration
  let pool = products.filter((p) => {
    if (!p) return false;

    // Stock filter
    if (onlyInStock && p.stock !== undefined && p.stock <= 0) {
      return false;
    }

    // Category filter with tolerance for subcategories and tags
    if (cleanCat) {
      const pCat = normalizeSearchTerm(p.category || "");
      const pSubCat = normalizeSearchTerm(p.subCategory || p.subcategory || "");
      const pTags = (p.tags || []).map((t) => normalizeSearchTerm(t));

      const matchesCat =
        pCat === cleanCat ||
        pCat.includes(cleanCat) ||
        cleanCat.includes(pCat) ||
        pSubCat.includes(cleanCat) ||
        pTags.some((t) => t.includes(cleanCat));

      if (!matchesCat) return false;
    }

    return true;
  });

  // 2. Query search & relevance scoring
  if (cleanQuery) {
    const fuse = new Fuse(pool, {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "brand", weight: 0.2 },
        { name: "category", weight: 0.1 },
        { name: "subCategory", weight: 0.1 },
        { name: "tags", weight: 0.05 },
        { name: "description", weight: 0.05 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });

    const searchResults = fuse.search(cleanQuery);
    const scoredIds = new Map<string, number>();

    searchResults.forEach((res, index) => {
      // lower fuse score = better match (0 is perfect match)
      const baseScore = 1 - (res.score ?? 0.5);
      scoredIds.set(res.item.id, baseScore * 100 - index * 0.1);
    });

    // Also include exact substring matches that might get high weight
    pool = pool.filter((p) => scoredIds.has(p.id));

    // Sort by relevance score initially
    pool.sort((a, b) => (scoredIds.get(b.id) || 0) - (scoredIds.get(a.id) || 0));
  }

  // 3. User-chosen sorting options
  if (sortBy !== "relevance" || !cleanQuery) {
    pool.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.price || 0) - (b.price || 0);
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case "newest": {
          const timeA = a.createdAt ? new Date(a.createdAt as string | number).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt as string | number).getTime() : 0;
          return timeB - timeA;
        }
        case "relevance":
        default: {
          // If no query, prioritize in-stock and best rated
          const stockA = a.stock !== undefined ? (a.stock > 0 ? 1 : 0) : 1;
          const stockB = b.stock !== undefined ? (b.stock > 0 ? 1 : 0) : 1;
          if (stockB !== stockA) return stockB - stockA;
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        }
      }
    });
  }

  return pool;
}
