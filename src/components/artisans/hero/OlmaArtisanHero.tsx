import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArtisanTrade } from '../../../types/artisan';
import { OlmaArtisanSearchBar } from './OlmaArtisanSearchBar';
import { OlmaArtisanFilterModal, ArtisanFilterOptions } from '../filters/OlmaArtisanFilterModal';
import { LocationSuggestionsPopup } from '../../OlmaImmo/LocationSuggestionsPopup';
import { searchAlgerianLocations, LocationSearchResult } from '../../../data/algerianCommunesDatabase';
import { requestUserAlgerianWilaya } from '../../../utils/realEstateGeolocation';

interface OlmaArtisanHeroProps {
  trades: ArtisanTrade[];
  filters: ArtisanFilterOptions;
  onFilterChange: (newFilters: ArtisanFilterOptions) => void;
  onSearchSubmit: () => void;
}

export const OlmaArtisanHero: React.FC<OlmaArtisanHeroProps> = ({
  trades,
  filters,
  onFilterChange,
  onSearchSubmit,
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [whereTerm, setWhereTerm] = useState(
    filters.commune
      ? `${filters.commune} (${filters.wilaya || ''})`
      : filters.wilaya || ''
  );
  const [whatTerm, setWhatTerm] = useState(filters.q || '');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal terms when external filters change
  useEffect(() => {
    setWhatTerm(filters.q || '');
  }, [filters.q]);

  useEffect(() => {
    setWhereTerm(
      filters.commune
        ? `${filters.commune} (${filters.wilaya || ''})`
        : filters.wilaya || ''
    );
  }, [filters.wilaya, filters.commune]);

  // Click outside to close location suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWhatChange = (val: string) => {
    setWhatTerm(val);
    onFilterChange({ ...filters, q: val.trim() || undefined });
  };

  const handleWhereChange = (val: string) => {
    setWhereTerm(val);
    if (val.trim().length >= 2) {
      const results = searchAlgerianLocations(val.trim(), 8);
      setSuggestions(results);
      setIsSuggestionsOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSelectSuggestion = (item: LocationSearchResult) => {
    const label = item.label;
    setWhereTerm(label);
    setIsSuggestionsOpen(false);
    onFilterChange({
      ...filters,
      wilaya: typeof item.wilaya === 'string' ? item.wilaya : (item.wilaya as { name?: string })?.name || '',
      commune: item.commune || undefined,
    });
    setTimeout(() => onSearchSubmit(), 50);
  };

  const handleQuickLocate = () => {
    setIsLocating(true);
    requestUserAlgerianWilaya(
      (result) => {
        setIsLocating(false);
        const label = result.commune
          ? `${result.commune} (${result.wilaya.name})`
          : result.wilaya.name;
        setWhereTerm(label);
        onFilterChange({
          ...filters,
          wilaya: result.wilaya.name,
          commune: result.commune || undefined,
        });
        toast.success(`Position détectée : ${label}`);
        setTimeout(() => onSearchSubmit(), 50);
      },
      (errMsg) => {
        setIsLocating(false);
        toast.error(errMsg);
      },
      () => setIsLocating(false)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSuggestionsOpen(false);
      if (whereTerm.trim().length >= 2) {
        const matches = searchAlgerianLocations(whereTerm.trim(), 1);
        if (matches.length > 0) {
          handleSelectSuggestion(matches[0]);
          return;
        }
      }
      onSearchSubmit();
    }
  };

  return (
    <div className="w-full bg-white pt-2 sm:pt-3 pb-3 sm:pb-4 relative z-30 border-b border-slate-100/80">
      <div className="max-w-xl mx-auto px-4 sm:px-6 relative" ref={containerRef}>
        <OlmaArtisanSearchBar
          whatTerm={whatTerm}
          whereTerm={whereTerm}
          isLocating={isLocating}
          onWhatChange={handleWhatChange}
          onWhatClear={() => {
            setWhatTerm('');
            onFilterChange({ ...filters, q: undefined });
          }}
          onWhereChange={handleWhereChange}
          onWhereClear={() => {
            setWhereTerm('');
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            onFilterChange({ ...filters, wilaya: undefined, commune: undefined });
          }}
          onQuickLocate={handleQuickLocate}
          onOpenFilters={() => setIsFilterModalOpen(true)}
          onKeyDown={handleKeyDown}
          onWhereFocus={(results) => {
            setSuggestions(results);
            setIsSuggestionsOpen(results.length > 0);
          }}
        />

        {/* Dynamic Location Auto-Suggestions Popup */}
        {isSuggestionsOpen && (
          <LocationSuggestionsPopup
            suggestions={suggestions}
            onSelect={handleSelectSuggestion}
          />
        )}

        {/* Filter Modal */}
        <OlmaArtisanFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          trades={trades}
          filters={filters}
          onApplyFilters={(newFilters) => {
            onFilterChange(newFilters);
            setTimeout(() => onSearchSubmit(), 50);
          }}
          onResetFilters={() => {
            onFilterChange({});
            setWhatTerm('');
            setWhereTerm('');
            setTimeout(() => onSearchSubmit(), 50);
          }}
        />
      </div>
    </div>
  );
};
