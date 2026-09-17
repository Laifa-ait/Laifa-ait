import React from 'react';
import { MapPin, Building2, Landmark } from 'lucide-react';
import { LocationSearchResult } from '../../data/algerianCommunesDatabase';

interface LocationSuggestionsPopupProps {
  suggestions: LocationSearchResult[];
  onSelect: (item: LocationSearchResult) => void;
}

export const LocationSuggestionsPopup: React.FC<LocationSuggestionsPopupProps> = ({
  suggestions,
  onSelect,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute left-4 right-4 top-full mt-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_12px_32px_-4px_rgba(100,116,139,0.18)] max-h-72 overflow-y-auto z-50 divide-y divide-slate-100">
      <div className="px-3.5 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-50/70">
        58 Wilayas • 548 Daïras • 1 541 Communes
      </div>
      {suggestions.map((item, idx) => (
        <button
          key={`${item.type}-${item.wilayaCode}-${item.commune || item.daira || item.wilaya}-${idx}`}
          type="button"
          onClick={() => onSelect(item)}
          className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
              {item.type === 'commune' ? (
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              ) : item.type === 'daira' ? (
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Landmark className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-slate-800 truncate block">
                {item.type === 'commune'
                  ? item.commune
                  : item.type === 'daira'
                  ? item.daira
                  : item.wilaya}
              </span>
              <span className="text-[11px] text-slate-400 truncate block">
                {item.type === 'commune'
                  ? `${item.wilaya} (${item.wilayaCode})`
                  : item.type === 'daira'
                  ? `Wilaya de ${item.wilaya}`
                  : `Code Wilaya ${item.wilayaCode}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {item.nameAr && (
              <span className="text-[11px] text-slate-400 font-arabic hidden sm:inline">
                {item.nameAr}
              </span>
            )}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                item.type === 'commune'
                  ? 'bg-emerald-50 text-emerald-700'
                  : item.type === 'daira'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {item.type === 'commune'
                ? 'Commune'
                : item.type === 'daira'
                ? 'Daïra'
                : 'Wilaya'}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
