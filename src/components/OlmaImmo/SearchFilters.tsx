import React, { useState } from 'react';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  daira?: string;
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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar' || i18n.language?.startsWith('ar');
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
    filters.daira,
    filters.commune,
    filters.minPrice,
    filters.maxPrice,
    filters.minRooms,
    filters.minArea,
  ].filter(Boolean).length;

  const handleRemoveSingleFilter = (key: keyof FilterState) => {
    const next = { ...filters };
    delete next[key];
    if (key === 'wilaya') {
      delete next.daira;
      delete next.commune;
    }
    if (key === 'daira') {
      delete next.commune;
    }
    onChange(next);
  };

  const listingTypes = [
    { type: undefined, label: isAr ? 'جميع العقارات' : t('immo_filter_all_properties', 'Tous les biens') },
    { type: 'sale' as ListingType, label: isAr ? 'شراء' : t('immo_filter_buy', 'Acheter') },
    { type: 'rent_long' as ListingType, label: isAr ? 'كراء' : t('immo_filter_rent', 'Louer') },
    { type: 'rent_short' as ListingType, label: isAr ? 'إقامات' : t('immo_filter_stays', 'Séjours') },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
      {/* Top Row: Listing Type Tabs & Map Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center bg-slate-50 p-1 rounded-2xl gap-1 shrink-0 border border-slate-200">
          {listingTypes.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleListingTypeChange(item.type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                filters.listingType === item.type
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span>{isMapExpanded ? (isAr ? 'إخفاء الخريطة' : t('hide_map', 'Masquer la carte')) : (isAr ? 'الخريطة' : t('map', 'Carte'))}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isAr ? 'الفلاتر' : t('filter_filters', 'Filtres')}</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-slate-900 text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Filter Row: Wilaya / Daira / Commune Selects + Property Type */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-8">
          <LocationFilterSelects
            wilaya={filters.wilaya}
            daira={filters.daira}
            commune={filters.commune}
            onWilayaChange={(w) => onChange({ ...filters, wilaya: w, daira: undefined, commune: undefined })}
            onDairaChange={(d) => onChange({ ...filters, daira: d, commune: undefined })}
            onCommuneChange={(c) => onChange({ ...filters, commune: c })}
            size="sm"
            idPrefix="search-filters"
          />
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-2">
          <select
            value={filters.propertyType || 'all'}
            onChange={handlePropertyTypeChange}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
          >
            <option value="all">{isAr ? 'كل الأنواع' : t('immo_filter_all_types', 'Tous types')}</option>
            <option value="apartment">{t('immo_type_apartment', 'Appartement')}</option>
            <option value="villa">{t('immo_type_villa', 'Villa')}</option>
            <option value="house">{t('immo_type_house', 'Maison')}</option>
            <option value="studio">{t('immo_type_studio', 'Studio')}</option>
            <option value="commercial">{t('immo_type_commercial', 'Local comm.')}</option>
            <option value="land">{t('immo_type_land', 'Terrain')}</option>
            <option value="office">{t('immo_type_office', 'Bureau')}</option>
          </select>

          <select
            value={filters.sort || 'recent'}
            onChange={handleSortChange}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
          >
            <option value="recent">{t('immo_filter_sort_recent', 'Plus récents')}</option>
            <option value="price_asc">{t('immo_filter_sort_price_asc', 'Prix croissant')}</option>
            <option value="price_desc">{t('immo_filter_sort_price_desc', 'Prix décroissant')}</option>
            <option value="popularity">{t('immo_filter_sort_popularity', 'Popularité')}</option>
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
