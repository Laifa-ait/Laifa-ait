import React from 'react';
import { ShoppingBag, Building2, Wrench, Store, ChevronRight } from 'lucide-react';
import { SuperAppVertical } from '../../types/superApp';

const VERTICAL_ICONS = {
  ShoppingBag,
  Building2,
  Wrench,
  Store,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {verticals.map((v) => {
        const Icon = VERTICAL_ICONS[v.iconName];
        const active = v.id === activeId;

        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.route)}
            className={`group relative p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
              active
                ? 'bg-stone-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                : 'bg-stone-800/40 border-stone-800 hover:bg-stone-800/70 ' + v.borderHover
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${v.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  {active && (
                    <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full shadow-xs">
                      Actif
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.badgeColor}`}
                  >
                    {v.badge}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                {v.name}
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-snug line-clamp-2">
                {v.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
              <span className="font-medium text-stone-300">{v.metrics}</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                Ouvrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
