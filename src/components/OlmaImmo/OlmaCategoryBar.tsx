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
  Sparkles,
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
    <div className="w-full py-4 mb-2">
      {/* Header section with clean title & action */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 font-['Poppins',sans-serif] tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Explorer par catégorie</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-400 font-medium">
            Filtrez les séjours & biens selon vos envies
          </p>
        </div>

        {activeCategory !== 'all' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onCategorySelect('all')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer bg-transparent border-none"
          >
            Réinitialiser
          </motion.button>
        )}
      </div>

      {/* Horizontal Pill Filters Bar with Tactile Motion */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 touch-pan-x overscroll-x-contain scroll-smooth">
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
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white border-transparent shadow-md shadow-orange-500/25 font-bold'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-orange-300 hover:bg-orange-50/40 hover:text-orange-600 shadow-2xs'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isSelected ? 'text-white stroke-[2.2]' : 'text-stone-500'
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




