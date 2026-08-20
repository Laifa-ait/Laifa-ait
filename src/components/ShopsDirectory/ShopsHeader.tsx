import React from "react";
import { Search, MapPin, X, ArrowUpDown, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ALGERIA_WILAYAS } from "../../constants";
import { ShopsFilterState, ShopSortOption } from "../../types/shopsDirectory";

interface ShopsHeaderProps {
  filters: ShopsFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ShopsFilterState>>;
  categories: string[];
  totalResults?: number;
}

export const ShopsHeader: React.FC<ShopsHeaderProps> = ({
  filters,
  setFilters,
  categories,
}) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, selectedWilaya: e.target.value }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategory: prev.selectedCategory === category ? "" : category,
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, sortBy: e.target.value as ShopSortOption }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      selectedWilaya: "",
      selectedCategory: "",
      sortBy: "popular",
      onlyVerified: false,
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.selectedWilaya) ||
    Boolean(filters.selectedCategory) ||
    filters.onlyVerified;

  return (
    <div className="space-y-6">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isArabic ? "دليل المتاجر المعتمدة 58 ولاية" : "Annuaire des Boutiques 58 Wilayas"}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-serif">
            {isArabic
              ? "استكشف أفضل المتاجر والبائعين في الجزائر"
              : "Découvrez les Meilleurs Vendeurs & Artisans d'Algérie"}
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-sans max-w-2xl">
            {isArabic
              ? "تصفح المتاجر الموثوقة، ابحث حسب الولاية أو التخصص، واستكشف منتجات البائعين المستقلين عبر كامل التراب الوطني."
              : "Explorez des boutiques indépendantes vérifiées, filtrez par wilaya et catégorie, et contactez directement les vendeurs."}
          </p>

          {/* Search Bar inside Hero */}
          <div className="pt-2">
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-teal-100/30 p-1.5 focus-within:ring-2 focus-within:ring-amber-400 transition-all">
              <Search className="w-5 h-5 text-gray-400 ml-3 mr-2 shrink-0 rtl:ml-2 rtl:mr-3" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={handleSearchChange}
                placeholder={
                  isArabic
                    ? "ابحث باسم المتجر، المنتج، أو المدينة..."
                    : "Rechercher par nom de boutique, spécialité, ville..."
                }
                className="w-full bg-transparent px-2 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none font-sans"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors mr-1 rtl:mr-0 rtl:ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Wilaya Filter */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{isArabic ? "الولاية" : "Wilaya"}</span>
            </label>
            <select
              value={filters.selectedWilaya}
              onChange={handleWilayaChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
            >
              <option value="">{isArabic ? "جميع الولايات (58 ولاية)" : "Toutes les Wilayas (58)"}</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
              <span>{isArabic ? "الترتيب حسب" : "Trier par"}</span>
            </label>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
            >
              <option value="popular">{isArabic ? "الأكثر شعبية" : "Plus populaires"}</option>
              <option value="rating">{isArabic ? "الأعلى تقييماً" : "Meilleures notes"}</option>
              <option value="products">{isArabic ? "الأكثر منتجات" : "Plus grand catalogue"}</option>
              <option value="newest">{isArabic ? "الأحدث انضماماً" : "Nouveaux vendeurs"}</option>
              <option value="name">{isArabic ? "الأبجدية (أ-ي)" : "Ordre alphabétique"}</option>
            </select>
          </div>

          {/* Verified Checkbox */}
          <div className="flex items-end">
            <label className="w-full flex items-center justify-between sm:justify-start gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-100/80 transition-colors">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {isArabic ? "متاجر موثوقة فقط" : "Boutiques vérifiées uniquement"}
              </span>
              <input
                type="checkbox"
                checked={filters.onlyVerified}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, onlyVerified: e.target.checked }))
                }
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300 cursor-pointer"
              />
            </label>
          </div>

          {/* Results Count & Clear Button */}
          <div className="flex items-end justify-between sm:justify-end gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isArabic ? "إعادة ضبط" : "Réinitialiser"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Chips */}
        {categories.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1 rtl:mr-0 rtl:ml-1">
                {isArabic ? "التخصص:" : "Catégorie:"}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, selectedCategory: "" }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  filters.selectedCategory === ""
                    ? "bg-teal-800 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isArabic ? "الكل" : "Toutes"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    filters.selectedCategory === cat
                      ? "bg-teal-800 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
