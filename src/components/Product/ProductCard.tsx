import React from "react";
import { Heart, Zap, Flame, Scale, Star, Truck } from "lucide-react";
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
    const { wishlist, toggleWishlist } = useCart();
    const navigate = useNavigate();
    const lang = i18n.language;
    const isProductFlashActive = isFlashSaleProp || false;
    
    const { products: comparedProducts, addProduct: addToCompare, removeProduct: removeFromCompare } = useComparatorStore();
    const isCompared = comparedProducts.some(p => p.id === product.id);

    const defaultClick = (prod: Product) => {
      if (onClick) {
        onClick(prod);
      } else {
        navigate(`/product/${prod.id}`);
      }
    };

    const getSpelledCorrectly = (str: string) => {
      return str.replace(/CHASSURE/gi, "Chaussure").replace(/Chassure/gi, "Chaussure");
    };

    const currentPrice = isProductFlashActive
      ? (product.flashPrice || 0)
      : (product.promoPrice || product.price || 0);

    const hasDiscount = (product.promoPrice && product.promoPrice < (product.price || 0)) ||
      (isProductFlashActive && product.flashPrice && product.flashPrice < (product.price || 0)) ||
      (product.originalPrice && product.originalPrice > currentPrice);

    const originalPrice = product.originalPrice || product.price || 0;
    const discountPercent = hasDiscount && originalPrice > 0
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    const isPremium = variant === "premium_immersive";

    return (
      <div
        className={`group flex flex-col bg-white overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer h-full ${
          isPremium 
            ? "border-amber-200/80 shadow-[0_2px_12px_rgba(245,158,11,0.06)]" 
            : "border-slate-200/70 shadow-sm"
        } ${sectionStyle || ""}`}
        onClick={() => defaultClick(product)}
      >
        {/* Product Image Container (Standard International 1:1 Aspect Ratio) */}
        <div className="relative aspect-square w-full bg-slate-50/80 overflow-hidden">
          <ProductImage
            src={getOptimizedImageUrl(product.image, 400)}
            alt={getSpelledCorrectly(getTranslatedField(product, "name", lang))}
            className="w-full h-full object-cover sm:object-contain p-0 sm:p-2 transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-20 pointer-events-none">
            {isPremium && (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-sans font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                PREMIUM
              </span>
            )}
            {product.isSponsored && (
              <span className="flex items-center gap-0.5 bg-slate-900/85 backdrop-blur-md text-white font-sans font-bold text-[8px] sm:text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                <Zap className="w-2.5 h-2.5" /> {t("SPONSORISÉ")}
              </span>
            )}
            {hasDiscount && discountPercent > 0 && (
              <span className="flex items-center gap-0.5 bg-rose-600 text-white font-sans font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                <Flame className="w-2.5 h-2.5 fill-current" />
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Action Buttons (Heart & Compare) */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5">
            <button
              aria-label={wishlist.includes(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm pointer-events-auto border border-slate-200/60"
            >
              <Heart
                className={`w-3.5 h-3.5 ${wishlist.includes(product.id) ? "fill-rose-500 text-rose-500" : "stroke-[2]"}`}
              />
            </button>
            <button
              aria-label={isCompared ? "Retirer du comparateur" : "Ajouter au comparateur"}
              onClick={(e) => {
                e.stopPropagation();
                if (isCompared) {
                  removeFromCompare(product.id);
                } else {
                  addToCompare(product);
                }
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all pointer-events-auto border ${
                isCompared 
                  ? "bg-amber-500 text-white border-transparent" 
                  : "bg-white/90 text-slate-500 hover:text-amber-600 hover:bg-white border-slate-200/60"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Section (Optimized padding and visual hierarchy) */}
        <div className="p-2.5 sm:p-3 flex flex-col flex-1 bg-white justify-between">
          <div>
            {/* Category / Store subtitle */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate uppercase tracking-wider">
                {product.category || product.sellerName || "Olmart"}
              </span>
              {Number(product.rating || 0) > 0 && (
                <div className="flex items-center gap-0.5 text-amber-500 text-[10px] sm:text-[11px] font-bold shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Product Title */}
            <h3 className="font-sans font-medium text-slate-800 text-[12px] sm:text-[13px] leading-snug line-clamp-2 mb-1.5 group-hover:text-amber-800 transition-colors">
              {getSpelledCorrectly(getTranslatedField(product, "name", lang))}
            </h3>
          </div>

          {/* Price & Delivery Information */}
          <div className="mt-1 pt-1.5 border-t border-slate-100/80 flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-sans font-bold text-slate-900 text-[14px] sm:text-[16px] tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="font-sans text-[11px] text-slate-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Fast Delivery mini indicator */}
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-700 font-medium">
              <Truck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              <span className="truncate">Livraison 58 Wilayas</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);


