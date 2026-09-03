import React from 'react';
import { DollarSign, Droplets, Zap, Building, Handshake, Check, Info } from 'lucide-react';
import { ListingType, UtilityCharges } from '../../../types/realEstate';

interface EditorStepFinancialsDZProps {
  listingType: ListingType;
  price: number;
  paymentAdvanceMonths?: 1 | 3 | 6 | 12;
  setPaymentAdvanceMonths: (months: 1 | 3 | 6 | 12) => void;
  securityDepositMonths?: number;
  setSecurityDepositMonths: (months: number) => void;
  isPriceNegotiable: boolean;
  setIsPriceNegotiable: (negotiable: boolean) => void;
  utilityCharges: UtilityCharges;
  setUtilityCharges: (charges: UtilityCharges) => void;
}

export const EditorStepFinancialsDZ: React.FC<EditorStepFinancialsDZProps> = ({
  listingType,
  price,
  paymentAdvanceMonths = 6,
  setPaymentAdvanceMonths,
  securityDepositMonths = 1,
  setSecurityDepositMonths,
  isPriceNegotiable,
  setIsPriceNegotiable,
  utilityCharges,
  setUtilityCharges,
}) => {
  const toggleUtility = (key: keyof UtilityCharges) => {
    setUtilityCharges({ ...utilityCharges, [key]: !utilityCharges[key] });
  };

  const advanceTotalDZD = price * paymentAdvanceMonths;
  const depositTotalDZD = price * securityDepositMonths;
  const grandTotalInitialDZD = advanceTotalDZD + depositTotalDZD;

  return (
    <div className="space-y-5 pt-5 border-t border-[#f0eae0]">
      {/* Négociabilité du Prix */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1a3831] flex items-center gap-1.5">
            <Handshake className="w-4 h-4 text-[#1a3831]" />
            <span>Négociabilité du Prix (Khasem 🤝)</span>
          </label>
          <span className="text-[11px] text-slate-500">Pratique commerciale courante</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsPriceNegotiable(false)}
            className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
              !isPriceNegotiable ? 'border-[#1a3831] bg-[#f4ecd8]/60 shadow-2xs' : 'border-[#e8e2d4] bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-[#1a3831] block">Prix Ferme / Non négociable</span>
              <span className="text-[10px] text-slate-500 block">Le montant est définitif</span>
            </div>
            {!isPriceNegotiable && <Check className="w-4 h-4 text-[#1a3831] stroke-[3]" />}
          </button>

          <button
            type="button"
            onClick={() => setIsPriceNegotiable(true)}
            className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
              isPriceNegotiable ? 'border-amber-600 bg-amber-50 shadow-2xs' : 'border-[#e8e2d4] bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-amber-900 block flex items-center gap-1">
                <span>Négociable (Khasem) 🤝</span>
              </span>
              <span className="text-[10px] text-slate-500 block">Ouvert aux offres</span>
            </div>
            {isPriceNegotiable && <Check className="w-4 h-4 text-amber-800 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Spécificités Location Longue Durée (Avance & Caution DZ) */}
      {listingType === 'rent_long' && (
        <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#e8e2d4] pb-2.5">
            <div>
              <h4 className="text-xs font-bold text-[#1a3831] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Modalités de Bail & Avance Locative DZ</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Spécificités réglementaires du marché immobilier algérien.</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Standard DZ
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a3831] block">Avance exigée à la signature :</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { months: 1, label: '1 Mois', badge: 'Court' },
                { months: 3, label: '3 Mois', badge: 'Trimestre' },
                { months: 6, label: '6 Mois', badge: 'Standard DZ ⭐' },
                { months: 12, label: '12 Mois (1 An)', badge: 'Standard DZ ⭐' },
              ] as const).map((opt) => {
                const isSel = paymentAdvanceMonths === opt.months;
                return (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setPaymentAdvanceMonths(opt.months)}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isSel ? 'bg-[#1a3831] text-[#ebdcb8] border-[#1a3831] font-bold' : 'bg-white text-slate-700 border-[#e8e2d4] hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{opt.label}</span>
                    <span className={`text-[9px] ${isSel ? 'text-amber-200 font-semibold' : 'text-slate-400'}`}>{opt.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1a3831] block">Caution de garantie (Mois de loyer) :</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={securityDepositMonths}
                  onChange={(e) => setSecurityDepositMonths(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 bg-white border border-[#e8e2d4] rounded-xl text-xs font-bold text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
                />
                <span className="text-xs text-slate-600 font-semibold">= {new Intl.NumberFormat('fr-DZ').format(depositTotalDZD)} DA</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-0.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                <span>Total à verser à la signature :</span>
                <span className="text-xs font-black text-emerald-950">{new Intl.NumberFormat('fr-DZ').format(grandTotalInitialDZD)} DA</span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-tight">
                Comprend {paymentAdvanceMonths}M d'avance ({new Intl.NumberFormat('fr-DZ').format(advanceTotalDZD)} DA) + {securityDepositMonths}M de caution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charges Incluses / Exclues */}
      <div className="space-y-2.5">
        <div>
          <label className="text-xs font-bold text-[#1a3831] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#1a3831]" />
            <span>Inclusion des Charges & Réseaux Utilitaires</span>
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">Cochez les charges directement incluses dans le prix.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { key: 'water' as const, label: 'Eau (ADE)', icon: Droplets, activeColor: 'border-blue-600 bg-blue-50/60', iconColor: 'bg-blue-600' },
            { key: 'electricityGas' as const, label: 'Sonelgaz (Élec/Gaz)', icon: Zap, activeColor: 'border-amber-600 bg-amber-50/60', iconColor: 'bg-amber-600' },
            { key: 'condoFees' as const, label: 'Copropriété / Syndic', icon: Building, activeColor: 'border-emerald-700 bg-emerald-50/60', iconColor: 'bg-emerald-700' },
          ].map(({ key, label, icon: Icon, activeColor, iconColor }) => {
            const isInc = utilityCharges[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleUtility(key)}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
                  isInc ? activeColor : 'border-[#e8e2d4] bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl text-white ${isInc ? iconColor : 'bg-slate-200 text-slate-600'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{label}</span>
                    <span className="text-[10px] text-slate-500 block">{isInc ? 'Inclus' : 'Non inclus'}</span>
                  </div>
                </div>
                {isInc && <Check className="w-3.5 h-3.5 text-slate-800 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
