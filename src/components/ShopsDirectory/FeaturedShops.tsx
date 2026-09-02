import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, MapPin, ShieldCheck, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShopDirectoryItem } from "../../types/shopsDirectory";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface FeaturedShopsProps {
  shops: ShopDirectoryItem[];
}

export const FeaturedShops: React.FC<FeaturedShopsProps> = ({ shops }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  if (!shops || shops.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-serif">
              {isArabic ? "متاجر مميزة وموصى بها" : "Boutiques à la Une & Coups de Cœur"}
            </h2>
            <p className="text-xs text-slate-500">
              {isArabic
                ? "متاجر كبرى ذات أعلى تقييم وتفاعل من المندوبين والمشترين"
                : "Sélection des meilleures enseignes certifiées Olmart"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.slice(0, 3).map((shop) => {
          const bannerUrl = shop.bannerUrl
            ? getOptimizedImageUrl(shop.bannerUrl, 400)
            : "/images/placeholders/product.svg";

          const logoUrl = shop.logoUrl
            ? getOptimizedImageUrl(shop.logoUrl, 100)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                shop.shopName || "Featured"
              )}&background=115E59&color=fff&bold=true`;

          return (
            <div
              key={shop.id || shop.sellerId}
              onClick={() => navigate(`/store/${shop.sellerId || shop.id}`)}
              className="group relative rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white p-5 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between border border-teal-800/40"
            >
              {/* Decorative background image blur */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <img loading="lazy" decoding="async" src={bannerUrl} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-xl border-2 border-amber-400/80 bg-white p-0.5 shadow-md overflow-hidden shrink-0">
                    <img loading="lazy" decoding="async" src={logoUrl} alt={shop.shopName} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isArabic ? "مطلائعي" : "Sponsorisé"}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {shop.shopName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-teal-200/90">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {shop.wilaya || "Algérie"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-amber-300">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      {(shop.rating || 4.9).toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed">
                  {shop.description || shop.slogan || (isArabic ? "متجر معتمد على منصة أولمارت." : "Boutique certifiée partenaire Olmart.")}
                </p>
              </div>

              <div className="relative z-10 pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-amber-300">
                <span>{isArabic ? "تصفح المنتجات" : "Découvrir la vitrine"}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
