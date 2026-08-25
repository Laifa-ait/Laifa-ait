import React from 'react';
import { Booking, BookingStatus } from '../../../types/realEstate';
import { Calendar, User, Phone, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface OwnerBookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
  onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
  onOpenChat: (booking: Booking) => void;
}

export const OwnerBookingsList: React.FC<OwnerBookingsListProps> = ({
  bookings,
  isLoading,
  onUpdateStatus,
  onOpenChat,
}) => {
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">En attente d'approbation</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">Séjour validé</span>;
      case 'cancelled':
      case 'rejected':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-800 text-[11px] font-bold rounded-full border border-rose-200">Annulé / Refusé</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-full border border-blue-200">Séjour terminé</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full capitalize">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#f0eae0] pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Réservations de séjours & vacances
          </h3>
          <p className="text-xs text-slate-500">
            Gérez les arrivées des voyageurs, validez les demandes et encaissez les séjours.
          </p>
        </div>
        <span className="px-3 py-1 bg-[#f4ecd8] text-[#1a3831] font-bold text-xs rounded-full">
          {bookings.length} séjours
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-bold animate-pulse">
          Chargement des réservations...
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-[#1a3831]">Aucune réservation de séjour</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Les réservations pour vos hébergements courte durée s'afficheront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(b.status)}
                  <span className="text-xs font-bold text-[#1a3831]">{b.propertyTitle || 'Hébergement'}</span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {new Intl.NumberFormat('fr-DZ').format(b.totalPriceDZD)} DA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#1a3831]" />
                    <span>Du {b.startDate} au {b.endDate} ({b.totalNights} nuits)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-[#1a3831]" />
                    <span>Voyageur: {b.travelerName || 'Client Olma'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-[#1a3831]" />
                    <span>Voyageurs: {b.guests?.adults || 1} adulte(s)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e8e2d4]">
                <button
                  type="button"
                  onClick={() => onOpenChat(b)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#e8e2d4] text-[#1a3831] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Messagerie</span>
                </button>

                {b.travelerPhone && (
                  <a
                    href={`tel:${b.travelerPhone}`}
                    className="p-2 bg-[#f4ecd8] border border-[#ebdcb8] text-[#1a3831] rounded-xl hover:bg-[#ebdcb8] transition flex items-center justify-center"
                    title="Appeler le voyageur"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                {b.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(b.id, 'confirmed')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accepter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(b.id, 'rejected')}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Refuser</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
