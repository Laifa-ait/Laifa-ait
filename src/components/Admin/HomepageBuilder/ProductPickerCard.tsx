import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";

interface ProductPickerCardProps {
  product: Product;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ProductPickerCard: React.FC<ProductPickerCardProps> = ({
  product,
  isSelected,
  onToggle,
}) => {
  const { t } = useTranslation();
  const inStock = product.stock === undefined || product.stock > 0;

  return (
    <button
      type="button"
      onClick={() => onToggle(product.id)}
      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
        isSelected
          ? "bg-amber-50/90 border-amber-500 ring-1 ring-amber-500/50"
          : "bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs"
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-zinc-100 shrink-0 overflow-hidden relative">
        {product.images?.[0] ? (
          <img loading="lazy" decoding="async" src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-400">Img</div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
            <Check className="w-4 h-4 text-amber-950 font-bold" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-zinc-900 truncate">{product.name}</p>
        <div className="flex items-center justify-between text-[10px] mt-0.5">
          <span className="font-extrabold text-amber-600">{formatPrice(product.price)} DZD</span>
          {inStock ? (
            <span className="text-emerald-700 font-semibold">{t("En stock")}</span>
          ) : (
            <span className="text-rose-500 font-semibold">{t("Rupture")}</span>
          )}
        </div>
      </div>
    </button>
  );
};
