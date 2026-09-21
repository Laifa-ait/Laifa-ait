import React from 'react';
import { SlidersHorizontal, X, LocateFixed, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocationSearchResult, searchAlgerianLocations } from '../../../data/algerianCommunesDatabase';
import { ALGERIA_WILAYAS } from '../../../constants/wilayas';

interface OlmaArtisanSearchBarProps {
  whatTerm: string;
  whereTerm: string;
  isLocating: boolean;
  onWhatChange: (val: string) => void;
  onWhatClear: () => void;
  onWhereChange: (val: string) => void;
  onWhereClear: () => void;
  onQuickLocate: () => void;
  onOpenFilters: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onWhereFocus: (results: LocationSearchResult[]) => void;
}

export const OlmaArtisanSearchBar: React.FC<OlmaArtisanSearchBarProps> = ({
  whatTerm,
  whereTerm,
  isLocating,
  onWhatChange,
  onWhatClear,
  onWhereChange,
  onWhereClear,
  onQuickLocate,
  onOpenFilters,
  onKeyDown,
  onWhereFocus,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-full px-4 sm:px-5 py-2.5 sm:py-3 border border-slate-200/70 shadow-[0_8px_24px_-4px_rgba(100,116,139,0.12),0_2px_6px_-1px_rgba(100,116,139,0.04)] flex items-center justify-between gap-2.5 transition-all duration-200 focus-within:border-slate-300 focus-within:shadow-[0_12px_28px_-4px_rgba(100,116,139,0.16)]">
      {/* Left: Quoi ? Métier ou Spécialité */}
      <div className="flex-1 min-w-0 flex items-center">
        <input
          type="text"
          placeholder={t('search_what_artisan_placeholder', 'Quoi ? (Plombier, Électricien, Peintre...)')}
          value={whatTerm}
          onChange={(e) => onWhatChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full text-xs sm:text-sm font-normal text-[#1E293B] placeholder:text-[#64748B] focus:outline-none bg-transparent"
          aria-label={t('search_what_artisan_placeholder', 'Métier ou service d\'artisanat recherché')}
        />
        {whatTerm && (
          <button
            type="button"
            onClick={onWhatClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
            title={t('search_clear', 'Effacer le métier')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-slate-200 shrink-0 mx-1" aria-hidden="true" />

      {/* Right: Où ? Wilaya ou Commune */}
      <div className="flex-1 min-w-0 flex items-center relative">
        <input
          type="text"
          placeholder={t('search_where_placeholder', 'Où ? (Wilaya, Commune...)')}
          list="artisan-algeria-wilayas"
          value={whereTerm}
          onChange={(e) => onWhereChange(e.target.value)}
          onFocus={() => {
            if (whereTerm.trim().length >= 2) {
              const results = searchAlgerianLocations(whereTerm.trim(), 8);
              onWhereFocus(results);
            }
          }}
          onKeyDown={onKeyDown}
          className="w-full text-xs sm:text-sm font-normal text-[#1E293B] placeholder:text-[#64748B] focus:outline-none bg-transparent"
          aria-label={t('search_where_placeholder', 'Localisation souhaitée pour l\'intervention')}
        />
        <datalist id="artisan-algeria-wilayas">
          {ALGERIA_WILAYAS.map((w) => (
            <option key={w.code} value={w.name}>
              {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ''}
            </option>
          ))}
        </datalist>

        {whereTerm ? (
          <button
            type="button"
            onClick={onWhereClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
            title={t('search_clear', 'Effacer la localisation')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onQuickLocate}
            disabled={isLocating}
            className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-full cursor-pointer shrink-0 transition-colors"
            title={t('search_geolocate_title', 'Détecter ma position en Algérie')}
            aria-label={t('search_geolocate_title', 'Détecter ma position en Algérie')}
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#64748B]" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Far Right: Filter Sliders Icon Button */}
      <button
        type="button"
        onClick={onOpenFilters}
        className="p-1.5 sm:p-2 -mr-1 rounded-full text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100/70 transition-colors cursor-pointer shrink-0"
        title={t('search_filters_button', 'Filtres avancés')}
        aria-label={t('search_filters_button', 'Ouvrir les filtres avancés')}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#64748B]" />
      </button>
    </div>
  );
};
