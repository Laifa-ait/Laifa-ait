import React from 'react';
import { GeoPointLocation } from '../../../types/realEstate';
import { LocationPicker } from '../LocationPicker';
import { MapPin } from 'lucide-react';

interface EditorStepLocationProps {
  location: GeoPointLocation;
  setLocation: (loc: GeoPointLocation) => void;
}

export const EditorStepLocation: React.FC<EditorStepLocationProps> = ({
  location,
  setLocation,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#1a3831]" />
          <span>Localisation & Emplacement</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Indiquez la wilaya, commune, et positionnez le repère GPS sur la carte interactive.
        </p>
      </div>

      <LocationPicker
        value={location}
        onChange={setLocation}
      />
    </div>
  );
};
