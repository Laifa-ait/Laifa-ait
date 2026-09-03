import React from "react";
import { Sparkles, Save, Search, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DEFAULT_CATEGORIES } from "../../../data/categories";
import { formatPrice } from "../../../utils/format";
import { Product } from "../../../domains/product/product.types";

interface CataloguesMarketplaceProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  catTitle: string;
  setCatTitle: (title: string) => void;
  catSubtitle: string;
  setCatSubtitle: (sub: string) => void;
  catImage: string;
  setCatImage: (img: string) => void;
  catSubImages: Record<string, string>;
  setCatSubImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  catFeaturedIds: string[];
  toggleProductFeatured: (id: string) => void;
  filteredProducts: Product[];
  searchProductQuery: string;
  setSearchProductQuery: (query: string) => void;
  isLoadingProducts: boolean;
  isSavingCategory: boolean;
  handleSaveCategory: () => void;
  handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void;
}

export const CataloguesMarketplace: React.FC<CataloguesMarketplaceProps> = ({
  selectedCategory,
  setSelectedCategory,
  catTitle,
  setCatTitle,
  catSubtitle,
  setCatSubtitle,
  catImage,
  setCatImage,
  catFeaturedIds,
  toggleProductFeatured,
  filteredProducts,
  searchProductQuery,
  setSearchProductQuery,
  isLoadingProducts,
  isSavingCategory,
  handleSaveCategory,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="catalogues-marketplace">
      {/* Left panel: List Categories */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
            {t("Rayons & Catégories Algérie")}
          </h3>
        </div>

        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {Object.keys(DEFAULT_CATEGORIES).map((catName) => {
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border flex items-center justify-between ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                    : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                }`}
              >
                <span>{catName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-lg ${
                    isSelected ? "bg-amber-500 text-zinc-950 font-extrabold" : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {DEFAULT_CATEGORIES[catName]?.title || catName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: Edit Form & 4 Featured Products Slot */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div>
            <h3 className="font-bold text-zinc-900 text-base">
              {t("Personnalisation du Rayon")} : <span className="text-amber-600">{selectedCategory}</span>
            </h3>
            <p className="text-xs text-zinc-500">
              {t("Définissez le titre d'accroche et les 4 produits stars mis en avant dans la grille")}
            </p>
          </div>

          <button
            type="button"
            disabled={isSavingCategory}
            onClick={handleSaveCategory}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSavingCategory ? t("Enregistrement...") : t("Sauvegarder Rayon")}
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {t("Titre d'Accroche Vitrine")}
            </label>
            <input
              type="text"
              value={catTitle}
              onChange={(e) => setCatTitle(e.target.value)}
              placeholder={t("Ex: Électronique & Gaming DZ")}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {t("Sous-titre / Promesse")}
            </label>
            <input
              type="text"
              value={catSubtitle}
              onChange={(e) => setCatSubtitle(e.target.value)}
              placeholder={t("Ex: Les marques officielles au meilleur prix")}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            {t("Image Bannière de Fond (URL)")}
          </label>
          <input
            type="url"
            value={catImage}
            onChange={(e) => setCatImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* 4-Product Star Selector */}
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-900">
              {t("4 Produits Vedettes du Rayon")} ({catFeaturedIds.length}/4)
            </h4>
            <span className="text-[11px] text-zinc-500">
              {t("Sélectionnez jusqu'à 4 articles pour le bento vitrine")}
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchProductQuery}
              onChange={(e) => setSearchProductQuery(e.target.value)}
              placeholder={t("Rechercher dans ce rayon...")}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {isLoadingProducts ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              {t("Chargement des produits du rayon...")}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400">
              {t("Aucun produit trouvé dans cette catégorie.")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
              {filteredProducts.map((p) => {
                const isFeatured = catFeaturedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProductFeatured(p.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                      isFeatured
                        ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500"
                        : "bg-white border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 shrink-0 overflow-hidden relative">
                      {p.images && p.images[0] ? (
                        <img loading="lazy" decoding="async" src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-400">
                          Img
                        </div>
                      )}
                      {isFeatured && (
                        <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-amber-950 font-bold" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-amber-600 font-extrabold">
                        {formatPrice(p.price)} DZD
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
