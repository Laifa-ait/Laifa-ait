import React from 'react';
import { motion } from 'motion/react';
import { Map as MapIcon, LayoutGrid } from 'lucide-react';

interface OlmaImmoFloatingToggleProps {
  activeView: 'split' | 'grid' | 'map';
  showBottomDeck: boolean;
  totalProperties: number;
  onToggle: () => void;
}

export const OlmaImmoFloatingToggle: React.FC<OlmaImmoFloatingToggleProps> = ({
  activeView,
  showBottomDeck,
  totalProperties,
  onToggle,
}) => {
  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300 ${
        activeView === 'map' && showBottomDeck
          ? 'bottom-36 sm:bottom-32 md:bottom-8'
          : 'bottom-20 md:bottom-8'
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0D281E] text-[#EBDCB8] font-bold text-xs sm:text-sm shadow-[0_12px_32px_rgba(13,40,30,0.35)] border border-[#EBDCB8]/30 hover:bg-[#153e31] transition-all cursor-pointer backdrop-blur-md"
      >
        {activeView === 'map' ? (
          <>
            <LayoutGrid className="w-4 h-4 text-amber-400" />
            <span>Afficher la liste ({totalProperties})</span>
          </>
        ) : (
          <>
            <MapIcon className="w-4 h-4 text-emerald-400" />
            <span>Afficher la carte ({totalProperties})</span>
          </>
        )}
      </motion.button>
    </div>
  );
};
