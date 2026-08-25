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
    <div className="bg-[#f0ece1] border border-[#ded5be] rounded-2xl p-4 space-y-2 text-xs text-slate-800 animate-fade-in">
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

      <div className="pt-2 border-t border-[#d5caaf] flex justify-between text-sm font-extrabold text-[#1e3835]">
        <span>Total</span>
        <span className="text-base text-[#1e3835]">{totalPriceDZD.toLocaleString('fr-DZ')} DA</span>
      </div>
    </div>
  );
};
