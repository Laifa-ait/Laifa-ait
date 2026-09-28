import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame, ShoppingBag, Check } from "lucide-react";
import { Product } from "../../domains/product/product.types";
import { getTranslatedField } from "../../utils/translations";
import { formatPrice } from "../../utils/format";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface FeaturedProductCardProps {
  product: Product;
  isAdded: boolean;
  onQuickAdd: (e: React.MouseEvent, prod: Product) => void;
  lang: string;
}

export const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({
  product,
  isAdded,
  onQuickAdd,
  lang,
}) => {
  const navigate = useNavigate();

  const effectivePrice = product.flashPrice || product.promoPrice || product.price;
  const originalPrice = product.originalPrice || product.price;
  const discountPercent =
    originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const translatedName = getTranslatedField(product, "name", lang) || product.name;
  const coverImage =
    getOptimizedImageUrl(product.image, 600) || "/images/placeholders/product.svg";

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-zinc-200/80 hover:border-amber-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden flex items-center justify-center p-3">
        <img
          src={coverImage}
          alt={translatedName}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-108"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/placeholders/product.svg";
          }}
        />

        {discountPercent > 0 && (
          <div className="absolute top-2.5 start-2.5 z-10">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-sans font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md">
              <Flame className="w-3 h-3 fill-white" />
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 truncate">
            {product.category || product.sellerName || "Olmart"}
          </span>
          <h4 className="font-sans font-semibold text-zinc-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-amber-800 transition-colors">
            {translatedName}
          </h4>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-black text-rose-600 text-sm sm:text-base tracking-tight tabular-nums">
              {formatPrice(effectivePrice)}
            </span>
            {discountPercent > 0 && (
              <span className="font-sans text-[11px] text-zinc-400 line-through tabular-nums">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => onQuickAdd(e, product)}
            aria-label="Ajouter au panier"
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs active:scale-90 transition-all duration-200 cursor-pointer border-none ${
              isAdded
                ? "bg-emerald-600 text-white scale-105"
                : "bg-zinc-950 hover:bg-amber-500 hover:text-zinc-950 text-white"
            }`}
          >
            {isAdded ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
