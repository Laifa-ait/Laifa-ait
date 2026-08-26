import React from 'react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { InteractiveMap } from './InteractiveMap';
import { Sparkles } from 'lucide-react';

interface OlmaImmoPropertiesSectionProps {
  properties: Property[];
  mapResults: PropertyMapResult[];
  selectedPropertyId?: string;
  onSelectProperty: (id: string) => void;
  viewMode: 'split' | 'list';
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
  viewMode,
  isLoading,
  cardRefs,
  onBoundsChange,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4 my-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-xl font-bold font-['Poppins',sans-serif] text-slate-900">
            Aucun résultat trouvé
          </h3>
          <p className="text-slate-500 text-sm">
            Aucun bien ou séjour ne correspond à vos critères actuels.
          </p>
          <p className="text-slate-400 text-xs">
            Essayez d'élargir votre recherche ou de réinitialiser les filtres.
          </p>
        </div>
        <button
          onClick={onResetFilters}
          className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold transition-all shadow-sm shadow-blue-600/20 cursor-pointer border-none"
        >
          Réinitialiser tous les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Split View (Grid 60% + Sticky Map 40%) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {properties.map((p) => {
              const isSelected = selectedPropertyId === p.id;
              return (
                <div
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[p.id] = el;
                  }}
                  onClick={() => onSelectProperty(p.id)}
                  className={`transition-all duration-300 rounded-2xl cursor-pointer ${
                    isSelected ? 'ring-2 ring-slate-900 shadow-lg scale-[1.01]' : 'hover:shadow-md'
                  }`}
                >
                  <PropertyCard property={p} />
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 hidden lg:block sticky top-24 h-[calc(100vh-140px)] min-h-[520px]">
            <InteractiveMap
              properties={mapResults.length > 0 ? mapResults : properties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={onSelectProperty}
              onBoundsChange={onBoundsChange}
              className="w-full h-full rounded-2xl overflow-hidden shadow-md border border-slate-200/80"
            />
          </div>
        </div>
      )}

      {/* List / Grid View Only */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <div key={p.id} ref={(el) => { cardRefs.current[p.id] = el; }}>
              <PropertyCard property={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
