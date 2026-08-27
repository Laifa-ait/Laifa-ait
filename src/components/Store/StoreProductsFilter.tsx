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
    <div className="bg-white border border-zinc-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Live Search inside Store */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث في هذا المتجر...' : 'Rechercher dans cette boutique...'}
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Horizontal Scrolling Pills */}
        {storeCategories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0 max-w-full lg:max-w-2xl xl:max-w-3xl">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedCategory === null
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                  : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100'
              }`}
            >
              {isRTL ? 'الكل' : 'Tout voir'}
            </button>
            {storeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                    : 'bg-zinc-50/50 text-zinc-600 border-zinc-100 hover:bg-zinc-100 hover:border-zinc-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
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
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500 bg-zinc-50/60 p-2.5 px-4 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span>
              {isRTL
                ? `تم العثور على ${filteredCount} من المنتجات المطابقة`
                : `${filteredCount} articles correspondent à vos filtres`}
            </span>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="text-orange-600 hover:text-orange-700 underline text-[10px] uppercase font-sans font-bold tracking-wider"
          >
            {isRTL ? 'إعادة تعيين' : 'Réinitialiser'}
          </button>
        </div>
      )}
    </div>
  );
};
