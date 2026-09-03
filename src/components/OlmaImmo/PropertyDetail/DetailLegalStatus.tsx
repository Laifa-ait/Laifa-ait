import React from 'react';
import { ShieldCheck, CheckCircle2, FileCheck, Scale, AlertCircle } from 'lucide-react';
import { Property } from '../../../types/realEstate';
import { getLegalPaperInfo } from '../../../constants/legalPapers';

interface DetailLegalStatusProps {
  property: Property;
}

export const DetailLegalStatus: React.FC<DetailLegalStatusProps> = ({ property }) => {
  const legalPapersList = Array.isArray(property.legalPapers) && property.legalPapers.length > 0
    ? property.legalPapers
    : (property.legalPaperType ? [property.legalPaperType] : []);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-5">
      {/* Header with Title & Certified Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0eae0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
                Statut Juridique du Bien
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-100" />
                Certifié DZ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparence administrative et conformité cadastrale selon la législation algérienne.
            </p>
          </div>
        </div>

        {property.isLegalVerified && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Documents validés par Olmart</span>
          </div>
        )}
      </div>

      {/* Documents list */}
      {legalPapersList.length > 0 ? (
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Documents déclarés par le propriétaire :
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {legalPapersList.map((paperType) => {
              const info = getLegalPaperInfo(paperType);
              if (!info) return null;
              const PaperIcon = info.icon || FileCheck;

              return (
                <div
                  key={paperType}
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] flex flex-col justify-between space-y-3 hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100/90 text-emerald-900 border border-emerald-200 flex items-center justify-center shrink-0">
                        <PaperIcon className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#1a3831] leading-tight">
                          {info.label}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {info.shortLabel}
                        </span>
                      </div>
                    </div>

                    {/* Certified Green Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-2xs shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-200" />
                      Certifié
                    </span>
                  </div>

                  {/* Legal Scope & Advice */}
                  <div className="space-y-1.5 pt-2 border-t border-[#f0eae0] text-[11px]">
                    <p className="text-slate-600 leading-snug">
                      <strong className="text-slate-800 font-semibold">Portée légale : </strong>
                      {info.legalScope}
                    </p>
                    <p className="text-emerald-900 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/60 leading-snug">
                      <strong className="text-emerald-950 font-semibold">Recommandation Olmart : </strong>
                      {info.buyerAdvice}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            Aucun document spécifique n&apos;a été déclaré pour ce bien. Nous vous recommandons de demander au propriétaire la consultation des actes lors de la visite.
          </p>
        </div>
      )}

      {/* Cadre de réassurance juridique */}
      <div className="p-4 rounded-2xl bg-[#f4ecd8]/60 border border-[#ebdcb8] flex items-start gap-3">
        <Scale className="w-5 h-5 text-[#1a3831] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-700">
          <h5 className="font-bold text-[#1a3831]">
            Garantie Notariale & Sécurité Transactionnelle Algérienne
          </h5>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Conformément à l&apos;article 324 bis 1 du Code civil algérien, tout transfert de propriété immobilière doit obligatoirement être dressé en la forme notariée et publié à la Conservation Foncière pour être opposable aux tiers. Olmart encourage systématiquement la vérification notariale avant tout versement d&apos;acompte.
          </p>
        </div>
      </div>
    </div>
  );
};
