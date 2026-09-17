import React from 'react';
import { Search, X } from 'lucide-react';

interface StoreProductsFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  storeCategories: string[];
  getCategoryCount: (cat: string) => number;
  filteredCount: number;
  isRTL: boolean;
}

export const StoreProductsFilter: React.FC<StoreProductsFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  storeCategories,
  getCategoryCount,
  filteredCount,
  isRTL,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Live Search inside Store */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث في هذا المتجر...' : 'Rechercher un article dans cette boutique...'}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Horizontal Scrolling Pills */}
        {storeCategories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0 max-w-full lg:max-w-2xl xl:max-w-3xl">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === null
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {isRTL ? 'الكل' : 'Tous les articles'}
            </button>
            {storeCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {getCategoryCount(cat)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Indicator bar */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 px-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>
              {isRTL
                ? `تم العثور على ${filteredCount} من المنتجات المطابقة`
                : `${filteredCount} articles correspondent à vos filtres`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="text-orange-600 hover:text-orange-700 font-bold text-xs cursor-pointer hover:underline"
          >
            {isRTL ? 'إعادة تعيين' : 'Réinitialiser'}
          </button>
        </div>
      )}
    </div>
  );
};
