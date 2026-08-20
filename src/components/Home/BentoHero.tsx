import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { Banner } from "../../domains/home/homepage.types";

export const BentoHero: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || "fr";
  const isRTL = lang === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const activeBanners = (banners || []).filter(b => b.is_active !== false && b.isActive !== false);

  if (activeBanners.length === 0) {
    return null;
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartX;
    setDragOffset(diffX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    
    const width = containerRef.current?.offsetWidth || window.innerWidth;
    const threshold = width * 0.15; // 15% of width to trigger swipe
    
    if (dragOffset > threshold) {
      if (isRTL) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (dragOffset < -threshold) {
      if (isRTL) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    
    setTouchStartX(null);
    setDragOffset(0);
  };

  // Multilingual dynamic translation lookup
  const getTranslatedValue = (banner: Banner, key: "title" | "subtitle" | "button_text") => {
    if (banner.translations?.[lang]?.[key]) {
      return banner.translations[lang][key];
    }
    const flatKey = `${key}_${lang}` as keyof Banner;
    const flatVal = banner[flatKey];
    if (typeof flatVal === "string" && flatVal) {
      return flatVal;
    }
    if (key === "title") return banner.title || banner.name || "";
    if (key === "subtitle") return banner.subtitle || "";
    if (key === "button_text") return banner.button_text || banner.ctaText || banner.buttonText || "";
    return "";
  };

  const width = containerRef.current?.offsetWidth || window.innerWidth;
  const dragPercent = width > 0 ? (dragOffset / width) * 100 : 0;
  const basePercent = isRTL ? currentIndex * 100 : -currentIndex * 100;
  const totalPercent = (basePercent + dragPercent) / activeBanners.length;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full min-h-[360px] sm:min-h-[460px] md:min-h-[500px] relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden group shadow-lg border border-zinc-100 select-none touch-pan-y bg-[#FAF8F5]"
    >
      {/* Horizontal Sliding Strip */}
      <motion.div
        animate={{ x: `${totalPercent}%` }}
        transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8 }}
        className="absolute inset-0 h-full flex flex-row"
        style={{ width: `${activeBanners.length * 100}%` }}
      >
        {activeBanners.map((banner, index) => {
          const isDefault1 = banner.id === "default-1" || banner.id === "1";
          const isDefault2 = banner.id === "default-2" || banner.id === "2";

          const title = getTranslatedValue(banner, "title");
          const subtitle = getTranslatedValue(banner, "subtitle");
          const buttonText = getTranslatedValue(banner, "button_text");

          const rawDesktop = banner.desktop_image || banner.desktopImage || banner.imageUrl;
          const desktopImageUrl = getOptimizedImageUrl(rawDesktop, 1200);

          const rawMobile = banner.mobile_image || banner.mobileImageUrl || rawDesktop;
          const mobileImageUrl = getOptimizedImageUrl(rawMobile, 800);

          const handleBannerClick = () => {
            if (banner.ctaLink) {
              navigate(banner.ctaLink);
            } else {
              navigate("/shop");
            }
          };

          return (
            <div
              key={banner.id || index}
              className="h-full flex-shrink-0 relative overflow-hidden flex items-center"
              style={{ width: `${100 / activeBanners.length}%` }}
            >
              {isDefault1 ? (
                /* Premium Summer Green Theme matching the mockup exactly */
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#9DD969] via-[#85D053] to-[#B5EE82] overflow-hidden">
                  {/* Abstract decorative background waves for layered depth */}
                  <svg 
                    className="absolute inset-0 w-full h-full text-white/15 opacity-60" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    <path d="M0,30 Q20,50 50,25 T100,30 L100,100 L0,100 Z" fill="currentColor" />
                    <path d="M0,45 Q35,20 70,55 T100,45 L100,100 L0,100 Z" fill="currentColor" opacity="0.4" />
                    <path d="M0,60 Q25,85 60,65 T100,70 L100,100 L0,100 Z" fill="currentColor" opacity="0.3" />
                  </svg>
                  
                  {/* Summer Fashion Shopping Model Image */}
                  <img
                    loading="eager"
                    src="https://images.unsplash.com/photo-1528255671579-01b9e182ed1d?auto=format&fit=crop&q=80&w=800"
                    alt={title || "Summer Sale"}
                    className="absolute right-0 sm:right-6 md:right-12 bottom-0 h-[80%] sm:h-[90%] md:h-[95%] w-auto object-contain object-bottom mix-blend-multiply pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : isDefault2 ? (
                /* Premium Sunset Peach Theme for visual contrast */
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#FCD5B5] via-[#F39A77] to-[#E56E5D] overflow-hidden">
                  {/* Abstract decorative waves */}
                  <svg 
                    className="absolute inset-0 w-full h-full text-white/10 opacity-70" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    <path d="M0,25 Q30,45 60,20 T100,25 L100,100 L0,100 Z" fill="currentColor" />
                    <path d="M0,50 Q25,30 75,60 T100,50 L100,100 L0,100 Z" fill="currentColor" opacity="0.3" />
                  </svg>
                  
                  {/* Fashion Shopping Model Image for Slide 2 */}
                  <img
                    loading="eager"
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"
                    alt={title || "Promotions"}
                    className="absolute right-0 sm:right-6 md:right-12 bottom-0 h-[80%] sm:h-[90%] md:h-[95%] w-auto object-contain object-bottom mix-blend-multiply pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                /* Custom user-uploaded banners */
                <div className="absolute inset-0 w-full h-full">
                  <picture className="absolute inset-0 w-full h-full">
                    {(banner.mobile_image || banner.mobileImageUrl) && (
                      <source media="(max-width: 640px)" srcSet={mobileImageUrl} />
                    )}
                    <img
                      loading="eager"
                      src={desktopImageUrl}
                      alt={title || "Hero Banner"}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-slate-900/35 z-0 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent z-0" />
                </div>
              )}

              {/* Decorative Blur for custom slides */}
              {!isDefault1 && !isDefault2 && (
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 blur-[100px] rounded-full pointer-events-none z-0"></div>
              )}

              {/* Content wrapper inside each slide so text translates together with background */}
              <div className="absolute inset-y-0 left-0 p-6 sm:p-10 md:p-16 flex flex-col justify-center items-start z-10 max-w-[55%] sm:max-w-[60%]">
                {/* Pill Badge */}
                <div
                  className={`flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full shadow-sm border ${
                    isDefault1 || isDefault2 
                      ? "bg-zinc-900 border-zinc-800 text-white" 
                      : "bg-white/10 backdrop-blur-md border-white/20 text-white"
                  }`}
                >
                  {isDefault1 || isDefault2 ? (
                    <span className="font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-wider text-white">
                      {isDefault1 ? "Limited Offer" : "Special Selection"}
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span className="font-sans font-medium text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white">
                        {t("home.hero.exclusive_selection")}
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2
                  className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tight mb-3 sm:mb-4 max-w-4xl leading-[1.1] text-start ${
                    isDefault1 || isDefault2 ? "text-zinc-950 font-extrabold" : "text-white"
                  }`}
                >
                  {isDefault1 ? (
                    <>
                      First Purchase Enjoy <br className="hidden md:inline" />
                      a Special Offer
                    </>
                  ) : title || "VOTRE UNIVERS SHOPPING"}
                </h2>

                {/* Subtitle */}
                {subtitle && (
                  <p
                    className={`text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-md text-start font-sans font-medium leading-relaxed ${
                      isDefault1 || isDefault2 ? "text-zinc-800" : "text-slate-100/90"
                    }`}
                  >
                    {isDefault1 
                      ? "Bénéficiez d'une réduction exclusive de bienvenue pour toute nouvelle inscription." 
                      : subtitle}
                  </p>
                )}

                {/* Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick();
                  }}
                  className={`font-sans font-extrabold text-[10px] sm:text-xs uppercase tracking-widest px-5 py-3 sm:px-6 sm:py-3.5 flex items-center gap-2.5 rounded-full cursor-pointer transition-all shadow-md ${
                    isDefault1 || isDefault2 
                      ? "bg-zinc-950 text-white hover:bg-[#85D053]" 
                      : "bg-white text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{isDefault1 ? "Shop Now" : buttonText || t("cat_explore")}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isDefault1 || isDefault2 ? "bg-white text-zinc-950" : "bg-slate-900 text-white"
                  }`}>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Navigation Chevrons */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={isRTL ? handleNext : handlePrev}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-300 cursor-pointer ${
              isRTL ? "right-4 sm:right-6" : "left-4 sm:left-6"
            }`}
          >
            {isRTL ? <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          <button
            onClick={isRTL ? handlePrev : handleNext}
            className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-300 cursor-pointer ${
              isRTL ? "left-4 sm:left-6" : "right-4 sm:right-6"
            }`}
          >
            {isRTL ? <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </>
      )}

      {/* 🌟 Curved Wave Cutout Overlay matching the page background color #FAF8F5 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <svg 
          width="160" 
          height="24" 
          viewBox="0 0 160 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Symmetrical fluid dome curve filled with the exact page background color #FAF8F5 */}
          <path 
            d="M 0 24 Q 22 24, 40 17 C 55 10, 65 0, 80 0 C 95 0, 105 10, 120 17 Q 138 24, 160 24 Z" 
            fill="#FAF8F5" 
          />
        </svg>
      </div>

      {/* 🌟 Custom Elongated Slide Indicators embedded inside the Curved Wave Cutout */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {activeBanners.map((_, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive 
                    ? "w-5 h-1.5 bg-[#7BC242]" 
                    : "w-1.5 h-1.5 bg-[#7BC242]/35 hover:bg-[#7BC242]/60"
                }`}
                title={`Aller à la diapositive ${idx + 1}`}
                aria-label={`Slide index ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
