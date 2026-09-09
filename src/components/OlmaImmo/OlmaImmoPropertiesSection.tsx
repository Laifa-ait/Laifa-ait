import React, { useState } from 'react';
import { PublicPropertyDTO, PropertyMapResult } from '../../types/realEstate';
import { FilterState } from './SearchFilters';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { InteractiveMap } from './InteractiveMap';
import { PropertyMapDeck } from './PropertyMapDeck';
import { OlmaImmoEmptyState } from './OlmaImmoEmptyState';
import { OlmaImmoFloatingToggle } from './OlmaImmoFloatingToggle';
import { Map as MapIcon, LayoutGrid, Columns2, RefreshCw, Eye, EyeOff } from 'lucide-react';

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
}) => {
  const [internalMode, setInternalMode] = useState<'split' | 'grid' | 'map'>('split');
  const activeView = (onViewModeChange ? (viewMode === 'list' ? 'grid' : viewMode) : internalMode) as 'split' | 'grid' | 'map';
  const [showBottomDeck, setShowBottomDeck] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | undefined>(undefined);

  const handleModeChange = (mode: 'split' | 'grid' | 'map') => {
    setInternalMode(mode);
    if (onViewModeChange) onViewModeChange(mode);
  };

  if (isLoading && activeView === 'grid') {
    return (
      <div className="space-y-6 my-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-stone-200 rounded-xl w-48 animate-pulse" />
          <div className="h-9 bg-stone-200 rounded-full w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (properties.length === 0 && !isLoading && !isSearchingMap && (activeView === 'grid' || activeView === 'split')) {
    return <OlmaImmoEmptyState filters={filters} onResetFilters={onResetFilters} />;
  }

  return (
    <div className="space-y-5 relative">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-extrabold text-[#0D281E]">
            {properties.length} {properties.length > 1 ? 'biens disponibles' : 'bien disponible'}
          </span>
          <span className="text-xs text-stone-400 font-medium">en Algérie</span>
        </div>

        <div className="flex items-center p-1 bg-stone-100 rounded-full border border-stone-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => handleModeChange('grid')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'grid' ? 'bg-white text-[#0D281E] shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grille</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('map')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'map' ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Carte</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('split')}
            className={`hidden lg:flex px-3.5 py-1.5 rounded-full text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
              activeView === 'split' ? 'bg-white text-[#0D281E] shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Mixte</span>
          </button>
        </div>
      </div>

      {activeView === 'map' && (
        <div className="w-full h-[calc(100vh-200px)] min-h-[560px] rounded-3xl overflow-hidden shadow-lg border border-[#DDD6C8] relative bg-[#F5EFE6] flex flex-col">
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowBottomDeck(!showBottomDeck)}
              className="px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#0D281E] text-xs font-bold shadow-md border border-stone-200 hover:bg-stone-50 flex items-center gap-1.5 transition cursor-pointer"
            >
              {showBottomDeck ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-stone-500" />
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
            <div className="absolute top-4 right-16 z-30 bg-[#0D281E]/95 backdrop-blur-md text-[#EBDCB8] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md border border-[#EBDCB8]/30 flex items-center gap-2 pointer-events-none animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
              <span>Recherche en cours...</span>
            </div>
          )}

          {properties.length === 0 && !isLoading && !isSearchingMap && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#0D281E]/95 text-[#EBDCB8] backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium shadow-xl border border-amber-400/40 flex items-center gap-2.5 pointer-events-auto">
              <span>Aucun bien dans cette zone</span>
              <button
                type="button"
                onClick={onResetFilters}
                className="font-bold underline text-amber-300 hover:text-white transition cursor-pointer"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    isSelected ? 'ring-3 ring-[#0D281E] shadow-xl scale-[1.01]' : 'hover:shadow-md'
                  }`}
                >
                  <PropertyCard property={p} />
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 hidden lg:block sticky top-24 h-[calc(100vh-140px)] min-h-[540px]">
            <InteractiveMap
              properties={mapResults.length > 0 ? mapResults : properties}
              selectedPropertyId={selectedPropertyId}
              highlightPropertyId={hoveredPropertyId}
              onSelectProperty={onSelectProperty}
              onBoundsChange={onBoundsChange}
              className="w-full h-full rounded-3xl overflow-hidden shadow-md border border-[#DDD6C8]"
            />
          </div>
        </div>
      )}

      {activeView === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  isSelected ? 'ring-3 ring-[#0D281E] shadow-xl scale-[1.01]' : 'hover:shadow-md'
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
