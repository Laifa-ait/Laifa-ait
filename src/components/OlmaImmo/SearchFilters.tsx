import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, SlidersHorizontal, MapPin } from 'lucide-react';
import { ALGERIA_WILAYAS } from '../../constants/wilayas';
import { PropertyType, ListingType, PropertySortOption } from '../../types/realEstate';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';

export interface FilterState {
  listingType?: ListingType;
  propertyType?: PropertyType;
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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [communeInput, setCommuneInput] = useState(filters.commune || '');

  useEffect(() => {
    setCommuneInput(filters.commune || '');
  }, [filters.commune]);

  const handleListingTypeChange = (type?: ListingType) => {
    onChange({ ...filters, listingType: type });
  };

  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PropertyType | 'all';
    onChange({ ...filters, propertyType: val === 'all' ? undefined : val });
  };

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({ ...filters, wilaya: val === 'all' ? undefined : val, commune: undefined });
    setCommuneInput('');
  };

  const handleCommuneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...filters, commune: communeInput.trim() || undefined });
  };

  const handleMinRoomsChange = (rooms?: number) => {
    onChange({ ...filters, minRooms: filters.minRooms === rooms ? undefined : rooms });
  };

  const activeFiltersCount = [
    filters.listingType,
    filters.propertyType,
    filters.wilaya,
    filters.commune,
    filters.minPrice,
    filters.maxPrice,
    filters.minRooms,
    filters.minArea,
    (filters.features || []).length > 0 ? true : undefined,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
      {/* Top Row: Listing Type Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => handleListingTypeChange(undefined)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
              !filters.listingType
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous les biens
          </button>

          <button
            onClick={() => handleListingTypeChange('sale')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
              filters.listingType === 'sale'
                ? 'bg-emerald-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Acheter
          </button>

          <button
            onClick={() => handleListingTypeChange('rent_long')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
              filters.listingType === 'rent_long'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Louer (Long terme)
          </button>

          <button
            onClick={() => handleListingTypeChange('rent_short')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
              filters.listingType === 'rent_short'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Séjours (Courte durée)
          </button>
        </div>

        {/* Map toggle & Reset buttons */}
        <div className="flex items-center gap-2 ms-auto shrink-0">
          {onToggleMap && (
            <button
              onClick={onToggleMap}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
                isMapExpanded
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>{isMapExpanded ? 'Masquer la carte' : 'Carte'}</span>
            </button>
          )}

          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Wilaya Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Wilaya
          </label>
          <select
            value={filters.wilaya || 'all'}
            onChange={handleWilayaChange}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          >
            <option value="all">Toutes les wilayas (48/58)</option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.name}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Type de bien
          </label>
          <select
            value={filters.propertyType || 'all'}
            onChange={handlePropertyTypeChange}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          >
            <option value="all">Tous les types</option>
            <option value="apartment">Appartement</option>
            <option value="villa">Villa</option>
            <option value="studio">Studio</option>
            <option value="commercial">Local Commercial</option>
            <option value="land">Terrain</option>
          </select>
        </div>

        {/* Commune Search */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Commune
          </label>
          <form onSubmit={handleCommuneSubmit} className="relative">
            <input
              type="text"
              placeholder="Ex: Oran, Bab Ezzouar..."
              value={communeInput}
              onChange={(e) => setCommuneInput(e.target.value)}
              onBlur={() => onChange({ ...filters, commune: communeInput.trim() || undefined })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 pe-8 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Sort Option */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Trier par
          </label>
          <select
            value={filters.sort || 'recent'}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as PropertySortOption })}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          >
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="popularity">Popularité / Vues</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Expand Toggle */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtres avancés (Budget, Pièces, Équipements)</span>
        </button>

        {/* Rooms quick selector */}
        <div className="hidden md:flex items-center gap-1">
          <span className="text-[11px] text-slate-500 font-medium me-1">Pièces min:</span>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleMinRoomsChange(num)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.minRooms === num
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              F{num}
            </button>
          ))}
        </div>
      </div>

      {showMoreFilters && <AdvancedFiltersPanel filters={filters} onChange={onChange} />}
    </div>
  );
};
