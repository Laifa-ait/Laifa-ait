import React from 'react';
import { DollarSign, Droplets, Zap, Building, Handshake, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Property } from '../../../types/realEstate';

interface DetailFinancialTermsProps {
  property: Property;
}

export const DetailFinancialTerms: React.FC<DetailFinancialTermsProps> = ({ property }) => {
  const isRentLong = property.listingType === 'rent_long';
  const isNegotiable = property.isPriceNegotiable;
  const advanceMonths = property.paymentAdvanceMonths || (isRentLong ? 6 : undefined);
  const depositMonths = property.securityDepositMonths ?? (isRentLong ? 1 : 0);
  const utilities = property.utilityCharges || { water: false, electricityGas: false, condoFees: false };

  const advanceTotal = advanceMonths ? property.price * advanceMonths : 0;
  const depositTotal = depositMonths ? property.price * depositMonths : 0;
  const signatureTotal = advanceTotal + depositTotal;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#e8e2d4] shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#f0eae0]">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#f4ecd8] rounded-2xl text-[#1a3831]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1a3831] font-['Playfair_Display',serif]">
              Conditions Financières & Commerciales
            </h3>
            <p className="text-[11px] text-slate-500">
              Modalités de paiement et charges incluses
            </p>
          </div>
        </div>

        {/* Badge Négociabilité */}
        {isNegotiable ? (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1">
            <Handshake className="w-3.5 h-3.5" />
            <span>Négociable (Khasem 🤝)</span>
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">
            Prix Ferme
          </span>
        )}
      </div>

      {/* Bail & Avance Locative (Location Longue Durée) */}
      {isRentLong && advanceMonths && (
        <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#1a3831] uppercase tracking-wider">
              Avance Locative Exigée à la Signature
            </span>
            <span className="px-2.5 py-0.5 bg-[#1a3831] text-[#ebdcb8] font-bold text-[11px] rounded-full">
              {advanceMonths} Mois ({advanceMonths === 12 ? '1 An' : `${advanceMonths}M`})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-white rounded-xl border border-[#e8e2d4]">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Loyer Mensuel</span>
              <span className="text-xs sm:text-sm font-black text-[#1a3831]">
                {new Intl.NumberFormat('fr-DZ').format(property.price)} DA
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#e8e2d4]">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Montant Avance ({advanceMonths}M)</span>
              <span className="text-xs sm:text-sm font-black text-emerald-800">
                {new Intl.NumberFormat('fr-DZ').format(advanceTotal)} DA
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#e8e2d4] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Caution ({depositMonths}M)</span>
              <span className="text-xs sm:text-sm font-black text-amber-800">
                {new Intl.NumberFormat('fr-DZ').format(depositTotal)} DA
              </span>
            </div>
          </div>

          {signatureTotal > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Total exigé à la remise des clés :</span>
              </span>
              <span className="text-sm font-black text-emerald-900">
                {new Intl.NumberFormat('fr-DZ').format(signatureTotal)} DA
              </span>
            </div>
          )}
        </div>
      )}

      {/* Charges & Utilitaires (ADE, Sonelgaz, Copropriété) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#1a3831] block">
          Réseaux & Charges de Copropriété :
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Eau ADE */}
          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
            utilities.water ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Droplets className={`w-4 h-4 shrink-0 ${utilities.water ? 'text-blue-600' : 'text-slate-400'}`} />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block truncate">Eau (ADE)</span>
              <span className="text-[10px] font-medium block">
                {utilities.water ? 'Inclus dans le prix' : 'Abonnement individuel'}
              </span>
            </div>
            {utilities.water ? (
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>

          {/* Sonelgaz */}
          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
            utilities.electricityGas ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Zap className={`w-4 h-4 shrink-0 ${utilities.electricityGas ? 'text-amber-600' : 'text-slate-400'}`} />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block truncate">Élec & Gaz (Sonelgaz)</span>
              <span className="text-[10px] font-medium block">
                {utilities.electricityGas ? 'Inclus dans le prix' : 'Compteur individuel'}
              </span>
            </div>
            {utilities.electricityGas ? (
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>

          {/* Copropriété */}
          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
            utilities.condoFees ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Building className={`w-4 h-4 shrink-0 ${utilities.condoFees ? 'text-emerald-700' : 'text-slate-400'}`} />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block truncate">Copropriété / Syndic</span>
              <span className="text-[10px] font-medium block">
                {utilities.condoFees ? 'Inclus dans le prix' : 'Non inclus'}
              </span>
            </div>
            {utilities.condoFees ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
