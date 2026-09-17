import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PropertyType } from '../../types/realEstate';
import { FilterState } from './SearchFilters';
import { OlmaImmoFilterModal } from './filters/OlmaImmoFilterModal';
import { searchAlgerianLocations, LocationSearchResult } from '../../data/algerianCommunesDatabase';
import { requestUserAlgerianWilaya } from '../../utils/realEstateGeolocation';
import { ALGERIA_WILAYAS } from '../../constants/wilayas';
import { LocationSuggestionsPopup } from './LocationSuggestionsPopup';
import { OlmaImmoSearchBar } from './OlmaImmoSearchBar';

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [whereTerm, setWhereTerm] = useState(
    filters.commune
      ? `${filters.commune} (${filters.wilaya || ''})`
      : filters.daira
      ? `${filters.daira} (Daïra, ${filters.wilaya || ''})`
      : filters.wilaya || ''
  );
  const [whatTerm, setWhatTerm] = useState(
    filters.propertyType
      ? filters.propertyType === 'villa'
        ? 'Villas'
        : filters.propertyType === 'apartment'
        ? 'Appartements'
        : filters.propertyType
      : ''
  );

  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filters.commune && filters.wilaya) {
      setWhereTerm(`${filters.commune} (${filters.wilaya})`);
    } else if (filters.daira && filters.wilaya) {
      setWhereTerm(`${filters.daira} (${filters.wilaya})`);
    } else if (filters.wilaya) {
      setWhereTerm(filters.wilaya);
    } else if (!filters.wilaya && !filters.commune && !filters.daira) {
      setWhereTerm('');
    }
  }, [filters.wilaya, filters.commune, filters.daira]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWhereChange = (val: string) => {
    setWhereTerm(val);
    const matchedWilaya = ALGERIA_WILAYAS.find(
      (w) => w.name.toLowerCase() === val.trim().toLowerCase()
    );
    if (matchedWilaya) {
      onFilterChange({
        ...filters,
        wilaya: matchedWilaya.name,
        daira: undefined,
        commune: undefined,
      });
    }
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
    setWhereTerm(item.label);
    setIsSuggestionsOpen(false);

    if (item.type === 'commune') {
      onFilterChange({
        ...filters,
        wilaya: item.wilaya,
        daira: item.daira || undefined,
        commune: item.commune,
      });
    } else if (item.type === 'daira') {
      onFilterChange({
        ...filters,
        wilaya: item.wilaya,
        daira: item.daira,
        commune: undefined,
      });
    } else {
      onFilterChange({
        ...filters,
        wilaya: item.wilaya,
        daira: undefined,
        commune: undefined,
      });
    }

    setTimeout(() => onSearchSubmit(), 60);
  };

  const handleWhatChange = (val: string) => {
    setWhatTerm(val);
    const lower = val.toLowerCase().trim();
    let pType: PropertyType | undefined = undefined;
    if (lower.includes('villa') || lower.includes('maison')) pType = 'villa';
    else if (lower.includes('appart')) pType = 'apartment';
    else if (lower.includes('studio') || lower.includes('loft')) pType = 'studio';
    else if (lower.includes('terrain')) pType = 'land';
    else if (lower.includes('comm')) pType = 'commercial';
    onFilterChange({ ...filters, propertyType: pType });
  };

  const handleQuickLocate = () => {
    setIsLocating(true);
    requestUserAlgerianWilaya(
      (result) => {
        setIsLocating(false);
        const locationLabel = result.commune
          ? `${result.commune} (${result.wilaya.name})`
          : result.wilaya.name;
        setWhereTerm(locationLabel);
        onFilterChange({
          ...filters,
          wilaya: result.wilaya.name,
          daira: result.daira || undefined,
          commune: result.commune || undefined,
        });
        toast.success(`Position détectée : ${locationLabel}`);
        setTimeout(() => onSearchSubmit(), 60);
      },
      (errMsg) => {
        setIsLocating(false);
        toast.error(errMsg);
      },
      () => {
        setIsLocating(false);
      }
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
    <div className="w-full bg-white pt-2 sm:pt-3 pb-3 sm:pb-4 relative z-30">
      <div className="max-w-xl mx-auto px-4 sm:px-6 relative" ref={suggestionsContainerRef}>
        <OlmaImmoSearchBar
          whatTerm={whatTerm}
          whereTerm={whereTerm}
          isLocating={isLocating}
          onWhatChange={handleWhatChange}
          onWhatClear={() => {
            setWhatTerm('');
            onFilterChange({ ...filters, propertyType: undefined });
          }}
          onWhereChange={handleWhereChange}
          onWhereClear={() => {
            setWhereTerm('');
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            onFilterChange({
              ...filters,
              wilaya: undefined,
              daira: undefined,
              commune: undefined,
            });
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
            setWhatTerm('');
            setWhereTerm('');
            setTimeout(() => onSearchSubmit(), 50);
          }}
        />
      </div>
    </div>
  );
};
