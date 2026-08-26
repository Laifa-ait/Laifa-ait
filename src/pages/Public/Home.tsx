import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
import { BentoHero } from "../../components/Home/BentoHero";
import { TechTrustBanner } from "../../components/Home/TechTrustBanner";
import { NeoCategoryGrid } from "../../components/Home/NeoCategoryGrid";
import { DynamicSection } from "../../components/Home/DynamicSection";
import { HomepageSection, Banner } from "../../domains/home/homepage.types";
import { Shop } from "../../domains/seller/shop.types";

interface HomeHeroBanner extends Partial<Banner> {
  id: string;
  desktop_image?: string;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  buttonText?: string;
  isActive?: boolean;
  is_active?: boolean;
  ctaLink?: string;
  translations?: Record<string, Record<string, string>>;
  mobile_image?: string | null;
  mobileImageUrl?: string;
}

interface HomeBanner extends Banner {
  desktop_image?: string;
  desktopImage?: string;
}
import { ProductCard } from "../../components/Product/ProductCard";
import { Product } from "../../domains/product/product.types";
import { Helmet } from "react-helmet-async";
import { MobileSwipeIndicator } from "../../components/ui/MobileSwipeIndicator";
import { useUserHabits } from "../../hooks/useUserHabits";
import { useHomeData } from "../../hooks/useHomeData";
import { FeaturedProductsCarousel } from "../../components/Home/FeaturedProductsCarousel";
import { BoutiquesMarques } from "../../components/Home/BoutiquesMarques";
import { MonthlyUpdateBanner } from "../../components/Layout/MonthlyUpdateBanner";
import { HomeEndlessGrid } from "../../components/Home/HomeEndlessGrid";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const rcmdScrollContainerRef = useRef<HTMLDivElement>(null);
  const premiumScrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRcmd = (direction: "left" | "right") => {
    if (rcmdScrollContainerRef.current) {
      const container = rcmdScrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.7;
      const leftScroll = direction === "right" ? scrollAmount : -scrollAmount;
      container.scrollBy({ left: leftScroll, behavior: "smooth" });
    }
  };

  const scrollPremium = (direction: "left" | "right") => {
    if (premiumScrollContainerRef.current) {
      const container = premiumScrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.7;
      const leftScroll = direction === "right" ? scrollAmount : -scrollAmount;
      container.scrollBy({ left: leftScroll, behavior: "smooth" });
    }
  };
  const { activeWilaya } = useShop();
  const { currentUser, userProfile } = useAuth();

  const {
    getCategorieFavorite,
    categoriesVisiteesCount,
  } = useUserHabits();

  const {
    dbBanners,
    isBannersLoading,
    homepageSections,
    featuredProducts,
    isLoadingProducts,
    customCategories,
    dbSellers,
    isSellersLoading
  } = useHomeData();

  const mappedSellers = useMemo<Shop[]>(() => {
    return dbSellers.map((s) => ({
      id: s.id,
      sellerId: s.id,
      shopName: s.shopName,
      logoUrl: s.logoUrl,
      status: "active" as const,
      wilaya: "",
      commissionRate: 0,
      bannerUrl: "",
    }));
  }, [dbSellers]);

  // Dynamic Personalized Category Cards computed sequence
  const defaultCategoryMapping = useMemo(
    () => [
      {
        key: "Supermarché",
        title: t("cat_supermarche"),
        subtitle: t("cat_supermarche_desc"),
        image:
          "/images/placeholders/product.svg",
        gradient: "from-slate-900/80 via-slate-900/20 to-transparent",
        withExploreButton: true,
      },
      {
        key: "Maison & Déco",
        title: t("cat_maison_deco"),
        subtitle: t("cat_home_desc"),
        image:
          "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Mode",
        title: t("cat_fashion_title"),
        subtitle: t("cat_fashion_desc"),
        image:
          "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
    ],
    [t],
  );

  const { categoryHierarchy } = useShop();

  // Merge default categories with custom database configurations
  const activeCategoriesConfig = useMemo(() => {
    // Generate baseMap from categoryHierarchy
    const baseMap = Object.keys(categoryHierarchy).map(catKey => {
      // Find matching default mapping if it exists to preserve images/gradients
      const defaultMapping = defaultCategoryMapping.find(dm => dm.key === catKey) || {
        key: catKey,
        title: catKey,
        subtitle: `Découvrez nos articles dans ${catKey}`,
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      };
      return defaultMapping;
    });

    return baseMap.map((categoryItem) => {
      const custom = customCategories.find((cc) => cc.id === categoryItem.key);
      if (custom) {
        return {
          ...categoryItem,
          title: custom.title || categoryItem.title,
          subtitle: custom.subtitle || categoryItem.subtitle,
          image: custom.image || categoryItem.image,
          gradient: custom.gradient || categoryItem.gradient,
          featuredProductIds: custom.featuredProductIds || [],
        };
      }
      return {
        ...categoryItem,
        featuredProductIds: [],
      };
    });
  }, [customCategories, defaultCategoryMapping, categoryHierarchy]);

  // Sort and display strictly only 3 category cards according to user's navigation count!
  const sortedCategoryCards = useMemo(() => {
    const sorted = [...activeCategoriesConfig].sort((a, b) => {
      const aCount = categoriesVisiteesCount?.[a.key] || 0;
      const bCount = categoriesVisiteesCount?.[b.key] || 0;

      if (bCount !== aCount) {
        return bCount - aCount;
      }

      // Fallback: favorite category computed by getCategorieFavorite
      const favorite = getCategorieFavorite();
      if (favorite === a.key) return -1;
      if (favorite === b.key) return 1;

      // Default order mapping fallback matching default 3
      const defaultOrder = Object.keys(categoryHierarchy);
      const defaultOrderArray = Array.isArray(defaultOrder) ? defaultOrder : [];
      return defaultOrderArray.indexOf(a.key) - defaultOrderArray.indexOf(b.key);
    });

    // Take exactly 3 categories to maintain the pristine aesthetic of 3 layout blocks
    return sorted;
  }, [activeCategoriesConfig, categoriesVisiteesCount, getCategorieFavorite, categoryHierarchy]);

  // Premium High-Value Selection: Sorted by sales count, devalued proportionally if seller trust drops
  const premiumProducts = useMemo(() => {
    if (!featuredProducts || featuredProducts.length === 0) return [];
    
    return [...featuredProducts]
      .map((product) => {
        // Look up seller profile in dbSellers to verify up-to-date trustScore
        const sellerProfile = dbSellers?.find((s) => s.id === product.sellerId);
        const extendedProduct = product as Product & { sellerTrustScore?: number; trustScore?: number };
        
        let sellerTrust = 100;
        if (sellerProfile && typeof sellerProfile.trustScore === "number") {
          sellerTrust = sellerProfile.trustScore;
        } else if (typeof extendedProduct.sellerTrustScore === "number") {
          sellerTrust = extendedProduct.sellerTrustScore;
        } else if (typeof extendedProduct.trustScore === "number") {
          sellerTrust = extendedProduct.trustScore;
        }

        const sales = product.salesCount || 0;
        const discountPenalty = product.promoPrice && product.promoPrice < product.price ? 1.1 : 1.0;
        
        // Value Score Formulation:
        // Reflects real customer sales, but drops value exponentially/linearly if seller has lost/compromised points in the trust Score system.
        const trustMultiplier = sellerTrust / 100;
        const valueScore = (sales * trustMultiplier * discountPenalty) + (product.rating || 0) * 2;

        return {
          ...product,
          sellerTrust,
          valueScore,
        };
      })
      .sort((a, b) => b.valueScore - a.valueScore);
  }, [featuredProducts, dbSellers]);

  // Dynamic Target Filtering for Banners and Sections (Audience & wilayas targeting + Dates)
  const filterByTargeting = useCallback((item: Banner | HomepageSection, isBanner: boolean) => {
    if (isBanner) {
      const bannerItem = item as Banner;
      if (bannerItem.isActive === false || bannerItem.is_active === false) return false;
    } else {
      const sectionItem = item as HomepageSection;
      if (sectionItem.isActive === false) return false;
    }

    // Date Schedule Checking
    const startDate = (item as Banner).startDate || (item as Banner).start_date;
    if (startDate) {
      if (new Date() < new Date(startDate as string | number)) return false;
    }
    const endDate = (item as Banner).endDate || (item as Banner).end_date;
    if (endDate) {
      if (new Date() > new Date(endDate as string | number)) return false;
    }

    // 1. Audience / User type filter
    const audienceValue = isBanner ? ((item as Banner).targetUserType || (item as Banner).target_user_type) : (item as HomepageSection).targetAudience;
    if (audienceValue && audienceValue !== "all") {
      if (audienceValue === "logged_in") {
        if (!currentUser) return false;
      } else if (audienceValue === "new") {
        if (currentUser) return false;
      } else if (audienceValue === "vip") {
        const isVip = userProfile?.isVip === true || userProfile?.vip === true || userProfile?.role === "admin";
        if (!isVip) return false;
      }
    }

    // 2. Region / Wilaya filter
    const regions = (item as Banner).targetRegions || (item as Banner).target_regions;
    if (regions && regions.length > 0) {
      if (activeWilaya && activeWilaya !== "Tous") {
        const cleanActive = activeWilaya.toLowerCase().trim();
        const matches = regions.some((reg: string) => {
          const cleanReg = reg.toLowerCase().trim();
          return cleanReg === cleanActive || cleanActive.includes(cleanReg) || cleanReg.includes(cleanActive);
        });
        if (!matches) return false;
      }
    }

    return true;
  }, [currentUser, userProfile, activeWilaya]);

  const targetedHeroBanners = useMemo<HomeHeroBanner[]>(() => {
    const filtered = dbBanners
      .filter((b) => !b.position || b.position === "hero" || b.zone === "carousel_main")
      .filter((b) => filterByTargeting(b, true))
      .map((b) => {
        const desktopImg = b.desktop_image || b.desktopImage || b.imageUrl || "";
        const mobileImg = b.mobile_image || b.mobileImageUrl || desktopImg;
        return {
          ...b,
          desktop_image: desktopImg,
          imageUrl: desktopImg,
          mobile_image: mobileImg,
          mobileImageUrl: mobileImg,
        };
      });
    
    if (filtered.length > 0) return filtered;

    return [
      {
        id: "default-1",
        desktop_image: "/images/placeholders/product.svg",
        imageUrl: "/images/placeholders/product.svg",
        title: t("hero_title_1"),
        subtitle: t("hero_sub_1"),
        button_text: t("hero_btn_1"),
      },
      {
        id: "default-2",
        desktop_image: "/images/placeholders/product.svg",
        imageUrl: "/images/placeholders/product.svg",
        title: t("hero_title_2"),
        subtitle: t("hero_sub_2"),
        button_text: t("hero_btn_2"),
      }
    ];
  }, [dbBanners, filterByTargeting, t]);

  const targetedIntermediateBanners = useMemo<HomeBanner[]>(() => {
    return dbBanners
      .filter((b) => b.position === "intermediate" || b.zone === "grid_bottom")
      .filter((b) => filterByTargeting(b, true))
      .map((b) => ({
        ...b,
        desktop_image: b.desktop_image || b.desktopImage || b.imageUrl || "",
        imageUrl: b.desktop_image || b.desktopImage || b.imageUrl || "",
        mobile_image: b.mobile_image || b.mobileImageUrl || b.desktop_image || b.imageUrl || "",
        mobileImageUrl: b.mobile_image || b.mobileImageUrl || b.desktop_image || b.imageUrl || "",
      }));
  }, [dbBanners, filterByTargeting]);

  const targetedHomepageSections = useMemo(() => {
    return homepageSections
      .filter((s) => s.isActive)
      .filter((s) => filterByTargeting(s, false));
  }, [homepageSections, filterByTargeting]);

  const targetedPopupBanner = useMemo<HomeBanner | undefined>(() => {
    const found = dbBanners
      .filter((b) => b.position === "popup")
      .filter((b) => filterByTargeting(b, true))[0];
    if (!found) return undefined;
    return {
      ...found,
      desktop_image: found.desktop_image || found.desktopImage || found.imageUrl || "",
      imageUrl: found.desktop_image || found.desktopImage || found.imageUrl || "",
    };
  }, [dbBanners, filterByTargeting]);

  const [showPopupBanner, setShowPopupBanner] = useState(false);

  useEffect(() => {
    if (targetedPopupBanner) {
      const hasSeenPopup = sessionStorage.getItem(`popup_seen_${targetedPopupBanner.id}`);
      if (!hasSeenPopup) {
        setShowPopupBanner(true);
        sessionStorage.setItem(`popup_seen_${targetedPopupBanner.id}`, "true");
      }
    }
  }, [targetedPopupBanner]);

  return (
    <div className="font-sans relative overflow-hidden w-full">
      {/* Removed local background to allow global layout background to show through */}
      <MonthlyUpdateBanner />
      {/* 💥 Dynamic Promotion Popup Banner (Loaded once per session per ID) */}
      {showPopupBanner && targetedPopupBanner && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="relative max-w-sm sm:max-w-md w-full rounded-3xl overflow-hidden shadow-xl bg-white border border-zinc-200 animate-in zoom-in-95 duration-500 group">
            <button 
              onClick={() => setShowPopupBanner(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-slate-100 backdrop-blur-md rounded-full text-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <div 
              className="relative cursor-pointer"
              onClick={() => {
                setShowPopupBanner(false);
                const hasLinkedProducts = targetedPopupBanner.linkedProductIds && targetedPopupBanner.linkedProductIds.length > 0;
                const linkDestination = hasLinkedProducts ? `/campaign/${targetedPopupBanner.id}` : (targetedPopupBanner.ctaLink || "#");
                navigate(linkDestination);
              }}
            >
              <img loading="lazy" 
                src={targetedPopupBanner.imageUrl || targetedPopupBanner.desktopImage} 
                alt={targetedPopupBanner.title} 
                className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-zinc-500 mb-1 block">{t("home.popup.exclusive_offer")}</span>
                <h3 className="text-white font-semibold text-xl font-display drop-shadow-md">{targetedPopupBanner.title}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <Helmet>
        <title>{t("seo_home_title")}</title>
        <meta name="description" content={t("seo_home_description")} />
        <meta name="keywords" content={t("seo_home_keywords")} />
        <meta property="og:image" content={targetedHeroBanners[0]?.desktop_image || targetedHeroBanners[0]?.imageUrl || "/images/placeholders/product.svg"} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <h1 className="sr-only">{t("home.sr_title")}</h1>
      
      {/* Casbah & Mediterranean Inspired Hero */}
      <section className="w-full bg-transparent py-4 sm:py-6 lg:py-8 relative overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
          {isBannersLoading ? (
            <div className="w-full min-h-[400px] sm:min-h-[500px] bg-slate-200 animate-pulse rounded-3xl border border-slate-100 mt-0" />
          ) : (
            <BentoHero banners={targetedHeroBanners} />
          )}
        </div>
      </section>

      {/* Tech Trust Banner */}
      <TechTrustBanner />

      {activeWilaya && activeWilaya !== "Tous" && (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 mb-6 sm:mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between py-4 px-6 bg-white border border-zinc-200 text-slate-800 rounded-full shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-900"></span>
              </span>
              <span className="font-sans font-bold text-[12px] sm:text-sm uppercase tracking-widest rtl:tracking-normal drop-shadow-sm text-slate-700">
                [ {activeWilaya} ] {t("home.regional_filter_active")}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* category Grid */}
      <NeoCategoryGrid categories={sortedCategoryCards} favoriteCategory={getCategorieFavorite()} />

      {/* Optimized Featured Products Section (Nos Incontournables) */}
      <FeaturedProductsCarousel />

      {/* Intermediate Banners */}
      {targetedIntermediateBanners.length > 0 && (
        <section className="mb-6 sm:mb-8 w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap gap-6">
            {targetedIntermediateBanners.map((banner) => {
              const hasLinkedProducts = banner.linkedProductIds && banner.linkedProductIds.length > 0;
              const linkDestination = hasLinkedProducts ? `/campaign/${banner.id}` : (banner.ctaLink || "#");
              return (
                <div
                  key={banner.id}
                  onClick={() => navigate(linkDestination)}
                  className={`relative block rounded-3xl overflow-hidden group shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-500 cursor-pointer ${banner.layout === "half" ? "w-full md:w-[calc(50%-12px)] aspect-[2/1] sm:aspect-[2.5/1]" : "w-full aspect-[2.5/1] sm:aspect-[4/1] md:aspect-[5/1]"}`}
                >
                  {/* PC Image */}
                  <img loading="lazy"
                    src={banner.imageUrl || banner.desktop_image}
                    alt={banner.title || banner.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${banner.mobileImageUrl ? "hidden sm:block" : ""}`}
                  />
                  {/* Mobile Image */}
                  {banner.mobileImageUrl && (
                    <img loading="lazy"
                      src={banner.mobileImageUrl}
                      alt={banner.title || banner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out sm:hidden block"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {targetedHomepageSections.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}
      
      {/* Selection Premium - Elegant Light Luxury Theme */}
      <section className="bg-transparent relative z-20 overflow-hidden mb-6 sm:mb-8">
        <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-t-[1.5rem] rounded-b-[4rem] shadow-sm border border-amber-200/80 border-b-4 border-b-amber-600 p-5 sm:p-8 relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-2 sm:pb-4 relative z-10 gap-4">
              <div className="flex flex-col items-start">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
                  <span className="uppercase tracking-tight text-slate-900">{t("product.premium_selection")}</span>
                </h3>
                <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-amber-600 rounded-full mt-2 sm:mt-3 opacity-80"></div>
              </div>
                            
              <button
                onClick={() => navigate("/premium-collection")}
                className="group relative flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-3 rounded-xl bg-transparent text-amber-600 hover:text-amber-700 active:scale-95 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 w-fit border-none"
              >
                <span>{t("view_collection", "Voir la collection")}</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            <div className="relative group/premium px-4 sm:px-0 z-10">
              {/* Left Desktop Nav */}
              <button
                onClick={() => scrollPremium("left")}
                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-amber-700 border border-amber-100 flex items-center justify-center hover:bg-amber-50 hover:text-amber-900 hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-sm cursor-pointer"
                aria-label={t("Voir les produits précédents")}
              >
                <ChevronLeft className="w-5 h-5 stroke-[2]" />
              </button>
              
              <div 
                ref={premiumScrollContainerRef} 
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 desktop-scrollbar snap-x snap-mandatory flex-nowrap select-none"
                style={{ scrollBehavior: 'smooth' }}
              >
                {isLoadingProducts ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="snap-start snap-always shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)] h-[260px] sm:h-[320px] rounded-[1.5rem] bg-slate-100/80 animate-pulse border border-slate-200/60" />
                  ))
                ) : premiumProducts.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center py-8 sm:py-12 text-center bg-transparent/50 rounded-[1.5rem] border border-slate-200/60 shadow-inner">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 mb-3 sm:mb-4" />
                    <p className="font-sans font-semibold text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest">{t("product.next_arrival_soon", "Prochain arrivage imminent")}</p>
                  </div>
                ) : (
                  premiumProducts.slice(0, 8).map((product, i) => {
                    return (
                      <div 
                        key={`${product.id}-${i}`}
                        className="snap-start snap-always shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]"
                      >
                        <ProductCard
                          product={product}
                          index={i}
                          variant="premium_immersive"
                          onClick={(p) => navigate(`/product/${p.id}`)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Right Desktop Nav */}
              <button
                onClick={() => scrollPremium("right")}
                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-amber-700 border border-amber-100 flex items-center justify-center hover:bg-amber-50 hover:text-amber-900 hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-sm cursor-pointer"
                aria-label={t("Voir les produits suivants")}
              >
                <ChevronRight className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            <MobileSwipeIndicator className="md:hidden block text-slate-500/60 mt-2" />
          </div>
        </div>
      </section>

      

      {/* Recommended Section (Point 4) - Casbah Arches & Sea Breeze */}
      <section className="bg-transparent relative z-20 overflow-hidden mb-6 sm:mb-8">
        <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          {/* Using a larger border-radius to emulate Casbah arches and soft blue borders for Mediterranean feel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-t-[1.5rem] rounded-b-[4rem] shadow-sm border border-teal-200/80 border-b-4 border-b-teal-600 p-5 sm:p-8 relative overflow-hidden">
          
          {/* Subtle sea breeze gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Playful Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-2 sm:pb-4 relative z-10 gap-4">
            <div className="flex flex-col items-start">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-sky-950 tracking-tight flex items-center gap-2 sm:gap-3">
                {lang === "ar" ? "خصيصاً لك" : <>
                  <span className="uppercase tracking-tight text-sky-950">{t("home.pour_vous.prefix")} {t("home.pour_vous.suffix")}</span>
                </>}
              </h3>
              <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-teal-600 rounded-full mt-2 sm:mt-3 opacity-80"></div>
            </div>

            {/* Mediterranean Button */}
            <button 
              onClick={() => navigate('/shop')}
              className="group relative flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-3 rounded-xl bg-transparent text-teal-700 hover:text-teal-800 active:scale-95 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 w-fit border-none"
            >
              <span>{t("home.pour_vous.explore_all")}</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="relative group/rcmd px-4 sm:px-0 z-10">
            {/* Left Desktop Nav */}
            <button
              onClick={() => scrollRcmd("left")}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-sky-700 border border-sky-100 flex items-center justify-center hover:bg-sky-50 hover:text-sky-900 hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-sm cursor-pointer"
              aria-label={t("Voir les produits précédents")}
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>

            <div 
              ref={rcmdScrollContainerRef} 
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 desktop-scrollbar snap-x snap-mandatory flex-nowrap select-none"
              style={{ scrollBehavior: 'smooth' }}
            >
              {featuredProducts.slice(0, 12).map((product, idx) => {
                return (
                  <div
                    key={product.id}
                    className="snap-start snap-always shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]"
                  >
                    <ProductCard
                      product={product}
                      index={idx}
                      sectionStyle="bg-white rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300"
                      onClick={(p) => navigate(`/product/${p.id}`)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Right Desktop Nav */}
            <button
              onClick={() => scrollRcmd("right")}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-sky-700 border border-sky-100 flex items-center justify-center hover:bg-sky-50 hover:text-sky-900 hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-sm cursor-pointer"
              aria-label={t("Voir plus de produits")}
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
            
            <MobileSwipeIndicator className="-mt-3 md:hidden block" />
          </div>
        </div>
      </div>
    </section>


      {/* Brand Carousel: Redesigned Dynamic Boutiques & Marques Section */}
      <BoutiquesMarques sellers={mappedSellers} isLoading={isSellersLoading} />

      {/* Main Product Grid Section: Shrink Banners and increase density - REMOVED DUPLICATE */}

      {/* Social Proof: Casbah Mediterranean Vibe */}
      <section className="py-10 sm:py-16 bg-sky-950 relative mb-6 sm:mb-8 rounded-t-[4rem] rounded-b-[4rem] mx-3 sm:mx-8 shadow-xl border border-sky-900 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-bl-full pointer-events-none blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/20 rounded-tr-full pointer-events-none blur-3xl"></div>
         
         <div className="max-w-4xl mx-auto px-4 relative z-10 pt-2 sm:pt-6">
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
               <div className="flex items-center gap-1.5 sm:gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 fill-amber-400 drop-shadow-md" />
                  ))}
               </div>
               <p className="text-lg sm:text-3xl font-display text-white leading-relaxed px-2 sm:px-4 max-w-3xl text-center italic drop-shadow-sm">
                 {t("home.social_proof.quote")}
               </p>
               <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <span className="text-xs sm:text-sm font-semibold text-sky-100 uppercase tracking-widest">{t("Sonia A.")}</span>
                  <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-[10px] sm:text-xs font-medium tracking-wide uppercase border border-teal-400/30 backdrop-blur-sm">{t("home.social_proof.verified")}</span>
               </div>
            </div>
         </div>
      </section>

      {/* Endless Grid Section */}
      <HomeEndlessGrid />
    </div>
  );
};

