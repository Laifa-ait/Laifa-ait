import React from "react";
import { Eye, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";

interface CategoryVitrinePreviewProps {
  catTitle: string;
  selectedCategory: string;
  catImage: string;
  featuredProducts: Product[];
}

export const CategoryVitrinePreview: React.FC<CategoryVitrinePreviewProps> = ({
  catTitle,
  selectedCategory,
  catImage,
  featuredProducts,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
        <Eye className="w-3.5 h-3.5 text-amber-500" />
        <span>{t("Aperçu en Direct du Cadre Vitrine Rayon")}</span>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden bg-zinc-900 relative shrink-0">
          <img
            src={catImage || "/images/placeholders/product.svg"}
            alt={catTitle || selectedCategory}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/placeholders/product.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2.5">
            <span className="text-[9px] font-bold text-amber-400 uppercase">RAYON</span>
            <h4 className="text-xs font-bold text-white truncate">{catTitle || selectedCategory}</h4>
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((idx) => {
            const prod = featuredProducts[idx];
            return (
              <div
                key={idx}
                className="p-1.5 rounded-xl border border-zinc-200 bg-white shadow-2xs flex flex-col items-center text-center space-y-1"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center">
                  {prod?.images?.[0] ? (
                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-zinc-300" />
                  )}
                </div>
                <span className="text-[9px] font-bold text-zinc-800 line-clamp-1">
                  {prod ? prod.name : `Slot ${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
