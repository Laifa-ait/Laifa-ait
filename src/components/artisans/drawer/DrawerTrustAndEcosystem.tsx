import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Building2,
  HelpCircle,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';

interface DrawerTrustAndEcosystemProps {
  onClose: () => void;
}

export const DrawerTrustAndEcosystem: React.FC<DrawerTrustAndEcosystemProps> = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pt-2 border-t border-slate-200/80">
      {/* Guarantees & Trust Card */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/80 space-y-2">
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Garantie Sérénité Olmart
          </h4>
        </div>
        <ul className="text-[11px] text-slate-600 space-y-1.5 pl-0.5">
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Artisans qualifiés & vérifiés manuellement</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Devis 100% gratuits & sans aucun engagement</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Paiement direct de gré à gré après travaux</span>
          </li>
        </ul>
      </div>

      {/* Olmart Ecosystem Navigation */}
      <div className="space-y-1">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
          Services de l&apos;Écosystème Olmart
        </h4>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/shop');
          }}
          className="w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
            <span>Marketplace & Outillage</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/immo');
          }}
          className="w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Building2 className="w-3.5 h-3.5" />
            </span>
            <span>Immobilier & Location</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/support');
          }}
          className="w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
            <span>Centre d&apos;Aide & Support</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <a
          href="tel:+213550000000"
          className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <PhoneCall className="w-3.5 h-3.5" />
            </span>
            <span>Assistance Téléphonique Algérie</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            7j/7
          </span>
        </a>
      </div>
    </div>
  );
};
