import React from 'react';
import { Home, Store, KeyRound, Tag, Layers } from 'lucide-react';

export type MapFilterCategory = 'all' | 'sale' | 'rent' | 'house' | 'commercial';

interface MapCategoryFilterBarProps {
  activeFilter: MapFilterCategory;
  onFilterChange: (filter: MapFilterCategory) => void;
}

export const MapCategoryFilterBar: React.FC<MapCategoryFilterBarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filterButtons: Array<{ id: MapFilterCategory; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'all', label: 'Tous', icon: Layers },
    { id: 'sale', label: 'Vente', icon: Tag },
    { id: 'rent', label: 'Location', icon: KeyRound },
    { id: 'house', label: 'Villas', icon: Home },
    { id: 'commercial', label: 'Locaux', icon: Store },
  ];

  return (
    <div
      className="absolute top-3 left-3 max-w-[calc(100%-120px)] sm:max-w-[calc(100%-160px)] z-30 flex items-center pointer-events-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-1.5 py-1.5 rounded-2xl border border-[#d8d2c4] shadow-md flex items-center gap-1 max-w-full overflow-x-auto scrollbar-none">
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          const isSelected = activeFilter === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFilterChange(btn.id);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-[#1e3835] text-white border-[#1e3835] shadow-xs'
                  : 'bg-stone-50/80 hover:bg-[#f2eee5] text-stone-700 border-[#e8e2d4]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
