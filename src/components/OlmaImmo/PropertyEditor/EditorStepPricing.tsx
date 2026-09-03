import React from 'react';
import { DollarSign, Phone, FileText } from 'lucide-react';
import { ListingType, UtilityCharges } from '../../../types/realEstate';
import { EditorStepFinancialsDZ } from './EditorStepFinancialsDZ';

interface EditorStepPricingProps {
  listingType: ListingType;
  price: number;
  setPrice: (val: number) => void;
  pricePeriod: 'night' | 'month' | 'total';
  setPricePeriod: (val: 'night' | 'month' | 'total') => void;
  paymentAdvanceMonths?: 1 | 3 | 6 | 12;
  setPaymentAdvanceMonths?: (months: 1 | 3 | 6 | 12) => void;
  securityDepositMonths?: number;
  setSecurityDepositMonths?: (months: number) => void;
  isPriceNegotiable?: boolean;
  setIsPriceNegotiable?: (negotiable: boolean) => void;
  utilityCharges?: UtilityCharges;
  setUtilityCharges?: (charges: UtilityCharges) => void;
  cleaningFee: number;
  setCleaningFee: (val: number) => void;
  serviceFee: number;
  setServiceFee: (val: number) => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
}

export const EditorStepPricing: React.FC<EditorStepPricingProps> = ({
  listingType,
  price,
  setPrice,
  pricePeriod,
  setPricePeriod,
  paymentAdvanceMonths = 6,
  setPaymentAdvanceMonths,
  securityDepositMonths = 1,
  setSecurityDepositMonths,
  isPriceNegotiable = false,
  setIsPriceNegotiable,
  utilityCharges = { water: false, electricityGas: false, condoFees: false },
  setUtilityCharges,
  cleaningFee,
  setCleaningFee,
  serviceFee,
  setServiceFee,
  title,
  setTitle,
  description,
  setDescription,
  contactPhone,
  setContactPhone,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-8">
      {/* Price & Currency */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1a3831]" />
            <span>Prix & Conditions Financières</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Indiquez le montant en Dinars Algériens (DZD).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-2">
            <label className="text-xs font-bold text-[#1a3831]">
              Montant {listingType === 'sale' ? 'global' : listingType === 'rent_long' ? 'du loyer mensuel' : 'de la nuitée'} (DA)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-base font-black text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
            />
            <span className="text-[11px] text-slate-500 block">
              {new Intl.NumberFormat('fr-DZ').format(price)} Dinars Algériens
            </span>
          </div>

          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-2">
            <label className="text-xs font-bold text-[#1a3831]">Périodicité</label>
            <select
              value={pricePeriod}
              onChange={(e) => setPricePeriod(e.target.value as 'night' | 'month' | 'total')}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-xs font-bold text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
            >
              {listingType === 'sale' && <option value="total">Prix Total (Vente)</option>}
              {listingType === 'rent_long' && <option value="month">Par Mois</option>}
              {listingType === 'rent_short' && <option value="night">Par Nuitée</option>}
            </select>
          </div>
        </div>

        {listingType === 'rent_short' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-2">
              <label className="text-xs font-bold text-[#1a3831]">Frais de ménage (DA)</label>
              <input
                type="number"
                min="0"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-xs font-bold text-[#1a3831]"
              />
            </div>
            <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-2">
              <label className="text-xs font-bold text-[#1a3831]">Frais de service (DA)</label>
              <input
                type="number"
                min="0"
                value={serviceFee}
                onChange={(e) => setServiceFee(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-xs font-bold text-[#1a3831]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Spécifications Financières & Commerciales Algériennes */}
      {setPaymentAdvanceMonths && setSecurityDepositMonths && setIsPriceNegotiable && setUtilityCharges && (
        <EditorStepFinancialsDZ
          listingType={listingType}
          price={price}
          paymentAdvanceMonths={paymentAdvanceMonths}
          setPaymentAdvanceMonths={setPaymentAdvanceMonths}
          securityDepositMonths={securityDepositMonths}
          setSecurityDepositMonths={setSecurityDepositMonths}
          isPriceNegotiable={isPriceNegotiable}
          setIsPriceNegotiable={setIsPriceNegotiable}
          utilityCharges={utilityCharges}
          setUtilityCharges={setUtilityCharges}
        />
      )}

      {/* Title & Description */}
      <div className="space-y-4 pt-6 border-t border-[#f0eae0]">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1a3831]" />
            <span>Titre & Texte de l'Annonce</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rédigez une présentation soignée et détaillée.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#1a3831] block mb-1">Titre de l'annonce</label>
            <input
              type="text"
              placeholder="Ex: Superbe Appartement F4 avec vue dégagée et ascenseur"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf8f5] border border-[#e8e2d4] rounded-xl text-sm font-bold text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1a3831] block mb-1">Description complète</label>
            <textarea
              rows={5}
              placeholder="Décrivez l'exposition, l'état de l'appartement, la proximité des commerces, écoles et transports..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf8f5] border border-[#e8e2d4] rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-[#1a3831]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1a3831] block mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Numéro de téléphone de contact</span>
            </label>
            <input
              type="tel"
              placeholder="0550 12 34 56"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 bg-[#faf8f5] border border-[#e8e2d4] rounded-xl text-xs font-bold text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
