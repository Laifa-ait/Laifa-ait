import React, { useMemo, useState } from 'react';
import { GeoPointLocation } from '../../../types/realEstate';
import {
  getCommunesForWilaya,
  getDairasForWilaya,
  findWilayaCoords,
  findCommuneCoords,
  findDairaForCommune,
} from '../../../data/algerianCommunesDatabase';
import { MapPin } from 'lucide-react';
import { ResidenceLocationPickerMap } from './ResidenceLocationPickerMap';
import { AlgeriaPlaceSearchBar } from './AlgeriaPlaceSearchBar';
import { AlgeriaPlaceResult } from '../../../services/algeriaPlaceSearch';
import { AlgerianTerritoryExplainerModal } from '../common/AlgerianTerritoryExplainer';
import { AdminTerritorySelectorGrid } from './AdminTerritorySelectorGrid';

interface ManualLocationPickerProps {
  location: GeoPointLocation;
  onChange: (updatedLocation: GeoPointLocation) => void;
}

export const ManualLocationPicker: React.FC<ManualLocationPickerProps> = ({ location, onChange }) => {
  const [isManualTextEntry, setIsManualTextEntry] = useState(false);
  const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false);

  // Available Daïras for Wilaya
  const availableDairas = useMemo(() => {
    if (!location.wilaya) return [];
    return getDairasForWilaya(location.wilaya);
  }, [location.wilaya]);

  // Communes available for currently selected Wilaya & Daïra
  const availableCommunes = useMemo(() => {
    if (!location.wilaya) return [];
    const all = getCommunesForWilaya(location.wilaya);
    if (!location.daira) return all;
    return all.filter((c) => c.daira && c.daira.toLowerCase() === location.daira?.toLowerCase());
  }, [location.wilaya, location.daira]);

  const effectiveDaira = useMemo(() => {
    if (location.daira) return location.daira;
    if (location.wilaya && location.commune) {
      return findDairaForCommune(location.wilaya, location.commune) || undefined;
    }
    return undefined;
  }, [location.daira, location.wilaya, location.commune]);

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWilaya = e.target.value;
    const coords = findWilayaCoords(selectedWilaya);
    const newLat = coords?.lat ? Number(coords.lat.toFixed(6)) : location.lat || 36.7538;
    const newLng = coords?.lng ? Number(coords.lng.toFixed(6)) : location.lng || 3.0588;

    const newCommunes = getCommunesForWilaya(selectedWilaya);
    const communeStillValid = newCommunes.some(
      (c) => c.name.toLowerCase() === (location.commune || '').toLowerCase()
    );

    const updatedCommune = communeStillValid ? location.commune : '';
    const updatedDaira = updatedCommune ? (findDairaForCommune(selectedWilaya, updatedCommune) || undefined) : undefined;

    onChange({
      ...location,
      wilaya: selectedWilaya,
      daira: updatedDaira,
      commune: updatedCommune,
      lat: newLat,
      lng: newLng,
    });
  };

  const handleDairaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDaira = e.target.value;
    const allCommunes = getCommunesForWilaya(location.wilaya || '');
    const communesInDaira = selectedDaira
      ? allCommunes.filter((c) => c.daira && c.daira.toLowerCase() === selectedDaira.toLowerCase())
      : allCommunes;
    const communeStillValid = communesInDaira.some(
      (c) => c.name.toLowerCase() === (location.commune || '').toLowerCase()
    );

    onChange({
      ...location,
      daira: selectedDaira || undefined,
      commune: communeStillValid ? location.commune : '',
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
    const autoDaira = findDairaForCommune(location.wilaya || '', selectedCommune) || undefined;

    onChange({
      ...location,
      commune: selectedCommune,
      daira: autoDaira || location.daira,
      lat: newLat,
      lng: newLng,
    });
  };

  const handleCommuneTextChange = (val: string) => {
    const coords = findCommuneCoords(location.wilaya || '', val);
    const autoDaira = findDairaForCommune(location.wilaya || '', val) || undefined;
    onChange({
      ...location,
      commune: val,
      daira: autoDaira || location.daira,
      ...(coords ? { lat: Number(coords.lat.toFixed(6)), lng: Number(coords.lng.toFixed(6)) } : {}),
    });
  };

  const handlePlaceSelect = (place: AlgeriaPlaceResult) => {
    const autoDaira = place.commune && (place.wilaya || location.wilaya)
      ? (findDairaForCommune(place.wilaya || location.wilaya || '', place.commune) || undefined)
      : undefined;

    onChange({
      ...location,
      lat: place.lat,
      lng: place.lng,
      wilaya: place.wilaya || location.wilaya,
      daira: autoDaira || location.daira,
      commune: place.commune || location.commune,
      address: location.address || (place.category === 'quartier' || place.category === 'landmark' ? place.name : location.address),
    });
  };

  const currentLat = location.lat || 36.7538;
  const currentLng = location.lng || 3.0588;

  return (
    <div className="space-y-4">
      <AdminTerritorySelectorGrid
        wilaya={location.wilaya}
        daira={location.daira}
        commune={location.commune}
        effectiveDaira={effectiveDaira}
        availableDairas={availableDairas}
        availableCommunes={availableCommunes}
        isManualTextEntry={isManualTextEntry}
        onToggleManualTextEntry={() => setIsManualTextEntry(!isManualTextEntry)}
        onWilayaChange={handleWilayaChange}
        onDairaChange={handleDairaChange}
        onCommuneSelect={handleCommuneSelect}
        onCommuneTextChange={handleCommuneTextChange}
        onOpenTerritoryModal={() => setIsTerritoryModalOpen(true)}
      />

      {/* Modal explicateur territorial */}
      <AlgerianTerritoryExplainerModal
        isOpen={isTerritoryModalOpen}
        onClose={() => setIsTerritoryModalOpen(false)}
      />

      {/* Address */}
      <div>
        <label className="block text-xs font-bold text-stone-700 mb-1">
          Adresse détaillée / Repère (Rue, Résidence, Bâtiment)
        </label>
        <input
          type="text"
          value={location.address}
          onChange={(e) => onChange({ ...location, address: e.target.value })}
          placeholder="Ex: 12 Rue Didouche Mourad, en face de la Grande Poste"
          className="w-full text-xs sm:text-sm font-medium border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#008BB5] bg-stone-50/50"
        />
      </div>

      {/* Autocomplete / Recherche rapide de lieu */}
      <div className="pt-1">
        <AlgeriaPlaceSearchBar
          onSelectPlace={handlePlaceSelect}
          preferredWilaya={location.wilaya}
        />
      </div>

      {/* Interactive Map Picker */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#008BB5]" />
            <span>Position exacte sur la carte (GPS Algérie)</span>
          </label>
          <span className="text-[10px] text-stone-400 font-mono">
            {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
          </span>
        </div>
        <ResidenceLocationPickerMap
          lat={currentLat}
          lng={currentLng}
          wilayaName={location.wilaya}
          communeName={location.commune}
          onLocationChange={(newLat, newLng) => {
            onChange({
              ...location,
              lat: Number(newLat.toFixed(6)),
              lng: Number(newLng.toFixed(6)),
            });
          }}
        />
        <p className="text-[11px] text-stone-400 mt-1">
          Cliquez sur la carte ou déplacez le marqueur pour ajuster le positionnement du bien.
        </p>
      </div>
    </div>
  );
};
