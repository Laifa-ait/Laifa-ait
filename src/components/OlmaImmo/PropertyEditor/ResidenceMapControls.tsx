import React from 'react';
import {
  Layers,
  RotateCcw,
  Navigation,
  Plus,
  Minus,
  MapPin,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { TileLayerType } from '../webMercator';

interface ResidenceMapControlsProps {
  layerType: TileLayerType;
  onLayerChange: (layer: TileLayerType) => void;
  wilayaName?: string;
  communeName?: string;
  onRecenterWilaya?: () => void;
  onCurrentPosition: () => void;
  isLocating: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNudge?: (dx: number, dy: number) => void;
  lat: number;
  lng: number;
  zoom: number;
  isDragging?: boolean;
}

export const ResidenceMapHeader: React.FC<
  Pick<
    ResidenceMapControlsProps,
    'layerType' | 'onLayerChange' | 'wilayaName' | 'communeName' | 'onRecenterWilaya' | 'onCurrentPosition' | 'isLocating'
  >
> = ({
  layerType,
  onLayerChange,
  wilayaName,
  communeName,
  onRecenterWilaya,
  onCurrentPosition,
  isLocating,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-[#0D281E]">
        <Crosshair className="w-4 h-4 text-emerald-700" />
        <span>Glissez la carte ou touchez l'emplacement exact</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="inline-flex p-0.5 rounded-xl bg-stone-200 border border-stone-300">
          <button
            type="button"
            onClick={() => onLayerChange('satellite')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition cursor-pointer ${
              layerType === 'satellite' ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-300" />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => onLayerChange('voyager')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition cursor-pointer ${
              layerType !== 'satellite' ? 'bg-white text-[#0D281E] shadow-xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <span>Plan</span>
          </button>
        </div>

        {wilayaName && onRecenterWilaya && (
          <button
            type="button"
            onClick={onRecenterWilaya}
            title={`Recentrer sur ${communeName ? `${communeName} (${wilayaName})` : wilayaName}`}
            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3 h-3 text-emerald-700" />
            <span className="truncate max-w-[140px]">{communeName || wilayaName}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onCurrentPosition}
          disabled={isLocating}
          title="Localiser ma position actuelle"
          className="px-2.5 py-1 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-60"
        >
          <Navigation className={`w-3 h-3 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Détection...' : 'GPS'}</span>
        </button>
      </div>
    </div>
  );
};

export const ResidenceMapOverlay: React.FC<
  Pick<
    ResidenceMapControlsProps,
    'communeName' | 'wilayaName' | 'onZoomIn' | 'onZoomOut' | 'onNudge' | 'zoom' | 'isDragging'
  >
> = ({
  communeName,
  wilayaName,
  onZoomIn,
  onZoomOut,
  onNudge,
  zoom,
  isDragging,
}) => {
  return (
    <>
      {/* Precision Ground Target Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/90 bg-emerald-500/20 shadow-sm flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-700 ring-2 ring-white" />
        </div>
      </div>

      {/* Pin Drop hovering right over the crosshair without jittery bounce */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[98%] pointer-events-none z-30 flex flex-col items-center transition-transform duration-100 ${
          isDragging ? '-translate-y-[112%] scale-105' : ''
        }`}
      >
        <span className="text-[10px] font-black uppercase tracking-wider text-[#0D281E] bg-[#EBDCB8] px-2 py-0.5 rounded-full shadow-md border border-[#c4b38d] mb-0.5 whitespace-nowrap">
          {communeName || wilayaName ? `Logement (${communeName || wilayaName})` : 'Emplacement du bien'}
        </span>
        <div className="p-2 bg-[#0D281E] text-white rounded-full shadow-xl border-2 border-white">
          <MapPin className="w-5 h-5 text-amber-300 drop-shadow-xs" />
        </div>
        <div className="w-2 h-2 bg-amber-400 rotate-45 -mt-1 shadow-2xs" />
      </div>

      {/* Floating Controls: Directional Nudge + Zoom */}
      <div className="absolute bottom-3 right-3 z-30 flex items-end gap-2">
        {/* Fine-Tuning Directional Arrows */}
        {onNudge && (
          <div className="flex flex-col items-center p-1 bg-white/95 backdrop-blur-md rounded-xl border border-stone-300 shadow-md">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNudge(0, -40);
              }}
              title="Déplacer vers le haut"
              className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition active:scale-95 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNudge(-40, 0);
                }}
                title="Déplacer vers la gauche"
                className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNudge(40, 0);
                }}
                title="Déplacer vers la droite"
                className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition active:scale-95 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNudge(0, 40);
              }}
              title="Déplacer vers le bas"
              className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition active:scale-95 cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Zoom In/Out Buttons */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-xl border border-stone-300 shadow-md overflow-hidden">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onZoomIn();
            }}
            title="Zoom avant (+)"
            className="w-8 h-8 flex items-center justify-center font-bold text-stone-800 hover:bg-stone-100 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-[1px] bg-stone-200" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onZoomOut();
            }}
            title="Zoom arrière (-)"
            className="w-8 h-8 flex items-center justify-center font-bold text-stone-800 hover:bg-stone-100 active:scale-95 transition cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Guidance Badge */}
      <div className="absolute bottom-3 left-3 z-30 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20 text-xs font-medium shadow-md flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span>Glisser la carte pour ajuster</span>
        <span className="text-stone-300 text-[10px] font-mono">| Zoom {Math.round(zoom)}</span>
      </div>
    </>
  );
};
