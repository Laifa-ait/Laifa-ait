import React, { useState, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCollectionProducts, useFeaturedProducts } from "../../hooks/queries/useProducts";
import {
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  ArrowLeft,
  Sofa,
  Shirt,
  Sparkles,
  Truck,
  Flame,
  Tag,
  Diamond,
  BookOpen,
  Smartphone,
  Refrigerator,
  CarFront,
  Dumbbell,
  Baby,
  Hammer,
  Dices,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { ProductCard } from "../../components/Product/ProductCard";
import { useUI } from "../../context/UIContext";
import { AdvancedSearchbar } from "../../components/Search/AdvancedSearchbar";
import { useShop } from "../../context/ShopContext";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { getCategoryTranslation } from "../../utils/translations";
import { ALGERIA_WILAYAS } from "../../constants";

const LUXURY_DEFAULT_BANNER = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop";

const CATEGORIES = [
  { id: "all", label: "Tous", icon: Sparkles },
  { id: "supermarché", label: "Supermarché", icon: Diamond },
  { id: "maison & déco", label: "Maison & Déco", icon: Sofa },
  { id: "électronique", label: "Électronique", icon: Smartphone },
  { id: "électroménager", label: "Électroménager", icon: Refrigerator },
  { id: "scolaire & bureau", label: "Scolaire & Bureau", icon: BookOpen },
  { id: "mode", label: "Mode", icon: Shirt },
  { id: "beauté & santé", label: "Beauté & Santé", icon: Sparkles },
  { id: "auto & moto", label: "Auto & Moto", icon: CarFront },
  { id: "sport & loisirs", label: "Sport & Loisirs", icon: Dumbbell },
  { id: "bébé & puériculture", label: "Bébé & Puériculture", icon: Baby },
  { id: "bricolage & outillage", label: "Bricolage & Outillage", icon: Hammer },
  { id: "jeux & jouets", label: "Jeux & Jouets", icon: Dices }
];

const QUICK_FILTERS = [
  { id: "free-shipping", label: "Livraison Express", icon: Truck },
  { id: "on-sale", label: "Offres Exclusives", icon: Tag },
  { id: "trending", label: "Sélection Prestige", icon: Flame },
];

export const PremiumCollection: React.FC = () => {
  const { collectionName } = useParams<{ collectionName: string }>();
  const { t } = useTranslation();

  const decodedName = collectionName
    ? decodeURIComponent(collectionName)
    : "COLLECTION PRESTIGE";

  const { data: collectionData, isLoading: isCollectionLoading } = useCollectionProducts(collectionName || "all");
  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedProducts(100);

  const rawProducts = useMemo(() => {
    if (collectionData?.products && collectionData.products.length > 0) {
      return collectionData.products;
    }
    return featuredData || [];
  }, [collectionData, featuredData]);

  const sectionTitle = collectionData?.title || (decodedName.toUpperCase() === "ALL" ? "COLLECTION PRESTIGE" : decodedName);
  const sectionBannerImg = (collectionData?.bannerImage && collectionData.bannerImage !== "/images/placeholders/product.svg") 
    ? collectionData.bannerImage 
    : LUXURY_DEFAULT_BANNER;

  const loading = isCollectionLoading || (rawProducts.length === 0 && isFeaturedLoading);

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Advanced Filters States
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const navigate = useNavigate();
  const { setIsCartOpen } = useUI();
  const { cart } = useCart();
  const { searchQuery } = useShop();

  const containerRef = useRef<HTMLDivElement>(null);
  const filterSectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedWilaya !== "all") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (activeQuickFilter) count++;
    return count;
  }, [selectedWilaya, minPrice, maxPrice, activeQuickFilter]);

  const INITIAL_LIMIT = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 10 : window.innerWidth >= 768 ? 8 : 6) : 6;
  const LOAD_MORE_LIMIT = 6;
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);

  const loadMoreItems = () => {
    setDisplayLimit(prev => prev + LOAD_MORE_LIMIT);
  };

  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    // 1. Search Query filter
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.category?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (activeCategory !== "all") {
      const selectedLower = activeCategory.toLowerCase();
      list = list.filter(p => {
        const cat = p.category?.toLowerCase() || "";
        if (selectedLower === "mode") {
          return cat.includes("mode") || cat.includes("vêtement") || cat.includes("fashion") || cat.includes("chaussure");
        }
        if (selectedLower === "maison & déco" || selectedLower === "maison") {
          return cat.includes("maison") || cat.includes("déco") || cat.includes("home") || cat.includes("design");
        }
        if (selectedLower === "électronique") {
          return cat.includes("tech") || cat.includes("informatique") || cat.includes("électronique") || cat.includes("smartphone") || cat.includes("téléphone") || cat.includes("ordinateur");
        }
        if (selectedLower === "électroménager") {
          return cat.includes("électroménager") || cat.includes("refrigerator") || cat.includes("cuisine") || cat.includes("machine") || cat.includes("appareil");
        }
        return cat === selectedLower || cat.includes(selectedLower);
      });
    }

    // 3. Quick Filters
    if (activeQuickFilter === "free-shipping") {
      list = list.filter(p => 
        p.freeShipping === true || 
        p.tags?.some((t: string) => t.toLowerCase().includes('gratuit')) || 
        p.description?.toLowerCase().includes('gratuit')
      );
    } else if (activeQuickFilter === "on-sale") {
      list = list.filter(p => 
        (p.promoPrice && p.promoPrice > 0) || 
        (p.originalPrice && p.originalPrice > p.price)
      );
    } else if (activeQuickFilter === "trending") {
      list = list.filter(p => p.rating && p.rating >= 4.5);
    }

    // 4. Advanced Price range filter
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    if (min !== null && !isNaN(min)) {
      list = list.filter(p => (p.promoPrice || p.price) >= min);
    }
    if (max !== null && !isNaN(max)) {
      list = list.filter(p => (p.promoPrice || p.price) <= max);
    }

    // 5. Advanced Wilaya filter
    if (selectedWilaya !== "all") {
      list = list.filter(p => {
        if (!p.wilaya) return false;
        const pWilaya = p.wilaya.toLowerCase();
        const sWilaya = selectedWilaya.toLowerCase();
        return pWilaya.includes(sWilaya) || sWilaya.includes(pWilaya);
      });
    }

    // 6. Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const pA = a.promoPrice || a.price;
        const pB = b.promoPrice || b.price;
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const pA = a.promoPrice || a.price;
        const pB = b.promoPrice || b.price;
        return pB - pA;
      });
    } else if (sortBy === "rating-desc") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // popular
      list.sort((a, b) => (b.salesCount || b.rating || 0) - (a.salesCount || a.rating || 0));
    }

    return list;
  }, [rawProducts, activeCategory, activeQuickFilter, sortBy, searchQuery, selectedWilaya, minPrice, maxPrice]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 selection:bg-amber-200 selection:text-zinc-900 font-sans" ref={containerRef}>
      {/* Light Luxury Hero Banner Section */}
      <div className="h-[35vh] min-h-[320px] md:h-[45vh] md:min-h-[420px] relative flex flex-col justify-end overflow-hidden border-b border-amber-200/50">
        {/* Transparent Navigation Header */}
        <div className="absolute top-0 left-0 w-full p-4 lg:p-6 flex justify-between items-center z-[65] bg-gradient-to-b from-black/60 via-black/20 to-transparent">
          <button
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-zinc-900 border border-zinc-200 shadow-md backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex items-center gap-2 font-serif text-lg sm:text-2xl tracking-[0.2em] text-amber-200 drop-shadow-md uppercase font-bold">
            <Diamond className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300/40" />
            <span>OLMART PRESTIGE</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Panier"
              className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-zinc-900 border border-zinc-200 shadow-md backdrop-blur-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white font-black text-[10px] flex items-center justify-center shadow-md border border-white animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Background Image & Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src={sectionBannerImg}
            alt={t("Collection Premium") || "Collection Premium"}
            className="absolute inset-0 w-full h-full object-cover object-[center_35%] filter brightness-95 saturate-[1.05]"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          {/* Light Multi-Stage Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-black/40 to-black/60" />
        </div>

        {/* Hero Editorial Content */}
        <motion.div className="relative z-50 w-full max-w-[90rem] mx-auto px-4 sm:px-8 pb-8 pt-16 flex flex-col justify-end h-full">
          <motion.div style={{ y: textY, opacity: textOpacity }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-amber-300/60 text-amber-800 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{t("SÉLECTION PRIVÉE & VENTES EXCLUSIVES")}</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-amber-100 uppercase mb-2">
              <Link to="/" className="hover:text-amber-300 transition-colors">
                {t("Accueil")}
              </Link>
              <span className="text-amber-300/80">/</span>
              <span className="text-white font-black">{t("Haute Sélection")}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight uppercase drop-shadow-lg text-white mb-3 leading-none">
              {t(sectionTitle) || decodedName}
            </h1>

            <p className="text-amber-50 text-xs sm:text-sm font-normal tracking-wide max-w-xl leading-relaxed hidden sm:block mb-4 drop-shadow">
              Explorez une collection d'exception soigneusement sélectionnée, alliant qualité supérieure, authenticité et livraison prioritaire sur 58 Wilayas.
            </p>
          </motion.div>

          {/* Recherche & Filtres Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-4xl relative z-[100] mt-2">
            <div className="flex-1">
              <AdvancedSearchbar variant="default" />
            </div>
            <button 
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center justify-center gap-2.5 px-6 md:px-8 h-11 rounded-full bg-white hover:bg-amber-50 text-zinc-900 border border-amber-300/80 font-bold uppercase tracking-widest text-[11px] hover:border-amber-500 transition-all duration-300 shadow-xl shrink-0 cursor-pointer select-none"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>{t("Filtres Avancés")}</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-amber-600 text-white text-[10px] font-black leading-none shadow-md ring-2 ring-white animate-pulse">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div ref={filterSectionRef} className="relative z-40 bg-[#FAF9F6] rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.05)] min-h-[65vh]">
        {/* Sticky Light Filters Toolbar */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#FAF9F6]/95 border-b border-zinc-200/80 shadow-sm rounded-t-[2.5rem] pt-6 pb-4">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-8">
            <div className="flex flex-col gap-4">
              {/* Top row: Categories Carousel */}
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex flex-row flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar flex-1 pb-1">
                  {CATEGORIES.map((cat) => {
                    const displayLabel = cat.id === "all" ? "Tout voir" : getCategoryTranslation(cat.label, t);
                    const isSelected = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 cursor-pointer select-none text-[11px] font-bold uppercase tracking-wider ${
                          isSelected
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 border border-amber-600 scale-[1.02]"
                            : "bg-white text-zinc-700 border border-zinc-200/80 hover:border-amber-400 hover:text-amber-800 hover:bg-amber-50/50 shadow-sm"
                        }`}
                      >
                        <cat.icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-amber-600"}`} />
                        <span>{displayLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom row: Quick Filters & Sorting Dropdown */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar pb-1">
                {QUICK_FILTERS.map((filter) => {
                  const isSelected = activeQuickFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveQuickFilter(isSelected ? null : filter.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 border rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer select-none ${
                        isSelected
                          ? "bg-amber-100 border-amber-400 text-amber-900 shadow-sm ring-1 ring-amber-400"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-amber-300 hover:text-zinc-900 shadow-sm"
                      }`}
                    >
                      <filter.icon className={`w-3 h-3 ${isSelected ? "text-amber-700" : "text-zinc-400"}`} />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}

                {/* Unified Sorting Dropdown */}
                <div className="relative ms-auto shrink-0 z-[100]">
                  <button 
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className={`flex items-center gap-2 px-4 py-1.5 border rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer select-none ${
                      sortBy !== "popular" 
                        ? "bg-amber-600 text-white border-amber-600 font-black shadow-md" 
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-amber-400 shadow-sm"
                    }`}
                  >
                    <span>
                      {t("Trier par : ")}{
                        sortBy === "price-asc" ? "Prix Croissant" :
                        sortBy === "price-desc" ? "Prix Décroissant" :
                        sortBy === "rating-desc" ? "Les Mieux Notés" : "Popularité"
                      }
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSortDropdown ? "rotate-180" : "rotate-0"}`} />
                  </button>
                  
                  {showSortDropdown && (
                    <>
                      {/* Invisible backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                      
                      <div className="absolute right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 py-2 min-w-[170px]">
                        {[
                          { id: "popular", label: "Popularité" },
                          { id: "price-asc", label: "Prix Croissant" },
                          { id: "price-desc", label: "Prix Décroissant" },
                          { id: "rating-desc", label: "Mieux Notés" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSortBy(opt.id);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors border-none bg-transparent cursor-pointer flex items-center justify-between ${
                              sortBy === opt.id 
                                ? "text-amber-700 bg-amber-50 font-extrabold" 
                                : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Container */}
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-28">
          {/* Section Header Count */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-8">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-zinc-600 uppercase">
              <span className="font-serif text-amber-700 text-base">{filteredProducts.length}</span>{" "}
              <span>{t("PIÈCES EN COLLECTION")}</span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setActiveQuickFilter(null);
                  setSelectedWilaya("all");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-[10px] font-extrabold text-amber-700 hover:text-amber-900 uppercase tracking-widest cursor-pointer underline underline-offset-4"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-white border border-zinc-200/80 animate-pulse rounded-2xl shadow-sm"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {filteredProducts.slice(0, displayLimit).map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                />
              ))}
              
              {displayLimit < filteredProducts.length && (
                <div className="col-span-full flex justify-center py-12">
                  <button
                    onClick={loadMoreItems}
                    className="px-8 py-4 bg-white hover:bg-amber-50 text-zinc-900 border border-amber-300 rounded-full font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center gap-3 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{t("Voir plus de pièces d'exception")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Light Luxury Empty State */
            <div className="bg-white border border-zinc-200 p-12 text-center rounded-3xl max-w-lg mx-auto my-12 shadow-sm">
              <Diamond className="w-14 h-14 text-amber-600 stroke-[1.2] mx-auto mb-4 animate-pulse" />
              <h3 className="font-serif text-xl font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Aucune pièce trouvée
              </h3>
              <p className="text-zinc-600 text-xs leading-relaxed mb-6 font-normal">
                Aucun article ne correspond à votre sélection de filtres actuelle dans cette collection.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setActiveQuickFilter(null);
                  setSelectedWilaya("all");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="px-6 py-3 bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-amber-700 transition-all cursor-pointer shadow-md"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Drawer (Light Mode) */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdvancedFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] cursor-pointer"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-zinc-200 shadow-2xl z-[201] flex flex-col overflow-hidden text-zinc-900"
            >
              {/* Header */}
              <div className="p-6 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                  <h2 className="font-serif font-bold text-base uppercase tracking-wider text-zinc-900">
                    {t("Filtres d'Exception")}
                  </h2>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-200/60 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer border-none outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Wilaya Filter */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                    {t("Wilaya de livraison")}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedWilaya}
                      onChange={(e) => setSelectedWilaya(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl outline-none focus:border-amber-600 transition-colors text-xs font-bold text-zinc-900 cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="all">{t("Toutes les Wilayas (58 Wilayas)")}</option>
                      {ALGERIA_WILAYAS.map((wilaya) => (
                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 pointer-events-none" />
                  </div>
                </div>

                {/* Price range */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                    {t("Tranche de Prix (DA)")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t("Min (DA)")}</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:border-amber-600 outline-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t("Max (DA)")}</span>
                      <input
                        type="number"
                        placeholder="Indéfini"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:border-amber-600 outline-none shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Express Filters Options */}
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                    {t("Critères Spécifiques")}
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: "free-shipping", name: "Livraison Express Offerte", desc: "Expédition prioritaire gratuite" },
                      { id: "on-sale", name: "Offres Privées & Prix Réduits", desc: "Pièces bénéficiant d'une remise exclusive" },
                      { id: "trending", name: "Sélection Les Mieux Notés (★ 4.5+)", desc: "Évaluation haut de gamme validée par les clients" }
                    ].map((opt) => {
                      const isActive = activeQuickFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setActiveQuickFilter(isActive ? null : opt.id)}
                          className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer outline-none ${
                            isActive
                              ? "bg-amber-50 border-amber-500 shadow-md ring-1 ring-amber-500/30"
                              : "bg-white border-zinc-200 hover:border-amber-300"
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isActive ? "bg-amber-600 border-amber-600" : "bg-white border-zinc-400"}`}>
                            {isActive && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                          </div>
                          <div>
                            <div className={`text-[11px] font-extrabold uppercase tracking-wider ${isActive ? "text-amber-900" : "text-zinc-800"}`}>{opt.name}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-normal">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 bg-zinc-50 border-t border-zinc-200 grid grid-cols-2 gap-3 shrink-0">
                <button
                  onClick={() => {
                    setSelectedWilaya("all");
                    setMinPrice("");
                    setMaxPrice("");
                    setActiveQuickFilter(null);
                  }}
                  className="px-4 py-3 border border-zinc-300 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-zinc-700 hover:bg-zinc-100 transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("Effacer")}</span>
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="px-4 py-3 bg-amber-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all cursor-pointer flex items-center justify-center select-none shadow-md"
                >
                  <span>{t("Appliquer")}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
