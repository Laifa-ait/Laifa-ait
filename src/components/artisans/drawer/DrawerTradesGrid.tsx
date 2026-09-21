import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Wind,
  HardHat,
  ChevronRight,
} from 'lucide-react';

interface DrawerTradesGridProps {
  onClose: () => void;
}

const POPULAR_TRADES = [
  { id: 'plomberie', translationKey: 'artisan_cat_plumbing', defaultName: 'Plomberie & Chauffage', icon: Wrench, color: 'text-sky-600 bg-sky-50' },
  { id: 'electricite', translationKey: 'artisan_cat_electricity', defaultName: 'Électricité Générale', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  { id: 'peinture', translationKey: 'artisan_cat_painting', defaultName: 'Peinture & Décoration', icon: Paintbrush, color: 'text-purple-600 bg-purple-50' },
  { id: 'menuiserie', translationKey: 'artisan_cat_carpentry', defaultName: 'Menuiserie & Meuble', icon: Hammer, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'climatisation', translationKey: 'artisan_cat_aircon', defaultName: 'Climatisation & Froid', icon: Wind, color: 'text-blue-600 bg-blue-50' },
  { id: 'maconnerie', translationKey: 'artisan_cat_masonry', defaultName: 'Maçonnerie & Rénovation', icon: HardHat, color: 'text-orange-600 bg-orange-50' },
];

export const DrawerTradesGrid: React.FC<DrawerTradesGridProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelectTrade = (tradeId: string) => {
    onClose();
    navigate(`/artisans?trade=${encodeURIComponent(tradeId)}`);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {t('artisan_drawer_search_by_trade')}
        </h4>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/artisans');
          }}
          className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
        >
          <span>{t('artisan_drawer_all_trades')}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {POPULAR_TRADES.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTrade(item.id)}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 hover:border-amber-400 bg-white hover:bg-amber-50/40 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color} group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950 truncate">
                {t(item.translationKey, item.defaultName)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
