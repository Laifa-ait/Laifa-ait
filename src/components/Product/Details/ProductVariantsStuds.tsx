import React from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight } from "lucide-react";
import { Product } from "../../../domains/product/product.types";
import { PRODUCT_COLORS } from "../../../constants";

export interface ProductVariantsStudsProps {
  product: Product;
  selectedColor: string | null;
  selectedSize: string | null;
  onSelectColor: (c: string) => void;
  onSelectSize: (s: string) => void;
  isColorOutOfStock: (c: string) => boolean;
  isSizeOutOfStock: (s: string) => boolean;
  onOpenSizeGuide: () => void;
}

export const ProductVariantsStuds: React.FC<ProductVariantsStudsProps> = ({
  product,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  isColorOutOfStock,
  isSizeOutOfStock,
  onOpenSizeGuide,
}) => {
  const { t } = useTranslation();

  const hasColors = Boolean(product.colors && product.colors.length > 0);
  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);

  if (!hasColors && !hasSizes) return null;

  return (
    <div className="space-y-4 pt-1">
      {/* Colors Section */}
      {hasColors && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
            <span>{t("product.details.nuances") || "Couleur"} :</span>
            <span className="font-semibold text-zinc-700 capitalize">
              {selectedColor || product.colors![0]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {product.colors!.map((c: string) => {
              const matchingColor = PRODUCT_COLORS.find(
                (pc) => pc.name.toLowerCase().trim() === c.toLowerCase().trim()
              );
              const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(c);
              const isRgb = /^rgb/i.test(c);
              const colorHex = matchingColor ? matchingColor.hex : isHex || isRgb ? c : "#FFFFFF";
              const isWhiteOrLight =
                colorHex.toLowerCase() === "#ffffff" ||
                colorHex.toLowerCase() === "#fde68a" ||
                colorHex.toLowerCase() === "#facc15" ||
                colorHex.toLowerCase() === "#f3ccde";
              const isSelected = selectedColor === c;
              const outOfStock = isColorOutOfStock(c);

              return (
                <button
                  key={c}
                  type="button"
                  disabled={outOfStock && !isSelected}
                  onClick={() => onSelectColor(c)}
                  className={`w-9 h-9 rounded-full p-0.5 transition-all cursor-pointer flex items-center justify-center border-none bg-transparent ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-emerald-600 scale-105"
                      : "hover:scale-105"
                  } ${outOfStock ? "opacity-35 cursor-not-allowed" : ""}`}
                  aria-label={`Couleur ${c}`}
                >
                  <div
                    className="w-full h-full rounded-full border border-black/10 flex items-center justify-center relative shadow-xs"
                    style={{ backgroundColor: colorHex }}
                  >
                    {isSelected && (
                      <Check className={`w-4 h-4 stroke-[3] ${isWhiteOrLight ? "text-zinc-950" : "text-white"}`} />
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1.5px] bg-zinc-950 rotate-45" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes Section */}
      {hasSizes && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-zinc-900">
              {t("product.details.sizes") || "Taille"}
            </span>
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="text-xs font-semibold text-zinc-500 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span>{t("product.details.size_guide") || "Guide des tailles"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.sizes!.map((s: string) => {
              const isSelected = selectedSize === s;
              const outOfStock = isSizeOutOfStock(s);

              return (
                <button
                  key={s}
                  type="button"
                  disabled={outOfStock && !isSelected}
                  onClick={() => onSelectSize(s)}
                  className={`min-w-[50px] h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300"
                  } ${outOfStock ? "opacity-35 cursor-not-allowed bg-zinc-50" : ""}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
