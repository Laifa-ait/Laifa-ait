import React from 'react';
import { Link } from 'react-router-dom';
import { Booking } from '../../../types/realEstate';
import { Calendar, Users, MessageSquare, ChevronRight, Ban } from 'lucide-react';
import {
  OlmaCard,
  OlmaButton,
  PropertyBadge,
  PropertyPrice,
  PropertyLocation,
  PropertyMedia,
} from '../primitives';

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
      className="flex flex-col md:flex-row group transition-all duration-300 hover:shadow-[var(--olma-shadow-card)] overflow-hidden"
    >
      {/* Property Photo */}
      <div className="md:w-72 md:shrink-0">
        <PropertyMedia
          src={booking.propertyImage}
          alt={booking.propertyTitle || 'Hébergement'}
          aspectRatio="16/10"
          className="h-52 md:h-full"
          topBadges={
            <PropertyBadge type="bookingStatus" value={booking.status} size="sm" dot />
          }
          bottomOverlay={
            <span className="bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
              {booking.totalNights} nuit(s)
            </span>
          }
        />
      </div>

      {/* Booking Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div>
              <h3 className="text-lg font-bold text-[#1A3831] font-['Playfair_Display',serif] group-hover:text-[#274B42] transition">
                {booking.propertyTitle || 'Hébergement de vacances'}
              </h3>
              {booking.propertyLocation && (
                <PropertyLocation
                  commune={booking.propertyLocation}
                  size="xs"
                  variant="muted"
                  className="mt-0.5"
                />
              )}
            </div>

            <div className="text-left sm:text-right shrink-0">
              <PropertyPrice
                price={booking.totalPriceDZD}
                size="md"
                variant="mineral"
              />
              <span className="block text-[11px] text-stone-500 font-medium">Prix total TTC</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-stone-700">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#F0EAE0]">
              <Calendar className="w-4 h-4 text-[#1A3831] shrink-0" aria-hidden="true" />
              <div>
                <span className="text-[10px] text-stone-400 block font-bold uppercase">Dates du séjour</span>
                <span className="font-semibold">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#F0EAE0]">
              <Users className="w-4 h-4 text-[#1A3831] shrink-0" aria-hidden="true" />
              <div>
                <span className="text-[10px] text-stone-400 block font-bold uppercase">Voyageurs</span>
                <span className="font-semibold">
                  {booking.guests?.adults || 1} adulte(s)
                  {(booking.guests?.children ?? 0) > 0 ? `, ${booking.guests?.children} enfant(s)` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E8E2D4] flex-wrap">
          <OlmaButton
            variant="secondary"
            size="sm"
            onClick={() => onOpenChat(booking)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#1A3831]" />}
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
