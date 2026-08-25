import React from 'react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { PropertyCard } from './PropertyCard';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse my-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-80 border border-[#e8e2d4]" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#e8e2d4] space-y-5 my-6 flex flex-col items-center shadow-xs">
        <div className="w-16 h-16 bg-[#f2eee5] text-[#183930] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black font-['Playfair_Display',serif] text-[#183930]">
            No properties found
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            No properties match your current search criteria.
          </p>
          <p className="text-slate-400 text-xs">
            Try expanding your area or resetting your filters.
          </p>
        </div>
        <button
          onClick={onResetFilters}
          className="mt-4 px-6 py-2.5 bg-[#f2eee5] hover:bg-[#183930] hover:text-white text-[#183930] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border border-[#e8e2d4]"
        >
          Reset all filters
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
                    isSelected ? 'ring-3 ring-[#183930] shadow-xl scale-[1.01]' : 'hover:shadow-md'
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
              className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-[#e5dfd2]"
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
