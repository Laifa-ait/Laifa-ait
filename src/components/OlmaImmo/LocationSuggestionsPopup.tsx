import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { LocationSearchResult } from '../../data/algerianCommunesDatabase';

interface LocationSuggestionsPopupProps {
  suggestions: LocationSearchResult[];
  onSelect: (item: LocationSearchResult) => void;
}

export const LocationSuggestionsPopup: React.FC<LocationSuggestionsPopupProps> = ({
  suggestions,
  onSelect,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Suggestions de localisation"
      className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_16px_36px_-8px_rgba(100,116,139,0.22),0_4px_12px_-2px_rgba(100,116,139,0.08)] overflow-hidden z-50 transition-all duration-200"
    >
      <div className="py-1.5 max-h-64 overflow-y-auto divide-y divide-slate-100">
        {suggestions.map((item) => (
          <button
            key={`${item.type}-${item.wilayaCode}-${item.commune || item.daira || item.wilaya}`}
            type="button"
            role="option"
            aria-selected={false}
            onClick={() => onSelect(item)}
            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 text-[#64748B] group-hover:text-[#1E293B] transition-colors">
              {item.type === 'wilaya' ? (
                <Navigation className="w-3.5 h-3.5 text-[#1E293B]" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-[#1E293B] truncate">
                {item.label}
              </div>
              <div className="text-[10px] sm:text-xs text-[#64748B] truncate">
                {item.type === 'commune'
                  ? `Commune · Daïra de ${item.daira || item.wilaya} · Wilaya de ${item.wilaya}`
                  : item.type === 'daira'
                  ? `Daïra · Wilaya de ${item.wilaya}`
                  : `Wilaya de ${item.wilaya} (${item.wilayaCode})`}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              {item.type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
