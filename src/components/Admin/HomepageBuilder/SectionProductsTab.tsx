import React, { useState } from "react";
import { Search, X, Check, PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";

interface SectionProductsTabProps {
  secCategory: string;
  setSecCategory: (val: string) => void;
  secLimit: number;
  setSecLimit: (val: number) => void;
  secManualLinks: string[];
  setSecManualLinks: (val: string[]) => void;
  allProducts: Product[];
}

export const SectionProductsTab: React.FC<SectionProductsTabProps> = ({
  secCategory,
  setSecCategory,
  secLimit,
  setSecLimit,
  secManualLinks,
  setSecManualLinks,
  allProducts,
}) => {
  const { t } = useTranslation();
  const [productSearch, setProductSearch] = useState("");

  const activeSelectedIds = secManualLinks.filter((id) => Boolean(id && id.trim()));

  const selectedProducts = allProducts.filter((p) => activeSelectedIds.includes(p.id));

  const availableFiltered = allProducts
    .filter((p) => {
      const q = productSearch.toLowerCase();
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchCat = secCategory ? p.category === secCategory : true;
      return matchName && matchCat;
    })
    .slice(0, 30);

  const padTo18 = (arr: string[]): string[] => {
    const result = [...arr];
    for (let i = result.length; i < 18; i++) {
      result.push("");
    }
    return result.slice(0, 18);
  };

  const handleToggleProduct = (productId: string) => {
    if (activeSelectedIds.includes(productId)) {
      const newLinks = secManualLinks.filter((id) => id !== productId);
      setSecManualLinks(padTo18(newLinks));
    } else {
      const firstEmptyIndex = secManualLinks.findIndex((id) => !id || !id.trim());
      if (firstEmptyIndex !== -1) {
        const next = [...secManualLinks];
        next[firstEmptyIndex] = productId;
        setSecManualLinks(next);
      } else {
        setSecManualLinks([...secManualLinks, productId]);
      }
    }
  };

  const handleRemoveSelected = (productId: string) => {
    const next = secManualLinks.filter((id) => id !== productId);
    setSecManualLinks(padTo18(next));
  };

  const categoriesList = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)));

  return (
    <div className="space-y-5" id="section-products-tab">
      {/* Category filter & limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("Filtrer par Catégorie Principale")}
          </label>
          <select
            value={secCategory}
            onChange={(e) => setSecCategory(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="">{t("Toutes les catégories (Multi-rayons)")}</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("Nombre max de produits à afficher")} ({secLimit || 8})
          </label>
          <input
            type="range"
            min={4}
            max={24}
            step={2}
            value={secLimit || 8}
            onChange={(e) => setSecLimit(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>4</span>
            <span>8</span>
            <span>12</span>
            <span>16</span>
            <span>24</span>
          </div>
        </div>
      </div>

      {/* Selected Products Strip */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900">
              {t("Produits Sélectionnés Manuellement")} ({selectedProducts.length})
            </h4>
          </div>
          {selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setSecManualLinks(Array(18).fill(""))}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              {t("Tout désélectionner")}
            </button>
          )}
        </div>

        {selectedProducts.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            {t("Aucun produit manuel sélectionné. Les produits seront sélectionnés automatiquement selon la catégorie et le type.")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-medium text-slate-800 group"
              >
                {p.images && p.images[0] && (
                  <img loading="lazy" decoding="async" src={p.images[0]}
                    alt={p.name}
                    className="w-5 h-5 object-cover rounded-md"
                  />
                )}
                <span className="max-w-[120px] truncate">{p.name}</span>
                <span className="text-[10px] font-bold text-amber-600">
                  {formatPrice(p.price)} DZD
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSelected(p.id)}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Picker Search & Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">
            {t("Ajouter des produits au catalogue de cette section")}
          </label>
          <span className="text-[11px] text-slate-500">
            {availableFiltered.length} {t("produits trouvés")}
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={t("Rechercher un produit par nom...")}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="max-h-56 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-1">
          {availableFiltered.map((p) => {
            const isSelected = activeSelectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleToggleProduct(p.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-50/80 border-amber-500 ring-1 ring-amber-500"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 overflow-hidden relative">
                  {p.images && p.images[0] ? (
                    <img loading="lazy" decoding="async" src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                      Img
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-amber-950 font-bold" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {formatPrice(p.price)} DZD
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
