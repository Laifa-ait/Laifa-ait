import React from 'react';
import {
  CalendarCheck,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  KeyRound,
  Snowflake,
  Building2,
  ShieldCheck,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArtisanTrade } from '../../../types/artisan';

interface CategoryItem {
  id: string; // tradeId or slug or 'all'
  translationKey: string;
  defaultLabel: string;
  icon: LucideIcon;
}

const STATIC_CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'all', translationKey: 'artisan_cat_all', defaultLabel: 'Réserver', icon: CalendarCheck },
  { id: 'plomberie', translationKey: 'artisan_cat_plumbing', defaultLabel: 'Plomberie & Sanitaire', icon: Wrench },
  { id: 'electricite', translationKey: 'artisan_cat_electricity', defaultLabel: 'Électricité & Énergie', icon: Zap },
  { id: 'peinture', translationKey: 'artisan_cat_painting', defaultLabel: 'Peinture & Finitions', icon: Paintbrush },
  { id: 'menuiserie', translationKey: 'artisan_cat_carpentry', defaultLabel: 'Menuiserie & Bois', icon: Hammer },
  { id: 'serrurerie', translationKey: 'artisan_cat_locksmith', defaultLabel: 'Serrurerie & Sécurité', icon: KeyRound },
  { id: 'climatisation', translationKey: 'artisan_cat_aircon', defaultLabel: 'Climatisation & Froid', icon: Snowflake },
  { id: 'maconnerie', translationKey: 'artisan_cat_masonry', defaultLabel: 'Maçonnerie & Gros œuvre', icon: Building2 },
  { id: 'etancheite', translationKey: 'artisan_cat_waterproofing', defaultLabel: 'Étanchéité & Façades', icon: ShieldCheck },
  { id: 'nettoyage', translationKey: 'artisan_cat_cleaning', defaultLabel: 'Nettoyage & Entretien', icon: Sparkles },
];

interface OlmaArtisanCategoryBarProps {
  trades: ArtisanTrade[];
  activeCategory: string; // 'all' or tradeId or slug
  onCategorySelect: (catId: string) => void;
}

export const OlmaArtisanCategoryBar: React.FC<OlmaArtisanCategoryBarProps> = ({
  trades,
  activeCategory,
  onCategorySelect,
}) => {
  const { t } = useTranslation();

  // If dynamic trades exist from API, map them with matching icons
  const getIconForTrade = (name: string, slug?: string): LucideIcon => {
    const s = `${name} ${slug || ''}`.toLowerCase();
    if (s.includes('plomb') || s.includes('sanit') || s.includes('chauff')) return Wrench;
    if (s.includes('electr') || s.includes('énerg')) return Zap;
    if (s.includes('peint') || s.includes('déco')) return Paintbrush;
    if (s.includes('menuis') || s.includes('bois') || s.includes('meuble')) return Hammer;
    if (s.includes('serrur') || s.includes('cle') || s.includes('sécur')) return KeyRound;
    if (s.includes('clim') || s.includes('froid') || s.includes('ventilat')) return Snowflake;
    if (s.includes('maçon') || s.includes('btp') || s.includes('bâtiment')) return Building2;
    if (s.includes('étanch') || s.includes('toit') || s.includes('façad')) return ShieldCheck;
    if (s.includes('nettoy') || s.includes('jardin') || s.includes('propr')) return Sparkles;
    return Wrench;
  };

  const dynamicItems: CategoryItem[] = trades.length > 0
    ? [
        { id: 'all', translationKey: 'artisan_cat_all', defaultLabel: 'Réserver', icon: CalendarCheck },
        ...trades.map((tr) => {
          const matchedStatic = STATIC_CATEGORY_ITEMS.find(
            (s) => s.id === tr.id || s.id === tr.slug || tr.name.toLowerCase().includes(s.id)
          );
          return {
            id: tr.id,
            translationKey: matchedStatic?.translationKey || '',
            defaultLabel: tr.name,
            icon: getIconForTrade(tr.name, tr.slug),
          };
        }),
      ]
    : STATIC_CATEGORY_ITEMS;

  return (
    <div className="w-full pt-1 pb-3 mb-1">
      {/* Horizontal Pill Filters Bar with Tactile Motion matching Olma Immo */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none touch-pan-x overscroll-x-contain scroll-smooth">
        {dynamicItems.map((cat) => {
          const isSelected = activeCategory === cat.id || (!activeCategory && cat.id === 'all');
          const Icon = cat.icon;
          const displayLabel = cat.translationKey ? t(cat.translationKey, cat.defaultLabel) : cat.defaultLabel;

          return (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="button"
              onClick={() => onCategorySelect(cat.id === 'all' ? '' : cat.id)}
              className={`rounded-full h-11 px-5 border flex items-center gap-2.5 text-xs sm:text-sm transition-all cursor-pointer shrink-0 select-none whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 font-black'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50/50 hover:text-slate-950 font-medium shadow-2xs'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isSelected ? 'text-slate-950 stroke-[2.5]' : 'text-slate-500'
                }`}
              />
              <span className="tracking-tight">{displayLabel}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
