import React from "react";
import { ChevronDown, ChevronUp, Check, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PreferenceCategoryCardProps {
  categoryName: string;
  icon: string;
  subcategories: string[];
  selectedInterests: string[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSelectAll: () => void;
  onToggleSubcategory: (sub: string) => void;
}

export const PreferenceCategoryCard: React.FC<PreferenceCategoryCardProps> = ({
  categoryName,
  icon,
  subcategories,
  selectedInterests,
  isExpanded,
  onToggleExpand,
  onToggleSelectAll,
  onToggleSubcategory,
}) => {
  const { t } = useTranslation();

  const selectedCount = subcategories.filter((sub) => selectedInterests.includes(sub)).length;
  const isAllSelected = selectedCount === subcategories.length && subcategories.length > 0;
  const isPartiallySelected = selectedCount > 0 && !isAllSelected;

  return (
    <div
      className={`bg-white rounded-[24px] border transition-all overflow-hidden ${
        selectedCount > 0
          ? "border-[#1a73e8] shadow-xs ring-1 ring-[#1a73e8]/20"
          : "border-[#dadce0] hover:border-[#bdc1c6]"
      }`}
    >
      {/* Category Header Bar */}
      <div
        onClick={onToggleExpand}
        className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-[#f8fafd] transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#f0f4f9] flex items-center justify-center text-2xl shrink-0 shadow-xs">
            {icon}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h4 className="text-base font-semibold text-[#202124] truncate">
              {categoryName}
            </h4>
            <p className="text-xs text-[#5f6368]">
              {selectedCount > 0
                ? t("{{count}} sur {{total}} sélectionnés", {
                    count: selectedCount,
                    total: subcategories.length,
                  })
                : t("{{total}} choix disponibles", { total: subcategories.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Quick Select/Unselect All for this category */}
          <button
            type="button"
            onClick={onToggleSelectAll}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer border ${
              isAllSelected
                ? "bg-[#1a73e8] border-[#1a73e8] text-white"
                : isPartiallySelected
                ? "bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]"
                : "bg-white border-[#dadce0] hover:border-[#1a73e8]"
            }`}
            title={isAllSelected ? t("Tout désélectionner") : t("Tout sélectionner")}
          >
            {isAllSelected && <Check className="w-4 h-4 stroke-[3]" />}
            {isPartiallySelected && <div className="w-2.5 h-1 bg-[#1a73e8] rounded-xs" />}
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer border-none bg-transparent"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Subcategories Filter Chips */}
      {isExpanded && subcategories.length > 0 && (
        <div className="px-6 pb-6 pt-2 border-t border-[#f1f3f4] bg-[#fdfdfe]">
          <p className="text-xs text-[#5f6368] mb-3">
            {t("Sélectionnez les sous-thématiques précises qui vous intéressent :")}
          </p>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => {
              const isSelected = selectedInterests.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onToggleSubcategory(sub)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] shadow-xs"
                      : "bg-white border-[#dadce0] text-[#3c4043] hover:border-[#1a73e8]/60 hover:bg-[#f8fafd]"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1a73e8]" />}
                  <span>{sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
