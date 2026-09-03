import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroPopularDestinationsProps {
  destinations: string[];
  activeDestination: string;
  onSelectDestination: (dest: string) => void;
}

export const HeroPopularDestinations: React.FC<HeroPopularDestinationsProps> = ({
  destinations,
  activeDestination,
  onSelectDestination,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mt-3.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
      <span className="text-[11px] font-bold text-stone-400 shrink-0 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-500" />
        Wilayas phares :
      </span>
      {destinations.map((dest) => (
        <button
          key={dest}
          type="button"
          onClick={() => onSelectDestination(dest)}
          className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border active:scale-95 ${
            activeDestination.toLowerCase() === dest.toLowerCase()
              ? 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E] shadow-xs'
              : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border-[#E6E0D4] shadow-2xs'
          }`}
        >
          {dest}
        </button>
      ))}
    </div>
  );
};
