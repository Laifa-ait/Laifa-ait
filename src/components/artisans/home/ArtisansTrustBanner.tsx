import React from 'react';
import { ShieldCheck, MapPin, Zap } from 'lucide-react';

export const ArtisansTrustBanner: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">Artisans Vérifiés</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identité et qualifications contrôlées par l'équipe Olmart
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">58 Wilayas Couvertes</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trouvez des professionnels directement dans votre commune
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">Devis 100% Gratuits</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mise en relation directe sans commissions cachées
          </p>
        </div>
      </div>
    </div>
  );
};
