import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { apiGet } from '../../lib/api';
import { ShortTermBookingGuestsSelector } from './ShortTermBookingGuestsSelector';
import { ShortTermBookingPriceBreakdown } from './ShortTermBookingPriceBreakdown';
import { ShortTermBookingGrid } from './ShortTermBookingGrid';

export interface UnavailableRange {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: 'RESERVED' | 'PENDING' | 'BLOCKED';
}

export interface AvailabilityResponse {
  success: boolean;
  propertyId: string;
  nightlyPrice: number;
  listingType: string;
  cleaningFee: number;
  serviceFee: number;
  currency: string;
  unavailableRanges: UnavailableRange[];
}

interface ShortTermBookingCalendarProps {
  propertyId: string;
  nightlyPrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  onSelectBooking: (bookingData: {
    startDate: string;
    endDate: string;
    totalNights: number;
    guests: { adults: number; children: number };
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    totalPriceDZD: number;
  }) => void;
}

export const ShortTermBookingCalendar: React.FC<ShortTermBookingCalendarProps> = ({
  propertyId,
  nightlyPrice,
  cleaningFee = 10000,
  serviceFee = 5000,
  onSelectBooking,
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [unavailableRanges, setUnavailableRanges] = useState<UnavailableRange[]>([]);

  // Selection states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [hoverDate, setHoverDate] = useState<string>('');

  // Guests states
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    const fetchAvailability = async () => {
      try {
        const res = await apiGet<AvailabilityResponse>(
          `/api/v1/real-estate/properties/${propertyId}/availability`
        );
        if (isMounted && res.success && res.unavailableRanges) {
          setUnavailableRanges(res.unavailableRanges);
        }
      } catch (err) {
        console.error('Failed to fetch property availability:', err);
      }
    };

    fetchAvailability();
    return () => { isMounted = false; };
  }, [propertyId]);

  const isDateInPast = (dateStr: string) => dateStr < todayStr;
  const isDateBooked = (dateStr: string) => unavailableRanges.some((r) => dateStr >= r.startDate && dateStr < r.endDate);
  const isDateDisabled = (dateStr: string) => isDateInPast(dateStr) || isDateBooked(dateStr);

  const handleDateClick = (dateStr: string) => {
    if (isDateDisabled(dateStr)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
    } else if (startDate && !endDate) {
      if (dateStr <= startDate) {
        setStartDate(dateStr);
      } else {
        const curr = new Date(startDate);
        const end = new Date(dateStr);
        let hasBlockedInBetween = false;

        while (curr < end) {
          const currStr = curr.toISOString().split('T')[0];
          if (isDateDisabled(currStr)) {
            hasBlockedInBetween = true;
            break;
          }
          curr.setDate(curr.getDate() + 1);
        }

        if (hasBlockedInBetween) {
          setStartDate(dateStr);
          setEndDate('');
        } else {
          setEndDate(dateStr);
        }
      }
    }
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= minMonth) setCurrentMonth(prev);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  let totalNights = 0;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    totalNights = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const subtotal = totalNights * nightlyPrice;
  const totalPriceDZD = totalNights > 0 ? subtotal + cleaningFee + serviceFee : 0;

  const handleConfirmReservation = () => {
    if (!startDate || !endDate) return;
    onSelectBooking({
      startDate,
      endDate,
      totalNights,
      guests: { adults, children },
      subtotal,
      cleaningFee,
      serviceFee,
      totalPriceDZD,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xl border border-[#e8e2d4] space-y-5 font-sans">
      {/* Header Price Banner */}
      <div className="flex items-baseline justify-between pb-4 border-b border-[#f0ebd8]">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#1e3835]">
              {nightlyPrice.toLocaleString('fr-DZ')} DA
            </span>
            <span className="text-xs font-semibold text-slate-500">/ nuit</span>
          </div>
          <p className="text-[11px] text-[#7a824e] font-semibold mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Séjour de courte durée
          </p>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f4ebd8] text-[#1e3835] text-[11px] font-bold rounded-lg border border-[#e2d6b5]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1e3835]" />
            Garantie Olma
          </span>
        </div>
      </div>

      {/* Date Range Display Box */}
      <div className="grid grid-cols-2 gap-2 bg-[#f9f7f2] border border-[#e6e0d0] rounded-2xl p-2.5">
        <div className="px-2">
          <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Arrivée</span>
          <span className="text-xs font-bold text-[#1e3835]">
            {startDate ? new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choisir la date'}
          </span>
        </div>
        <div className="px-2 border-s border-[#e6e0d0]">
          <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Départ</span>
          <span className="text-xs font-bold text-[#1e3835]">
            {endDate ? new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choisir la date'}
          </span>
        </div>
      </div>

      {/* Calendar Grid Section */}
      <ShortTermBookingGrid
        currentMonth={currentMonth}
        today={today}
        todayStr={todayStr}
        startDate={startDate}
        endDate={endDate}
        hoverDate={hoverDate}
        setHoverDate={setHoverDate}
        isDateDisabled={isDateDisabled}
        handleDateClick={handleDateClick}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
      />

      {/* Guests Selector */}
      <ShortTermBookingGuestsSelector
        adults={adults}
        setAdults={setAdults}
        childrenCount={children}
        setChildrenCount={setChildren}
      />

      {/* Pricing Breakdown */}
      {startDate && endDate && totalNights > 0 && (
        <ShortTermBookingPriceBreakdown
          nightlyPrice={nightlyPrice}
          totalNights={totalNights}
          subtotal={subtotal}
          cleaningFee={cleaningFee}
          serviceFee={serviceFee}
          totalPriceDZD={totalPriceDZD}
        />
      )}

      {/* Reservation Button */}
      <button
        type="button"
        disabled={!startDate || !endDate || totalNights <= 0}
        onClick={handleConfirmReservation}
        className="w-full py-3.5 px-4 bg-[#1e3835] hover:bg-[#152725] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#1e3835]/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2"
      >
        <CalendarIcon className="w-4 h-4 text-[#ebdcb8]" />
        <span>
          {!startDate ? 'Choisir vos dates' : !endDate ? 'Choisir la date de départ' : 'Vérifier & Réserver'}
        </span>
      </button>

      <p className="text-[10px] text-center text-slate-500 font-medium">
        Aucun montant n'est débité immédiatement. La demande est soumise à la confirmation du propriétaire.
      </p>
    </div>
  );
};
