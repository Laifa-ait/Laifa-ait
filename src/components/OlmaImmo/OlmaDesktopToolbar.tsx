import React from 'react';
import {
  Columns2,
  LayoutGrid,
  Map as MapIcon,
  ArrowUpDown,
} from 'lucide-react';
import { FilterState } from './SearchFilters';

export type DesktopSplitRatio = 'balanced' | 'focus-list' | 'focus-map';

export interface OlmaDesktopToolbarProps {
  propertiesCount: number;
  activeView: 'split' | 'grid' | 'map';
  onViewChange: (mode: 'split' | 'grid' | 'map') => void;
  splitRatio?: DesktopSplitRatio;
  onSplitRatioChange?: (ratio: DesktopSplitRatio) => void;
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

export const OlmaDesktopToolbar: React.FC<OlmaDesktopToolbarProps> = ({
  propertiesCount,
  activeView,
  onViewChange,
  filters,
  onFilterChange,
}) => {
  const currentSort = filters?.sort || 'recent';

  const handleSortChange = (newSort: FilterState['sort']) => {
    if (onFilterChange && filters) {
      onFilterChange({ ...filters, sort: newSort });
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-3 select-none">
      {/* Left: Simplified Title (image_7.png: '10 biens disponibles') */}
      <div className="flex items-center gap-2">
        <h2 className="text-base sm:text-lg font-bold text-[#1E293B] tracking-tight">
          {propertiesCount} {propertiesCount > 1 ? 'biens disponibles' : 'bien disponible'}
          {filters?.wilaya ? ` à ${filters.wilaya}` : ''}
        </h2>
      </div>

      {/* Right: Reduced Minimalist Sort Icon Button (⇅) */}
      <div className="flex items-center gap-2.5">
        {onFilterChange && (
          <div className="relative inline-flex items-center">
            <select
              aria-label="Trier les résultats"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sort'])}
              className="appearance-none bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-[#1E293B] text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none cursor-pointer transition"
            >
              <option value="recent">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="area_desc">Surface m²</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 pointer-events-none" />
          </div>
        )}

        {/* View Mode Switcher */}
        <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/70">
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={`p-1.5 rounded-md text-xs transition-all ${
              activeView === 'grid'
                ? 'bg-white text-[#1E293B] shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
            title="Vue Grille"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('split')}
            className={`p-1.5 rounded-md text-xs transition-all ${
              activeView === 'split'
                ? 'bg-white text-[#1E293B] shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
            title="Vue Partagée"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('map')}
            className={`p-1.5 rounded-md text-xs transition-all ${
              activeView === 'map'
                ? 'bg-white text-[#1E293B] shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
            title="Vue Carte"
          >
            <MapIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
