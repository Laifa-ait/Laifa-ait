import React, { useState, useEffect, useMemo } from "react";
import { apiGet } from "../../lib/api";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ShopDirectoryItem, ShopsFilterState } from "../../types/shopsDirectory";
import { ShopsHeader } from "../../components/ShopsDirectory/ShopsHeader";
import { ShopsStats } from "../../components/ShopsDirectory/ShopsStats";
import { FeaturedShops } from "../../components/ShopsDirectory/FeaturedShops";
import { ShopsGrid } from "../../components/ShopsDirectory/ShopsGrid";
import { FALLBACK_SHOPS } from "../../data/fallbackShops";

export const ShopsDirectory: React.FC = () => {
  const [shops, setShops] = useState<ShopDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<ShopsFilterState>({
    searchQuery: "",
    selectedWilaya: "",
    selectedCategory: "",
    sortBy: "popular",
    onlyVerified: false,
  });

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const res = await apiGet<{ success: boolean; shops: ShopDirectoryItem[] }>("/api/v1/public/shops");
        if (res.success && Array.isArray(res.shops) && res.shops.length > 0) {
          setShops(res.shops);
        } else {
          // Fallback to client-side publicProfiles collection query
          const q = query(collection(db, "publicProfiles"), limit(50));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const fetched = snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                sellerId: d.id,
                shopName: data.shopName || data.displayName || "Boutique Vendeur",
                slogan: data.slogan || "",
                description: data.description || data.shopDescription || "",
                logoUrl: data.logoUrl || data.photoURL || "",
                bannerUrl: data.bannerUrl || data.coverUrl || "",
                wilaya: data.wilaya || "16 - Alger",
                category: data.category || "Général",
                rating: data.rating !== undefined ? data.rating : null,
                reviewsCount: data.reviewsCount !== undefined ? data.reviewsCount : 0,
                sellerTrustScore: data.sellerTrustScore !== undefined ? data.sellerTrustScore : 90,
                productsCount: data.productsCount !== undefined ? data.productsCount : 0,
                isVerified: data.isVerified !== undefined ? data.isVerified : true,
              } as ShopDirectoryItem;
            });
            setShops(fetched);
          } else {
            setShops(FALLBACK_SHOPS);
          }
        }
      } catch (err) {
        console.error("Error fetching shops directory:", err);
        setShops(FALLBACK_SHOPS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []);

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
    return shops.filter((s) => (s.sellerTrustScore || 90) >= 90 || s.isVerified).slice(0, 3);
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
