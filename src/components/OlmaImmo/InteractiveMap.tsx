import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { OlmaVectorMap } from './OlmaVectorMap';
import { MapFilterCategory } from './MapCategoryFilterBar';

interface InteractiveMapProps {
  properties: (Property | PropertyMapResult)[];
  selectedPropertyId?: string;
  highlightPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  onBoundsChange?: (bbox: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  className?: string;
  activeFilter?: MapFilterCategory;
  onFilterChange?: (filter: MapFilterCategory) => void;
  showFilters?: boolean;
  showPreviewCard?: boolean;
  allowFullscreenToggle?: boolean;
}

const ALGIERS_CENTER = { lat: 36.7538, lng: 3.0588 };

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedPropertyId,
  highlightPropertyId,
  onSelectProperty,
  onBoundsChange,
  centerLat = ALGIERS_CENTER.lat,
  centerLng = ALGIERS_CENTER.lng,
  zoom = 12,
  className = 'w-full h-full min-h-[400px]',
  activeFilter,
  onFilterChange,
  showFilters = true,
  showPreviewCard = true,
  allowFullscreenToggle = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 w-screen h-screen bg-black/90 p-2 sm:p-4 flex flex-col'
    : `relative rounded-3xl overflow-hidden border border-[#d8d2c4] shadow-md ${className}`;

  return (
    <div className={containerClasses}>
      {allowFullscreenToggle && (
        <div className="absolute top-3 right-3 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-full bg-[#0D281E] text-[#EBDCB8] shadow-md hover:bg-[#153e31] transition cursor-pointer"
            title={isFullscreen ? 'Quitter le plein écran' : 'Agrandir en plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      <OlmaVectorMap
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        highlightPropertyId={highlightPropertyId}
        onSelectProperty={onSelectProperty}
        onBoundsChange={onBoundsChange}
        centerLat={centerLat}
        centerLng={centerLng}
        zoom={zoom}
        className="w-full h-full flex-1"
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        showFilters={showFilters}
        showPreviewCard={showPreviewCard}
      />
    </div>
  );
};

