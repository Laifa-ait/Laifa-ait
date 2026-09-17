import React from 'react';
import { MapPin } from 'lucide-react';

interface MapZoneSearchButtonProps {
  onSearchZone: () => void;
}

export const MapZoneSearchButton: React.FC<MapZoneSearchButtonProps> = ({ onSearchZone }) => {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onSearchZone();
      }}
      className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#1E3A8A] text-white px-4 py-2 rounded-full border border-white/20 text-xs font-bold shadow-2xl hover:bg-blue-900 transition-all cursor-pointer pointer-events-auto"
    >
      <MapPin className="w-3.5 h-3.5 text-[#F59E0B] me-1.5" />
      <span>Rechercher dans cette zone</span>
    </button>
  );
};
