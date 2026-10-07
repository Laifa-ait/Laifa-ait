import React, { useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { MobileSwipeIndicator } from "../ui/MobileSwipeIndicator";

interface NeoCategoryItem {
  key: string;
  image: string;
  title: string;
  subtitle?: string;
}

export const NeoCategoryGrid: React.FC<{
  categories: NeoCategoryItem[];
  favoriteCategory: string | null;
}> = ({ categories, favoriteCategory }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setActiveCategory } = useShop();
  const isRTL = i18n.dir() === "rtl";

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      const actualDirection = isRTL
        ? direction === "left"
          ? "right"
          : "left"
        : direction;
      scrollContainerRef.current.scrollBy({
        left: actualDirection === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 mb-8 sm:mb-12 pt-2 relative z-20">
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>{t("home.categories.badge", "Univers Produits")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-black text-slate-900 tracking-tight">
            {t("home.categories.explore_by", "Explorer par catégories")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t("home.categories.swipe_hint", "Découvrez les meilleures sélections par univers")}
          </p>
        </div>

        {/* Desktop Slider Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-emerald-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
            aria-label="Previous categories"
          >
            <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-emerald-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
            aria-label="Next categories"
          >
            <ChevronRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Horizontal Swipe Container */}
      <div className="relative group/carousel">
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 md:gap-5 pb-4 pt-1 px-0.5 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((card, index) => {
            const isFavorite = card.key === favoriteCategory;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                onClick={() => {
                  setActiveCategory(card.key);
                  navigate(`/shop?category=${encodeURIComponent(card.key)}`);
                }}
                className="relative flex flex-col w-[78vw] sm:w-[300px] md:w-[340px] h-44 sm:h-48 md:h-52 bg-slate-900 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:border-emerald-500/50 active:scale-[0.99] transition-all duration-300 shrink-0 snap-start group border border-slate-800"
              >
                {/* Background Image & Fallback Gradient */}
                {card.image && card.image !== "/images/placeholders/product.svg" ? (
                  <img
                    src={getOptimizedImageUrl(card.image, 800)}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out z-0"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 z-0" />
                )}

                {/* Gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent z-10 pointer-events-none group-hover:via-slate-900/25 transition-colors" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end items-start z-20">
                  {isFavorite && (
                    <span className="mb-2 inline-flex items-center gap-1 bg-amber-400/20 backdrop-blur-md text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                      {t("home.category.recommended_star", "Populaire")}
                    </span>
                  )}

                  <h3 className="font-sans font-bold text-white text-base sm:text-lg md:text-xl tracking-tight mb-0.5 group-hover:text-amber-300 transition-colors leading-snug drop-shadow-sm">
                    {t(card.title, card.title)}
                  </h3>

                  {card.subtitle && (
                    <p className="font-sans font-normal text-slate-300 text-xs tracking-wide line-clamp-1 mb-2 drop-shadow-sm">
                      {t(card.subtitle, card.subtitle)}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-emerald-400 group-hover:text-emerald-300 text-[11px] sm:text-xs font-bold tracking-wider uppercase group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span>{t("home.category.discover", "Explorer")}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <MobileSwipeIndicator className="-mt-1" />
      </div>
    </section>
  );
};
