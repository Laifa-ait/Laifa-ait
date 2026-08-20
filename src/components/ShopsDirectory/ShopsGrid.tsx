import React, { useState } from "react";
import { LayoutGrid, List, Store, SearchX, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShopDirectoryItem } from "../../types/shopsDirectory";
import { ShopCard } from "./ShopCard";

interface ShopsGridProps {
  shops: ShopDirectoryItem[];
  isLoading: boolean;
  totalResults: number;
  onResetFilters: () => void;
}

export const ShopsGrid: React.FC<ShopsGridProps> = ({
  shops,
  isLoading,
  totalResults,
  onResetFilters,
}) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-slate-200 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
            >
              <div className="h-28 bg-slate-200 rounded-xl w-full" />
              <div className="flex items-center gap-3 pt-2">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-4 shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <SearchX className="w-8 h-8" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-slate-900">
            {isArabic ? "لم يتم العثور على أي متجر" : "Aucune boutique trouvée"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {isArabic
              ? "جرّب تغيير عبارة البحث، اختيار ولاية أخرى، أو إزالة بعض التصفية."
              : "Essayez de modifier votre recherche ou de réinitialiser vos filtres."}
          </p>
        </div>

        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isArabic ? "إعادة إظهار كل المتاجر" : "Afficher toutes les boutiques"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Bar with Count & Grid/List switcher */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-1.5">
          <Store className="w-4 h-4 text-teal-600" />
          <span>
            {isArabic
              ? `تم العثور على ${totalResults} متجر`
              : `${totalResults} boutique${totalResults > 1 ? "s" : ""} disponible${totalResults > 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-teal-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Vue Grille"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-teal-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Vue Liste"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid or List Display */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            : "grid grid-cols-1 sm:grid-cols-2 gap-4"
        }
      >
        {shops.map((shop) => (
          <ShopCard key={shop.id || shop.sellerId} shop={shop} />
        ))}
      </div>
    </div>
  );
};
