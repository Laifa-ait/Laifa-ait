import React from "react";
import { useTranslation } from "react-i18next";
import { CollectionCategory, CollectionQuickFilter } from "./collection.types";
import { getCategoryTranslation } from "../../utils/translations";

interface CollectionNavTabsProps {
  categories: CollectionCategory[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  quickFilters: CollectionQuickFilter[];
  activeQuickFilter: string | null;
  onSelectQuickFilter: (filterId: string | null) => void;
}

export const CollectionNavTabs: React.FC<CollectionNavTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  quickFilters,
  activeQuickFilter,
  onSelectQuickFilter,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white/95 border-b border-slate-200/90 sticky top-0 z-30 backdrop-blur-md transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 space-y-2">
        {/* Row 1: Primary Category Tabs with Joyful Colors */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const displayLabel = cat.id === "all" ? t("all_categories", "Toutes les catégories") : getCategoryTranslation(cat.label, t);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`relative px-4 py-2 text-xs font-bold tracking-wide whitespace-nowrap rounded-xl transition-all duration-200 cursor-pointer select-none shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-slate-900 to-indigo-900 text-white shadow-sm ring-2 ring-indigo-500/20 scale-[1.02]"
                    : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 hover:text-slate-950 border border-slate-200/60"
                }`}
              >
                {cat.emoji && <span className="text-sm">{cat.emoji}</span>}
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary Quick Filter Tags with Eye-pleasing Badges */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar py-0.5">
          {quickFilters.map((filter) => {
            const isSelected = activeQuickFilter === filter.id;
            const Icon = filter.icon;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onSelectQuickFilter(isSelected ? null : filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 whitespace-nowrap cursor-pointer select-none border ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-950 shadow-2xs hover:bg-slate-50"
                }`}
              >
                {filter.emoji ? (
                  <span className="text-xs">{filter.emoji}</span>
                ) : (
                  Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                )}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
