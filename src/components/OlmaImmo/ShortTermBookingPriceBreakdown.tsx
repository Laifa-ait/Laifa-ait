import React from 'react';

interface ShortTermBookingPriceBreakdownProps {
  nightlyPrice: number;
  totalNights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPriceDZD: number;
}

export const ShortTermBookingPriceBreakdown: React.FC<ShortTermBookingPriceBreakdownProps> = ({
  nightlyPrice,
  totalNights,
  subtotal,
  cleaningFee,
  serviceFee,
  totalPriceDZD,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-800 animate-fade-in">
      <div className="flex justify-between">
        <span>
          {nightlyPrice.toLocaleString('fr-DZ')} DA × {totalNights} nuit{totalNights > 1 ? 's' : ''}
        </span>
        <span className="font-semibold">{subtotal.toLocaleString('fr-DZ')} DA</span>
      </div>

      <div className="flex justify-between">
        <span>Frais de ménage</span>
        <span className="font-semibold">{cleaningFee.toLocaleString('fr-DZ')} DA</span>
      </div>

      <div className="flex justify-between">
        <span>Frais de service Olma</span>
        <span className="font-semibold">{serviceFee.toLocaleString('fr-DZ')} DA</span>
      </div>

      <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-[#1E3A8A]">
        <span>Total</span>
        <span className="text-base text-[#1E3A8A]">{totalPriceDZD.toLocaleString('fr-DZ')} DA</span>
      </div>
    </div>
  );
};
