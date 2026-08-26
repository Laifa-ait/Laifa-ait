import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, X, Compass, Sparkles } from 'lucide-react';
import { PropertyType } from '../../types/realEstate';
import { FilterState } from './SearchFilters';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';

interface OlmaImmoHeroProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onSearchSubmit: () => void;
}

const POPULAR_DESTINATIONS = [
  'Alger',
  'Oran',
  'Béjaïa',
  'Tipaza',
  'Constantine',
  'Annaba',
  'Tlemcen',
];

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

  const handleQuickDestination = (dest: string) => {
    setSearchTerm(dest);
    onFilterChange({
      ...filters,
      wilaya: dest,
      commune: undefined,
    });
    setTimeout(() => {
      onSearchSubmit();
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 pb-2">
      {/* Travel-Inspired Hero Banner / Search Frame */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-amber-100/40 via-orange-50/20 to-transparent p-4 sm:p-8 md:p-10 border border-stone-200/60 shadow-[0_4px_25px_-4px_rgba(28,25,23,0.03)]">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Human-Centered Title Block */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Explorer l'Algérie & ses Joyaux</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 font-['Poppins',sans-serif]">
            Où souhaitez-vous <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">habiter</span> ou <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent">séjourner</span> ?
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 font-normal max-w-lg mx-auto">
            Villas d'exception, appartements de prestige et séjours de vacances vérifiés partout en Algérie.
          </p>
        </div>

        {/* Floating Capsule Search Bar (Luxury Travel Aesthetic) */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-full p-2 sm:p-2.5 ps-4 sm:ps-6 border border-stone-200/90 shadow-lg shadow-stone-900/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 transition-all duration-200 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500">
            
            {/* Location Input */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <label className="hidden sm:block text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none">
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Wilaya, commune, quartier, ville..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
                />
              </div>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    onFilterChange({ ...filters, wilaya: undefined, commune: undefined });
                  }}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer bg-transparent border-none shrink-0"
                  title="Effacer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-stone-200" />

            {/* Quick Type Selector */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <select
                value={filters.propertyType || 'all'}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    propertyType: e.target.value === 'all' ? undefined : (e.target.value as PropertyType),
                  })
                }
                className="appearance-none bg-stone-100/70 border border-stone-200 text-stone-700 text-xs font-semibold rounded-full px-3.5 py-2 focus:outline-none cursor-pointer hover:bg-stone-100 transition-colors"
              >
                <option value="all">Tous types de bien</option>
                <option value="villa">Villas & Maisons</option>
                <option value="apartment">Appartements</option>
                <option value="studio">Studios</option>
                <option value="commercial">Commerces</option>
                <option value="land">Terrains</option>
              </select>
            </div>

            {/* Actions group: Filter button + Search pill button */}
            <div className="flex items-center gap-2 justify-end shrink-0 pt-1 sm:pt-0">
              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-full text-xs font-medium flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 active:scale-95 ${
                  isFiltersOpen
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200'
                }`}
                title="Filtres détaillés"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Primary Golden Hour Vibrant Search Button */}
              <button
                type="button"
                onClick={onSearchSubmit}
                className="flex-1 sm:flex-initial px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-md shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>

          {/* Quick Destination Tags */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
            <span className="text-[11px] font-semibold text-stone-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Populaires :
            </span>
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => handleQuickDestination(dest)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 border active:scale-95 ${
                  searchTerm.toLowerCase() === dest.toLowerCase()
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-xs'
                    : 'bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 border-stone-200 shadow-2xs'
                }`}
              >
                {dest}
              </button>
            ))}
          </div>

          {/* Expandable Advanced Filters Panel */}
          {isFiltersOpen && (
            <div className="mt-4 bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-stone-200/90 text-stone-800 animate-in fade-in slide-in-from-top-3 duration-200">
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

