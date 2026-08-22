import React, { useState } from 'react';
import { X, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { apiPost } from '../../lib/api';
import toast from 'react-hot-toast';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  pricePerNight: number;
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  pricePerNight,
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(inThreeDays);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const totalNights = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const totalPriceDZD = totalNights * pricePerNight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('La date de départ doit être postérieure à la date d\'arrivée');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiPost<{ success: boolean; error?: string }>('/api/v1/real-estate/bookings', {
        propertyId,
        startDate,
        endDate,
      });

      if (response.success) {
        setIsSuccess(true);
        toast.success('Demande de réservation enregistrée !');
      } else {
        toast.error(response.error || 'Erreur lors de la réservation');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur réseau';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Réservation en attente de confirmation</h3>
            <p className="text-xs text-slate-600">
              Votre demande de séjour pour <strong className="text-slate-800">{propertyTitle}</strong> a été transmise. Le propriétaire la validera dans les plus brefs délais.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Réserver un séjour</h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{propertyTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date d'arrivée</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date de départ</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Prix par nuit:</span>
                <span className="font-semibold">{pricePerNight.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div className="flex justify-between">
                <span>Nombre de nuits:</span>
                <span className="font-semibold">{totalNights} nuit{totalNights > 1 ? 's' : ''}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 flex justify-between text-sm font-bold text-emerald-950">
                <span>Total estimé:</span>
                <span className="text-emerald-700">{totalPriceDZD.toLocaleString('fr-DZ')} DA</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting ? 'Envoi de la demande...' : 'Confirmer la demande de séjour'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
