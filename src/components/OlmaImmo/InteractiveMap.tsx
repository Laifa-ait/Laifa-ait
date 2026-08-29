import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { PropertyMapPreview } from './PropertyMapPreview';
import { OlmaVectorMap } from './OlmaVectorMap';
import { MapCategoryFilterBar, MapFilterCategory } from './MapCategoryFilterBar';

interface InteractiveMapProps {
  properties: (Property | PropertyMapResult)[];
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  onBoundsChange?: (bbox: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  className?: string;
  activeFilter?: MapFilterCategory;
  onFilterChange?: (filter: MapFilterCategory) => void;
}

const ALGIERS_CENTER = { lat: 36.7538, lng: 3.0588 };

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onBoundsChange,
  centerLat = ALGIERS_CENTER.lat,
  centerLng = ALGIERS_CENTER.lng,
  zoom = 11,
  className = 'w-full h-full min-h-[400px]',
  activeFilter: controlledFilter,
  onFilterChange,
}) => {
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const mapsMapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) || '';

  const [internalFilter, setInternalFilter] = useState<MapFilterCategory>('all');
  const activeFilter = controlledFilter !== undefined ? controlledFilter : internalFilter;

  const handleFilterClick = (cat: MapFilterCategory) => {
    setInternalFilter(cat);
    if (onFilterChange) onFilterChange(cat);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'sale') return p.listingType === 'sale';
      if (activeFilter === 'rent') return p.listingType === 'rent_long' || p.listingType === 'rent_short';
      if (activeFilter === 'house') return p.propertyType === 'villa' || p.propertyType === 'house';
      if (activeFilter === 'commercial') return p.propertyType === 'commercial' || p.propertyType === 'office';
      return true;
    });
  }, [properties, activeFilter]);

  const [mapCenter, setMapCenter] = useState({ lat: centerLat, lng: centerLng });

  useEffect(() => {
    if (centerLat && centerLng) {
      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [centerLat, centerLng]);

  const selectedProperty = filteredProperties.find((p) => p.id === selectedPropertyId);

  useEffect(() => {
    if (selectedProperty) {
      const lat = 'location' in selectedProperty ? selectedProperty.location.lat : selectedProperty.lat;
      const lng = 'location' in selectedProperty ? selectedProperty.location.lng : selectedProperty.lng;
      if (lat && lng) {
        setMapCenter({ lat, lng });
      }
    }
  }, [selectedProperty]);

  const formatPrice = (price: number, period?: string) => {
    let suffix = '';
    if (period === 'night') suffix = ' / nuit';
    else if (period === 'month') suffix = ' / mois';

    if (price >= 1_000_000) {
      return `${(price / 1_000_000).toFixed(1)} M DZD${suffix}`;
    }
    if (price >= 1_000) {
      return `${(price / 1_000).toFixed(0)} k DZD${suffix}`;
    }
    return `${price} DZD${suffix}`;
  };

  // If Google Maps API key is configured, use official @vis.gl/react-google-maps provider
  if (mapsApiKey) {
    return (
      <div className={`relative rounded-3xl overflow-hidden border border-[#d8d2c4] shadow-md ${className}`}>
        <MapCategoryFilterBar activeFilter={activeFilter} onFilterChange={handleFilterClick} />

        <APIProvider apiKey={mapsApiKey}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={zoom}
            mapId={mapsMapId || undefined}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
            onCameraChanged={(ev) => {
              if (onBoundsChange && ev.detail.bounds) {
                const b = ev.detail.bounds;
                onBoundsChange(`${b.west},${b.south},${b.east},${b.north}`);
              }
            }}
          >
            {filteredProperties.map((p) => {
              const isSelected = p.id === selectedPropertyId;
              const pLat = 'location' in p ? p.location.lat : p.lat;
              const pLng = 'location' in p ? p.location.lng : p.lng;
              if (!pLat || !pLng) return null;

              return (
                <AdvancedMarker
                  key={p.id}
                  position={{ lat: pLat, lng: pLng }}
                  onClick={() => onSelectProperty && onSelectProperty(p.id)}
                  title={p.title}
                >
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#1e3835] text-white border-white ring-4 ring-[#1e3835]/30 scale-110'
                        : 'bg-white text-[#1c211e] border-[#d8d2c4] hover:bg-[#1e3835] hover:text-white'
                    }`}
                  >
                    {formatPrice(p.price, p.pricePeriod)}
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-sm">
            <PropertyMapPreview
              property={selectedProperty}
              onClose={() => onSelectProperty && onSelectProperty('')}
            />
          </div>
        )}
      </div>
    );
  }

  // Standalone Olma Vector interactive map
  return (
    <OlmaVectorMap
      properties={filteredProperties}
      selectedPropertyId={selectedPropertyId}
      onSelectProperty={onSelectProperty}
      onBoundsChange={onBoundsChange}
      className={className}
      activeFilter={activeFilter}
      onFilterChange={handleFilterClick}
    />
  );
};
