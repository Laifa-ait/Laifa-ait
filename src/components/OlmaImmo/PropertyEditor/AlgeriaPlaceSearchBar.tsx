import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Compass, Building2, Flag } from 'lucide-react';
import {
  AlgeriaPlaceResult,
  searchLocalAlgerianPlaces,
  searchOnlineAlgerianPlaces,
} from '../../../services/algeriaPlaceSearch';

interface AlgeriaPlaceSearchBarProps {
  onSelectPlace: (place: AlgeriaPlaceResult) => void;
  preferredWilaya?: string;
  className?: string;
  placeholder?: string;
}

export const AlgeriaPlaceSearchBar: React.FC<AlgeriaPlaceSearchBarProps> = ({
  onSelectPlace,
  preferredWilaya,
  className = '',
  placeholder = 'Rechercher un quartier, cité ou repère (ex: Bouchaoui, Hydra, Akid Lotfi, Didouche...)',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlgeriaPlaceResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [lastSelected, setLastSelected] = useState<AlgeriaPlaceResult | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic with instant local match + debounced online OpenStreetMap
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // 1. Instant local Algerian database search (< 2ms)
    const local = searchLocalAlgerianPlaces(trimmed, preferredWilaya);
    setResults(local);
    setIsOpen(true);

    // 2. Debounced online search if query >= 3 chars
    if (trimmed.length >= 3) {
      const controller = new AbortController();
      setIsSearchingOnline(true);
      const timer = setTimeout(async () => {
        const online = await searchOnlineAlgerianPlaces(trimmed, controller.signal);
        setIsSearchingOnline(false);
        if (online.length > 0) {
          setResults((prev) => {
            const existingIds = new Set(prev.map((r) => `${r.name.toLowerCase()}-${r.wilaya.toLowerCase()}`));
            const filteredOnline = online.filter(
              (o) => !existingIds.has(`${o.name.toLowerCase()}-${o.wilaya.toLowerCase()}`)
            );
            return [...prev, ...filteredOnline].slice(0, 10);
          });
        }
      }, 350);

      return () => {
        clearTimeout(timer);
        controller.abort();
        setIsSearchingOnline(false);
      };
    }
  }, [query, preferredWilaya]);

  const handleSelect = (place: AlgeriaPlaceResult) => {
    setLastSelected(place);
    setQuery(place.name);
    setIsOpen(false);
    onSelectPlace(place);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setLastSelected(null);
  };

  const renderBadge = (category: AlgeriaPlaceResult['category']) => {
    switch (category) {
      case 'quartier':
        return (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Quartier / Cité
          </span>
        );
      case 'landmark':
        return (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Repère
          </span>
        );
      case 'commune':
        return (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Commune
          </span>
        );
      case 'wilaya':
        return (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            Wilaya
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">
            Lieu
          </span>
        );
    }
  };

  const renderIcon = (category: AlgeriaPlaceResult['category']) => {
    if (category === 'commune') return <Building2 className="w-4 h-4 text-blue-600 shrink-0" />;
    if (category === 'wilaya') return <Flag className="w-4 h-4 text-amber-600 shrink-0" />;
    if (category === 'landmark') return <Compass className="w-4 h-4 text-purple-600 shrink-0" />;
    return <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-emerald-700">
          {isSearchingOnline ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <Search className="w-4 h-4 text-stone-500" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white text-stone-900 text-xs font-semibold placeholder:text-stone-400 pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all min-h-[42px]"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
            title="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected location reassurance message */}
      {lastSelected && !isOpen && (
        <div className="mt-1.5 flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium animate-fadeIn">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              Centré sur <strong>{lastSelected.name}</strong> ({lastSelected.wilaya})
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 shrink-0 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">
            Carte libre au glissement
          </span>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden max-h-72 overflow-y-auto divide-y divide-stone-100">
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-600 font-bold">
            <span>Lieux trouvés ({results.length})</span>
            <span className="text-[10px] text-stone-400 font-normal">Algérie</span>
          </div>

          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-stone-100 group-hover:bg-emerald-100/60 transition-colors">
                {renderIcon(place.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-950 truncate">
                      {place.name}
                    </span>
                    {place.name_ar && (
                      <span className="text-[11px] font-medium text-stone-400 font-arabic truncate" dir="rtl">
                        {place.name_ar}
                      </span>
                    )}
                  </div>
                  {renderBadge(place.category)}
                </div>

                <p className="text-[11px] text-stone-600 truncate mt-0.5">
                  {place.description || `${place.commune ? `${place.commune}, ` : ''}${place.wilaya}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
