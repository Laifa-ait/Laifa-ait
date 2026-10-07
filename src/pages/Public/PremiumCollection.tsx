import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCollectionProducts, useFeaturedProducts } from "../../hooks/queries/useProducts";
import { useUI } from "../../context/UIContext";
import { useCart } from "../../context/CartContext";
import { Product } from "../../domains/product/product.types";
import { CollectionCategory, CollectionQuickFilter, CollectionSortOption } from "../../components/Collection/collection.types";
import { CollectionHero } from "../../components/Collection/CollectionHero";
import { CollectionNavTabs } from "../../components/Collection/CollectionNavTabs";
import { CollectionToolbar } from "../../components/Collection/CollectionToolbar";
import { CollectionProductGrid } from "../../components/Collection/CollectionProductGrid";
import { CollectionFilterDrawer } from "../../components/Collection/CollectionFilterDrawer";

const CATEGORIES: CollectionCategory[] = [
  { id: "all", label: "Toutes les catégories", emoji: "✨" },
  { id: "mode", label: "Mode & Prêt-à-porter", emoji: "👗" },
  { id: "électronique", label: "High-Tech & Audio", emoji: "📱" },
  { id: "électroménager", label: "Électroménager", emoji: "🍳" },
  { id: "maison & déco", label: "Maison & Décoration", emoji: "🛋️" },
  { id: "beauté & santé", label: "Cosmétique & Soins", emoji: "💄" },
  { id: "supermarché", label: "Épicerie Fine & Bio", emoji: "🛒" },
  { id: "sport & loisirs", label: "Sport & Plein Air", emoji: "⚽" },
  { id: "bébé & puériculture", label: "Enfants & Bébés", emoji: "🍼" },
  { id: "auto & moto", label: "Auto & Moto", emoji: "🚗" },
  { id: "jeux & jouets", label: "Jeux & Culture", emoji: "🎮" },
];

const QUICK_FILTERS: CollectionQuickFilter[] = [
  { id: "free-shipping", label: "Livraison Gratuite", emoji: "🚚" },
  { id: "on-sale", label: "Promos Choc", emoji: "🏷️" },
  { id: "trending", label: "Top Ventes", emoji: "🔥" },
  { id: "cod", label: "Paiement Cash COD", emoji: "💵" },
];

interface PremiumCollectionProps {
  forcedCollectionName?: string;
}

export const PremiumCollection: React.FC<PremiumCollectionProps> = ({ forcedCollectionName }) => {
  const { collectionName: routeCollectionName } = useParams<{ collectionName?: string }>();
  const { t } = useTranslation();
  const { setIsCartOpen } = useUI();
  const { cart } = useCart();

  const activeName = forcedCollectionName || routeCollectionName || "all";
  const decodedName = activeName ? decodeURIComponent(activeName) : "COLLECTION PRESTIGE";

  const { data: collectionData, isLoading: isCollectionLoading } = useCollectionProducts(activeName);
  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedProducts(100);

  const rawProducts: Product[] = useMemo(() => {
    if (collectionData?.products && collectionData.products.length > 0) {
      return collectionData.products;
    }
    return featuredData || [];
  }, [collectionData, featuredData]);

  const sectionTitle = collectionData?.title || (decodedName.toUpperCase() === "ALL" ? "Collection Prestige" : decodedName);

  const isLoading = isCollectionLoading || (rawProducts.length === 0 && isFeaturedLoading);

  // Filter States
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<CollectionSortOption>("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pagination
  const [displayLimit, setDisplayLimit] = useState(12);

  const totalCartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== "all") count++;
    if (activeQuickFilter) count++;
    if (selectedWilaya !== "all") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  }, [activeCategory, activeQuickFilter, selectedWilaya, minPrice, maxPrice]);

  const resetAllFilters = () => {
    setActiveCategory("all");
    setActiveQuickFilter(null);
    setSelectedWilaya("all");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
  };

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "all") {
      list = list.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    if (activeQuickFilter === "free-shipping") {
      list = list.filter((p) => p.freeShipping === true);
    } else if (activeQuickFilter === "on-sale") {
      list = list.filter((p) => Boolean(p.promoPrice && p.promoPrice < (p.price || 0)));
    } else if (activeQuickFilter === "trending") {
      list = list.filter((p) => Number(p.rating || 0) >= 4.5 || p.isFeatured || p.isSponsored);
    } else if (activeQuickFilter === "cod") {
      list = list.filter((p) => p.acceptsCod !== false);
    }

    if (selectedWilaya !== "all") {
      list = list.filter((p) => !p.wilaya || p.wilaya === selectedWilaya || p.wilaya === "Toutes les Wilayas");
    }

    const min = parseFloat(minPrice);
    if (!isNaN(min) && min >= 0) {
      list = list.filter((p) => (p.promoPrice || p.price || 0) >= min);
    }

    const max = parseFloat(maxPrice);
    if (!isNaN(max) && max > 0) {
      list = list.filter((p) => (p.promoPrice || p.price || 0) <= max);
    }

    list.sort((a, b) => {
      const priceA = a.promoPrice || a.price || 0;
      const priceB = b.promoPrice || b.price || 0;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "rating-desc") return Number(b.rating || 0) - Number(a.rating || 0);
      return 0;
    });

    return list;
  }, [rawProducts, searchQuery, activeCategory, activeQuickFilter, selectedWilaya, minPrice, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans pb-24">
      {/* Editorial Luxury Header (No dark hero image) */}
      <CollectionHero
        title={t(sectionTitle) || decodedName}
        totalCartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFilters={() => setIsFilterDrawerOpen(true)}
        activeFiltersCount={activeFiltersCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Zero-Pill Minimalist Category & Tag Bar */}
      <CollectionNavTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        quickFilters={QUICK_FILTERS}
        activeQuickFilter={activeQuickFilter}
        onSelectQuickFilter={setActiveQuickFilter}
      />

      {/* Main Luxury Gallery Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        <CollectionToolbar
          totalCount={filteredProducts.length}
          activeFiltersCount={activeFiltersCount}
          onResetFilters={resetAllFilters}
          sortBy={sortBy}
          onSelectSort={setSortBy}
          onOpenFilters={() => setIsFilterDrawerOpen(true)}
        />

        <CollectionProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          displayLimit={displayLimit}
          onLoadMore={() => setDisplayLimit((prev) => prev + 12)}
          onResetFilters={resetAllFilters}
        />
      </main>

      {/* Slide-over Filter Drawer */}
      <CollectionFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedWilaya={selectedWilaya}
        onChangeWilaya={setSelectedWilaya}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChangeMinPrice={setMinPrice}
        onChangeMaxPrice={setMaxPrice}
        activeQuickFilter={activeQuickFilter}
        onSelectQuickFilter={setActiveQuickFilter}
        onResetAll={resetAllFilters}
      />
    </div>
  );
};
