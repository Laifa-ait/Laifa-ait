import React from 'react';
import { MapPin } from 'lucide-react';

interface MapZoneSearchButtonProps {
  onSearchZone: () => void;
}

export const MapZoneSearchButton: React.FC<MapZoneSearchButtonProps> = ({ onSearchZone }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSearchZone();
      }}
      className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#1e3835] text-white px-4 py-2 rounded-full border border-white/20 text-xs font-bold shadow-2xl hover:bg-[#152725] transition-all cursor-pointer pointer-events-auto"
    >
      <MapPin className="w-3.5 h-3.5 text-emerald-400 me-1.5" />
      <span>Rechercher dans cette zone</span>
    </button>
  );
};
