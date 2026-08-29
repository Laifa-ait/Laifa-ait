import React from 'react';
import { Home, Store, KeyRound, Tag, Layers } from 'lucide-react';
import { MapFilterCategory } from './OlmaVectorMap';

interface OlmaMapFilterBarProps {
  activeFilter: MapFilterCategory;
  onFilterClick: (filter: MapFilterCategory) => void;
}

export const OlmaMapFilterBar: React.FC<OlmaMapFilterBarProps> = ({
  activeFilter,
  onFilterClick,
}) => {
  const filterButtons: Array<{ id: MapFilterCategory; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'all', label: 'Tous les prix', icon: Layers },
    { id: 'sale', label: 'Achat', icon: Tag },
    { id: 'rent', label: 'Location', icon: KeyRound },
    { id: 'house', label: 'Maison / Villa', icon: Home },
    { id: 'commercial', label: 'Local / Bureau', icon: Store },
  ];

  return (
    <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-[#d8d2c4] shadow-lg flex items-center gap-1.5 max-w-full overflow-x-auto scrollbar-none">
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          const isSelected = activeFilter === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFilterClick(btn.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-[#1e3835] text-white border-[#1e3835] shadow-xs'
                  : 'bg-stone-50/80 hover:bg-[#f2eee5] text-stone-700 border-[#e8e2d4]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
