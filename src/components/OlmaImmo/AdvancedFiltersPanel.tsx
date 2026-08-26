import React from 'react';
import { AMENITIES_OPTIONS } from './PropertyImageAndFeaturesForm';

interface AdvancedFiltersPanelProps {
  roomsFilter: number | 'all';
  setRoomsFilter: (rooms: number | 'all') => void;
  selectedAmenities: string[];
  toggleAmenity: (amenity: string) => void;
  areaRange: [number, number];
  setAreaRange: (range: [number, number]) => void;
  onReset: () => void;
}

export const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  roomsFilter,
  setRoomsFilter,
  selectedAmenities,
  toggleAmenity,
  areaRange,
  setAreaRange,
  onReset,
}) => {
  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      {/* Rooms filter */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Nombre de pièces (F)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 1, 2, 3, 4, 5] as const).map((r) => (
            <button
              key={String(r)}
              type="button"
              onClick={() => setRoomsFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                roomsFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'Tous' : `F${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Surface filter */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>Superficie min.</span>
          <span className="text-blue-600 font-extrabold">{areaRange[0]} m²</span>
        </div>
        <input
          type="range"
          min="20"
          max="500"
          step="10"
          value={areaRange[0]}
          onChange={(e) => setAreaRange([Number(e.target.value), areaRange[1]])}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Amenities selection */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Équipements & Commodités
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES_OPTIONS.map((item) => {
            const isSelected = selectedAmenities.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer min-h-[32px] ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
        >
          Réinitialiser tous les filtres
        </button>
      </div>
    </div>
  );
};
