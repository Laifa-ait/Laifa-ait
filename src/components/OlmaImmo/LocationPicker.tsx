import React, { useState } from 'react';
import { ALGERIA_WILAYAS } from '../../constants/wilayas';
import { GeoPointLocation } from '../../types/realEstate';
import { MapPin, Navigation, Compass, CheckCircle2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface LocationPickerProps {
  location: GeoPointLocation;
  onChange: (updatedLocation: GeoPointLocation) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange }) => {
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const mapsMapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) || '';
  const [isMapActive, setIsMapActive] = useState(false);

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWilaya = e.target.value;
    const foundWilaya = ALGERIA_WILAYAS.find((w) => w.name === selectedWilaya);

    onChange({
      ...location,
      wilaya: selectedWilaya,
      lat: foundWilaya?.lat ? foundWilaya.lat : location.lat || 36.7538,
      lng: foundWilaya?.lng ? foundWilaya.lng : location.lng || 3.0588,
    });
  };

  const handleCommuneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...location,
      commune: e.target.value,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...location,
      address: e.target.value,
    });
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange({
      ...location,
      lat: isNaN(val) ? 0 : val,
    });
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange({
      ...location,
      lng: isNaN(val) ? 0 : val,
    });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange({
            ...location,
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        () => {
          onChange({
            ...location,
            lat: 36.7538,
            lng: 3.0588,
          });
        }
      );
    }
  };

  return (
    <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Localisation du bien (Algérie)
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors min-h-[44px]"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Utiliser ma position</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Wilaya Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Wilaya *</label>
          <select
            value={location.wilaya || ''}
            onChange={handleWilayaChange}
            required
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          >
            <option value="" disabled>
              Sélectionnez une Wilaya
            </option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.name}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Commune Input */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Commune *</label>
          <input
            type="text"
            required
            placeholder="Ex: Bab Ezzouar, Hydra..."
            value={location.commune || ''}
            onChange={handleCommuneChange}
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Adresse ou quartier *</label>
        <input
          type="text"
          required
          placeholder="Ex: Cité 1000 Logements, Bâtiment B1"
          value={location.address || ''}
          onChange={handleAddressChange}
          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
        />
      </div>

      {/* Visual GPS Marker Picker */}
      <div className="space-y-2 pt-2 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Ajustement précis du marqueur GPS</span>
          <button
            type="button"
            onClick={() => setIsMapActive(!isMapActive)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            {isMapActive ? 'Masquer la carte' : 'Placer sur la carte'}
          </button>
        </div>

        {isMapActive && (
          <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-300 relative shadow-inner bg-slate-900">
            {mapsApiKey ? (
              <APIProvider apiKey={mapsApiKey}>
                <Map
                  defaultCenter={{ lat: location.lat || 36.7538, lng: location.lng || 3.0588 }}
                  defaultZoom={13}
                  mapId={mapsMapId || undefined}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                  gestureHandling="greedy"
                  onClick={(ev) => {
                    if (ev.detail.latLng) {
                      onChange({
                        ...location,
                        lat: Number(ev.detail.latLng.lat.toFixed(6)),
                        lng: Number(ev.detail.latLng.lng.toFixed(6)),
                      });
                    }
                  }}
                >
                  <AdvancedMarker
                    position={{ lat: location.lat || 36.7538, lng: location.lng || 3.0588 }}
                  >
                    <div className="p-2 bg-rose-600 text-white rounded-full shadow-lg border-2 border-white animate-bounce">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            ) : (
              <div
                className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 text-center cursor-crosshair relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  const lat = Number((37.5 - y * 4).toFixed(6));
                  const lng = Number((1.5 + x * 6).toFixed(6));
                  onChange({ ...location, lat, lng });
                }}
              >
                <Compass className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-200">Cliquez pour placer le marqueur GPS du bien</p>
                <p className="text-[10px] text-slate-400 mt-1">Coordonnées sélectionnées: {location.lat}° N, {location.lng}° E</p>
                <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Emplacement validé</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coordinates Lat / Lng Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Latitude (°N)</label>
            <input
              type="number"
              step="0.000001"
              value={location.lat || 36.7538}
              onChange={handleLatChange}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Longitude (°E)</label>
            <input
              type="number"
              step="0.000001"
              value={location.lng || 3.0588}
              onChange={handleLngChange}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        Le geohash géographique sera calculé automatiquement par le serveur backend.
      </p>
    </div>
  );
};
