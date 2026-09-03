import React from 'react';
import { Briefcase, Building2, Wrench, ShieldCheck, ChevronRight, Sparkles, Key } from 'lucide-react';
import { QuickRoleAccess } from '../../types/superApp';

interface SuperAppRoleShortcutsProps {
  shortcuts: QuickRoleAccess[];
  hasUser: boolean;
  onSelect: (route: string) => void;
}

export const SuperAppRoleShortcuts: React.FC<SuperAppRoleShortcutsProps> = ({
  shortcuts,
  hasUser,
  onSelect,
}) => {
  if (shortcuts.length === 0 && hasUser) {
    return (
      <div className="p-3.5 rounded-2xl bg-stone-800/50 border border-stone-700/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Devenez Partenaire Pro</div>
            <div className="text-[11px] text-stone-400">
              Vendez vos produits ou louez vos biens sur Olmart
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect('/immo/owner')}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
        >
          Activer
        </button>
      </div>
    );
  }

  if (shortcuts.length === 0) return null;

  return (
    <div className="pt-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
          Vos Espaces Pro & Privilégiés
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {shortcuts.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => onSelect(sc.route)}
            className="p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 text-left flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                {sc.iconName === 'Briefcase' && <Briefcase className="w-4 h-4" />}
                {sc.iconName === 'Building2' && <Building2 className="w-4 h-4" />}
                {sc.iconName === 'Wrench' && <Wrench className="w-4 h-4" />}
                {sc.iconName === 'ShieldCheck' && <ShieldCheck className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  {sc.title}
                </div>
                <div className="text-[10px] text-stone-400">{sc.subtitle}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
