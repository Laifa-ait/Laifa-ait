import React, { useState } from "react";
import { ShoppingBag, Minus, Plus, Heart, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";
import { useUI } from "../../../context/UIContext";

interface BuyBoxProps {
  product: Product;
  isCurrentSelectionOutOfStock: boolean;
  onAddToCart: (quantity?: number) => void;
  onToggleWishlist: () => void;
  wishlist: string[];
  onShare: () => void;
  stickyRef?: React.Ref<HTMLDivElement>;
  isSticky?: boolean;
}

export const ProductBuyBox: React.FC<BuyBoxProps> = ({
  product,
  isCurrentSelectionOutOfStock,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onShare,
  stickyRef,
  isSticky,
}) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const { setIsStickyBuyBarVisible } = useUI();

  React.useEffect(() => {
    setIsStickyBuyBarVisible(!!isSticky);
    return () => {
      setIsStickyBuyBarVisible(false);
    };
  }, [isSticky, setIsStickyBuyBarVisible]);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    const maxStock = product.stock || 99;
    setQuantity((prev) => Math.min(maxStock, prev + 1));
  };

  return (
    <div
      ref={stickyRef}
      className={`z-40 ${
        isSticky
          ? "fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] animate-in slide-in-from-bottom-8 duration-200"
          : "relative pt-2"
      }`}
      style={isSticky ? { paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" } : undefined}
    >
      <div className={`flex items-center gap-2.5 sm:gap-3.5 max-w-7xl mx-auto ${isSticky ? "justify-center" : ""}`}>
        {/* Quantity Stepper: [-] 1 [+] like in the Zara mockup */}
        <div className="h-13 sm:h-14 px-2 sm:px-3 bg-zinc-100 rounded-2xl flex items-center justify-between gap-2 border border-zinc-200/70 shrink-0">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            aria-label="Diminuer la quantité"
            className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition-colors disabled:opacity-40 cursor-pointer border-none shadow-2xs"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center font-bold text-sm text-zinc-950 tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            aria-label="Augmenter la quantité"
            className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer border-none shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Prominent "Ajouter au panier" Button */}
        <button
          type="button"
          disabled={isCurrentSelectionOutOfStock}
          onClick={() => onAddToCart(quantity)}
          className={`flex-1 h-13 sm:h-14 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer border-none active:scale-98 ${
            isCurrentSelectionOutOfStock
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
          }`}
        >
          <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          <span className="font-sans font-bold text-sm tracking-wide whitespace-nowrap">
            {isCurrentSelectionOutOfStock
              ? t("out_of_stock") || "En rupture"
              : t("add_to_cart") || "Ajouter au panier"}
          </span>
        </button>

        {/* Desktop-only wishlist / share when not sticky */}
        {!isSticky && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`w-13 h-13 sm:h-14 rounded-2xl border transition-all flex items-center justify-center shadow-2xs active:scale-95 cursor-pointer ${
                wishlist.includes(product.id)
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
              aria-label="Ajouter aux favoris"
            >
              <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-rose-600 text-rose-600" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onShare}
              className="w-13 h-13 sm:h-14 rounded-2xl bg-white border border-zinc-200 text-zinc-600 flex items-center justify-center hover:text-zinc-950 hover:border-zinc-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
              aria-label="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
