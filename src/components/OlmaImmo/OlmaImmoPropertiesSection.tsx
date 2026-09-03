import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { InteractiveMap } from './InteractiveMap';
import { PropertyMapDeck } from './PropertyMapDeck';
import { Sparkles, Map as MapIcon, LayoutGrid, Columns2, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface OlmaImmoPropertiesSectionProps {
  properties: Property[];
  mapResults: PropertyMapResult[];
  selectedPropertyId?: string;
  onSelectProperty: (id: string) => void;
  viewMode: 'split' | 'grid' | 'list' | 'map';
  onViewModeChange?: (mode: 'split' | 'grid' | 'list' | 'map') => void;
  isLoading: boolean;
  cardRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  onBoundsChange: (bbox: string | null) => void;
  onResetFilters: () => void;
}

export const OlmaImmoPropertiesSection: React.FC<OlmaImmoPropertiesSectionProps> = ({
  properties,
  mapResults,
  selectedPropertyId,
  onSelectProperty,
  viewMode = 'split',
  onViewModeChange,
  isLoading,
  cardRefs,
  onBoundsChange,
  onResetFilters,
}) => {
  const [internalMode, setInternalMode] = useState<'split' | 'grid' | 'map'>('split');
  const activeView = (onViewModeChange ? (viewMode === 'list' ? 'grid' : viewMode) : internalMode) as 'split' | 'grid' | 'map';
  const [showBottomDeck, setShowBottomDeck] = useState(true);

  const handleModeChange = (mode: 'split' | 'grid' | 'map') => {
    setInternalMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const toggleMapOrList = () => {
    if (activeView === 'map') {
      handleModeChange('grid');
    } else {
      handleModeChange('map');
    }
  };

  if (isLoading) {
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

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E6E0D4] shadow-[0_4px_24px_rgba(26,56,49,0.04)] space-y-4 my-6 flex flex-col items-center">
        <div className="w-14 h-14 bg-[#0D281E] text-[#EBDCB8] rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-xl font-extrabold text-[#0D281E] font-['Playfair_Display',serif]">Aucune annonce trouvée</h3>
          <p className="text-stone-500 text-sm">Aucun bien ne correspond à vos critères de recherche actuels.</p>
          <p className="text-stone-400 text-xs">Ajustez vos critères ou réinitialisez les filtres pour découvrir nos annonces vérifiées.</p>
        </div>
        <button onClick={onResetFilters} className="mt-2 px-6 py-2.5 bg-[#0D281E] hover:bg-[#153e31] text-[#EBDCB8] rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Réinitialiser les filtres</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 relative">
      {/* Top Section Toolbar: Results Count + Modern Segmented Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-extrabold text-[#0D281E]">
            {properties.length} {properties.length > 1 ? 'biens disponibles' : 'bien disponible'}
          </span>
          <span className="text-xs text-stone-400 font-medium">en Algérie</span>
        </div>

        {/* Segmented View Mode Toggle */}
        <div className="flex items-center p-1 bg-stone-100 rounded-full border border-stone-200/80 shadow-2xs">
          <button type="button" onClick={() => handleModeChange('grid')} className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeView === 'grid' ? 'bg-white text-[#0D281E] shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grille</span>
          </button>
          <button type="button" onClick={() => handleModeChange('map')} className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeView === 'map' ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}>
            <MapIcon className="w-3.5 h-3.5" />
            <span>Carte</span>
          </button>
          <button type="button" onClick={() => handleModeChange('split')} className={`hidden lg:flex px-3.5 py-1.5 rounded-full text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${activeView === 'split' ? 'bg-white text-[#0D281E] shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}>
            <Columns2 className="w-3.5 h-3.5" />
            <span>Mixte</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FULL MAP MODE (With freedom toggle & smooth bottom carousel) */}
      {activeView === 'map' && (
        <div className="w-full h-[calc(100vh-200px)] min-h-[560px] rounded-3xl overflow-hidden shadow-lg border border-[#DDD6C8] relative bg-[#F5EFE6] animate-in fade-in duration-300 flex flex-col">
          {/* Quick Map Controls Header */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowBottomDeck(!showBottomDeck)}
              className="px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#0D281E] text-xs font-bold shadow-md border border-stone-200 hover:bg-stone-50 flex items-center gap-1.5 transition cursor-pointer"
            >
              {showBottomDeck ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                  <span>Carte 100% libre</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Afficher les {properties.length} annonces</span>
                </>
              )}
            </button>
          </div>

          <div className="w-full h-full relative">
            <InteractiveMap
              properties={mapResults.length > 0 ? mapResults : properties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={onSelectProperty}
              onBoundsChange={onBoundsChange}
              showFilters={true}
              showPreviewCard={!showBottomDeck} // Use floating preview card only when bottom deck is hidden
              className="w-full h-full"
            />
          </div>

          {/* Bottom Floating Property Carousel */}
          <PropertyMapDeck
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={onSelectProperty}
            show={showBottomDeck}
          />
        </div>
      )}

      {/* VIEW 2: SPLIT VIEW (Desktop: 7 cols grid + 5 cols sticky map | Mobile: grid) */}
      {activeView === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {properties.map((p) => {
              const isSelected = selectedPropertyId === p.id;
              return (
                <div
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[p.id] = el;
                  }}
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

          {/* Sticky Desktop Map */}
          <div className="lg:col-span-5 hidden lg:block sticky top-24 h-[calc(100vh-140px)] min-h-[540px]">
            <InteractiveMap
              properties={mapResults.length > 0 ? mapResults : properties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={onSelectProperty}
              onBoundsChange={onBoundsChange}
              className="w-full h-full rounded-3xl overflow-hidden shadow-md border border-[#DDD6C8]"
            />
          </div>
        </div>
      )}

      {/* VIEW 3: PURE GRID VIEW */}
      {activeView === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <div key={p.id} ref={(el) => { cardRefs.current[p.id] = el; }}>
              <PropertyCard property={p} />
            </div>
          ))}
        </div>
      )}

      {/* FLOATING ACTION PILL BUTTON (Mobile & Desktop 1-Click Map/List Switcher) */}
      <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMapOrList}
          className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0D281E] text-[#EBDCB8] font-bold text-xs sm:text-sm shadow-[0_12px_32px_rgba(13,40,30,0.35)] border border-[#EBDCB8]/30 hover:bg-[#153e31] transition-all cursor-pointer backdrop-blur-md"
        >
          {activeView === 'map' ? (
            <>
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span>Afficher la liste ({properties.length})</span>
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span>Afficher la carte ({properties.length})</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

