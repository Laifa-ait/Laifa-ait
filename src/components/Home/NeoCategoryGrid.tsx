import React, { useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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
      const scrollAmount = 380; // approximate width of a card + gap
      // If RTL, scroll directions can be reversed depending on the browser behavior
      const actualDirection = isRTL ? (direction === "left" ? "right" : "left") : direction;
      scrollContainerRef.current.scrollBy({
        left: actualDirection === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 mb-10 sm:mb-14 pt-2 sm:pt-4 relative z-20">
      
      {/* Title block with helper to mention horizontal layout and ability to swipe */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-sans font-extrabold text-slate-900 tracking-tight">
            {t("home.categories.explore_by", "Explorer par catégories")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t("home.categories.swipe_hint", "Faites défiler horizontalement pour tout explorer")}
          </p>
        </div>

        {/* Desktop Slider Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => handleScroll("left")}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] hover:border-slate-300 active:scale-95 transition-all shadow-sm"
            aria-label="Previous categories"
          >
            <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] hover:border-slate-300 active:scale-95 transition-all shadow-sm"
            aria-label="Next categories"
          >
            <ChevronRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Horizontal Swipe Container */}
      <div className="relative group/carousel">
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-4 pt-1 px-1 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((card, index) => {
            const isFavorite = card.key === favoriteCategory;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.02 }}
                onClick={() => {
                  setActiveCategory(card.key);
                  navigate(`/shop?category=${encodeURIComponent(card.key)}`);
                }}
                className="relative flex flex-col w-[85vw] sm:w-[350px] md:w-[400px] h-48 sm:h-52 md:h-56 bg-slate-100 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl active:scale-[0.99] transition-all duration-300 shrink-0 snap-start group border border-slate-200/50"
              >
                {/* Background Image (Covering the entire card) - NO global dark overlay filter */}
                <img
                  src={getOptimizedImageUrl(card.image, 800)}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out z-0"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Localized bottom-up gradient specifically for text legibility, leaving the upper image completely clear */}
                <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent z-10 pointer-events-none" />

                {/* Content Overlay (Writing directly on the card with no white background block) */}
                <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end items-start z-20">
                  {isFavorite && (
                    <span className="mb-2 inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-white border border-white/20 px-2.5 py-0.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                      {t("home.category.recommended_star", "Recommandé")}
                    </span>
                  )}
                  
                  <h3 className="font-sans font-bold text-white text-base sm:text-lg md:text-xl tracking-tight mb-0.5 group-hover:text-blue-200 transition-colors duration-300 leading-snug drop-shadow-sm">
                    {card.title}
                  </h3>
                  
                  <p className="font-sans font-medium text-slate-200/95 text-xs sm:text-sm tracking-wide line-clamp-1 mb-2.5 drop-shadow-sm">
                    {card.subtitle}
                  </p>

                  <div className="flex items-center gap-1 text-white/90 text-[10px] sm:text-xs font-bold tracking-wider uppercase group-hover:text-blue-300 transition-colors duration-300">
                    <span>{t("home.category.discover", "Découvrir")}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Swipe Indicator beneath the horizontal list */}
        <MobileSwipeIndicator className="-mt-1" />
      </div>
    </section>
  );
};

