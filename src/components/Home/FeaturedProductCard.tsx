import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { Product } from "../../domains/product/product.types";
import { getTranslatedField } from "../../utils/translations";
import { formatPrice } from "../../utils/format";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface FeaturedProductCardProps {
  product: Product;
  isAdded?: boolean;
  onQuickAdd?: (e: React.MouseEvent, prod: Product) => void;
  lang: string;
}

export const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({
  product,
  isAdded: _isAdded,
  onQuickAdd: _onQuickAdd,
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
      className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80 hover:border-amber-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Image container couvrant 100% de la zone supérieure et médiane */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-zinc-900 overflow-hidden">
        <img
          src={coverImage}
          alt={translatedName}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/placeholders/product.svg";
          }}
        />

        {/* Dégradé léger uniquement au bas de la photo pour contraster le titre */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />

        {discountPercent > 0 && (
          <div className="absolute top-2.5 start-2.5 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-sans font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md">
              <Flame className="w-3 h-3 fill-white" />
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Informations produit incrustées en bas de la photo */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 z-20 pointer-events-none">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 truncate drop-shadow-sm">
            {product.category || product.sellerName || "Olmart"}
          </span>
          <h4 className="font-sans font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-md">
            {translatedName}
          </h4>
        </div>
      </div>

      {/* Barre inférieure : Prix uniquement */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-baseline gap-2 bg-zinc-950 border-t border-zinc-800/80 mt-auto">
        <span className="font-sans font-black text-white text-base sm:text-lg tracking-tight tabular-nums drop-shadow-xs">
          {formatPrice(effectivePrice)}
        </span>
        {discountPercent > 0 && (
          <span className="font-sans text-xs text-zinc-400 line-through tabular-nums">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>
    </div>
  );
};
