import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, MessageSquare, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../lib/api';
import toast from 'react-hot-toast';

interface BookingMessagingContext {
  type: string;
  recipientId?: string;
  recipientName?: string;
  propertyId?: string;
  propertyTitle?: string;
  [key: string]: unknown;
}

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  propertyImage?: string;
  ownerId?: string;
  bookingSummary: {
    startDate: string;
    endDate: string;
    totalNights: number;
    guests: { adults: number; children: number };
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    totalPriceDZD: number;
  };
  onOpenMessaging?: (context: BookingMessagingContext) => void;
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyLocation = 'Algérie',
  propertyImage,
  ownerId,
  bookingSummary,
  onOpenMessaging,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const { startDate, endDate, totalNights, guests, subtotal, cleaningFee, serviceFee, totalPriceDZD } = bookingSummary;

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiPost<{ success: boolean; data?: { id: string }; error?: string }>(
        '/api/v1/real-estate/bookings',
        {
          propertyId,
          startDate,
          endDate,
          guests,
        }
      );

      if (response.success && response.data) {
        setCreatedBookingId(response.data.id);
        toast.success('Demande de réservation envoyée !');
      } else {
        toast.error(response.error || 'Erreur lors de la réservation.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur réseau';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactOwner = () => {
    onClose();
    if (onOpenMessaging && ownerId) {
      onOpenMessaging({
        recipientId: ownerId,
        type: 'REAL_ESTATE_INQUIRY',
        context: {
          propertyId,
          referenceTitle: propertyTitle,
          referenceImage: propertyImage,
          referencePriceDZD: totalPriceDZD,
        },
      });
    }
  };

  const handleGoToMyBookings = () => {
    onClose();
    navigate('/immo/my-bookings');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e8e2d4] relative animate-scale-up font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {createdBookingId ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-[#1e3835] text-[#ebdcb8] rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-[#b8a679]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7a824e]">
                Demande transmise
              </span>
              <h3 className="text-xl font-bold text-[#1e3835] font-['Playfair_Display',serif]">
                Réservation en attente de confirmation
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Votre demande de séjour pour <strong className="text-slate-900">{propertyTitle}</strong> a été enregistrée avec succès sous la référence <span className="font-mono font-bold text-[#1e3835]">{createdBookingId}</span>.
              </p>
            </div>

            <div className="bg-white border border-[#e8e2d4] rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-medium">
                <span>Dates du séjour :</span>
                <span className="font-bold text-[#1e3835]">{formatDateLabel(startDate)} → {formatDateLabel(endDate)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Voyageurs :</span>
                <span className="font-bold text-[#1e3835]">{guests.adults} adulte{guests.adults > 1 ? 's' : ''} {guests.children > 0 ? `· ${guests.children} enfant${guests.children > 1 ? 's' : ''}` : ''}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#f0ebd8]">
                <span>Total estimé :</span>
                <span className="text-emerald-800 text-sm">{totalPriceDZD.toLocaleString('fr-DZ')} DA</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleGoToMyBookings}
                className="w-full py-3 px-4 bg-[#1e3835] hover:bg-[#152725] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Mes séjours</span>
                <ArrowRight className="w-4 h-4 text-[#ebdcb8]" />
              </button>

              <button
                type="button"
                onClick={handleContactOwner}
                className="w-full py-3 px-4 bg-[#ebdcb8] hover:bg-[#e2d0a5] text-[#1e3835] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contacter l'hôte</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitBooking} className="space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7a824e] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Récapitulatif de votre séjour
              </span>
              <h3 className="text-xl font-bold text-[#1e3835] font-['Playfair_Display',serif]">
                Confirmer la réservation
              </h3>
            </div>

            {/* Property Summary Header */}
            <div className="bg-white border border-[#e8e2d4] rounded-2xl p-3.5 flex items-center gap-3">
              {propertyImage ? (
                <img src={propertyImage} alt={propertyTitle} className="w-14 h-14 rounded-xl object-cover border border-[#e8e2d4] shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#ebdcb8]/40 border border-[#b8a679]/30 flex items-center justify-center text-[#1e3835] shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#1e3835] truncate">{propertyTitle}</h4>
                <p className="text-xs text-slate-500 font-medium">{propertyLocation}</p>
              </div>
            </div>

            {/* Dates & Guests Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white border border-[#e8e2d4] rounded-2xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dates</span>
                <span className="font-bold text-[#1e3835] block mt-0.5">{formatDateLabel(startDate)}</span>
                <span className="text-[11px] text-slate-500 font-medium">au {formatDateLabel(endDate)} ({totalNights} nuit{totalNights > 1 ? 's' : ''})</span>
              </div>

              <div className="bg-white border border-[#e8e2d4] rounded-2xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Voyageurs</span>
                <span className="font-bold text-[#1e3835] block mt-0.5">
                  {guests.adults} adulte{guests.adults > 1 ? 's' : ''}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {guests.children > 0 ? `${guests.children} enfant${guests.children > 1 ? 's' : ''}` : 'Aucun enfant'}
                </span>
              </div>
            </div>

            {/* Detailed Price Calculation Box */}
            <div className="bg-[#f0ece1] border border-[#ded5be] rounded-2xl p-4 space-y-2 text-xs text-slate-800">
              <div className="flex justify-between">
                <span>Prix du séjour ({totalNights} nuit{totalNights > 1 ? 's' : ''})</span>
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

              <div className="pt-2 border-t border-[#d5caaf] flex justify-between text-base font-extrabold text-[#1e3835]">
                <span>Total</span>
                <span className="text-[#1e3835]">{totalPriceDZD.toLocaleString('fr-DZ')} DA</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#1e3835] hover:bg-[#152725] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Transmissions de la demande...' : 'Envoyer la demande de réservation'}</span>
              <ArrowRight className="w-4 h-4 text-[#ebdcb8]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
