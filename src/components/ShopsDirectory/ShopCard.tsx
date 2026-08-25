import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ShieldCheck, Star, Package, ChevronRight, Store, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShopDirectoryItem } from "../../types/shopsDirectory";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface ShopCardProps {
  shop: ShopDirectoryItem;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const fallbackBanner = "/images/placeholders/product.svg";
  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    shop.shopName || "Boutique"
  )}&background=0F766E&color=fff&size=128&bold=true`;

  const bannerUrl = shop.bannerUrl
    ? getOptimizedImageUrl(shop.bannerUrl, 400)
    : fallbackBanner;

  const logoUrl = shop.logoUrl
    ? getOptimizedImageUrl(shop.logoUrl, 120)
    : fallbackLogo;

  const hasRating = shop.rating !== null && shop.rating !== undefined && shop.rating > 0;
  const ratingValue = hasRating ? shop.rating!.toFixed(1) : null;
  const reviewsCount = shop.reviewsCount !== undefined ? shop.reviewsCount : 0;
  const isVerified = shop.isVerified !== false && shop.status !== "PENDING_VERIFICATION";

  return (
    <div
      onClick={() => navigate(`/store/${shop.sellerId || shop.id}`)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Banner */}
        <div className="relative h-28 sm:h-32 bg-slate-800 overflow-hidden">
          <img
            src={bannerUrl}
            alt={shop.shopName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackBanner;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Wilaya Badge */}
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{shop.wilaya || "Algérie"}</span>
          </div>

          {/* Verified Badge */}
          {isVerified && (
            <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isArabic ? "موثوق" : "Vérifiée"}</span>
            </div>
          )}
        </div>

        {/* Logo Avatar Overlay & Header Info */}
        <div className="px-5 pt-0 pb-3 relative">
          <div className="flex items-end justify-between -mt-8 sm:-mt-10 mb-3">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={shop.shopName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackLogo;
                  }}
                />
              </div>
            </div>

            {/* Rating / Score pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              {hasRating ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{ratingValue}</span>
                  <span className="text-[10px] text-amber-600/80 font-normal">
                    ({reviewsCount})
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-amber-700 font-semibold px-0.5">
                  {isArabic ? "لا توجد تقييمات" : "Aucun avis"} ({reviewsCount})
                </span>
              )}
            </div>
          </div>

          {/* Shop Name & Description */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 flex items-center gap-1.5">
              <span>{shop.shopName}</span>
            </h3>

            {shop.slogan ? (
              <p className="text-xs font-medium text-teal-700 italic line-clamp-1">
                "{shop.slogan}"
              </p>
            ) : (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {shop.description || (isArabic ? "مرحبًا بكم في متجرنا على Olmart." : "Bienvenue dans notre boutique officielle Olmart.")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Meta & Action */}
      <div className="px-5 pb-4 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-800">{shop.productsCount ?? 12}</span>
            <span>{isArabic ? "منتج" : "produits"}</span>
          </div>

          {shop.avgPreparationTime && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{shop.avgPreparationTime}</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/store/${shop.sellerId || shop.id}`);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow-md cursor-pointer"
        >
          <Store className="w-4 h-4 text-amber-300" />
          <span>{isArabic ? "زيارة المتجر" : "Visiter la boutique"}</span>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
