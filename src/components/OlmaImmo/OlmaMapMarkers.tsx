import React from 'react';
import { PublicPropertyDTO, PropertyMapResult } from '../../types/realEstate';
import { project, formatPriceShort } from './webMercator';
import { formatPriceAlgeria } from './mapStyles';

interface OlmaMapMarkersProps {
  properties: (PublicPropertyDTO | PropertyMapResult)[];
  selectedPropertyId?: string;
  highlightPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  centerProj: { x: number; y: number };
  zoom: number;
  width: number;
  height: number;
}

export const OlmaMapMarkers: React.FC<OlmaMapMarkersProps> = ({
  properties,
  selectedPropertyId,
  highlightPropertyId,
  onSelectProperty,
  centerProj,
  zoom,
  width,
  height,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {properties.map((p) => {
        const pLat = 'location' in p ? p.location.lat : p.lat;
        const pLng = 'location' in p ? p.location.lng : p.lng;
        if (!pLat || !pLng) return null;

        const pProj = project(pLat, pLng, zoom);
        const screenX = pProj.x - centerProj.x + width / 2;
        const screenY = pProj.y - centerProj.y + height / 2;

        // Skip markers out of view
        if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) {
          return null;
        }

        const isSelected = p.id === selectedPropertyId;
        const isHighlight = p.id === highlightPropertyId;

        return (
          <div
            key={p.id}
            style={{ left: `${Math.round(screenX)}px`, top: `${Math.round(screenY)}px` }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectProperty) onSelectProperty(p.id);
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-transform ${
              isHighlight ? 'z-50 scale-105' : isSelected ? 'z-40 scale-110' : 'z-20 hover:scale-105'
            }`}
          >
            {isHighlight ? (
              <div className="relative flex flex-col items-center">
                <span className="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-900 bg-[#F59E0B] px-2 py-0.5 rounded-full shadow-md mb-0.5 border border-amber-400 z-10">
                  ★ Ce bien
                </span>
                <div className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#1E3A8A] text-white border-2 border-white shadow-2xl flex items-center gap-1">
                  <span>{formatPriceAlgeria(p.price, p.pricePeriod)}</span>
                </div>
              </div>
            ) : (
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#1E3A8A] text-white border-white ring-4 ring-blue-900/30 shadow-2xl'
                    : 'bg-white/95 text-slate-900 border-slate-300 hover:bg-[#1E3A8A] hover:text-white shadow-md'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#F59E0B]' : 'bg-blue-600'}`} />
                <span>{formatPriceShort(p.price, p.pricePeriod)}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
