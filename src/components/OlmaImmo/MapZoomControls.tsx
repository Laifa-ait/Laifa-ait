import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const MapZoomControls: React.FC<MapZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <div className="absolute top-16 left-3 z-30 flex flex-col gap-2 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#d8d2c4] shadow-md p-1 flex flex-col items-center">
        <button
          onClick={onZoomIn}
          aria-label="Zoom avant"
          className="w-8 h-8 flex items-center justify-center font-black text-slate-800 hover:bg-[#f2eee5] rounded-xl text-base cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#1e3835]" />
        </button>
        <div className="w-5 h-[1px] bg-[#e8e2d4]" />
        <button
          onClick={onZoomOut}
          aria-label="Zoom arrière"
          className="w-8 h-8 flex items-center justify-center font-black text-slate-800 hover:bg-[#f2eee5] rounded-xl text-base cursor-pointer"
        >
          <Minus className="w-4 h-4 text-[#1e3835]" />
        </button>
      </div>

      <button
        onClick={onReset}
        aria-label="Recentrer la carte"
        title="Recentrer sur l'Algérie"
        className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-2xl border border-[#d8d2c4] shadow-md flex items-center justify-center text-slate-800 hover:bg-[#f2eee5] cursor-pointer"
      >
        <RotateCcw className="w-4 h-4 text-[#1e3835]" />
      </button>
    </div>
  );
};
