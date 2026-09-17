import React from 'react';
import {
  Compass,
  Palmtree,
  Building2,
  Home,
  BedDouble,
  Trees,
  Store,
  Building,
  Briefcase,
  LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PropertyType } from '../../types/realEstate';

interface CategoryItem {
  id: PropertyType | 'all';
  label: string;
  icon: LucideIcon;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'all', label: 'Tout voir', icon: Compass },
  { id: 'villa', label: 'Villas & Piscine', icon: Palmtree },
  { id: 'apartment', label: 'Appartements', icon: Building2 },
  { id: 'house', label: 'Maisons & Riad', icon: Home },
  { id: 'studio', label: 'Studios & Lofts', icon: BedDouble },
  { id: 'land', label: 'Terrains & Nature', icon: Trees },
  { id: 'commercial', label: 'Commerces', icon: Store },
  { id: 'building', label: 'Immeubles', icon: Building },
  { id: 'office', label: 'Bureaux', icon: Briefcase },
];

interface OlmaCategoryBarProps {
  activeCategory: PropertyType | 'all';
  onCategorySelect: (cat: PropertyType | 'all') => void;
}

export const OlmaCategoryBar: React.FC<OlmaCategoryBarProps> = ({
  activeCategory,
  onCategorySelect,
}) => {
  return (
    <div className="w-full pt-1 pb-3 mb-1">
      {/* Horizontal Pill Filters Bar with Tactile Motion */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none touch-pan-x overscroll-x-contain scroll-smooth">
        {CATEGORY_ITEMS.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="button"
              onClick={() => onCategorySelect(cat.id)}
              className={`rounded-full h-11 px-5 border flex items-center gap-2.5 font-medium text-xs sm:text-sm transition-all cursor-pointer shrink-0 select-none whitespace-nowrap ${
                isSelected
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md shadow-[#1E3A8A]/20 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-[#1E3A8A]/40 hover:bg-blue-50/50 hover:text-[#1E3A8A] shadow-2xs'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isSelected ? 'text-[#F59E0B] stroke-[2.2]' : 'text-slate-500'
                }`}
              />
              <span className="tracking-tight">{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};




