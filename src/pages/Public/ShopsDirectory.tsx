import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apiGet } from "../../lib/api";
import { ShopDirectoryItem, ShopsFilterState } from "../../types/shopsDirectory";
import { ShopsHeader } from "../../components/ShopsDirectory/ShopsHeader";
import { ShopsStats } from "../../components/ShopsDirectory/ShopsStats";
import { FeaturedShops } from "../../components/ShopsDirectory/FeaturedShops";
import { ShopsGrid } from "../../components/ShopsDirectory/ShopsGrid";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ShopsDirectory: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");
  const [shops, setShops] = useState<ShopDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<ShopsFilterState>({
    searchQuery: "",
    selectedWilaya: "",
    selectedCategory: "",
    sortBy: "popular",
    onlyVerified: false,
  });

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiGet<{ success: boolean; shops?: ShopDirectoryItem[]; error?: string }>("/api/v1/public/shops");
      if (res && res.success && Array.isArray(res.shops)) {
        setShops(res.shops);
      } else {
        setShops([]);
        setErrorMessage(res?.error || (isArabic ? "تعذر تحميل المتاجر." : "Impossible de charger les boutiques."));
      }
    } catch (err: unknown) {
      console.error("Error fetching shops directory:", err);
      setShops([]);
      setErrorMessage(isArabic ? "حدث خطأ أثناء تحميل المتاجر." : "Une erreur est survenue lors du chargement des boutiques.");
    } finally {
      setIsLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    shops.forEach((s) => {
      if (s.category) set.add(s.category);
      if (s.categories) s.categories.forEach((c) => set.add(c));
    });
    return Array.from(set).filter(Boolean);
  }, [shops]);

  const uniqueWilayas = useMemo(() => {
    const set = new Set<string>();
    shops.forEach((s) => {
      if (s.wilaya) set.add(s.wilaya);
    });
    return set.size;
  }, [shops]);

  const filteredShops = useMemo(() => {
    return shops
      .filter((shop) => {
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = shop.shopName?.toLowerCase().includes(q);
          const matchDesc = shop.description?.toLowerCase().includes(q);
          const matchSlogan = shop.slogan?.toLowerCase().includes(q);
          const matchWilaya = shop.wilaya?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSlogan && !matchWilaya) return false;
        }

        if (filters.selectedWilaya) {
          if (!shop.wilaya || !shop.wilaya.toLowerCase().includes(filters.selectedWilaya.toLowerCase())) {
            return false;
          }
        }

        if (filters.selectedCategory) {
          const catMatch =
            shop.category?.toLowerCase() === filters.selectedCategory.toLowerCase() ||
            shop.categories?.some((c) => c.toLowerCase() === filters.selectedCategory.toLowerCase());
          if (!catMatch) return false;
        }

        if (filters.onlyVerified) {
          if (!shop.isVerified) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (filters.sortBy === "products") {
          return (b.productsCount || 0) - (a.productsCount || 0);
        }
        if (filters.sortBy === "name") {
          return (a.shopName || "").localeCompare(b.shopName || "");
        }
        if (filters.sortBy === "newest") {
          return (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1;
        }
        return (b.sellerTrustScore || 0) - (a.sellerTrustScore || 0);
      });
  }, [shops, filters]);

  const featuredShopsList = useMemo(() => {
    return shops
      .filter((s) => (typeof s.sellerTrustScore === "number" && s.sellerTrustScore >= 90) || s.isVerified)
      .slice(0, 3);
  }, [shops]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      selectedWilaya: "",
      selectedCategory: "",
      sortBy: "popular",
      onlyVerified: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ShopsHeader
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          totalResults={filteredShops.length}
        />

        <ShopsStats totalShops={shops.length} wilayaCount={uniqueWilayas || 58} />

        {errorMessage && !isLoading && shops.length === 0 && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-rose-700 font-semibold">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={fetchShops}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isArabic ? "إعادة المحاولة" : "Réessayer"}</span>
            </button>
          </div>
        )}

        {!filters.searchQuery && !filters.selectedWilaya && !filters.selectedCategory && (
          <FeaturedShops shops={featuredShopsList} />
        )}

        <ShopsGrid
          shops={filteredShops}
          isLoading={isLoading}
          totalResults={filteredShops.length}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
};
