import React from 'react';
import { Home, Key, Palmtree } from 'lucide-react';
import { ListingType } from '../../types/realEstate';

interface HeroListingTabsProps {
  activeType?: ListingType;
  onSelectType: (type?: ListingType) => void;
}

export const HeroListingTabs: React.FC<HeroListingTabsProps> = ({
  activeType,
  onSelectType,
}) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2.5 sm:mb-3">
      <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => onSelectType(undefined)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !activeType ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tous les biens
        </button>
        <button
          type="button"
          onClick={() => onSelectType('sale')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeType === 'sale' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-3 h-3 text-[#F59E0B]" />
          <span>Acheter</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectType('rent_long')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeType === 'rent_long' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-3 h-3 text-emerald-400" />
          <span>Louer</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectType('rent_short')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeType === 'rent_short' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palmtree className="w-3 h-3 text-[#F59E0B]" />
          <span>Vacances</span>
        </button>
      </div>
    </div>
  );
};
