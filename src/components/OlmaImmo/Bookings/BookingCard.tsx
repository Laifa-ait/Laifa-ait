import React from 'react';
import { Link } from 'react-router-dom';
import { Booking, BookingStatus } from '../../../types/realEstate';
import { Calendar, MapPin, Users, MessageSquare, ChevronRight, Ban } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onOpenChat: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onOpenChat,
  onCancelBooking,
}) => {
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
            Séjour Confirmé
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
            En attente de l'hôte
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold">
            Annulée
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold">
            Non acceptée
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold">
            Séjour Terminé
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold capitalize">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8e2d4] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col md:flex-row group">
      {/* Property Photo */}
      <div className="md:w-72 h-52 md:h-auto relative bg-slate-900 overflow-hidden shrink-0">
        <img loading="lazy" decoding="async" src={booking.propertyImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
          alt={booking.propertyTitle || 'Hébergement'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">{getStatusBadge(booking.status)}</div>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
          {booking.totalNights} nuit(s)
        </div>
      </div>

      {/* Booking Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-[#1a3831] font-['Playfair_Display',serif] group-hover:text-[#274b42] transition">
                {booking.propertyTitle || 'Hébergement de vacances'}
              </h3>
              {booking.propertyLocation && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1a3831]" />
                  <span>{booking.propertyLocation}</span>
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="block text-lg font-black text-[#1a3831]">
                {new Intl.NumberFormat('fr-DZ').format(booking.totalPriceDZD)} DA
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Prix total TTC</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faf8f5] border border-[#f0eae0]">
              <Calendar className="w-4 h-4 text-[#1a3831]" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Dates du séjour</span>
                <span className="font-semibold">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faf8f5] border border-[#f0eae0]">
              <Users className="w-4 h-4 text-[#1a3831]" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Voyageurs</span>
                <span className="font-semibold">
                  {booking.guests?.adults || 1} adulte(s)
                  {(booking.guests?.children ?? 0) > 0 ? `, ${booking.guests?.children} enfant(s)` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e8e2d4]">
          <button
            type="button"
            onClick={() => onOpenChat(booking)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-[#e8e2d4] text-[#1a3831] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#1a3831]" />
            <span>Contacter l'hôte</span>
          </button>

          <div className="flex items-center gap-2">
            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <button
                type="button"
                onClick={() => onCancelBooking(booking.id)}
                className="px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Annuler</span>
              </button>
            )}

            <Link
              to={`/immo/property/${booking.propertyId}`}
              className="px-4 py-2 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <span>Voir l'annonce</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
