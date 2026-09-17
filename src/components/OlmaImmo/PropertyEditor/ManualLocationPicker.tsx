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
    return getCommunesForWilaya(location.wilaya, location.daira);
  }, [location.wilaya, location.daira]);

  const effectiveDaira = useMemo(() => {
    if (location.daira) return location.daira;
    if (location.wilaya && location.commune) {
      return findDairaForCommune(location.wilaya, location.commune);
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
    const updatedDaira = updatedCommune ? findDairaForCommune(selectedWilaya, updatedCommune) : '';

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
    const communesInDaira = getCommunesForWilaya(location.wilaya || '', selectedDaira);
    const communeStillValid = communesInDaira.some(
      (c) => c.name.toLowerCase() === (location.commune || '').toLowerCase()
    );

    onChange({
      ...location,
      daira: selectedDaira,
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
    const autoDaira = findDairaForCommune(location.wilaya || '', selectedCommune);

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
    const autoDaira = findDairaForCommune(location.wilaya || '', val);
    onChange({
      ...location,
      commune: val,
      daira: autoDaira || location.daira,
      ...(coords ? { lat: Number(coords.lat.toFixed(6)), lng: Number(coords.lng.toFixed(6)) } : {}),
    });
  };

  const handlePlaceSelect = (place: AlgeriaPlaceResult) => {
    const autoDaira = place.commune && (place.wilaya || location.wilaya)
      ? findDairaForCommune(place.wilaya || location.wilaya || '', place.commune)
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
          3. Adresse, Quartier ou Cité *
        </label>
        <input
          type="text"
          required
          placeholder="Ex: Boulevard Millenium, Cité 500 Logements, Rue Didouche Mourad..."
          value={location.address || ''}
          onChange={(e) => onChange({ ...location, address: e.target.value })}
          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        />
      </div>

      {/* Interactive Draggable Map with Satellite View for Pin Dropping */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#1E3A8A]" />
            <span>4. Positionner sur la carte (Recherche de lieux & Glissement)</span>
          </label>
          <span className="text-[10px] text-slate-500 font-medium">Algérie 58 Wilayas</span>
        </div>

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
