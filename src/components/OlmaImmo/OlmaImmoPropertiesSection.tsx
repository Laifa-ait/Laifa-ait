import React, { useState, useEffect, useCallback } from 'react';
import { PublicPropertyDTO, PropertyMapResult } from '../../types/realEstate';
import { FilterState } from './SearchFilters';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { InteractiveMap } from './InteractiveMap';
import { PropertyMapDeck } from './PropertyMapDeck';
import { OlmaImmoEmptyState } from './OlmaImmoEmptyState';
import { OlmaImmoFloatingToggle } from './OlmaImmoFloatingToggle';
import { OlmaDesktopToolbar, DesktopSplitRatio } from './OlmaDesktopToolbar';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

interface OlmaImmoPropertiesSectionProps {
  properties: PublicPropertyDTO[];
  mapResults: PropertyMapResult[];
  selectedPropertyId?: string;
  onSelectProperty: (id: string) => void;
  viewMode: 'split' | 'grid' | 'list' | 'map';
  onViewModeChange?: (mode: 'split' | 'grid' | 'list' | 'map') => void;
  isLoading: boolean;
  isSearchingMap?: boolean;
  cardRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  onBoundsChange: (bbox: string | null) => void;
  onResetFilters: () => void;
  filters?: FilterState;
  onFilterChange?: (newFilters: FilterState) => void;
}

export const OlmaImmoPropertiesSection: React.FC<OlmaImmoPropertiesSectionProps> = ({
  properties,
  mapResults,
  selectedPropertyId,
  onSelectProperty,
  viewMode = 'split',
  onViewModeChange,
  isLoading,
  isSearchingMap = false,
  cardRefs,
  onBoundsChange,
  onResetFilters,
  filters,
  onFilterChange,
}) => {
  const [internalMode, setInternalMode] = useState<'split' | 'grid' | 'map'>('split');
  const activeView = (onViewModeChange ? (viewMode === 'list' ? 'grid' : viewMode) : internalMode) as 'split' | 'grid' | 'map';
  const [splitRatio, setSplitRatio] = useState<DesktopSplitRatio>('balanced');
  const [showBottomDeck, setShowBottomDeck] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | undefined>(undefined);

  const handleModeChange = useCallback(
    (mode: 'split' | 'grid' | 'map') => {
      setInternalMode(mode);
      if (onViewModeChange) onViewModeChange(mode);
    },
    [onViewModeChange]
  );

  // Keyboard navigation shortcuts for PC users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 's' || e.key === 'S') handleModeChange('split');
      if (e.key === 'g' || e.key === 'G') handleModeChange('grid');
      if (e.key === 'm' || e.key === 'M') handleModeChange('map');
      if (e.key === 'Escape') onSelectProperty('');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleModeChange, onSelectProperty]);

  if (isLoading && activeView === 'grid') {
    return (
      <div className="space-y-6 my-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-stone-200 rounded-xl w-48 animate-pulse" />
          <div className="h-9 bg-stone-200 rounded-full w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (properties.length === 0 && !isLoading && !isSearchingMap && (activeView === 'grid' || activeView === 'split')) {
    return <OlmaImmoEmptyState filters={filters} onResetFilters={onResetFilters} />;
  }

  const getSplitFeedColClass = () => {
    if (splitRatio === 'focus-list') {
      return 'lg:col-span-7 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5';
    }
    if (splitRatio === 'focus-map') {
      return 'lg:col-span-5 xl:col-span-4 grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-2 gap-5';
    }
    return 'lg:col-span-6 xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-2 gap-5';
  };

  const getSplitMapColClass = () => {
    if (splitRatio === 'focus-list') {
      return 'lg:col-span-5 xl:col-span-4 hidden lg:block sticky top-20 h-[calc(100vh-110px)] min-h-[580px]';
    }
    if (splitRatio === 'focus-map') {
      return 'lg:col-span-7 xl:col-span-8 hidden lg:block sticky top-20 h-[calc(100vh-110px)] min-h-[580px]';
    }
    return 'lg:col-span-6 xl:col-span-6 hidden lg:block sticky top-20 h-[calc(100vh-110px)] min-h-[580px]';
  };

  return (
    <div className="space-y-4 relative w-full">
      {/* Dedicated Desktop PC Command Toolbar */}
      <OlmaDesktopToolbar
        propertiesCount={properties.length}
        activeView={activeView}
        onViewChange={handleModeChange}
        splitRatio={splitRatio}
        onSplitRatioChange={setSplitRatio}
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {activeView === 'map' && (
        <div className="w-full h-[calc(100vh-180px)] min-h-[580px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative bg-slate-100 flex flex-col">
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowBottomDeck(!showBottomDeck)}
              className="px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#1E3A8A] text-xs font-bold shadow-md border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
            >
              {showBottomDeck ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Carte libre</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Afficher aperçus ({properties.length})</span>
                </>
              )}
            </button>
          </div>

          {isSearchingMap && (
            <div className="absolute top-4 right-16 z-30 bg-[#1E3A8A]/95 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md border border-blue-800/30 flex items-center gap-2 pointer-events-none animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-[#F59E0B]" />
              <span>Recherche en cours...</span>
            </div>
          )}

          {properties.length === 0 && !isLoading && !isSearchingMap && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#1E3A8A]/95 text-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium shadow-xl border border-[#F59E0B]/40 flex items-center gap-2.5 pointer-events-auto">
              <span>Aucun bien dans cette zone</span>
              <button
                type="button"
                onClick={onResetFilters}
                className="font-bold underline text-[#F59E0B] hover:text-amber-200 transition cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>
          )}

          <div className="w-full h-full relative">
            <InteractiveMap
              properties={mapResults.length > 0 ? mapResults : properties}
              selectedPropertyId={selectedPropertyId}
              highlightPropertyId={hoveredPropertyId}
              onSelectProperty={onSelectProperty}
              onBoundsChange={onBoundsChange}
              showFilters={true}
              showPreviewCard={!showBottomDeck}
              className="w-full h-full"
            />
          </div>

          <PropertyMapDeck
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={onSelectProperty}
            show={showBottomDeck}
          />
        </div>
      )}

      {activeView === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
          <div className={getSplitFeedColClass()}>
            {properties.map((p) => {
              const isSelected = selectedPropertyId === p.id;
              return (
                <div
                  key={p.id}
                  ref={(el) => { cardRefs.current[p.id] = el; }}
                  onMouseEnter={() => setHoveredPropertyId(p.id)}
                  onMouseLeave={() => setHoveredPropertyId((c) => (c === p.id ? undefined : c))}
                  onClick={() => onSelectProperty(p.id)}
                  className={`transition-all duration-300 rounded-3xl cursor-pointer ${
                    isSelected ? 'ring-3 ring-[#1E3A8A] shadow-xl scale-[1.01]' : 'hover:shadow-md'
                  }`}
                >
                  <PropertyCard property={p} />
                </div>
              );
            })}
          </div>

          <div className={getSplitMapColClass()}>
            <InteractiveMap
              properties={mapResults.length > 0 ? mapResults : properties}
              selectedPropertyId={selectedPropertyId}
              highlightPropertyId={hoveredPropertyId}
              onSelectProperty={onSelectProperty}
              onBoundsChange={onBoundsChange}
              className="w-full h-full rounded-3xl overflow-hidden shadow-md border border-slate-200"
            />
          </div>
        </div>
      )}

      {activeView === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 w-full">
          {properties.map((p) => {
            const isSelected = selectedPropertyId === p.id;
            return (
              <div
                key={p.id}
                ref={(el) => { cardRefs.current[p.id] = el; }}
                onMouseEnter={() => setHoveredPropertyId(p.id)}
                onMouseLeave={() => setHoveredPropertyId((c) => (c === p.id ? undefined : c))}
                onClick={() => onSelectProperty(p.id)}
                className={`transition-all duration-300 rounded-3xl cursor-pointer ${
                  isSelected ? 'ring-3 ring-[#1E3A8A] shadow-xl scale-[1.01]' : 'hover:shadow-md'
                }`}
              >
                <PropertyCard property={p} />
              </div>
            );
          })}
        </div>
      )}

      <OlmaImmoFloatingToggle
        activeView={activeView}
        showBottomDeck={showBottomDeck}
        totalProperties={properties.length}
        onToggle={() => handleModeChange(activeView === 'map' ? 'grid' : 'map')}
      />
    </div>
  );
};
