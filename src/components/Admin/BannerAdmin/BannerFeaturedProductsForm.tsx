import React from "react";
import { useTranslation } from "react-i18next";
import { X, Plus } from "lucide-react";
import { Product } from "../../../domains/product/product.types";

export interface BannerFeaturedProductsFormProps {
  allProducts: Product[];
  bannerFeaturedProducts: string[];
  setBannerFeaturedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  productSearchTerm: string;
  setProductSearchTerm: (v: string) => void;
}

export const BannerFeaturedProductsForm: React.FC<BannerFeaturedProductsFormProps> = ({
  allProducts,
  bannerFeaturedProducts,
  setBannerFeaturedProducts,
  productSearchTerm,
  setProductSearchTerm,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 pt-3 border-t border-zinc-100">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
          {t("Produits Mis en Avant (VIP)")}
        </label>
        <span className="text-xs font-bold text-zinc-400">{t("Seront affichés en premier")}</span>
      </div>

      {/* Selected products visualization */}
      {bannerFeaturedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-orange-50 rounded-2xl border border-orange-100">
          {bannerFeaturedProducts.map((prodId) => {
            const p = allProducts.find((x) => x.id === prodId);
            return p ? (
              <div
                key={prodId}
                className="flex items-center gap-1.5 bg-white border border-orange-200 ps-2 pe-1 py-1 rounded-lg shadow-sm text-xs group animate-fade-in"
              >
                <img loading="lazy" src={p.image} className="w-5 h-5 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                <span className="font-semibold text-zinc-800 max-w-[120px] truncate">{p.name}</span>
                <button
                  type="button"
                  onClick={() => setBannerFeaturedProducts((prev) => prev.filter((id) => id !== prodId))}
                  className="p-0.5 text-zinc-400 hover:text-red-500 bg-zinc-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Add Product Search */}
      <div className="relative">
        <input
          type="text"
          placeholder={t("Rechercher un produit à mettre en avant...") || "Rechercher un produit à mettre en avant..."}
          value={productSearchTerm}
          onChange={(e) => setProductSearchTerm(e.target.value)}
          className="w-full h-10 px-3 rounded-2xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50"
        />
        {productSearchTerm.length > 1 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
            {allProducts
              .filter((p) => !bannerFeaturedProducts.includes(p.id))
              .filter((p) => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setBannerFeaturedProducts((prev) => [...prev, p.id]);
                    setProductSearchTerm("");
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 last:border-b-0"
                >
                  <img loading="lazy" src={p.image} className="w-8 h-8 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{p.name}</p>
                    <p className="text-xs text-zinc-500">
                      {p.price} {t("DA")}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-orange-500 shrink-0" />
                </div>
              ))}
            {allProducts.filter(
              (p) =>
                !bannerFeaturedProducts.includes(p.id) &&
                p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
            ).length === 0 && (
              <div className="p-3 text-center text-xs text-zinc-500 font-bold uppercase">
                {t("Aucun résultat")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
