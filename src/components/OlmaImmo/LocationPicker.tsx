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
    <div className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
      {/* Header & Mode Switcher */}
      <div className="space-y-3 pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span>Système de Géolocalisation du Logement</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Positionnez votre logement par glissement sur la carte ou par signal GPS direct.
            </p>
          </div>

          {location.wilaya && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>{location.commune ? `${location.commune}, ` : ''}{location.wilaya}</span>
            </div>
          )}
        </div>

        {/* Segmented Controller Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#1E3A8A]" />
            <span>Positionnement par Glissement</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('gps')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'gps'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-4 h-4 text-[#F59E0B]" />
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
