import React, { useMemo, useState } from 'react';
import { GeoPointLocation } from '../../../types/realEstate';
import { ALGERIA_WILAYAS } from '../../../constants/wilayas';
import {
  getCommunesForWilaya,
  findWilayaCoords,
  findCommuneCoords,
} from '../../../data/algerianCommunesDatabase';
import { MapPin, CheckCircle2, Edit3, ListFilter } from 'lucide-react';
import { ResidenceLocationPickerMap } from './ResidenceLocationPickerMap';
import { AlgeriaPlaceSearchBar } from './AlgeriaPlaceSearchBar';
import { AlgeriaPlaceResult } from '../../../services/algeriaPlaceSearch';

interface ManualLocationPickerProps {
  location: GeoPointLocation;
  onChange: (updatedLocation: GeoPointLocation) => void;
}

export const ManualLocationPicker: React.FC<ManualLocationPickerProps> = ({ location, onChange }) => {
  const [isManualTextEntry, setIsManualTextEntry] = useState(false);

  // Communes available for currently selected Wilaya
  const availableCommunes = useMemo(() => {
    if (!location.wilaya) return [];
    return getCommunesForWilaya(location.wilaya);
  }, [location.wilaya]);

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWilaya = e.target.value;
    const coords = findWilayaCoords(selectedWilaya);
    const newLat = coords?.lat ? Number(coords.lat.toFixed(6)) : location.lat || 36.7538;
    const newLng = coords?.lng ? Number(coords.lng.toFixed(6)) : location.lng || 3.0588;

    // Check if current commune belongs to newly selected Wilaya
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
    const newLat = coords?.lat ? Number(coords.lat.toFixed(6)) : location.lat || 36.7538;
    const newLng = coords?.lng ? Number(coords.lng.toFixed(6)) : location.lng || 3.0588;

    onChange({
      ...location,
      commune: selectedCommune,
      lat: newLat,
      lng: newLng,
    });
  };

  const handleCommuneTextChange = (val: string) => {
    const coords = findCommuneCoords(location.wilaya || '', val);
    onChange({
      ...location,
      commune: val,
      ...(coords ? { lat: Number(coords.lat.toFixed(6)), lng: Number(coords.lng.toFixed(6)) } : {}),
    });
  };

  const handlePlaceSelect = (place: AlgeriaPlaceResult) => {
    onChange({
      ...location,
      lat: place.lat,
      lng: place.lng,
      wilaya: place.wilaya || location.wilaya,
      commune: place.commune || location.commune,
      address: location.address || (place.category === 'quartier' || place.category === 'landmark' ? place.name : location.address),
    });
  };

  const currentLat = location.lat || 36.7538;
  const currentLng = location.lng || 3.0588;

  return (
    <div className="space-y-4">
      {/* Wilaya and Commune selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            1. Wilaya * ({ALGERIA_WILAYAS.length} wilayas)
          </label>
          <select
            value={location.wilaya || ''}
            onChange={handleWilayaChange}
            required
            className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px] cursor-pointer"
          >
            <option value="" disabled>
              Sélectionnez une Wilaya
            </option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.name}>
                {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700">
              2. Commune * {availableCommunes.length > 0 ? `(${availableCommunes.length})` : ''}
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
                    <span>Choisir dans la liste</span>
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
                  ? `-- Choisir une commune (${availableCommunes.length} communes) --`
                  : "Sélectionnez d'abord une Wilaya"}
              </option>
              {availableCommunes.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.postal_code ? `(${c.postal_code})` : ''} {c.name_ar ? `• ${c.name_ar}` : ''}
                </option>
              ))}
              <option value="__custom__">✍️ Autre commune / saisie manuelle...</option>
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                required
                list="communes-datalist"
                placeholder="Ex: Bab Ezzouar, Hydra, Bir El Djir..."
                value={location.commune || ''}
                onChange={(e) => handleCommuneTextChange(e.target.value)}
                className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
              {availableCommunes.length > 0 && (
                <datalist id="communes-datalist">
                  {availableCommunes.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation feedback when Wilaya and Commune are locked */}
      {location.wilaya && location.commune && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-emerald-950 font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Pieu positionné sur <strong>{location.commune}</strong> (Wilaya de {location.wilaya}).
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Localisation prête
          </span>
        </div>
      )}

      {/* Address */}
      <div>
        <label className="block text-xs font-bold text-stone-700 mb-1">
          3. Adresse, Quartier ou Cité *
        </label>
        <input
          type="text"
          required
          placeholder="Ex: Boulevard Millenium, Cité 500 Logements, Rue Didouche Mourad..."
          value={location.address || ''}
          onChange={(e) => onChange({ ...location, address: e.target.value })}
          className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
        />
      </div>

      {/* Interactive Draggable Map with Satellite View for Pin Dropping */}
      <div className="space-y-2.5 pt-2 border-t border-stone-200">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-[#0D281E] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>4. Positionner sur la carte (Recherche de lieux & Glissement)</span>
          </label>
          <span className="text-[10px] text-stone-500 font-medium">Algérie 58 Wilayas</span>
        </div>

        {/* Moteur de recherche de lieux en Algérie */}
        <AlgeriaPlaceSearchBar
          onSelectPlace={handlePlaceSelect}
          preferredWilaya={location.wilaya}
          placeholder="Rechercher un quartier, cité ou repère (ex: Bouchaoui, Hydra, Akid Lotfi...)"
        />

        <ResidenceLocationPickerMap
          lat={currentLat}
          lng={currentLng}
          wilayaName={location.wilaya}
          communeName={location.commune}
          onLocationChange={(newLat, newLng) => onChange({ ...location, lat: newLat, lng: newLng })}
        />
      </div>
    </div>
  );
};

