import React from "react";
import { ShoppingBag, Heart, Share2, ShieldCheck, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useComparatorStore } from "../../../store/useComparatorStore";
import { Product } from "../../../domains/product/product.types";

interface BuyBoxProps {
  product: Product;
  isCurrentSelectionOutOfStock: boolean;
  onAddToCart: () => void;
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
  const { products: comparedProducts, addProduct: addToCompare, removeProduct: removeFromCompare } = useComparatorStore();
  const isCompared = comparedProducts.some(p => p.id === product.id);

  return (
    <div
      ref={stickyRef}
      className={`z-40 ${isSticky ? "fixed bottom-0 left-0 right-0 p-3 sm:p-5 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-10px_30px_rgba(40,30,20,0.08)] animate-in slide-in-from-bottom-12 duration-300" : "relative"}`}
    >
      <div className={`flex gap-2 sm:gap-3.5 max-w-7xl mx-auto ${isSticky ? "justify-center" : ""}`}>
        <button
          disabled={isCurrentSelectionOutOfStock}
          onClick={onAddToCart}
          className={`flex-1 sm:flex-[3] py-3.5 sm:py-4.5 rounded-full flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 group border border-transparent shadow-md hover:shadow-lg ${
            isCurrentSelectionOutOfStock
              ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : "bg-[#008BB5] text-white hover:bg-[#007CA7] active:scale-95"
          }`}
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          <span className="font-sans font-bold uppercase tracking-wider text-[11px] sm:text-xs whitespace-nowrap">
            {isCurrentSelectionOutOfStock ? t("out_of_stock") || "En rupture" : t("add_to_cart") || "Ajouter au Panier"}
          </span>
        </button>

        <button
          onClick={onToggleWishlist}
          className={`w-12 sm:w-14 h-12 sm:h-auto rounded-full border transition-all flex items-center justify-center shrink-0 shadow-sm active:scale-90 ${
            wishlist.includes(product.id)
              ? "border-[#D81159] bg-[#FFEAEF] text-[#D81159]"
              : "border-stone-200 bg-white text-stone-600 hover:text-[#D81159] hover:border-[#D81159]"
          }`}
          aria-label={t("Add to wishlist") || "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlist.includes(product.id) ? "fill-[#D81159]" : ""}`} />
        </button>
        
        <button
          onClick={() => {
            if (isCompared) {
              removeFromCompare(product.id);
            } else {
              addToCompare(product);
            }
          }}
          className={`w-12 sm:w-14 h-12 sm:h-auto rounded-full border transition-all flex items-center justify-center shrink-0 shadow-sm active:scale-90 ${
            isCompared
              ? "border-[#008BB5] bg-[#E5F6FA] text-[#008BB5]"
              : "border-stone-200 bg-white text-stone-600 hover:text-[#008BB5] hover:border-[#008BB5]"
          }`}
          aria-label={t("Comparer") || "Comparer"}
        >
          <Scale className={`w-4 h-4 sm:w-5 sm:h-5 ${isCompared ? "stroke-[2.5]" : ""}`} />
        </button>

        <button
          onClick={onShare}
          className={`w-12 sm:w-14 h-12 sm:h-auto rounded-full bg-white border border-stone-200 text-stone-600 flex items-center justify-center hover:text-black hover:border-black shadow-sm active:scale-90 transition-all ${
            isSticky ? "hidden sm:flex" : "flex"
          }`}
          aria-label={t("Share product") || "Share product"}
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {isSticky && (
        <div className="hidden sm:flex max-w-7xl mx-auto mt-2.5 items-center justify-center gap-1.5 text-[10px] rtl:text-[12px] font-bold text-stone-500 uppercase tracking-widest rtl:tracking-normal">
          <ShieldCheck className="w-3.5 h-3.5 text-[#008BB5]" /> {t("secured_cash_on_delivery") || "Paiement à la livraison sécurisé"}
        </div>
      )}
    </div>
  );
};
