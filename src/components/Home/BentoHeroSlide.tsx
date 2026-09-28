import React from "react";
import { ArrowUpRight, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Banner } from "../../domains/home/homepage.types";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface BentoHeroSlideProps {
  banner: Banner;
  index: number;
  totalBanners: number;
  onBannerClick: (banner: Banner) => void;
  lang: string;
}

export const BentoHeroSlide: React.FC<BentoHeroSlideProps> = ({
  banner,
  index,
  totalBanners,
  onBannerClick,
  lang,
}) => {
  const { t } = useTranslation();

  const isDefault1 = banner.id === "default-1" || banner.id === "1";
  const isDefault2 = banner.id === "default-2" || banner.id === "2";

  const getTranslatedValue = (b: Banner, key: "title" | "subtitle" | "button_text") => {
    if (b.translations?.[lang]?.[key]) {
      return b.translations[lang][key];
    }
    const flatKey = `${key}_${lang}` as keyof Banner;
    const flatVal = b[flatKey];
    if (typeof flatVal === "string" && flatVal) {
      return flatVal;
    }
    const rawVal =
      (key === "title"
        ? b.title || b.name
        : key === "subtitle"
        ? b.subtitle
        : b.button_text || b.ctaText || b.buttonText) || "";
    if (rawVal) {
      return t(rawVal, rawVal);
    }
    return "";
  };

  const title = getTranslatedValue(banner, "title");
  const subtitle = getTranslatedValue(banner, "subtitle");
  const buttonText = getTranslatedValue(banner, "button_text");

  const rawDesktop = banner.desktop_image || banner.desktopImage || banner.imageUrl;
  const desktopImageUrl = getOptimizedImageUrl(rawDesktop, 1200);
  const rawMobile = banner.mobile_image || banner.mobileImageUrl || rawDesktop;
  const mobileImageUrl = getOptimizedImageUrl(rawMobile, 800);

  return (
    <div
      key={banner.id || index}
      className="h-full flex-shrink-0 relative overflow-hidden flex items-center"
      style={{ width: `${100 / totalBanners}%` }}
    >
      {isDefault1 ? (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/80 overflow-hidden">
          <div className="absolute -top-24 -end-24 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 start-1/3 w-80 h-80 bg-orange-600/15 blur-[100px] rounded-full pointer-events-none" />

          {/* High-conversion product showcase image */}
          <img
            loading="eager"
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=900"
            alt={title || "Grande Braderie"}
            className="absolute end-0 sm:end-8 md:end-16 bottom-0 h-[85%] sm:h-[92%] md:h-[98%] w-auto object-contain object-bottom pointer-events-none drop-shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent sm:hidden pointer-events-none" />
        </div>
      ) : isDefault2 ? (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-stone-900 via-neutral-900 to-amber-900/70 overflow-hidden">
          <div className="absolute -top-24 -end-24 w-96 h-96 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 start-1/4 w-80 h-80 bg-amber-600/15 blur-[100px] rounded-full pointer-events-none" />

          <img
            loading="eager"
            src="https://images.unsplash.com/photo-1528255671579-01b9e182ed1d?auto=format&fit=crop&q=80&w=900"
            alt={title || "Promotions"}
            className="absolute end-0 sm:end-8 md:end-16 bottom-0 h-[85%] sm:h-[92%] md:h-[98%] w-auto object-contain object-bottom pointer-events-none drop-shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent sm:hidden pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <picture className="absolute inset-0 w-full h-full">
            {(banner.mobile_image || banner.mobileImageUrl) && (
              <source media="(max-width: 640px)" srcSet={mobileImageUrl} />
            )}
            <img
              loading="eager"
              src={desktopImageUrl}
              alt={title || "Hero Banner"}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-0 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent rtl:bg-gradient-to-l z-0 pointer-events-none" />
        </div>
      )}

      {/* Content wrapper */}
      <div className="absolute inset-y-0 start-0 p-6 sm:p-10 md:p-14 flex flex-col justify-center items-start z-10 max-w-[92%] sm:max-w-[70%] md:max-w-[58%]">
        {/* Dynamic Micro Kicker */}
        <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 backdrop-blur-md shadow-xs">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="font-sans font-extrabold text-[10px] sm:text-xs uppercase tracking-wider">
            {isDefault1
              ? t("home.hero.flash_kicker", "⚡ Offres Exclusives Olmart")
              : isDefault2
              ? t("home.hero.artisan_kicker", "🇩🇿 Fait en Algérie & Nouveautés")
              : t("home.hero.special_kicker", "✨ Sélection Officielle")}
          </span>
        </div>

        {/* Title with crisp high-contrast formatting */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tight mb-2 sm:mb-3 max-w-2xl leading-[1.08] text-start text-white drop-shadow-md">
          {isDefault1
            ? t("home.hero.headline_1", "Grandes Promos & Nouveautés Tendance")
            : isDefault2
            ? t("home.hero.headline_2", "Le Meilleur de la Marketplace Algérienne")
            : title || t("home.hero.default_title", "Votre Univers Shopping")}
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-lg text-start font-sans font-normal text-zinc-300 leading-relaxed line-clamp-2">
          {isDefault1
            ? t(
                "home.hero.sub_1",
                "Profitez des meilleures réductions du moment avec livraison sécurisée dans toutes les wilayas."
              )
            : isDefault2
            ? t(
                "home.hero.sub_2",
                "Des milliers de produits certifiés, prix transparents et protection acheteur jusqu'à la réception."
              )
            : subtitle}
        </p>

        {/* High-conversion CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBannerClick(banner);
          }}
          className="group relative inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans font-bold text-xs sm:text-sm uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
        >
          <span>
            {isDefault1
              ? t("home.hero.shop_now", "Profiter des offres")
              : buttonText || t("cat_explore", "Découvrir la boutique")}
          </span>
          <div className="w-6 h-6 rounded-lg bg-zinc-950/10 flex items-center justify-center group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
            <ArrowUpRight className="w-4 h-4 rtl:rotate-90 rtl:scale-x-[-1] text-zinc-950 stroke-[2.5]" />
          </div>
        </button>
      </div>
    </div>
  );
};
