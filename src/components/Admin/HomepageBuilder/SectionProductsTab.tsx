import React, { useState, useMemo } from "react";
import { Search, X, PackageCheck, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";
import { filterAndRankProducts, ProductSearchFilters } from "../../../utils/productSearchRelevance";
import { ProductPickerCard } from "./ProductPickerCard";

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
  const [sortBy, setSortBy] = useState<ProductSearchFilters["sortBy"]>("relevance");
  const [onlyInStock, setOnlyInStock] = useState(false);

  const activeSelectedIds = secManualLinks.filter((id) => Boolean(id && id.trim()));
  const selectedProducts = allProducts.filter((p) => activeSelectedIds.includes(p.id));

  const availableFiltered = useMemo(() => {
    return filterAndRankProducts(allProducts, {
      query: productSearch,
      category: secCategory,
      sortBy,
      onlyInStock,
    }).slice(0, 40);
  }, [allProducts, productSearch, secCategory, sortBy, onlyInStock]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      if (p.category) map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return map;
  }, [allProducts]);

  const padTo18 = (arr: string[]): string[] => {
    const result = [...arr];
    for (let i = result.length; i < 18; i++) result.push("");
    return result.slice(0, 18);
  };

  const handleToggleProduct = (productId: string) => {
    if (activeSelectedIds.includes(productId)) {
      setSecManualLinks(padTo18(secManualLinks.filter((id) => id !== productId)));
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

  return (
    <div className="space-y-4" id="section-products-tab">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            {t("Filtrer par Catégorie Principale")}
          </label>
          <select
            value={secCategory}
            onChange={(e) => setSecCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="">{t("Toutes les catégories")} ({allProducts.length})</option>
            {Array.from(categoryCounts.entries()).map(([cat, count]) => (
              <option key={cat} value={cat}>{cat} ({count})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            {t("Nombre max de produits à afficher")} ({secLimit || 8})
          </label>
          <input
            type="range"
            min={4}
            max={24}
            step={2}
            value={secLimit || 8}
            onChange={(e) => setSecLimit(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5 font-mono">
            <span>4</span><span>8</span><span>12</span><span>16</span><span>24</span>
          </div>
        </div>
      </div>

      {/* Selected Products Strip */}
      <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-zinc-900">
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
          <p className="text-xs text-zinc-500 italic">
            {t("Aucun produit manuel sélectionné. La section utilisera automatiquement le catalogue selon la catégorie.")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-zinc-200 shadow-2xs text-xs text-zinc-800"
              >
                {p.images?.[0] && (
                  <img loading="lazy" decoding="async" src={p.images[0]} alt={p.name} className="w-4 h-4 object-cover rounded" />
                )}
                <span className="max-w-[110px] truncate text-[11px] font-medium">{p.name}</span>
                <span className="text-[10px] font-bold text-amber-600">{formatPrice(p.price)} DZD</span>
                <button
                  type="button"
                  onClick={() => setSecManualLinks(padTo18(secManualLinks.filter((id) => id !== p.id)))}
                  className="text-zinc-400 hover:text-rose-500 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Product Search Bar & Relevance Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
            {t("Recherche Pertinente & Ajout au Catalogue")}
          </label>
          <span className="text-[11px] text-zinc-500 font-mono">
            {availableFiltered.length} {t("produits")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder={t("Nom, marque, mots-clés, référence...")}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {productSearch && (
              <button
                type="button"
                onClick={() => setProductSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-3 relative">
            <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSearchFilters["sortBy"])}
              className="w-full pl-7 pr-2 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              <option value="relevance">{t("Pertinence")}</option>
              <option value="price_asc">{t("Prix croissant")}</option>
              <option value="price_desc">{t("Prix décroissant")}</option>
              <option value="rating">{t("Mieux notés")}</option>
              <option value="newest">{t("Nouveautés")}</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center">
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-zinc-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span>{t("En stock uniquement")}</span>
            </label>
          </div>
        </div>

        {/* Results Grid */}
        <div className="max-h-52 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-1 border border-zinc-100 rounded-xl bg-zinc-50/50">
          {availableFiltered.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-zinc-400">
              {t("Aucun produit ne correspond à ces critères de recherche.")}
            </div>
          ) : (
            availableFiltered.map((p) => (
              <ProductPickerCard
                key={p.id}
                product={p}
                isSelected={activeSelectedIds.includes(p.id)}
                onToggle={handleToggleProduct}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
