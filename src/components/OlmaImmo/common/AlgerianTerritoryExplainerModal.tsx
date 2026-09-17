import React from 'react';
import { Landmark, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { TERRITORY_LEVELS } from './territoryData';

export interface AlgerianTerritoryExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgerianTerritoryExplainerModal: React.FC<AlgerianTerritoryExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="territory-explainer-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-md">
              <Landmark className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F59E0B] block">
                Guide Foncier & Administratif Algérien
              </span>
              <h3
                id="territory-explainer-title"
                className="text-lg sm:text-xl font-black text-[#1E3A8A]"
              >
                Comprendre : Wilaya • Daïra • Baladia
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le guide"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5 text-xs text-slate-700 leading-relaxed">
          <p>
            Pour effectuer une recherche immobilière précise et sécurisée en Algérie, le découpage administratif s’articule en <strong>trois échelons hiérarchiques</strong>. Chaque annonce sur Olma Immo est géoréférencée selon cette nomenclature officielle :
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="space-y-4 mb-6">
          {TERRITORY_LEVELS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.level}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${item.color}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shadow-xs shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-black tracking-tight">
                          {item.title} ({item.subtitle})
                        </h4>
                        <span className="text-xs font-bold opacity-75 font-arabic">
                          {item.arabic}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold opacity-80 block">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/90 shadow-2xs border border-current/20 shrink-0">
                    Niveau {item.level}
                  </span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed mb-3 font-normal opacity-95">
                  {item.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-current/15 text-xs">
                  <div className="flex items-start gap-1.5 opacity-90">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      <strong>Gouvernance :</strong> {item.governance}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 opacity-90">
                    <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      <strong>Impact immobilier :</strong> {item.realEstateImpact}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs text-amber-950 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            <strong>Recherche Olma Immo :</strong> Vous pouvez filtrer par <strong>Wilaya</strong> pour avoir une vue provinciale, affiner par <strong>Daïra</strong> pour cibler un bassin de vie spécifique, ou sélectionner directement la <strong>Baladia / Commune</strong> pour inspecter un quartier précis sur la carte.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Compris, fermer
          </button>
        </div>
      </div>
    </div>
  );
};
