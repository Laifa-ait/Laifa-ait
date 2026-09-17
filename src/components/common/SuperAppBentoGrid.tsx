import React from 'react';
import { ShoppingBag, Building2, Wrench, Store, ChevronRight, Check } from 'lucide-react';
import { SuperAppVertical } from '../../types/superApp';

const VERTICAL_ICONS = {
  ShoppingBag,
  Building2,
  Wrench,
  Store,
};

const VERTICAL_THEMES: Record<
  string,
  {
    iconGradient: string;
    iconShadow: string;
    badgeStyle: string;
    activeBorder: string;
    activeBg: string;
  }
> = {
  marketplace: {
    iconGradient: 'from-amber-500 via-orange-500 to-amber-600',
    iconShadow: 'shadow-orange-500/20',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200/90',
    activeBorder: 'border-orange-500/50 ring-2 ring-orange-500/20',
    activeBg: 'bg-orange-50/30',
  },
  immo: {
    iconGradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    iconShadow: 'shadow-emerald-500/20',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    activeBorder: 'border-emerald-500/50 ring-2 ring-emerald-500/20',
    activeBg: 'bg-emerald-50/30',
  },
  bricolage: {
    iconGradient: 'from-blue-600 via-indigo-600 to-blue-700',
    iconShadow: 'shadow-blue-500/20',
    badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200/90',
    activeBorder: 'border-blue-500/50 ring-2 ring-blue-500/20',
    activeBg: 'bg-blue-50/30',
  },
  shops: {
    iconGradient: 'from-purple-600 via-fuchsia-600 to-purple-700',
    iconShadow: 'shadow-purple-500/20',
    badgeStyle: 'bg-purple-50 text-purple-800 border-purple-200/90',
    activeBorder: 'border-purple-500/50 ring-2 ring-purple-500/20',
    activeBg: 'bg-purple-50/30',
  },
};

interface SuperAppBentoGridProps {
  verticals: SuperAppVertical[];
  activeId: string;
  onSelect: (route: string) => void;
}

export const SuperAppBentoGrid: React.FC<SuperAppBentoGridProps> = ({
  verticals,
  activeId,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {verticals.map((v) => {
        const Icon = VERTICAL_ICONS[v.iconName];
        const active = v.id === activeId;
        const theme = VERTICAL_THEMES[v.id] || VERTICAL_THEMES.marketplace;

        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.route)}
            className={`group relative p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
              active
                ? `${theme.activeBg} ${theme.activeBorder} shadow-[0_8px_24px_rgba(30,58,138,0.08)]`
                : 'bg-white hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]'
            }`}
          >
            <div>
              {/* Header inside Card: Icon & Badges */}
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${theme.iconGradient} text-white flex items-center justify-center shadow-md ${theme.iconShadow} group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {active && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-[#1E3A8A] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Actif
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeStyle}`}
                  >
                    {v.badge}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="text-base font-black text-slate-900 group-hover:text-[#1E3A8A] transition-colors tracking-tight">
                {v.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                {v.description}
              </p>
            </div>

            {/* Bottom Row: Metric & Action Link */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-md">
                {v.metrics}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs transition-all duration-200 ${
                  active
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-[#1E3A8A] group-hover:text-white group-hover:shadow-xs'
                }`}
              >
                {active ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    En cours
                  </>
                ) : (
                  <>
                    Ouvrir
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
