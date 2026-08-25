import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { PropertyMapPreview } from './PropertyMapPreview';
import { OlmaVectorMap } from './OlmaVectorMap';

interface InteractiveMapProps {
  properties: (Property | PropertyMapResult)[];
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  onBoundsChange?: (bbox: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  className?: string;
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
}) => {
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const mapsMapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) || '';
  const [mapCenter, setMapCenter] = useState({ lat: centerLat, lng: centerLng });

  useEffect(() => {
    if (centerLat && centerLng) {
      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [centerLat, centerLng]);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  useEffect(() => {
    if (selectedProperty) {
      const pLat = 'location' in selectedProperty ? selectedProperty.location.lat : selectedProperty.lat;
      const pLng = 'location' in selectedProperty ? selectedProperty.location.lng : selectedProperty.lng;
      if (pLat && pLng) {
        setMapCenter({ lat: pLat, lng: pLng });
      }
    }
  }, [selectedProperty]);

  const formatPriceShort = (price: number, period?: string) => {
    let suffix = '';
    if (period === 'night') suffix = '/n';
    else if (period === 'month') suffix = '/m';

    if (price >= 1_000_000) {
      const m = price / 1_000_000;
      return `${m.toFixed(m % 1 === 0 ? 0 : 1)} M DZD${suffix}`;
    }
    if (price >= 1_000) {
      return `${Math.round(price / 1_000)} k DZD${suffix}`;
    }
    return `${price} DZD${suffix}`;
  };

  // If Google Maps API key is configured, use official @vis.gl/react-google-maps provider
  if (mapsApiKey) {
    return (
      <div className={`relative rounded-3xl overflow-hidden border border-[#d8d2c4] shadow-lg flex flex-col ${className}`}>
        <APIProvider apiKey={mapsApiKey}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={zoom}
            mapId={mapsMapId || undefined}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onCameraChanged={(ev) => {
              if (onBoundsChange && ev.detail.bounds) {
                const { south, west, north, east } = ev.detail.bounds;
                const bbox = `${west.toFixed(6)},${south.toFixed(6)},${east.toFixed(6)},${north.toFixed(6)}`;
                onBoundsChange(bbox);
              }
            }}
          >
            {properties.map((p) => {
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
                  className="cursor-pointer"
                >
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all duration-300 transform flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-[#1e3835] text-white border-white scale-110 z-30 ring-4 ring-[#1e3835]/30'
                        : 'bg-white text-[#1c211e] border-[#d8d2c4] hover:scale-105 hover:bg-[#1e3835] hover:text-white z-10'
                    }`}
                  >
                    <span>{formatPriceShort(p.price, p.pricePeriod)}</span>
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
      properties={properties}
      selectedPropertyId={selectedPropertyId}
      onSelectProperty={onSelectProperty}
      onBoundsChange={onBoundsChange}
      centerLat={centerLat}
      centerLng={centerLng}
      className={className}
    />
  );
};
