import React from "react";
import { Star, Globe } from "lucide-react";
import { Product } from "../../../domains/product/product.types";
import { Shop } from "../../../domains/seller/shop.types";
import { formatPrice } from "../../../utils/format";

export interface ProductHeaderBentoProps {
  product: Product;
  shop?: Shop | null;
  currentPrice: number;
  bilingualMode: boolean;
  onToggleBilingualMode: () => void;
  currentLang: string;
}

export const ProductHeaderBento: React.FC<ProductHeaderBentoProps> = ({
  product,
  shop,
  currentPrice,
  bilingualMode,
  onToggleBilingualMode,
  currentLang,
}) => {
  const productName = product.translations?.[currentLang]?.name || product.name;
  const brandName = product.brand || shop?.shopName || "";

  // Real discount calculation only if real previous price exists
  const originalPrice = product.price && product.price > currentPrice ? product.price : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;

  const hasReviews = Boolean(product.stats?.reviewCount && product.stats.reviewCount > 0);

  return (
    <div className="space-y-2.5 pt-1">
      {/* Top Line: Badges on Left, Brand Alone on Right (Zara Style) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {discountPercent && discountPercent > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/60">
              -{discountPercent}%
            </span>
          ) : null}
          {product.onSale ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
              ⚡ Promo
            </span>
          ) : null}
          {product.condition && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
              {product.condition}
            </span>
          )}
        </div>

        {/* Brand Name Alone on Right */}
        {brandName ? (
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-900">
            {brandName}
          </span>
        ) : <div />}
      </div>

      {/* Main Product Title */}
      <div>
        {bilingualMode ? (
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              {product.translations?.["ar"]?.name || product.name}
            </h1>
            <h2 className="text-sm font-medium text-zinc-500 leading-snug border-t border-zinc-100 pt-1">
              {product.translations?.["fr"]?.name || product.name}
            </h2>
          </div>
        ) : (
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            {productName}
          </h1>
        )}

        {/* Category Subtitle + Discrete Bilingual Switcher */}
        <div className="flex items-center justify-between gap-2 mt-1">
          {product.category && (
            <p className="text-xs sm:text-sm font-medium text-zinc-500">
              {product.category} {product.subcategory ? `• ${product.subcategory}` : ""}
            </p>
          )}
          <button
            type="button"
            onClick={onToggleBilingualMode}
            className={`px-2 py-0.5 text-[10px] font-semibold transition-all rounded-full cursor-pointer flex items-center gap-1 border shrink-0 ${
              bilingualMode
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800"
            }`}
            aria-label="Mode bilingue"
          >
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>{bilingualMode ? "AR / FR" : "Bilingue"}</span>
          </button>
        </div>
      </div>

      {/* Star Rating Row (Only shown if real reviews exist) */}
      {hasReviews && (
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i <= Math.round(Number(product.stats?.averageRating || 0))
                    ? "fill-amber-500 text-amber-500"
                    : "fill-zinc-200 text-zinc-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-zinc-900">
            {Number(product.stats?.averageRating || 0).toFixed(1)}
          </span>
          <span className="text-xs font-medium text-zinc-400">
            ({product.stats?.reviewCount} avis)
          </span>
        </div>
      )}

      {/* Price Row with Old Price and Discount Pill on Right (Zara Style) */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums tracking-tight">
            {formatPrice(currentPrice)}
          </span>
          {originalPrice && (
            <span className="text-sm sm:text-base text-zinc-400 line-through tabular-nums font-semibold">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {discountPercent && discountPercent > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/60">
            -{discountPercent}%
          </span>
        )}
      </div>
    </div>
  );
};
