import React from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
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
    <div className="bg-[#FAF6F0] rounded-[2rem] p-4 sm:p-5 border border-[#EAE3D5] shadow-sm space-y-5">
      {hasColors && (
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
            {t("product.details.nuances") || "Couleurs"}
          </h4>
          <div className="flex flex-wrap gap-2.5">
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
                colorHex.toLowerCase() === "#facc15";

              return (
                <button
                  key={c}
                  type="button"
                  disabled={isColorOutOfStock(c) && selectedColor !== c}
                  onClick={() => onSelectColor(c)}
                  className={`flex items-center justify-center p-0.5 rounded-full border-2 transition-all shadow-sm cursor-pointer ${
                    selectedColor === c
                      ? "border-[#008BB5] scale-110"
                      : "border-transparent hover:border-stone-300"
                  } ${isColorOutOfStock(c) ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
                    style={{ background: colorHex }}
                  >
                    {selectedColor === c && (
                      <Check className={`w-3.5 h-3.5 ${isWhiteOrLight ? "text-black" : "text-white"}`} />
                    )}
                    {isColorOutOfStock(c) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1.5px] bg-black rotate-45" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasSizes && (
        <div className="space-y-2.5 pt-4 border-t border-[#EAE3D5]">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              {t("product.details.sizes") || "Tailles"}
            </h4>
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="text-[9px] font-bold uppercase tracking-wider text-[#008BB5] hover:underline transition-all cursor-pointer"
            >
              {t("product.details.size_guide") || "Guide des tailles"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes!.map((s: string) => (
              <button
                key={s}
                type="button"
                disabled={isSizeOutOfStock(s) && selectedSize !== s}
                onClick={() => onSelectSize(s)}
                className={`px-4 py-2 rounded-xl font-sans font-bold text-[10px] uppercase tracking-wider transition-all border cursor-pointer ${
                  selectedSize === s
                    ? "bg-[#008BB5] text-white border-[#008BB5] shadow-md"
                    : "bg-white border-stone-200 text-stone-700 hover:border-[#008BB5]"
                } ${isSizeOutOfStock(s) ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
