import React from 'react';
import { Link } from 'react-router-dom';
import { Booking, BookingStatus } from '../../../types/realEstate';
import { Calendar, MapPin, Users, MessageSquare, ChevronRight, Ban } from 'lucide-react';
import { OlmaCard } from '../primitives/OlmaCard';
import { OlmaPill } from '../primitives/OlmaPill';
import { OlmaButton } from '../primitives/OlmaButton';

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
          <OlmaPill variant="success" size="md" dot>
            Séjour Confirmé
          </OlmaPill>
        );
      case 'pending':
        return (
          <OlmaPill variant="warning" size="md" dot>
            En attente de l'hôte
          </OlmaPill>
        );
      case 'cancelled':
        return (
          <OlmaPill variant="danger" size="md">
            Annulée
          </OlmaPill>
        );
      case 'rejected':
        return (
          <OlmaPill variant="neutral" size="md">
            Non acceptée
          </OlmaPill>
        );
      case 'completed':
        return (
          <OlmaPill variant="info" size="md">
            Séjour Terminé
          </OlmaPill>
        );
      default:
        return (
          <OlmaPill variant="neutral" size="md" className="capitalize">
            {status}
          </OlmaPill>
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
    <OlmaCard
      variant="default"
      radius="2xl"
      elevation="subtle"
      bordered
      borderVariant="default"
      className="flex flex-col md:flex-row group transition-all duration-300 hover:shadow-[var(--olma-shadow-card)]"
    >
      {/* Property Photo */}
      <div className="md:w-72 h-52 md:h-auto relative bg-zinc-900 overflow-hidden shrink-0">
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
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1a3831]" />
                  <span>{booking.propertyLocation}</span>
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="block text-lg font-black text-[#1a3831]">
                {new Intl.NumberFormat('fr-DZ').format(booking.totalPriceDZD)} DA
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">Prix total TTC</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-zinc-700">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#faf8f5] border border-[#f0eae0]">
              <Calendar className="w-4 h-4 text-[#1a3831]" />
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase">Dates du séjour</span>
                <span className="font-semibold">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#faf8f5] border border-[#f0eae0]">
              <Users className="w-4 h-4 text-[#1a3831]" />
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase">Voyageurs</span>
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
          <OlmaButton
            variant="secondary"
            size="sm"
            onClick={() => onOpenChat(booking)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#1a3831]" />}
          >
            Contacter l'hôte
          </OlmaButton>

          <div className="flex items-center gap-2">
            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <OlmaButton
                variant="danger"
                size="sm"
                onClick={() => onCancelBooking(booking.id)}
                leftIcon={<Ban className="w-3.5 h-3.5" />}
              >
                Annuler
              </OlmaButton>
            )}

            <OlmaButton
              as={Link}
              to={`/immo/property/${booking.propertyId}`}
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Voir l'annonce
            </OlmaButton>
          </div>
        </div>
      </div>
    </OlmaCard>
  );
};
