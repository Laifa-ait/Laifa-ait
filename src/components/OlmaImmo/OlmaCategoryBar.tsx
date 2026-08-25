import React from 'react';
import { PropertyType } from '../../types/realEstate';

interface CategoryItem {
  id: PropertyType | 'all';
  label: string;
  emoji: string;
}

const CATEGORY_PILLS: CategoryItem[] = [
  { id: 'all', label: 'Tout voir', emoji: '🌍' },
  { id: 'villa', label: 'Villas', emoji: '🏡' },
  { id: 'apartment', label: 'Appartements', emoji: '🏢' },
  { id: 'house', label: 'Maisons', emoji: '🔑' },
  { id: 'studio', label: 'Studios', emoji: '🛋️' },
  { id: 'land', label: 'Terrains', emoji: '🌾' },
  { id: 'commercial', label: 'Locaux / Commerces', emoji: '🏬' },
  { id: 'building', label: 'Immeubles', emoji: '🏛️' },
  { id: 'office', label: 'Bureaux', emoji: '💼' },
];

interface OlmaCategoryBarProps {
  activeCategory: PropertyType | 'all';
  onCategorySelect: (cat: PropertyType | 'all') => void;
}

export const OlmaCategoryBar: React.FC<OlmaCategoryBarProps> = ({
  activeCategory,
  onCategorySelect,
}) => {
  const handleClick = (id: PropertyType | 'all') => {
    onCategorySelect(id);
  };

  return (
    <div className="w-full py-1.5 mb-5">
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1.5 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 touch-pan-x overscroll-x-contain scroll-smooth">
        {CATEGORY_PILLS.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleClick(cat.id)}
              className={`group relative flex items-center gap-3 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-150 cursor-pointer shrink-0 select-none whitespace-nowrap active:scale-[0.98] ${
                isSelected
                  ? 'bg-gradient-to-b from-[#cfcfcf] via-[#dadada] to-[#e4e4e4] text-neutral-900 font-semibold border border-[#b8b8b8] shadow-[inset_0_3px_6px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,0.9)]'
                  : 'bg-white text-neutral-900 font-medium border border-neutral-200/70 shadow-[0_6px_16px_rgba(0,0,0,0.10),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.14),0_3px_6px_rgba(0,0,0,0.06)] hover:bg-neutral-50/50'
              }`}
            >
              <span className="text-xl leading-none transform group-hover:scale-105 transition-transform">
                {cat.emoji}
              </span>
              <span className="tracking-tight text-[15px] sm:text-[16px] leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};



