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
        className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#1E3A8A] text-white font-bold text-xs sm:text-sm shadow-[0_12px_32px_rgba(30,58,138,0.35)] border border-blue-400/30 hover:bg-blue-900 transition-all cursor-pointer backdrop-blur-md"
      >
        {activeView === 'map' ? (
          <>
            <LayoutGrid className="w-4 h-4 text-[#F59E0B]" />
            <span>Afficher la liste ({totalProperties})</span>
          </>
        ) : (
          <>
            <MapIcon className="w-4 h-4 text-[#F59E0B]" />
            <span>Afficher la carte ({totalProperties})</span>
          </>
        )}
      </motion.button>
    </div>
  );
};
