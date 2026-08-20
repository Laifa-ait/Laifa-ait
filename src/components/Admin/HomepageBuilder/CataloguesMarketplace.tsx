import React from "react";
import { Sparkles, Save, Image as ImageIcon, Star, Search, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DEFAULT_CATEGORIES } from "../../../data/categories";
import { PRODUCT_HIERARCHY } from "../../../constants";
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
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void;
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
  catSubImages,
  setCatSubImages,
  catFeaturedIds,
  toggleProductFeatured,
  filteredProducts,
  searchProductQuery,
  setSearchProductQuery,
  isLoadingProducts,
  isSavingCategory,
  handleSaveCategory,
  handleFileUpload,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="catalogues-marketplace">
      {/* Left panel: List Categories */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h3 className="font-sans font-bold text-xs text-zinc-950 uppercase tracking-wider rtl:tracking-normal mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" /> {t("Catalogues Marketplace")}
        </h3>
        <div className="space-y-2">
          {Object.keys(DEFAULT_CATEGORIES).map((catName) => {
            const isSelected = selectedCategory === catName;
            const defaultCat = DEFAULT_CATEGORIES[catName] || { title: "" };
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`w-full text-start px-4 py-3.5 rounded-xl font-bold text-xs transition-all relative cursor-pointer border flex items-center justify-between ${
                  isSelected
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-md scale-[1.02]"
                    : "bg-zinc-50/40 hover:bg-zinc-50/90 text-zinc-950 border-zinc-200"
                }`}
              >
                <span>{catName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? "bg-orange-600 text-white" : "bg-zinc-100 text-zinc-600"}`}
                >
                  {defaultCat.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-[11px] text-orange-850 font-bold space-y-1.5">
          <span className="block uppercase tracking-wider rtl:tracking-normal text-[9px] text-orange-600 font-sans font-bold">
            {t("ℹ️ Recommandation Connectée (IA)")}
          </span>
          <p>
            {t(
              "L'ordre des catalogues est personnalisé dynamiquement pour chaque utilisateur. Les habitudes (visites, recherches) sont synchronisées sur le Cloud ☁️ pour une expérience cross-device."
            )}
          </p>
        </div>
      </div>

      {/* Right panel: Edit Form */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-orange-600">
              {t("Configuration du Catalogue")}
            </span>
            <h3 className="text-xl font-sans font-bold text-zinc-950">{selectedCategory}</h3>
          </div>
          <button
            type="button"
            onClick={handleSaveCategory}
            disabled={isSavingCategory}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 text-white font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal transition-colors rounded-xl shadow-md border-none cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSavingCategory ? t("Enregistrement...") : t("Enregistrer")}
          </button>
        </div>

        {/* Custom visual properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-500 mb-1.5">
                {t("Titre personnalisé du Widget")}
              </label>
              <input
                type="text"
                value={catTitle}
                onChange={(e) => setCatTitle(e.target.value)}
                placeholder={t("Ex: Le Quotidien Pratique")}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-500 mb-1.5">
                {t("Sous-titre accrocheur")}
              </label>
              <input
                type="text"
                value={catSubtitle}
                onChange={(e) => setCatSubtitle(e.target.value)}
                placeholder={t("Ex: Tradition des 58 Wilayas")}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-500 mb-1.5">
                {t("Image (Média Importé ou URL)")}
              </label>
              <div className="space-y-2">
                {!catImage ? (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100/50 rounded-xl cursor-pointer transition-all">
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-600">
                      {t("Sélectionner une image depuis vos médias")}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp, image/gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setCatImage)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-2 rounded-xl">
                    <span className="text-xs font-bold text-zinc-600 truncate max-w-[200px]">
                      {t("Image sélectionnée")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCatImage("")}
                      className="text-xs text-red-500 font-bold hover:underline px-2 bg-transparent border-none cursor-pointer"
                    >
                      {t("Supprimer")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview image cover */}
          <div className="space-y-2">
            <span className="block text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-500">
              {t("Rendu visuel (Aperçu)")}
            </span>
            <div className="relative h-[200px] rounded-2xl overflow-hidden shadow-inner bg-zinc-100 flex items-center justify-center border border-zinc-200">
              {catImage ? (
                <>
                  <img
                    loading="lazy"
                    src={catImage}
                    className="w-full h-full object-cover"
                    alt={t("Preview catalogue")}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                  <div className="absolute bottom-4 start-4 text-start">
                    <span className="bg-orange-600 inline-block text-[8px] font-bold text-white px-2 py-0.5 rounded-full mb-1">
                      {t("PRÉFÉRÉ POUR VOUS ⭐")}
                    </span>
                    <h4 className="text-sm font-sans font-bold text-white">{catTitle || selectedCategory}</h4>
                    <p className="text-[10px] text-zinc-200 mt-0.5">
                      {catSubtitle || t("L'excellence à votre portée")}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-400">{t("Aucune image configurée")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories Editor */}
        <div className="space-y-4 pt-6 border-t border-zinc-100">
          <div className="flex flex-col gap-1">
            <h4 className="font-sans font-bold text-xs text-zinc-950 uppercase tracking-wider rtl:tracking-normal flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              {t("Images des Sous-Catégories")}
            </h4>
            <p className="text-[10px] text-zinc-500 font-bold">
              {t("Personnalisez les images des sous-catégories principales qui s'affichent dans l'Univers Olma.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(PRODUCT_HIERARCHY[selectedCategory] || {}).map((subName) => (
              <div key={subName} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                <span className="font-bold text-xs text-zinc-900 block truncate">{subName}</span>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {catSubImages[subName] ? (
                      <img
                        loading="lazy"
                        src={catSubImages[subName]}
                        className="w-full h-full object-cover"
                        alt={subName}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg cursor-pointer transition-all text-[10px] font-bold text-zinc-700 w-full mb-2">
                      {t("Changer d'image")}
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => setCatSubImages((prev) => ({ ...prev, [subName]: url })))
                        }
                      />
                    </label>
                    {catSubImages[subName] && (
                      <button
                        type="button"
                        onClick={() =>
                          setCatSubImages((prev) => {
                            const newImages = { ...prev };
                            delete newImages[subName];
                            return newImages;
                          })
                        }
                        className="text-[9px] text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        {t("Supprimer")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products Association */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-sans font-bold text-xs text-zinc-950 uppercase tracking-wider rtl:tracking-normal flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500 fill-current" />
                {t("Produits en Vedette (")}
                {catFeaturedIds.length})
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-bold">
                {t('Cochez les produits de cette catégorie pour les fixer "en vedette" sur l\'Accueil.')}
              </p>
            </div>

            {/* Search query inside category products */}
            <div className="relative max-w-xs w-full self-start">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                placeholder={t("Filtrer les produits...")}
                className="w-full ps-9 pe-4 py-2 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 text-xs font-bold focus:outline-none focus:border-orange-600"
              />
            </div>
          </div>

          {/* Products selection list */}
          {isLoadingProducts ? (
            <div className="py-8 text-center text-zinc-950/40 font-bold animate-pulse text-xs uppercase">
              {t("Chargement des produits...")}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center border-dashed border-2 border-zinc-200 rounded-xl">
              <p className="text-xs text-zinc-950/50 font-bold">
                {t("Aucun produit trouvé dans cette catégorie.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto pe-2 custom-scrollbar">
              {filteredProducts.map((prod) => {
                const isFeatured = catFeaturedIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleProductFeatured(prod.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isFeatured
                        ? "bg-zinc-50 border-orange-200 shadow-sm"
                        : "bg-white hover:bg-zinc-50/50 border-zinc-200"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-150 shrink-0 border border-zinc-200">
                      <img
                        loading="lazy"
                        src={prod.image}
                        className="w-full h-full object-cover"
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-zinc-950 truncate">{prod.name}</h5>
                      <p className="text-[10px] text-zinc-550 font-semibold mt-0.5">{formatPrice(prod.price)}</p>
                    </div>
                    <div className="shrink-0 ps-1">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isFeatured ? "bg-orange-600 border-orange-600 text-white" : "border-zinc-300 bg-white"
                        }`}
                      >
                        {isFeatured && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
