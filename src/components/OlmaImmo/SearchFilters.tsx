import React, { useState } from 'react';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { PropertyType, ListingType, PropertySortOption, LegalPaperType } from '../../types/realEstate';
import { LocationFilterSelects } from './filters/LocationFilterSelects';
import { OlmaImmoFilterModal } from './filters/OlmaImmoFilterModal';
import { ActiveFilterPills } from './filters/ActiveFilterPills';

export interface FilterState {
  listingType?: ListingType;
  propertyType?: PropertyType;
  legalPaperType?: LegalPaperType;
  hasActeNotarie?: boolean;
  hasLivretFoncier?: boolean;
  wilaya?: string;
  commune?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  minArea?: number;
  sort?: PropertySortOption;
  features?: string[];
}

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isMapExpanded?: boolean;
  onToggleMap?: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChange,
  onReset,
  isMapExpanded,
  onToggleMap,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleListingTypeChange = (type?: ListingType) => {
    onChange({ ...filters, listingType: type });
  };

  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PropertyType | 'all';
    onChange({ ...filters, propertyType: val === 'all' ? undefined : val });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sort: e.target.value as PropertySortOption });
  };

  const activeFiltersCount = [
    filters.listingType,
    filters.propertyType,
    filters.legalPaperType,
    filters.hasActeNotarie,
    filters.hasLivretFoncier,
    filters.wilaya,
    filters.commune,
    filters.minPrice,
    filters.maxPrice,
    filters.minRooms,
    filters.minArea,
  ].filter(Boolean).length;

  const handleRemoveSingleFilter = (key: keyof FilterState) => {
    const next = { ...filters };
    delete next[key];
    if (key === 'wilaya') delete next.commune;
    onChange(next);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6E0D4] shadow-sm p-4 sm:p-5 mb-6 space-y-4">
      {/* Top Row: Listing Type Tabs & Map Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center bg-[#FAF8F5] p-1 rounded-2xl gap-1 shrink-0 border border-stone-200">
          {[
            { type: undefined, label: 'Tous les biens' },
            { type: 'sale' as ListingType, label: 'Acheter' },
            { type: 'rent_long' as ListingType, label: 'Louer' },
            { type: 'rent_short' as ListingType, label: 'Séjours' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleListingTypeChange(item.type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                filters.listingType === item.type
                  ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ms-auto shrink-0">
          {onToggleMap && (
            <button
              type="button"
              onClick={onToggleMap}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                isMapExpanded
                  ? 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E]'
                  : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{isMapExpanded ? 'Masquer la carte' : 'Carte'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#0D281E] text-[#EBDCB8] text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Filter Row: Wilaya / Commune Selects + Property Type */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-8">
          <LocationFilterSelects
            wilaya={filters.wilaya}
            commune={filters.commune}
            onWilayaChange={(w) => onChange({ ...filters, wilaya: w, commune: undefined })}
            onCommuneChange={(c) => onChange({ ...filters, commune: c })}
            size="sm"
            idPrefix="search-filters"
          />
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-2">
          <select
            value={filters.propertyType || 'all'}
            onChange={handlePropertyTypeChange}
            className="w-full bg-[#FAF8F5] border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3 py-2 min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#0D281E] cursor-pointer"
          >
            <option value="all">Tous types</option>
            <option value="apartment">Appartement</option>
            <option value="villa">Villa</option>
            <option value="house">Maison</option>
            <option value="studio">Studio</option>
            <option value="commercial">Local comm.</option>
            <option value="land">Terrain</option>
            <option value="office">Bureau</option>
          </select>

          <select
            value={filters.sort || 'recent'}
            onChange={handleSortChange}
            className="w-full bg-[#FAF8F5] border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3 py-2 min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#0D281E] cursor-pointer"
          >
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="popularity">Popularité</option>
          </select>
        </div>
      </div>

      {/* Active Filter Pills Dismissible Section */}
      <ActiveFilterPills
        filters={filters}
        onRemoveFilter={handleRemoveSingleFilter}
        onResetAll={onReset}
      />

      {/* Advanced Filter Modal */}
      <OlmaImmoFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        onApplyFilters={onChange}
        onResetFilters={onReset}
      />
    </div>
  );
};
