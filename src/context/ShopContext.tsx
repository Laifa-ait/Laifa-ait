import React, { createContext, useContext, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "../domains/product/product.types";
import { PRODUCT_HIERARCHY } from "../constants";
import { apiGet, apiPost } from "../lib/api";
import { safeLogger } from "../utils/logger";
import { queryKeys } from "../lib/queryKeys";
import { productsApi } from "../services/api/products.api";

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
  const queryClient = useQueryClient();
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
      safeLogger.error("Error refreshing hierarchy", { err: err instanceof Error ? err.message : String(err) });
    }
  };

  React.useEffect(() => {
    refreshHierarchy();
  }, []);

  const fetchFeaturedProducts = async (nbLimit = 20): Promise<Product[]> => {
    try {
      return await queryClient.fetchQuery({
        queryKey: queryKeys.products.featured(nbLimit, 0),
        queryFn: () => productsApi.getFeaturedProducts(nbLimit, 0),
        staleTime: 5 * 60 * 1000,
      });
    } catch (err) {
      safeLogger.error("fetchFeaturedProducts failed", { err: err instanceof Error ? err.message : String(err) });
      return [];
    }
  };

  const fetchProductsByCategory = async (category: string, nbLimit = 20): Promise<Product[]> => {
    try {
      return await queryClient.fetchQuery({
        queryKey: queryKeys.products.category(category || "", nbLimit),
        queryFn: () => productsApi.getProducts({ category, limit: nbLimit }),
        staleTime: 5 * 60 * 1000,
      });
    } catch (err) {
      safeLogger.error("fetchProductsByCategory failed", { err: err instanceof Error ? err.message : String(err) });
      return [];
    }
  };

  const fetchProductsByIds = async (ids: string[]): Promise<Product[]> => {
    if (!ids || ids.length === 0) return [];
    try {
      return await queryClient.fetchQuery({
        queryKey: queryKeys.products.list({ ids: ids.sort() }),
        queryFn: async () => {
          const res = await apiPost<{ products: Product[] }>("/api/v1/products/batch", { ids });
          return res?.products || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    } catch (err) {
      safeLogger.error("fetchProductsByIds failed", { err: err instanceof Error ? err.message : String(err) });
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
      return await queryClient.fetchQuery({
        queryKey: ["products", "cross-sell", currentProduct.id, targetCategory, nbLimit],
        queryFn: async () => {
          const data = await apiGet<{ products: Product[] }>(`/api/v1/products/cross-sell?sellerId=${encodeURIComponent(currentProduct.sellerId)}&category=${encodeURIComponent(targetCategory)}&currentProductId=${encodeURIComponent(currentProduct.id)}&limit=${nbLimit}`);
          return data?.products || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    } catch (err) {
      safeLogger.error("fetchCrossSellProducts failed", { err: err instanceof Error ? err.message : String(err) });
      return [];
    }
  }, [queryClient]);

  const fetchRecommendedProducts = async (nbLimit = 8): Promise<Product[]> => {
    try {
      return await queryClient.fetchQuery({
        queryKey: ["products", "recommended", nbLimit],
        queryFn: async () => {
          const data = await apiGet<{ productIds: string[] }>("/api/v1/metadata/recommendations");
          let recommendedIds: string[] = [];
          if (data && Array.isArray(data.productIds)) {
            recommendedIds = data.productIds;
          }

          if (recommendedIds.length > 0) {
            const slicedIds = recommendedIds.slice(0, nbLimit);
            const resolved = await fetchProductsByIds(slicedIds);
            if (resolved.length > 0) {
              return resolved;
            }
          }

          return fetchFeaturedProducts(nbLimit);
        },
        staleTime: 5 * 60 * 1000,
      });
    } catch (err) {
      safeLogger.error("Error fetching recommended products", { err: err instanceof Error ? err.message : String(err) });
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
