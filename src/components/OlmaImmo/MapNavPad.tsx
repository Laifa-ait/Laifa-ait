import React from 'react';
import { Plus, Minus, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { TileLayerType } from './webMercator';

interface MapNavPadProps {
  onPan: (dx: number, dy: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  layerType: TileLayerType;
  onToggleLayer: () => void;
}

export const MapNavPad: React.FC<MapNavPadProps> = ({
  onPan,
  onZoomIn,
  onZoomOut,
  onReset,
  layerType,
  onToggleLayer,
}) => {
  return (
    <div className="absolute top-16 left-3 z-30 flex flex-col gap-2 pointer-events-auto select-none">
      {/* Directional Pad */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#d8d2c4] shadow-md p-1 grid grid-cols-3 gap-0.5 w-[84px] h-[84px] items-center justify-items-center">
        <div />
        <button
          type="button"
          onClick={() => onPan(0, 100)}
          title="Déplacer vers le nord"
          aria-label="Nord"
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-200/70 text-[#1e3835] active:scale-90 transition"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div />

        <button
          type="button"
          onClick={() => onPan(100, 0)}
          title="Déplacer vers l'ouest"
          aria-label="Ouest"
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-200/70 text-[#1e3835] active:scale-90 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReset}
          title="Recentrer sur le bien"
          aria-label="Recentrer"
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#1e3835] text-white hover:bg-[#152a28] active:scale-90 transition shadow-xs"
        >
          <RotateCcw className="w-3 h-3 text-amber-300" />
        </button>

        <button
          type="button"
          onClick={() => onPan(-100, 0)}
          title="Déplacer vers l'est"
          aria-label="Est"
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-200/70 text-[#1e3835] active:scale-90 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div />
        <button
          type="button"
          onClick={() => onPan(0, -100)}
          title="Déplacer vers le sud"
          aria-label="Sud"
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-200/70 text-[#1e3835] active:scale-90 transition"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <div />
      </div>

      {/* Zoom In & Out */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#d8d2c4] shadow-md p-1 flex flex-col items-center w-[42px] self-start">
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom avant (+)"
          aria-label="Zoom avant"
          className="w-8 h-8 flex items-center justify-center font-bold text-[#1e3835] hover:bg-[#f2eee5] rounded-xl active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-5 h-[1px] bg-[#e8e2d4]" />
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom arrière (-)"
          aria-label="Zoom arrière"
          className="w-8 h-8 flex items-center justify-center font-bold text-[#1e3835] hover:bg-[#f2eee5] rounded-xl active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Toggle (Plan / Satellite) */}
      <button
        type="button"
        onClick={onToggleLayer}
        title={layerType === 'satellite' ? 'Passer en mode Plan' : 'Passer en mode Satellite'}
        className="px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-[#d8d2c4] shadow-md flex items-center gap-1.5 text-[11px] font-bold text-[#1e3835] hover:bg-[#f2eee5] active:scale-95 transition self-start"
      >
        <Layers className="w-3.5 h-3.5 text-emerald-700" />
        <span>{layerType === 'satellite' ? 'Plan' : 'Satellite'}</span>
      </button>
    </div>
  );
};
