import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OptimizedImage } from "./OptimizedImage";

interface DbBanner {
  id: string;
  name?: string; // from builder
  title?: string;
  title_color?: string;
  subtitle?: string;
  ctaLink?: string;
  subtitle_color?: string;
  button_text?: string;
  ctaText?: string; // from builder
  btn_bg_color?: string;
  btn_text_color?: string;
  desktop_image?: string;
  imageUrl?: string; // from builder
  mobile_image?: string | null;
  mobileImageUrl?: string; // from builder
  tag_id?: string;
  sort_order?: number;
  orderIndex?: number; // from builder
  is_active?: boolean;
  isActive?: boolean; // from builder
  created_at?: string | Date | { seconds: number; nanoseconds: number };
  updated_at?: string | Date | { seconds: number; nanoseconds: number };
  translations?: {
    [lang: string]: {
      title?: string;
      subtitle?: string;
      button_text?: string;
    };
  };
  title_fr?: string;
  title_en?: string;
  title_ar?: string;
  subtitle_fr?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  button_text_fr?: string;
  button_text_en?: string;
  button_text_ar?: string;
  linkedProductIds?: string[];
}

interface TagType {
  id: string;
  name: string;
  slug: string;
}

interface BannerCarouselProps {
  banners: DbBanner[];
  tags: TagType[];
  autoPlay?: boolean;
  interval?: number;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = [],
  tags = [],
  autoPlay = true,
  interval = 5000,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "fr";
  const isRTL = lang === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const activeBanners = banners.filter((b) => b.is_active !== false && b.isActive !== false);

  // Multilingual dynamic translation lookup
  const getTranslatedValue = useCallback(
    (banner: DbBanner, key: "title" | "subtitle" | "button_text") => {
      if (!banner) return "";
      // 1. Check nested translation object
      if (banner.translations?.[lang]?.[key]) {
        return banner.translations[lang][key];
      }
      // 2. Check flat localized suffix keys (e.g., banner.title_ar, title_fr)
      if (key === "title") {
        if (lang === "fr" && banner.title_fr) return banner.title_fr;
        if (lang === "en" && banner.title_en) return banner.title_en;
        if (lang === "ar" && banner.title_ar) return banner.title_ar;
      } else if (key === "subtitle") {
        if (lang === "fr" && banner.subtitle_fr) return banner.subtitle_fr;
        if (lang === "en" && banner.subtitle_en) return banner.subtitle_en;
        if (lang === "ar" && banner.subtitle_ar) return banner.subtitle_ar;
      } else if (key === "button_text") {
        if (lang === "fr" && banner.button_text_fr) return banner.button_text_fr;
        if (lang === "en" && banner.button_text_en) return banner.button_text_en;
        if (lang === "ar" && banner.button_text_ar) return banner.button_text_ar;
      }
      // 3. Perfect fallback chains
      if (key === "title") return banner.title || banner.name || "";
      if (key === "subtitle") return banner.subtitle || "";
      if (key === "button_text") return banner.button_text || banner.ctaText || "";
      return "";
    },
    [lang]
  );

  // Auto-play timer with full reset on index change (insures full interval duration when manually navigated)
  useEffect(() => {
    if (autoPlay && activeBanners.length > 1 && !isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [activeBanners.length, autoPlay, interval, isHovered, currentIndex]);

  if (activeBanners.length === 0) {
    return null;
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeBanners.length) % activeBanners.length);
  };

  // Touch handlers for responsive swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = touchStartX - currentX;

    if (Math.abs(diffX) > 60) {
      if (diffX > 0) {
        // swipe left
        if (isRTL) handlePrev();
        else handleNext();
      } else {
        // swipe right
        if (isRTL) handleNext();
        else handlePrev();
      }
      setTouchStartX(null);
    }
  };

  const currentBanner = activeBanners[currentIndex];
  const linkedTag = currentBanner.tag_id ? tags.find((t) => t.id === currentBanner.tag_id) : null;
  const imageUrl =
    currentBanner.desktop_image ||
    currentBanner.imageUrl ||
    "/images/placeholders/product.svg";
  const mobileImageUrl = currentBanner.mobile_image || currentBanner.mobileImageUrl;

  // Multilingual dynamic translation lookup
  const title = getTranslatedValue(currentBanner, "title");
  const subtitle = getTranslatedValue(currentBanner, "subtitle");
  const buttonText = getTranslatedValue(currentBanner, "button_text");

  const handleBannerClick = () => {
    if (currentBanner) {
      if (currentBanner.linkedProductIds && currentBanner.linkedProductIds.length > 0) {
        navigate(`/campaign/${currentBanner.id}`);
      } else if (linkedTag) {
        navigate(`/shop?tag=${linkedTag.slug}`);
      } else if (currentBanner.ctaLink) {
        navigate(currentBanner.ctaLink);
      } else {
        navigate("/shop");
      }
    }
  };

  return (
    <div
      className="w-full select-none animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="banner-carousel-wrapper"
    >
      <div
        onClick={handleBannerClick}
        className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl group cursor-pointer bg-[var(--color-slate-900, #0f172a)] border border-[var(--color-orange-600, #ea580c)]/20 transition-all duration-500 hover:border-[var(--color-slate-900, #0f172a)]/30"
      >
        <div className="relative w-full h-[220px] sm:h-[320px] lg:h-[380px] xl:h-[420px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(e, info) => {
                const swipeThreshold = 50;
                if (info.offset.x < -swipeThreshold) {
                  // Swiped left
                  if (isRTL) handlePrev();
                  else handleNext();
                } else if (info.offset.x > swipeThreshold) {
                  // Swiped right
                  if (isRTL) handleNext();
                  else handlePrev();
                }
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y z-[5]"
            >
              {/* Premium cinematic zooming action inside back panel */}
              <motion.div
                initial={{ scale: 1.06, y: 0 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 6, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full bg-[var(--color-slate-900, #0f172a)]"
              >
                <OptimizedImage
                  src={imageUrl}
                  alt={title || "Banner"}
                  priority={true}
                  className="w-full h-full object-cover transition-opacity duration-700 opacity-90 group-hover:scale-102"
                />
              </motion.div>

              {/* Enhanced Multidirectional Overlays for Maximum Rich Contrast */}
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent z-0" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent z-0" />
              <div className="absolute inset-0 bg-[var(--color-slate-900, #0f172a)]/15 group-hover:bg-transparent transition-colors duration-500 z-0" />

              {/* Banner Contents: Bottom Position with staggered premium typography entries */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-16 lg:p-20 z-10 pb-16 sm:pb-24">
                <div className="max-w-4xl w-full">
                  <div className={`flex flex-col ${isRTL ? "items-end text-right" : "items-start text-left"}`}>
                    {/* 1. Tag Badge */}
                    {linkedTag && (
                      <motion.div
                        key={`tag-${currentBanner.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="flex items-center gap-2 mb-3 bg-white/10 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/15 shadow-[0_4px_12px_rgba(255,255,255,0.05)] hover:bg-white/20 transition-all duration-300"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span className="text-[10px] rtl:text-[12px] md:text-[11px] font-sans font-bold uppercase text-white tracking-[0.25em] rtl:tracking-normal leading-none">
                          {linkedTag.name}
                        </span>
                      </motion.div>
                    )}

                    {/* 2. Main Title */}
                    {title && (
                      <motion.h2
                        key={`title-${currentBanner.id}`}
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ color: currentBanner.title_color || "#FFFFFF" }}
                        className="text-3xl sm:text-5xl lg:text-7xl font-sans font-bold leading-[0.95] uppercase tracking-tighter rtl:tracking-normal mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-stone-100"
                      >
                        {title}
                      </motion.h2>
                    )}

                    {/* 3. Subtitle */}
                    {subtitle && (
                      <motion.p
                        key={`sub-${currentBanner.id}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        style={{ color: currentBanner.subtitle_color || "#ECECEC" }}
                        className="text-xs rtl:text-sm sm:text-base lg:text-lg font-medium tracking-tight rtl:tracking-normal drop-shadow-md mb-8 max-w-[280px] sm:max-w-xl md:max-w-2xl opacity-90 leading-relaxed font-sans"
                      >
                        {subtitle}
                      </motion.p>
                    )}

                    {/* 4. Action Button with responsive scaling and custom hover states */}
                    {buttonText && (
                      <motion.button
                        key={`btn-${currentBanner.id}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBannerClick();
                        }}
                        style={{
                          backgroundColor: currentBanner.btn_bg_color || "#FFFFFF",
                          color: currentBanner.btn_text_color || "var(--color-slate-900, #0f172a)",
                        }}
                        whileHover={{ scale: 1.04, y: -2, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.97 }}
                        className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-xl text-[10px] rtl:text-[12px] sm:text-xs rtl:text-sm font-sans font-bold uppercase tracking-widest rtl:tracking-normal shadow-2xl transition-all duration-300 flex items-center gap-3 group/btn hover:brightness-105 z-10"
                      >
                        <span>{buttonText}</span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform duration-300 ${isRTL ? "rotate-180 group-hover/btn:-translate-x-1.5" : "group-hover/btn:translate-x-1.5"}`}
                        />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Custom Chevron Navigation Buttons */}
        {activeBanners.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.95)", color: "var(--color-slate-900, #0f172a)" }}
              whileTap={{ scale: 0.9 }}
              onClick={isRTL ? handleNext : handlePrev}
              className={`absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all opacity-0 group-hover:opacity-100 duration-300 ${
                isRTL ? "right-4 sm:right-6" : "left-4 sm:left-6"
              }`}
              aria-label={t("Previous slider item") || "Previous slider item"}
            >
              {isRTL ? (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.95)", color: "var(--color-slate-900, #0f172a)" }}
              whileTap={{ scale: 0.9 }}
              onClick={isRTL ? handlePrev : handleNext}
              className={`absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all opacity-0 group-hover:opacity-100 duration-300 ${
                isRTL ? "left-4 sm:left-6" : "right-4 sm:right-6"
              }`}
              aria-label={t("Next slider item") || "Next slider item"}
            >
              {isRTL ? (
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </motion.button>
          </>
        )}

        {/* Carousel indicator dots with progress representation positioned in the bottom-end corner to prevent overlap */}
        {activeBanners.length > 1 && (
          <div className={`absolute bottom-4 sm:bottom-6 ${isRTL ? "left-4 sm:left-8" : "right-4 sm:right-8"} flex items-center justify-center gap-2.5 z-20 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5`}>
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                  currentIndex === idx ? "w-8 bg-white shadow-lg" : "w-1.5 bg-white/35 hover:bg-white/60"
                }`}
                title={`Aller à la diapositive ${idx + 1}`}
                aria-label={`Slide index ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
