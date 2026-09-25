import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Droplets, Zap, Building, Handshake, CheckCircle2, AlertCircle, Sparkles, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { PublicPropertyDTO } from '../../../types/realEstate';

interface DetailFinancialTermsProps {
  property: PublicPropertyDTO;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const formatDZD = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(amount);
};

export const DetailFinancialTerms: React.FC<DetailFinancialTermsProps> = ({
  property,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const isRentLong = property.listingType === 'rent_long';
  const isNegotiable = property.isPriceNegotiable;
  const advanceMonths = property.paymentAdvanceMonths || (isRentLong ? 6 : undefined);
  const depositMonths = property.securityDepositMonths ?? (isRentLong ? 1 : 0);
  const utilities = property.utilityCharges || { water: false, electricityGas: false, condoFees: false };

  const advanceTotal = advanceMonths ? property.price * advanceMonths : 0;
  const depositTotal = depositMonths ? property.price * depositMonths : 0;
  const signatureTotal = advanceTotal + depositTotal;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-2xl text-[#1E3A8A]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E3A8A] font-['Playfair_Display',serif]">
              {t('immo_finance_title', 'Conditions Financières & Commerciales')}
            </h3>
            <p className="text-[11px] text-slate-500">
              {t('immo_finance_subtitle', 'Modalités indicatives de paiement et charges incluses')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Négociabilité */}
          {isNegotiable ? (
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1">
              <Handshake className="w-3.5 h-3.5" />
              <span>{t('immo_finance_negotiable', 'Négociable')}</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">
              {t('immo_finance_fixed_price', 'Prix Ferme')}
            </span>
          )}

          <button
            type="button"
            onClick={handleToggle}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 active:scale-95"
            aria-label={isOpen ? t('immo_finance_hide', 'Masquer') : t('immo_finance_show', 'Afficher')}
          >
            <span>{isOpen ? t('immo_finance_hide', 'Masquer') : t('immo_finance_show', 'Afficher')}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          {/* Bail & Avance Locative (Location Longue Durée) */}
          {isRentLong && advanceMonths && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider">
                  {t('immo_finance_advance_required', 'Avance Locative Exigée à la Signature')}
                </span>
                <span className="px-2.5 py-0.5 bg-[#1E3A8A] text-white font-bold text-[11px] rounded-full">
                  {advanceMonths} {t('immo_finance_months', 'Mois')} ({advanceMonths === 12 ? t('immo_finance_one_year', '1 An') : `${advanceMonths}M`})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">{t('immo_finance_monthly_rent', 'Loyer Mensuel')}</span>
                  <span className="text-xs sm:text-sm font-black text-[#1E3A8A]">
                    {formatDZD(property.price)} DA
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    {t('immo_finance_advance_amount', 'Montant Avance')} ({advanceMonths}M)
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-800">
                    {formatDZD(advanceTotal)} DA
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    {t('immo_finance_deposit', 'Caution')} ({depositMonths}M)
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-800">
                    {formatDZD(depositTotal)} DA
                  </span>
                </div>
              </div>

              {signatureTotal > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>{t('immo_finance_total_at_keys', 'Total exigé à la remise des clés :')}</span>
                  </span>
                  <span className="text-sm font-black text-emerald-900">
                    {formatDZD(signatureTotal)} DA
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Charges & Utilitaires */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#1E3A8A] block">
              {t('immo_finance_utilities_title', 'Réseaux & Charges de Copropriété :')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Eau ADE */}
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                utilities.water ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <Droplets className={`w-4 h-4 shrink-0 ${utilities.water ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold block truncate">{t('immo_finance_water', 'Eau (ADE)')}</span>
                  <span className="text-[10px] font-medium block">
                    {utilities.water ? t('immo_finance_included', 'Inclus dans le prix') : t('immo_finance_indiv_sub', 'Abonnement individuel')}
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
                  <span className="text-xs font-bold block truncate">{t('immo_finance_gas_elec', 'Élec & Gaz (Sonelgaz)')}</span>
                  <span className="text-[10px] font-medium block">
                    {utilities.electricityGas ? t('immo_finance_included', 'Inclus dans le prix') : t('immo_finance_indiv_meter', 'Compteur individuel')}
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
                  <span className="text-xs font-bold block truncate">{t('immo_finance_condo', 'Copropriété / Syndic')}</span>
                  <span className="text-[10px] font-medium block">
                    {utilities.condoFees ? t('immo_finance_included', 'Inclus dans le prix') : t('immo_finance_not_included', 'Non inclus')}
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

          {/* Reassurance no online payment */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-stone-600">
            <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {t('immo_finance_reassurance', "Règlement de gré à gré ou par chèque de banque certifié lors de la signature chez le notaire. Aucun acompte n'est perçu en ligne.")}
            </span>
          </div>
        </>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700">
            {isNegotiable ? t('immo_finance_negotiable', 'Prix Négociable') : t('immo_finance_fixed_price', 'Prix Ferme')} • {isRentLong && advanceMonths ? `${t('immo_finance_advance_amount', 'Avance')} ${advanceMonths} ${t('immo_finance_months', 'mois')} • ` : ''}{t('immo_finance_summary_notary', 'Règlement notarié sécurisé')}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className="text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline cursor-pointer shrink-0 ml-2"
          >
            {t('immo_finance_unfold', 'Déplier')}
          </button>
        </div>
      )}
    </div>
  );
};
