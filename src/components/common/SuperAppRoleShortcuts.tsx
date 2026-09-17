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
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-200/80 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">Devenez Partenaire Pro</div>
            <div className="text-[11px] text-slate-500 font-medium">
              Vendez vos produits ou louez vos biens sur Olmart
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect('/immo/owner')}
          className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          Activer
        </button>
      </div>
    );
  }

  if (shortcuts.length === 0) return null;

  return (
    <div className="pt-1">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Vos Espaces Pro & Privilégiés
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {shortcuts.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => onSelect(sc.route)}
            className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-left flex items-center justify-between transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#1E3A8A] group-hover:text-white flex items-center justify-center transition-colors">
                {sc.iconName === 'Briefcase' && <Briefcase className="w-4 h-4" />}
                {sc.iconName === 'Building2' && <Building2 className="w-4 h-4" />}
                {sc.iconName === 'Wrench' && <Wrench className="w-4 h-4" />}
                {sc.iconName === 'ShieldCheck' && <ShieldCheck className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                  {sc.title}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">{sc.subtitle}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
};
