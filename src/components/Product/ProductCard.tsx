import React, { useState } from "react";
import { Heart, Zap, Flame, Scale, Star, Truck, ShoppingBag, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useComparatorStore } from "../../store/useComparatorStore";
import { Product } from "../../domains/product/product.types";
import { formatPrice } from "../../utils/format";
import { getTranslatedField } from "../../utils/translations";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: (product: Product) => void;
  isFeatured?: boolean;
  variant?: "default" | "premium_immersive" | "flash_sale";
  sectionStyle?: string;
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
    isFlashSale: isFlashSaleProp,
  }: ProductCardProps) => {
    const { t, i18n } = useTranslation();
    const { wishlist, toggleWishlist, addToCart } = useCart();
    const navigate = useNavigate();
    const lang = i18n.language;
    const isProductFlashActive = isFlashSaleProp || false;
    const [justAdded, setJustAdded] = useState(false);

    const {
      products: comparedProducts,
      addProduct: addToCompare,
      removeProduct: removeFromCompare,
    } = useComparatorStore();
    const isCompared = comparedProducts.some((p) => p.id === product.id);

    const defaultClick = (prod: Product) => {
      if (onClick) {
        onClick(prod);
      } else {
        navigate(`/product/${prod.id}`);
      }
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
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

    const isPremium = variant === "premium_immersive";

    return (
      <div
        className={`group flex flex-col bg-white overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full relative ${
          isPremium
            ? "border-amber-300 shadow-[0_4px_24px_rgba(245,158,11,0.12)]"
            : "border-zinc-200/80 hover:border-amber-400/80 shadow-2xs"
        } ${sectionStyle || ""}`}
        onClick={() => defaultClick(product)}
      >
        {/* Product Image */}
        <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden flex items-center justify-center p-2.5 sm:p-3">
          <ProductImage
            src={getOptimizedImageUrl(product.image, 400)}
            alt={getTranslatedField(product, "name", lang)}
            className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-108"
          />

          {/* Badges */}
          <div className="absolute top-2.5 start-2.5 flex flex-col items-start gap-1 z-20 pointer-events-none">
            {isPremium && (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-sans font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                PREMIUM
              </span>
            )}
            {product.isSponsored && (
              <span className="flex items-center gap-1 bg-zinc-950/90 backdrop-blur-md text-white font-sans font-bold text-[8px] sm:text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> {t("SPONSORISÉ")}
              </span>
            )}
            {hasDiscount && discountPercent > 0 && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-sans font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                <Flame className="w-2.5 h-2.5 fill-white text-white" />
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Floating Actions */}
          <div className="absolute top-2.5 end-2.5 z-20 flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              aria-label={wishlist.includes(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-zinc-500 hover:text-rose-500 hover:bg-white hover:scale-110 active:scale-90 transition-all shadow-sm pointer-events-auto border border-zinc-200/60"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlist.includes(product.id) ? "fill-rose-500 text-rose-500" : "stroke-[2]"
                }`}
              />
            </button>
            <button
              type="button"
              aria-label={isCompared ? "Retirer du comparateur" : "Ajouter au comparateur"}
              onClick={(e) => {
                e.stopPropagation();
                if (isCompared) {
                  removeFromCompare(product.id);
                } else {
                  addToCompare(product);
                }
              }}
              className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all pointer-events-auto border ${
                isCompared
                  ? "bg-amber-500 text-white border-transparent"
                  : "bg-white/95 text-zinc-500 hover:text-amber-600 hover:bg-white border-zinc-200/60"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 bg-white justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 truncate uppercase tracking-wider">
                {product.category || product.sellerName || "Olmart"}
              </span>
              {Number(product.rating || 0) > 0 && (
                <div className="flex items-center gap-0.5 text-amber-500 text-[10px] sm:text-[11px] font-bold shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                </div>
              )}
            </div>

            <h3 className="font-sans font-semibold text-zinc-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-amber-800 transition-colors">
              {getTranslatedField(product, "name", lang)}
            </h3>
          </div>

          <div className="mt-1 pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-sans font-black text-zinc-950 text-sm sm:text-base tracking-tight tabular-nums">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="font-sans text-[11px] text-zinc-400 line-through tabular-nums">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-700 font-semibold mt-0.5">
                <Truck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">Livraison 58/69 Wilayas</span>
              </div>
            </div>

            <button
              type="button"
              aria-label={t("add_to_cart", "Ajouter au panier")}
              onClick={handleQuickAdd}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs active:scale-90 transition-all duration-200 cursor-pointer border-none ${
                justAdded
                  ? "bg-emerald-600 text-white scale-105"
                  : "bg-zinc-950 hover:bg-amber-500 hover:text-zinc-950 text-white hover:shadow-md"
              }`}
            >
              {justAdded ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ShoppingBag className="w-4 h-4 stroke-[2]" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);
