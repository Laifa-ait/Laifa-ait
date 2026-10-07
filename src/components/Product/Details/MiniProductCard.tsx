import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";
import { getOptimizedImageUrl } from "../../../utils/imageUtils";
import { useCart } from "../../../context/CartContext";

interface MiniProductCardProps {
  product: Product;
  currentLang?: string;
}

export const MiniProductCard: React.FC<MiniProductCardProps> = ({
  product,
  currentLang = "fr",
}) => {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const isWishlisted = wishlist.includes(product.id);

  const currentPrice = Number(product.promoPrice || product.price) || 0;
  const originalPrice = product.promoPrice && product.price && product.price > product.promoPrice ? product.price : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;
  const title = product.translations?.[currentLang]?.name || product.name;
  const brandOrCategory = product.brand || product.subcategory || product.category || "";
  const imageUrl = product.images?.[0] || "/placeholder.png";

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, { quantity: 1 });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:border-emerald-500/40 transition-all duration-300 w-full select-none"
    >
      {/* Visual Image Stage - 3:4 portrait fashion ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <img
          src={getOptimizedImageUrl(imageUrl, 500)}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Minimalist Discount Tag */}
        {discountPercent && discountPercent > 0 ? (
          <span className="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white shadow-xs">
            -{discountPercent}%
          </span>
        ) : null}

        {/* Floating Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2.5 end-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border ${
            isWishlisted
              ? "bg-rose-50 border-rose-200 text-rose-600"
              : "bg-white/85 hover:bg-white border-white/80 text-zinc-500 hover:text-rose-600 shadow-xs"
          }`}
          aria-label="Ajouter aux favoris"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-600" : ""}`} />
        </button>

        {/* Quick Add To Cart Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="absolute bottom-2.5 end-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-emerald-600 hover:text-white text-zinc-700 backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-white/80 active:scale-95 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Ajouter au panier"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Meta Section - Seamless without dividing border */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-1">
        {brandOrCategory ? (
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider truncate">
            {brandOrCategory}
          </span>
        ) : null}

        <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-snug">
          {title}
        </h3>

        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
            {formatPrice(currentPrice)}
          </span>
          {originalPrice ? (
            <span className="text-[10px] text-zinc-400 line-through tabular-nums font-medium">
              {formatPrice(originalPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
