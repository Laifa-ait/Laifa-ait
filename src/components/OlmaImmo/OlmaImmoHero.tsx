import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, X, Compass } from 'lucide-react';
import { PropertyType, ListingType } from '../../types/realEstate';
import { FilterState } from './SearchFilters';
import { HeroPopularDestinations } from './HeroPopularDestinations';
import { HeroListingTabs } from './HeroListingTabs';
import { OlmaImmoFilterModal } from './filters/OlmaImmoFilterModal';

interface OlmaImmoHeroProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onSearchSubmit: () => void;
}

const POPULAR_DESTINATIONS = [
  'Alger',
  'Oran',
  'Constantine',
  'Annaba',
  'Béjaïa',
  'Tipaza',
  'Tlemcen',
  'Ghardaïa',
];

export const OlmaImmoHero: React.FC<OlmaImmoHeroProps> = ({
  filters,
  onFilterChange,
  onSearchSubmit,
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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

  const handleListingTypeSelect = (type?: ListingType) => {
    onFilterChange({
      ...filters,
      listingType: type,
    });
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
    filters.hasActeNotarie,
    filters.hasLivretFoncier,
    filters.legalPaperType,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 pb-2">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-white to-[#FAF6F0] p-5 sm:p-8 md:p-10 border border-[#E6E0D4] shadow-[0_8px_32px_rgba(13,40,30,0.04)]">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D281E] text-[#EBDCB8] text-xs font-bold shadow-sm border border-[#EBDCB8]/20">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Le Premier Marché Immobilier d'Algérie</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0D281E] font-['Playfair_Display',serif]">
            Trouvez votre prochain <span className="text-amber-700 underline decoration-amber-400/40 decoration-wavy">chez-vous</span> en Algérie
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-lg mx-auto leading-relaxed">
            Villas d'exception, appartements avec acte notarié & livret foncier, séjours de vacances vérifiés sur 58 wilayas.
          </p>
        </div>

        {/* Listing Type Switcher Tabs Component */}
        <HeroListingTabs
          activeType={filters.listingType}
          onSelectType={handleListingTypeSelect}
        />

        {/* Floating Capsule Search Bar */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="bg-white rounded-2xl sm:rounded-full p-2 sm:p-2.5 ps-4 sm:ps-6 border border-[#E6E0D4] shadow-[0_10px_30px_rgba(13,40,30,0.08)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 transition-all duration-200 focus-within:ring-3 focus-within:ring-[#0D281E]/20 focus-within:border-[#0D281E]">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] text-amber-700 flex items-center justify-center shrink-0 border border-[#EDE7DC]">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="hidden sm:block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider leading-none">
                  Localisation
                </label>
                <input
                  type="text"
                  placeholder="Wilaya, commune (ex: Alger, Oran, Hydra)..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-xs sm:text-sm font-semibold text-[#0D281E] placeholder:text-stone-400 focus:outline-none bg-transparent"
                />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    onFilterChange({ ...filters, wilaya: undefined, commune: undefined });
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer bg-transparent border-none shrink-0"
                  title="Effacer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="hidden sm:block w-px h-8 bg-stone-200" />

            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <select
                value={filters.propertyType || 'all'}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    propertyType: e.target.value === 'all' ? undefined : (e.target.value as PropertyType),
                  })
                }
                className="appearance-none bg-[#FAF8F5] border border-[#E6E0D4] text-[#0D281E] text-xs font-bold rounded-full px-4 py-2.5 focus:outline-none cursor-pointer hover:bg-stone-100 transition-colors"
              >
                <option value="all">Tous types</option>
                <option value="villa">Villas & Maisons</option>
                <option value="apartment">Appartements</option>
                <option value="studio">Studios & Lofts</option>
                <option value="commercial">Commerces</option>
                <option value="land">Terrains</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-end shrink-0 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`px-3 py-2.5 rounded-xl sm:rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 shrink-0 active:scale-95 ${
                  activeFiltersCount > 0
                    ? 'bg-[#0D281E] text-[#EBDCB8] shadow-md border border-[#EBDCB8]/30'
                    : 'bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border border-[#E6E0D4]'
                }`}
                title="Filtres avancés"
                aria-label="Ouvrir les filtres avancés"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-[#0D281E] text-[10px] font-extrabold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onSearchSubmit}
                className="flex-1 sm:flex-initial px-6 py-3 bg-[#0D281E] hover:bg-[#153e31] text-[#EBDCB8] font-bold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-[0_4px_16px_rgba(13,40,30,0.25)] hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#EBDCB8]/20"
              >
                <Search className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>

          <HeroPopularDestinations
            destinations={POPULAR_DESTINATIONS}
            activeDestination={searchTerm}
            onSelectDestination={handleQuickDestination}
          />

          <OlmaImmoFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            filters={filters}
            onApplyFilters={(newFilters) => {
              onFilterChange(newFilters);
              setTimeout(() => onSearchSubmit(), 50);
            }}
            onResetFilters={() => {
              onFilterChange({ sort: 'recent' });
              setTimeout(() => onSearchSubmit(), 50);
            }}
          />
        </div>
      </div>
    </div>
  );
};
