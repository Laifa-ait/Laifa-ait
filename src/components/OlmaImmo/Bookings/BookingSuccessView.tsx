import React from 'react';
import { CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';

interface BookingSuccessViewProps {
  createdBookingId: string;
  propertyTitle: string;
  startDate: string;
  endDate: string;
  guests: { adults: number; children: number };
  totalPriceDZD: number;
  formatDateLabel: (dateStr: string) => string;
  onGoToMyBookings: () => void;
  onContactOwner: () => void;
}

export const BookingSuccessView: React.FC<BookingSuccessViewProps> = ({
  createdBookingId,
  propertyTitle,
  startDate,
  endDate,
  guests,
  totalPriceDZD,
  formatDateLabel,
  onGoToMyBookings,
  onContactOwner,
}) => {
  return (
    <div className="text-center py-6 space-y-5">
      <div className="w-16 h-16 bg-[#1E3A8A] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-blue-900">
        <CheckCircle2 className="w-10 h-10 text-[#F59E0B]" />
      </div>

      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#1E3A8A]">
          Demande transmise
        </span>
        <h3 className="text-xl font-bold text-[#1E3A8A] font-['Playfair_Display',serif]">
          Réservation en attente de confirmation
        </h3>
        <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
          Votre demande de séjour pour <strong className="text-zinc-900">{propertyTitle}</strong> a été enregistrée avec succès sous la référence <span className="font-mono font-bold text-[#1E3A8A]">{createdBookingId}</span>.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-zinc-700">
        <div className="flex justify-between font-medium">
          <span>Dates du séjour :</span>
          <span className="font-bold text-[#1E3A8A]">{formatDateLabel(startDate)} → {formatDateLabel(endDate)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Voyageurs :</span>
          <span className="font-bold text-[#1E3A8A]">{guests.adults} adulte{guests.adults > 1 ? 's' : ''} {guests.children > 0 ? `· ${guests.children} enfant${guests.children > 1 ? 's' : ''}` : ''}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
          <span>Total estimé :</span>
          <span className="text-emerald-800 text-sm">{totalPriceDZD.toLocaleString('fr-DZ')} DA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onGoToMyBookings}
          className="w-full py-3 px-4 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>Mes séjours</span>
          <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
        </button>

        <button
          type="button"
          onClick={onContactOwner}
          className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px] border border-slate-200"
        >
          <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
          <span>Contacter l'hôte</span>
        </button>
      </div>
    </div>
  );
};
