import React from 'react';
import {
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Hammer,
  Grid,
  Layers,
  Square,
  Key,
  Tv,
  Shield,
  Trees,
  Wrench,
  LucideIcon,
} from 'lucide-react';
import { ArtisanTrade } from '../../types/artisan';

const ICON_MAP: Record<string, LucideIcon> = {
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Hammer,
  Grid,
  Layers,
  Square,
  Key,
  Tv,
  Shield,
  Trees,
  Wrench,
};

interface ArtisanTradeCardProps {
  trade: ArtisanTrade;
  isSelected?: boolean;
  onSelect: (tradeId: string) => void;
}

export const ArtisanTradeCard: React.FC<ArtisanTradeCardProps> = ({
  trade,
  isSelected = false,
  onSelect,
}) => {
  const IconComponent = ICON_MAP[trade.icon] || Wrench;

  return (
    <button
      onClick={() => onSelect(trade.id)}
      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group h-full ${
        isSelected
          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
          : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800'
            }`}
          >
            <IconComponent className="w-5 h-5 stroke-[2.2]" />
          </div>
          {trade.popular && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
              Populaire
            </span>
          )}
        </div>

        <div>
          <h4
            className={`text-sm font-extrabold transition-colors ${
              isSelected ? 'text-amber-950' : 'text-slate-900 group-hover:text-amber-600'
            }`}
          >
            {trade.name}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {trade.description}
          </p>
        </div>
      </div>

      {trade.specialties && trade.specialties.length > 0 && (
        <div className="pt-3 mt-2 border-t border-slate-100 flex flex-wrap gap-1">
          {trade.specialties.slice(0, 2).map((s, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md truncate max-w-[120px]"
            >
              {s}
            </span>
          ))}
          {trade.specialties.length > 2 && (
            <span className="text-[10px] text-slate-400 font-semibold px-1">
              +{trade.specialties.length - 2}
            </span>
          )}
        </div>
      )}
    </button>
  );
};
