import React, { useState } from 'react';
import { GeoPointLocation } from '../../types/realEstate';
import { Navigation, MapPin, CheckCircle } from 'lucide-react';
import { AutoGpsLocator } from './PropertyEditor/AutoGpsLocator';
import { ManualLocationPicker } from './PropertyEditor/ManualLocationPicker';

interface LocationPickerProps {
  location: GeoPointLocation;
  onChange: (updatedLocation: GeoPointLocation) => void;
}

type LocalizationMode = 'gps' | 'manual';

export const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange }) => {
  const [mode, setMode] = useState<LocalizationMode>('manual');

  return (
    <div className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E6E0D4] shadow-xs">
      {/* Header & Mode Switcher */}
      <div className="space-y-3 pb-3 border-b border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0D281E] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Système de Géolocalisation du Logement</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Positionnez votre logement par glissement sur la carte ou par signal GPS direct.
            </p>
          </div>

          {location.wilaya && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{location.commune ? `${location.commune}, ` : ''}{location.wilaya}</span>
            </div>
          )}
        </div>

        {/* Segmented Controller Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-100 border border-stone-200/80">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-[#0D281E] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Positionnement par Glissement</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('gps')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'gps'
                ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Navigation className="w-4 h-4 text-amber-300" />
            <span>Localisation par GPS</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {mode === 'gps' ? (
        <AutoGpsLocator location={location} onChange={onChange} />
      ) : (
        <ManualLocationPicker location={location} onChange={onChange} />
      )}
    </div>
  );
};
