import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
import { BentoHero } from "../../components/Home/BentoHero";
import { NeoCategoryGrid } from "../../components/Home/NeoCategoryGrid";
import { FeaturedProductsCarousel } from "../../components/Home/FeaturedProductsCarousel";
import { DynamicSection } from "../../components/Home/DynamicSection";
import { HomeEndlessGrid } from "../../components/Home/HomeEndlessGrid";
import { SponsoredSection } from "../../components/Home/SponsoredSection";
import { Banner } from "../../domains/home/homepage.types";
import { Helmet } from "react-helmet-async";
import { useUserHabits } from "../../hooks/useUserHabits";
import { useHomeData } from "../../hooks/useHomeData";
import { useHomeCategoryConfig } from "./hooks/useHomeCategoryConfig";

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

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { activeWilaya } = useShop();
  const { currentUser } = useAuth();

  const {
    getCategorieFavorite,
    categoriesVisiteesCount,
  } = useUserHabits();

  const {
    dbBanners,
    isBannersLoading,
    featuredProducts,
    customCategories,
    homepageSections,
  } = useHomeData();

  const { categoryHierarchy } = useShop();

  const { sortedCategoryCards } = useHomeCategoryConfig(
    customCategories,
    categoryHierarchy,
    categoriesVisiteesCount,
    getCategorieFavorite()
  );

  // Dynamic Target Filtering for Hero Banners
  const filterByTargeting = useCallback((item: Banner) => {
    if (item.isActive === false || item.is_active === false) return false;

    const startDate = item.startDate || item.start_date;
    if (startDate && new Date() < new Date(startDate as string | number)) return false;
    const endDate = item.endDate || item.end_date;
    if (endDate && new Date() > new Date(endDate as string | number)) return false;

    const audienceValue = item.targetUserType || item.target_user_type;
    if (audienceValue && audienceValue !== "all") {
      if (audienceValue === "logged_in" && !currentUser) return false;
      if (audienceValue === "new" && currentUser) return false;
    }

    const regions = item.targetRegions || item.target_regions;
    if (regions && regions.length > 0 && activeWilaya && activeWilaya !== "Tous") {
      const cleanActive = activeWilaya.toLowerCase().trim();
      const matches = regions.some((reg: string) => {
        const cleanReg = reg.toLowerCase().trim();
        return cleanReg === cleanActive || cleanActive.includes(cleanReg) || cleanReg.includes(cleanActive);
      });
      if (!matches) return false;
    }

    return true;
  }, [currentUser, activeWilaya]);

  const targetedHeroBanners = useMemo<HomeHeroBanner[]>(() => {
    const filtered = dbBanners
      .filter((b) => !b.position || b.position === "hero" || b.zone === "carousel_main")
      .filter((b) => filterByTargeting(b))
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
      },
    ];
  }, [dbBanners, filterByTargeting, t]);

  return (
    <div className="font-sans relative overflow-hidden w-full">
      <Helmet>
        <title>{t("seo_home_title")}</title>
        <meta name="description" content={t("seo_home_description")} />
        <meta name="keywords" content={t("seo_home_keywords")} />
        <meta
          property="og:image"
          content={
            targetedHeroBanners[0]?.desktop_image ||
            targetedHeroBanners[0]?.imageUrl ||
            "/images/placeholders/product.svg"
          }
        />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <h1 className="sr-only">{t("home.sr_title")}</h1>

      {/* a) Le hero (garde BentoHero tel quel) */}
      <section className="w-full bg-transparent py-2 sm:py-4 relative overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
          {isBannersLoading ? (
            <div className="w-full min-h-[400px] sm:min-h-[500px] bg-zinc-200 animate-pulse rounded-2xl border border-zinc-100 mt-0" />
          ) : (
            <BentoHero banners={targetedHeroBanners} />
          )}
        </div>
      </section>

      {/* b) La grille de catégories */}
      <NeoCategoryGrid
        categories={sortedCategoryCards}
        favoriteCategory={getCategorieFavorite()}
      />

      {/* c) UNE section « Promotions du moment » (les produits ayant flashPrice ou promoPrice actifs, réutilise le carrousel existant) */}
      <FeaturedProductsCarousel products={featuredProducts} />

      {/* Emplacements Sponsorisés Home (masqué si vide, zéro mock fallback) */}
      <SponsoredSection />

      {/* Sections administrables dynamiques */}
      {[...(homepageSections || [])]
        .filter((section) => section && section.isActive)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
        .map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}

      {/* d) La grille infinie de produits */}
      <HomeEndlessGrid />
    </div>
  );
};
