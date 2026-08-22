import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { PropertyMapResult } from '../../types/realEstate';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

interface InteractiveMapProps {
  properties: PropertyMapResult[];
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  onBoundsChange?: (bbox: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  className?: string;
}

// Default center on Algiers, Algeria
const ALGIERS_CENTER = { lat: 36.7538, lng: 3.0588 };

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onBoundsChange,
  centerLat = ALGIERS_CENTER.lat,
  centerLng = ALGIERS_CENTER.lng,
  zoom = 11,
  className = 'w-full h-[500px]',
}) => {
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const mapsMapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) || '';
  const [mapCenter, setMapCenter] = useState({ lat: centerLat, lng: centerLng });

  useEffect(() => {
    if (centerLat && centerLng) {
      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [centerLat, centerLng]);

  const formatPriceShort = (price: number, period?: string) => {
    let suffix = '';
    if (period === 'night') suffix = '/n';
    else if (period === 'month') suffix = '/m';

    if (price >= 1_000_000) {
      return `${(price / 1_000_000).toFixed(1)} Mda${suffix}`;
    }
    if (price >= 1_000) {
      return `${Math.round(price / 1_000)} kDA${suffix}`;
    }
    return `${price} DA${suffix}`;
  };

  // If Google Maps API key is configured, render official @vis.gl/react-google-maps component
  if (mapsApiKey) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md ${className}`}>
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
              return (
                <AdvancedMarker
                  key={p.id}
                  position={{ lat: p.lat, lng: p.lng }}
                  onClick={() => onSelectProperty && onSelectProperty(p.id)}
                  title={p.title}
                >
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg transition-all duration-300 transform cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-white scale-110 z-30 ring-4 ring-rose-500/30'
                        : 'bg-emerald-800 text-white border-emerald-400/30 hover:scale-105 hover:bg-emerald-700 z-10'
                    }`}
                  >
                    <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
                    <span>{formatPriceShort(p.price, p.pricePeriod)}</span>
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      </div>
    );
  }

  // Graceful interactive map fallback when Google Maps API key is waiting to be set
  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg flex flex-col ${className}`}>
      {/* Top Banner Notice */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-slate-800/80 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span className="font-medium text-slate-200">
            Carte interactive Olma Immo ({properties.length} bien{properties.length > 1 ? 's' : ''})
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
          Algérie
        </span>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="relative flex-1 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
        {/* Decorative Grid and Contours */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Property Pins Overlay */}
        <div className="relative w-full h-full min-h-[300px]">
          {properties.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-center p-4">
              <MapPin className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-medium">Aucun bien à afficher dans cette zone</p>
              <p className="text-xs text-slate-500 mt-1">Essayez d'élargir votre recherche</p>
            </div>
          ) : (
            properties.map((p, index) => {
              const isSelected = p.id === selectedPropertyId;
              // Map latitude and longitude relative to Algeria bounding box for visual placement
              const xPct = Math.max(10, Math.min(90, ((p.lng - 1.5) / 6) * 100));
              const yPct = Math.max(10, Math.min(90, ((37.5 - p.lat) / 4) * 100));

              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProperty && onSelectProperty(p.id)}
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer z-10 group min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    isSelected ? 'z-30 scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-xl flex items-center gap-1.5 transition-all border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-white ring-4 ring-rose-500/40 shadow-rose-900/50'
                        : 'bg-emerald-700/90 hover:bg-emerald-600 text-white border-emerald-400/40 backdrop-blur-md shadow-emerald-950/60'
                    }`}
                  >
                    <MapPin className="w-3 h-3 text-emerald-300" />
                    <span>{formatPriceShort(p.price, p.pricePeriod)}</span>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-40 w-44">
                    <div className="bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-2xl border border-slate-700 text-center">
                      <p className="font-semibold line-clamp-1">{p.title}</p>
                      <p className="text-slate-400 text-[10px]">{p.commune}, {p.wilaya}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">Coordonnées: {mapCenter.lat.toFixed(4)}° N, {mapCenter.lng.toFixed(4)}° E</span>
        <div className="flex items-center gap-2 shrink-0 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Wilayas Algérie</span>
        </div>
      </div>
    </div>
  );
};
