import React from 'react';
import { Layers, Maximize2, Minimize2, Plus, Minus, LocateFixed } from 'lucide-react';

interface MapControlsOverlayProps {
  mapTypeId: 'roadmap' | 'satellite' | 'hybrid';
  onToggleMapType: () => void;
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
  allowFullscreenToggle?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
  recenterTitle?: string;
}

export const MapControlsOverlay: React.FC<MapControlsOverlayProps> = ({
  mapTypeId,
  onToggleMapType,
  isFullscreen,
  onToggleFullscreen,
  allowFullscreenToggle = true,
  onZoomIn,
  onZoomOut,
  onRecenter,
  recenterTitle = 'Recentrer sur le bien',
}) => {
  return (
    <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2 pointer-events-none">
      {/* Top action row */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        {onRecenter && (
          <button
            type="button"
            onClick={onRecenter}
            className="p-2 rounded-xl bg-white/95 backdrop-blur-md text-[#0D281E] shadow-md border border-stone-200/80 hover:bg-[#0D281E] hover:text-[#EBDCB8] transition-all cursor-pointer group active:scale-95"
            title={recenterTitle}
          >
            <LocateFixed className="w-4 h-4 text-emerald-700 group-hover:text-[#EBDCB8]" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleMapType}
          className="px-2.5 py-2 rounded-xl bg-white/95 backdrop-blur-md text-stone-800 shadow-md border border-stone-200/80 hover:bg-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Basculer vue satellite / plan"
        >
          <Layers className="w-4 h-4 text-emerald-700" />
          <span className="text-[11px] hidden sm:inline">
            {mapTypeId === 'roadmap' ? 'Satellite' : 'Plan'}
          </span>
        </button>

        {allowFullscreenToggle && onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-[#0D281E] text-[#EBDCB8] shadow-md hover:bg-[#153e31] transition-all cursor-pointer active:scale-95"
            title={isFullscreen ? 'Quitter le plein écran' : 'Agrandir la carte'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Vertical zoom buttons (if available) */}
      {(onZoomIn || onZoomOut) && (
        <div className="flex flex-col rounded-xl overflow-hidden shadow-md border border-stone-200/80 bg-white/95 backdrop-blur-md pointer-events-auto mt-1">
          {onZoomIn && (
            <button
              type="button"
              onClick={onZoomIn}
              className="p-2 text-stone-700 hover:bg-stone-100 transition-colors border-b border-stone-200/60 flex items-center justify-center cursor-pointer active:scale-95"
              title="Zoomer (+)"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {onZoomOut && (
            <button
              type="button"
              onClick={onZoomOut}
              className="p-2 text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
              title="Dézoomer (-)"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
