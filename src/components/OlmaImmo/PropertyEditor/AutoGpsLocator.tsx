import React, { useState, useMemo } from 'react';
import { GeoPointLocation } from '../../../types/realEstate';
import { ALGERIA_WILAYAS } from '../../../constants/wilayas';
import {
  findClosestLocation,
  getCommunesForWilaya,
  findWilayaCoords,
  findCommuneCoords,
} from '../../../data/algerianCommunesDatabase';
import { ListFilter, Edit3 } from 'lucide-react';
import { ResidenceLocationPickerMap } from './ResidenceLocationPickerMap';
import { AutoGpsCard } from './AutoGpsCard';

interface AutoGpsLocatorProps {
  location: GeoPointLocation;
  onChange: (updatedLocation: GeoPointLocation) => void;
}

export const AutoGpsLocator: React.FC<AutoGpsLocatorProps> = ({ location, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [hasDetected, setHasDetected] = useState<boolean>(Boolean(location.lat && location.lng));
  const [isManualTextEntry, setIsManualTextEntry] = useState(false);

  const availableCommunes = useMemo(() => {
    if (!location.wilaya) return [];
    return getCommunesForWilaya(location.wilaya);
  }, [location.wilaya]);

  const handleTriggerGps = () => {
    if (!navigator.geolocation) {
      setGpsError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setAccuracy(Math.round(pos.coords.accuracy));
        setHasDetected(true);

        const closest = findClosestLocation(lat, lng);

        onChange({
          ...location,
          lat,
          lng,
          wilaya: location.wilaya || closest.wilaya,
          commune: location.commune || closest.commune,
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Accès GPS refusé. Veuillez autoriser la localisation ou utiliser la saisie manuelle.");
        } else {
          setGpsError("Impossible de capter le signal GPS. Veuillez réessayer ou passer en manuel.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWilaya = e.target.value;
    const coords = findWilayaCoords(selectedWilaya);
    const newLat = coords?.lat ? Number(coords.lat.toFixed(6)) : location.lat;
    const newLng = coords?.lng ? Number(coords.lng.toFixed(6)) : location.lng;

    const newCommunes = getCommunesForWilaya(selectedWilaya);
    const communeStillValid = newCommunes.some(
      (c) => c.name.toLowerCase() === (location.commune || '').toLowerCase()
    );

    onChange({
      ...location,
      wilaya: selectedWilaya,
      commune: communeStillValid ? location.commune : '',
      lat: newLat,
      lng: newLng,
    });
  };

  const handleCommuneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCommune = e.target.value;
    if (selectedCommune === '__custom__') {
      setIsManualTextEntry(true);
      return;
    }

    const coords = findCommuneCoords(location.wilaya || '', selectedCommune);
    const newLat = coords?.lat ? Number(coords.lat.toFixed(6)) : location.lat;
    const newLng = coords?.lng ? Number(coords.lng.toFixed(6)) : location.lng;

    onChange({
      ...location,
      commune: selectedCommune,
      lat: newLat,
      lng: newLng,
    });
  };

  return (
    <div className="space-y-4">
      {/* Primary GPS Activation Trigger */}
      <AutoGpsCard
        isLocating={isLocating}
        hasDetected={hasDetected}
        accuracy={accuracy}
        gpsError={gpsError}
        onTriggerGps={handleTriggerGps}
      />

      {/* Map Preview & Fine-Tuning of detected GPS point */}
      {hasDetected && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0D281E] block">
            Ajuster le repère sur la carte (Glisser la carte / Vue Satellite)
          </label>
          <ResidenceLocationPickerMap
            lat={location.lat || 36.7538}
            lng={location.lng || 3.0588}
            wilayaName={location.wilaya}
            communeName={location.commune}
            className="h-56 w-full"
            onLocationChange={(newLat, newLng) => {
              onChange({
                ...location,
                lat: newLat,
                lng: newLng,
              });
            }}
          />
        </div>
      )}

      {/* Wilaya / Commune / Address fields complementing the GPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Wilaya ({ALGERIA_WILAYAS.length} disponibles) *
          </label>
          <select
            value={location.wilaya || ''}
            onChange={handleWilayaChange}
            className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          >
            <option value="" disabled>Sélectionnez la Wilaya</option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.name}>
                {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-stone-600">
              Commune {availableCommunes.length > 0 ? `(${availableCommunes.length})` : ''} *
            </label>
            {location.wilaya && availableCommunes.length > 0 && (
              <button
                type="button"
                onClick={() => setIsManualTextEntry(!isManualTextEntry)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {isManualTextEntry ? (
                  <>
                    <ListFilter className="w-3 h-3" />
                    <span>Liste ({availableCommunes.length})</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>Saisie libre</span>
                  </>
                )}
              </button>
            )}
          </div>

          {!isManualTextEntry ? (
            <select
              value={location.commune || ''}
              onChange={handleCommuneSelect}
              required
              disabled={!location.wilaya}
              className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px] disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
            >
              <option value="" disabled>
                {location.wilaya
                  ? `-- Choisir la commune (${availableCommunes.length} communes) --`
                  : "Sélectionnez d'abord la Wilaya"}
              </option>
              {availableCommunes.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.postal_code ? `(${c.postal_code})` : ''} {c.name_ar ? `• ${c.name_ar}` : ''}
                </option>
              ))}
              <option value="__custom__">✍️ Autre commune / saisie manuelle...</option>
            </select>
          ) : (
            <input
              type="text"
              required
              placeholder="Ex: Hydra, Sidi M'Hamed, Es Sénia..."
              value={location.commune || ''}
              onChange={(e) => {
                const val = e.target.value;
                const coords = findCommuneCoords(location.wilaya || '', val);
                onChange({
                  ...location,
                  commune: val,
                  ...(coords ? { lat: Number(coords.lat.toFixed(6)), lng: Number(coords.lng.toFixed(6)) } : {}),
                });
              }}
              className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Précision adresse / Résidence / Bâtiment</label>
        <input
          type="text"
          placeholder="Ex: Résidence Les Palmiers, Rue Capitaine Si Lahcène..."
          value={location.address || ''}
          onChange={(e) => onChange({ ...location, address: e.target.value })}
          className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
        />
      </div>
    </div>
  );
};
