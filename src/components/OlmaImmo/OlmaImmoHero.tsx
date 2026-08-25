import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { PropertyType } from '../../types/realEstate';
import { FilterState } from './SearchFilters';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';

interface OlmaImmoHeroProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onSearchSubmit: () => void;
}

export const OlmaImmoHero: React.FC<OlmaImmoHeroProps> = ({
  filters,
  onFilterChange,
  onSearchSubmit,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.wilaya || filters.commune || '');

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    onFilterChange({
      ...filters,
      wilaya: val.trim() || undefined,
      commune: undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
      {/* Dark Forest Green Frame with Centered Search Capsule */}
      <div className="bg-[#183930] rounded-2xl sm:rounded-3xl py-6 sm:py-8 px-4 sm:px-8 shadow-xl relative overflow-hidden">
        {/* Centered Rounded Search Pill */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="bg-white rounded-full p-2 sm:p-2.5 ps-4 sm:ps-6 shadow-2xl border border-white/30 flex items-center gap-2 sm:gap-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#f5f1e8]/50">
            <Search className="w-5 h-5 text-[#183930] shrink-0" />
            
            <input
              type="text"
              placeholder="Search location, wilaya, commune, neighborhood..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  onFilterChange({ ...filters, wilaya: undefined, commune: undefined });
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Quick Type Filter */}
            <select
              value={filters.propertyType || 'all'}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  propertyType: e.target.value === 'all' ? undefined : (e.target.value as PropertyType),
                })
              }
              className="hidden md:block appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full px-3 py-2 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
              <option value="house">House</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`p-2.5 rounded-full text-xs font-medium flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                isFiltersOpen
                  ? 'bg-[#183930] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="More Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Search Button */}
            <button
              type="button"
              onClick={onSearchSubmit}
              className="px-5 sm:px-7 py-2.5 bg-[#183930] hover:bg-[#122b24] text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-md shrink-0 active:scale-95"
            >
              Search
            </button>
          </div>

          {/* Expandable Advanced Filters Panel */}
          {isFiltersOpen && (
            <div className="mt-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <AdvancedFiltersPanel
                roomsFilter={filters.minRooms || 'all'}
                setRoomsFilter={(r) => onFilterChange({ ...filters, minRooms: r === 'all' ? undefined : r })}
                selectedAmenities={filters.features || []}
                toggleAmenity={(a) => {
                  const feats = filters.features || [];
                  onFilterChange({
                    ...filters,
                    features: feats.includes(a) ? feats.filter((f) => f !== a) : [...feats, a],
                  });
                }}
                areaRange={[filters.minArea || 0, 500]}
                setAreaRange={([min]) => onFilterChange({ ...filters, minArea: min === 0 ? undefined : min })}
                onReset={() =>
                  onFilterChange({
                    ...filters,
                    minRooms: undefined,
                    features: undefined,
                    minArea: undefined,
                  })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

