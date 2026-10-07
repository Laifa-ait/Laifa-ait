import React, { useState } from "react";
import { Heart, Star, ShoppingBag, Check, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { formatPrice } from "../../utils/format";
import { getTranslatedField } from "../../utils/translations";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { useCart } from "../../context/CartContext";

interface CollectionProductCardProps {
  product: Product;
  index?: number;
}

export const CollectionProductCard: React.FC<CollectionProductCardProps> = React.memo(({ product }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const lang = i18n.language;

  const isFavorite = wishlist.includes(product.id);
  const currentPrice = product.promoPrice || product.price || 0;
  const originalPrice = product.originalPrice || product.price || 0;
  const hasDiscount = Boolean(product.promoPrice && product.promoPrice < (product.price || 0));
  const discountPercent =
    hasDiscount && originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const savingsAmount = hasDiscount && originalPrice > currentPrice ? originalPrice - currentPrice : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article
      onClick={() => navigate(`/product/${product.id}`)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full relative"
    >
      {/* Product Image Stage: object-contain with gentle warm backdrop to never crop */}
      <div className="relative aspect-square w-full p-3 sm:p-4 flex items-center justify-center bg-gradient-to-b from-slate-50/90 via-white to-slate-100/50 select-none overflow-hidden border-b border-slate-100">
        <img
          src={getOptimizedImageUrl(product.image, 600) || "/images/placeholders/product.svg"}
          alt={getTranslatedField(product, "name", lang)}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/placeholders/product.svg";
          }}
        />

        {/* Vibrant Eyecatching Badges */}
        <div className="absolute top-2.5 start-2.5 z-10 flex flex-col items-start gap-1">
          {hasDiscount && discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs">
              −{discountPercent}%
            </span>
          )}
          {product.freeShipping && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <Truck className="w-2.5 h-2.5 text-emerald-600" />
              <span>Gratuit</span>
            </span>
          )}
          {product.isSponsored && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-900/85 backdrop-blur-xs text-amber-300 border border-white/10 shadow-2xs">
              Sponsorisé
            </span>
          )}
        </div>

        {/* Wishlist Button with Lively Rose Accent */}
        <button
          type="button"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer border ${
            isFavorite
              ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm scale-105"
              : "bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border-slate-200/60 shadow-2xs"
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      {/* Product Information Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 bg-white">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider truncate">
              {product.category || product.sellerName || "Olmart Marketplace"}
            </span>
            {Number(product.rating || 0) > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{Number(product.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
            {getTranslatedField(product, "name", lang)}
          </h3>

          {/* Savings Highlight if any */}
          {savingsAmount > 0 && (
            <p className="text-[10px] font-bold text-emerald-700 mt-1">
              Économisez {formatPrice(savingsAmount)}
            </p>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-black text-slate-950 tracking-tight tabular-nums">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Quick Add to Cart Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
              justAdded
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-emerald-600 text-white hover:shadow-emerald-600/20"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{t("added_to_cart", "Ajouté au panier !")}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t("quick_add_btn", "Ajouter au panier")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

CollectionProductCard.displayName = "CollectionProductCard";
