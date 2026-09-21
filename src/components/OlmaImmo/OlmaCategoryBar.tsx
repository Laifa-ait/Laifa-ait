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
import { useTranslation } from 'react-i18next';
import { PropertyType } from '../../types/realEstate';

interface CategoryItem {
  id: PropertyType | 'all';
  translationKey: string;
  defaultLabel: string;
  icon: LucideIcon;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'all', translationKey: 'immo_cat_all', defaultLabel: 'Tout voir', icon: Compass },
  { id: 'villa', translationKey: 'immo_cat_villa', defaultLabel: 'Villas & Piscine', icon: Palmtree },
  { id: 'apartment', translationKey: 'immo_cat_apartment', defaultLabel: 'Appartements', icon: Building2 },
  { id: 'house', translationKey: 'immo_cat_house', defaultLabel: 'Maisons & Riad', icon: Home },
  { id: 'studio', translationKey: 'immo_cat_studio', defaultLabel: 'Studios & Lofts', icon: BedDouble },
  { id: 'land', translationKey: 'immo_cat_land', defaultLabel: 'Terrains & Nature', icon: Trees },
  { id: 'commercial', translationKey: 'immo_cat_commercial', defaultLabel: 'Commerces', icon: Store },
  { id: 'building', translationKey: 'immo_cat_building', defaultLabel: 'Immeubles', icon: Building },
  { id: 'office', translationKey: 'immo_cat_office', defaultLabel: 'Bureaux', icon: Briefcase },
];

interface OlmaCategoryBarProps {
  activeCategory: PropertyType | 'all';
  onCategorySelect: (cat: PropertyType | 'all') => void;
}

export const OlmaCategoryBar: React.FC<OlmaCategoryBarProps> = ({
  activeCategory,
  onCategorySelect,
}) => {
  const { t } = useTranslation();

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
              <span className="tracking-tight">{t(cat.translationKey, cat.defaultLabel)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
