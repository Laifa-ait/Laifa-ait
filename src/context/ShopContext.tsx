import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../domains/product/product.types";
import { PRODUCT_HIERARCHY } from "../constants";
import { apiGet, apiPost } from "../lib/api";

class LocalMemoryCache {
  private cache: Record<string, { data: any; expiry: number }> = {};
  set(key: string, data: any, durationMs = 300000) {
    this.cache[key] = { data, expiry: Date.now() + durationMs };
  }
  get(key: string): any | null {
    const item = this.cache[key];
    if (item && Date.now() < item.expiry) {
      return item.data;
    }
    if (item) delete this.cache[key];
    return null;
  }
  clear() {
    this.cache = {};
  }
}
const cacheEngine = new LocalMemoryCache();

function handleDevQuotaLogger(context: string, isFromCache: boolean) {
  if (import.meta.env.DEV) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[Olma Dev-Safe Layer] %c${context} %c${isFromCache ? "⚡ SWR CACHED" : "📦 LIVE (REST)"}`,
        "color: #C95D3B; font-weight: bold;",
        "color: inherit;",
        isFromCache ? "color: #38bdf8; font-weight: bold;" : "color: #34d399; font-weight: bold;"
      );
    }
  }
}

interface ShopContextType {
  fetchFeaturedProducts: (nbLimit?: number) => Promise<Product[]>;
  fetchProductsByCategory: (category: string, nbLimit?: number) => Promise<Product[]>;
  fetchProductsByIds: (ids: string[]) => Promise<Product[]>;
  fetchRecommendedProducts: (nbLimit?: number) => Promise<Product[]>;
  fetchCrossSellProducts: (product: Product, nbLimit?: number) => Promise<Product[]>;
  // Category Hierarchy
  categoryHierarchy: Record<string, Record<string, string[]>>;
  refreshHierarchy: () => Promise<void>;
  // keep remaining for UI state
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSaleFilterActive: boolean;
  setIsSaleFilterActive: (active: boolean) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  activeWilaya: string;
  setActiveWilaya: (wilaya: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaleFilterActive, setIsSaleFilterActive] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("quality");
  const [activeWilaya, setActiveWilaya] = useState("Tous");
  const [categoryHierarchy, setCategoryHierarchy] =
    useState<Record<string, Record<string, string[]>>>(PRODUCT_HIERARCHY);

  const refreshHierarchy = async () => {
    try {
      const data = await apiGet<{ hierarchy?: Record<string, Record<string, string[]>>; sortOrder?: string[] }>("/api/v1/settings/categories");
      if (data && data.hierarchy) {
        const rawHierarchy = data.hierarchy;
        const sortOrder = data.sortOrder || [];
        
        const sortedHierarchy: Record<string, Record<string, string[]>> = {};
        
        sortOrder.forEach((key: string) => {
          if (rawHierarchy[key]) {
            sortedHierarchy[key] = rawHierarchy[key];
          }
        });
        
        Object.keys(rawHierarchy).forEach((key) => {
          if (!sortedHierarchy[key]) {
            sortedHierarchy[key] = rawHierarchy[key];
          }
        });
        
        setCategoryHierarchy(sortedHierarchy);
      }
    } catch (err) {
      console.error("Error refreshing hierarchy:", err);
    }
  };

  React.useEffect(() => {
    refreshHierarchy();
  }, []);

  const fetchFeaturedProducts = async (nbLimit = 20): Promise<Product[]> => {
    const cacheKey = `featured_products_${nbLimit}`;
    const cached = cacheEngine.get(cacheKey);
    if (cached) {
      handleDevQuotaLogger("fetchFeaturedProducts (CACHE)", true);
      return cached;
    }

    try {
      const data = await apiGet<{ products: Product[] }>(`/api/v1/products?featured=true&limit=${nbLimit}`);
      if (data && Array.isArray(data.products)) {
        cacheEngine.set(cacheKey, data.products);
        return data.products;
      }
      return [];
    } catch (err) {
      console.error("fetchFeaturedProducts failed:", err);
      return [];
    }
  };

  const fetchProductsByCategory = async (category: string, nbLimit = 20): Promise<Product[]> => {
    const cacheKey = `products_category_${category}_${nbLimit}`;
    const cached = cacheEngine.get(cacheKey);
    if (cached) {
      handleDevQuotaLogger(`fetchProductsByCategory [${category}] (CACHE)`, true);
      return cached;
    }

    try {
      const url = category === "Tous" 
        ? `/api/v1/products?limit=${nbLimit}`
        : `/api/v1/products?category=${encodeURIComponent(category)}&limit=${nbLimit}`;
      const data = await apiGet<{ products: Product[] }>(url);
      if (data && Array.isArray(data.products)) {
        cacheEngine.set(cacheKey, data.products);
        return data.products;
      }
      return [];
    } catch (err) {
      console.error("fetchProductsByCategory failed:", err);
      return [];
    }
  };

  const fetchProductsByIds = async (ids: string[]): Promise<Product[]> => {
    if (!ids || ids.length === 0) return [];

    const cacheKey = `products_ids_${ids.sort().join("_")}`;
    const cached = cacheEngine.get(cacheKey);
    if (cached) {
      handleDevQuotaLogger("fetchProductsByIds (CACHE)", true);
      return cached;
    }

    try {
      const res = await apiPost<{ products: Product[] }>("/api/v1/products/batch", { ids });
      if (res && Array.isArray(res.products)) {
        cacheEngine.set(cacheKey, res.products);
        return res.products;
      }
      return [];
    } catch (err) {
      console.error("fetchProductsByIds failed:", err);
      return [];
    }
  };

  const fetchCrossSellProducts = React.useCallback(async (currentProduct: Product, nbLimit = 4): Promise<Product[]> => {
    let targetCategory = "Accessoires";
    const catLower = (currentProduct.category || "").toLowerCase();

    if (catLower.includes("mode") || catLower.includes("vêtement")) targetCategory = "Accessoires";
    else if (catLower.includes("téléphone") || catLower.includes("smartphone"))
      targetCategory = "Accessoires Téléphonie";
    else if (catLower.includes("pc") || catLower.includes("ordinateur")) targetCategory = "Périphériques";

    try {
      const data = await apiGet<{ products: Product[] }>(`/api/v1/products/cross-sell?sellerId=${encodeURIComponent(currentProduct.sellerId)}&category=${encodeURIComponent(targetCategory)}&currentProductId=${encodeURIComponent(currentProduct.id)}&limit=${nbLimit}`);
      if (data && Array.isArray(data.products)) {
        return data.products;
      }
      return [];
    } catch (err) {
      console.error("fetchCrossSellProducts failed:", err);
      return [];
    }
  }, []);

  const fetchRecommendedProducts = async (nbLimit = 8): Promise<Product[]> => {
    const cacheKey = `recommended_products_${nbLimit}`;
    const cached = cacheEngine.get(cacheKey);
    if (cached) {
      handleDevQuotaLogger("fetchRecommendedProducts (CACHE)", true);
      return cached;
    }

    try {
      const data = await apiGet<{ productIds: string[] }>("/api/v1/metadata/recommendations");
      let recommendedIds: string[] = [];
      if (data && Array.isArray(data.productIds)) {
        recommendedIds = data.productIds;
      }

      if (recommendedIds.length > 0) {
        const slicedIds = recommendedIds.slice(0, nbLimit);
        const resolved = await fetchProductsByIds(slicedIds);
        if (resolved.length > 0) {
          cacheEngine.set(cacheKey, resolved);
          return resolved;
        }
      }

      const fallback = await fetchFeaturedProducts(nbLimit);
      cacheEngine.set(cacheKey, fallback);
      return fallback;
    } catch (err) {
      console.error("Error fetching recommended products:", err);
      return fetchFeaturedProducts(nbLimit);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        fetchFeaturedProducts,
        fetchProductsByCategory,
        fetchProductsByIds,
        fetchRecommendedProducts,
        fetchCrossSellProducts,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isSaleFilterActive,
        setIsSaleFilterActive,
        activeTag,
        setActiveTag,
        sortOption,
        setSortOption,
        activeWilaya,
        setActiveWilaya,
        categoryHierarchy,
        refreshHierarchy,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
