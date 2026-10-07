import React from "react";
import { Heart, Scale, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useComparatorStore } from "../../store/useComparatorStore";
import { Product } from "../../domains/product/product.types";
import { formatPrice } from "../../utils/format";
import { getTranslatedField } from "../../utils/translations";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: (product: Product) => void;
  isFeatured?: boolean;
  variant?: "default" | "premium_immersive" | "flash_sale";
  sectionStyle?: string;
  styleVariant?: "clean" | "premium" | "immersive" | "glass" | "dark" | string;
  isFlashSale?: boolean;
}

export const ProductCard = React.memo(
  ({
    product,
    index: _index,
    onClick,
    isFeatured: _isFeatured = false,
    variant = "default",
    sectionStyle,
    styleVariant = "clean",
    isFlashSale: isFlashSaleProp,
  }: ProductCardProps) => {
    const { t, i18n } = useTranslation();
    const { wishlist, toggleWishlist } = useCart();
    const navigate = useNavigate();
    const lang = i18n.language;
    const isProductFlashActive = isFlashSaleProp || false;

    const {
      products: comparedProducts,
      addProduct: addToCompare,
      removeProduct: removeFromCompare,
    } = useComparatorStore();
    const isCompared = comparedProducts.some((p) => p.id === product.id);

    const defaultClick = (prod: Product) => {
      if (onClick) onClick(prod);
      else navigate(`/product/${prod.id}`);
    };

    const currentPrice = isProductFlashActive
      ? product.flashPrice || 0
      : product.promoPrice || product.price || 0;

    const hasDiscount =
      (product.promoPrice && product.promoPrice < (product.price || 0)) ||
      (isProductFlashActive && product.flashPrice && product.flashPrice < (product.price || 0)) ||
      (product.originalPrice && product.originalPrice > currentPrice);

    const originalPrice = product.originalPrice || product.price || 0;
    const discountPercent =
      hasDiscount && originalPrice > 0
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

    const isPremium = variant === "premium_immersive" || styleVariant === "premium";
    const isImmersive = styleVariant === "immersive";
    const isGlass = styleVariant === "glass";
    const isDark = styleVariant === "dark";
    const isElevated = styleVariant === "elevated";

    const getContainerStyles = () => {
      if (isGlass) {
        return "bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md";
      }
      if (isPremium) {
        return "bg-white border-2 border-emerald-600 shadow-sm hover:shadow-md hover:-translate-y-0.5";
      }
      if (isImmersive) {
        return "bg-white border-2 border-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5";
      }
      if (isElevated) {
        return "bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5";
      }
      if (isDark) {
        return "bg-slate-900 border border-slate-800 text-white";
      }
      return "bg-white border border-slate-200/80 hover:border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5";
    };

    return (
      <div
        className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 cursor-pointer h-full relative ${getContainerStyles()} ${sectionStyle || ""}`}
        onClick={() => defaultClick(product)}
      >
        {/* Photo Container */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-slate-50">
          <img
            src={getOptimizedImageUrl(product.image, 600) || "/images/placeholders/product.svg"}
            alt={getTranslatedField(product, "name", lang)}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/placeholders/product.svg";
            }}
          />

          {/* Badges en haut à gauche */}
          <div className="absolute top-2.5 start-2.5 z-20 flex flex-col items-start gap-1 pointer-events-none">
            {hasDiscount && discountPercent > 0 && (
              <span className="flex items-center gap-1 bg-red-600 text-white font-sans font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                -{discountPercent}%
              </span>
            )}
            {product.isSponsored && (
              <span className="bg-slate-100 text-slate-700 border border-slate-200 font-sans font-bold text-[8px] sm:text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                {t("Sponsorisé")}
              </span>
            )}
          </div>

          {/* Actions flottantes en haut à droite */}
          <div className="absolute top-2.5 end-2.5 z-20 flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              aria-label={wishlist.includes(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="w-8 h-8 rounded-full bg-white/95 hover:bg-slate-100 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer border border-slate-200"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "stroke-[2]"}`} />
            </button>
            <button
              type="button"
              aria-label={isCompared ? "Retirer du comparateur" : "Ajouter au comparateur"}
              onClick={(e) => {
                e.stopPropagation();
                if (isCompared) removeFromCompare(product.id);
                else addToCompare(product);
              }}
              className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer border ${
                isCompared
                  ? "bg-slate-900 text-white border-transparent"
                  : "bg-white/95 text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Corps de la carte : Métadonnées, Titre et Prix */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2 bg-white">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {product.category || product.sellerName || "Olmart"}
              </span>
              {Number(product.rating || 0) > 0 && (
                <div className="flex items-center gap-0.5 text-slate-700 text-[10px] font-bold shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                </div>
              )}
            </div>

            <h3 className="font-sans font-semibold text-slate-900 group-hover:text-emerald-700 text-xs sm:text-sm leading-snug line-clamp-2 transition-colors">
              {getTranslatedField(product, "name", lang)}
            </h3>
          </div>

          {/* Ligne inférieure : Prix */}
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2 mt-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans font-black text-sm sm:text-base tracking-tight tabular-nums text-emerald-700">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="font-sans text-[11px] text-slate-400 line-through tabular-nums">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 group-hover:text-emerald-800 transition-colors">
              {t("details", "Voir")}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
