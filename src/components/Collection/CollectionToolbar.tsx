import React, { useState } from "react";
import { ChevronDown, Check, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CollectionSortOption } from "./collection.types";

interface CollectionToolbarProps {
  totalCount: number;
  activeFiltersCount: number;
  onResetFilters: () => void;
  sortBy: CollectionSortOption;
  onSelectSort: (sort: CollectionSortOption) => void;
  onOpenFilters: () => void;
}

export const CollectionToolbar: React.FC<CollectionToolbarProps> = ({
  totalCount,
  activeFiltersCount,
  onResetFilters,
  sortBy,
  onSelectSort,
  onOpenFilters,
}) => {
  const { t } = useTranslation();
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions: Array<{ id: CollectionSortOption; label: string }> = [
    { id: "popular", label: t("sort_popular", "Popularité") },
    { id: "price-asc", label: t("sort_price_asc", "Prix Croissant") },
    { id: "price-desc", label: t("sort_price_desc", "Prix Décroissant") },
    { id: "rating-desc", label: t("sort_rating", "Mieux Notés") },
    { id: "newest", label: t("sort_newest", "Nouveautés") },
  ];

  const currentSortLabel = sortOptions.find((o) => o.id === sortBy)?.label || t("sort_popular", "Popularité");

  return (
    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5 mb-6 pt-2">
      {/* Left: Product Count with Friendly Badge */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 shadow-2xs">
          <span className="font-black text-rose-600">{totalCount}</span>
          <span>{t("products_found_count", "Articles disponibles")}</span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="ms-2 text-xs font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("common_reset", "Réinitialiser")}</span>
          </button>
        )}
      </div>

      {/* Right: Sort Dropdown & Mobile Filter Trigger */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-800 text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-slate-400 text-xs">{t("sort_by_prefix", "Trier :")}</span>
            <span className="font-bold text-slate-900">{currentSortLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
          </button>

          {showSortDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelectSort(opt.id);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                      sortBy === opt.id ? "bg-rose-50 text-rose-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Mobile Filter Button */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          title={t("common_filters", "Filtres")}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
