import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, User, CheckCircle2 } from 'lucide-react';
import { apiPost } from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface VisitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export const VisitRequestModal: React.FC<VisitRequestModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}) => {
  const { userProfile } = useAuth();
  const [visitorName, setVisitorName] = useState(userProfile?.displayName || '');
  const [visitorPhone, setVisitorPhone] = useState(userProfile?.phone || '');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('10:00 - 12:00');
  const [visitType, setVisitType] = useState<'in_person' | 'virtual'>('in_person');
  const [visitorNotes, setVisitorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || visitorName.length < 2) {
      toast.error('Veuillez saisir votre nom complet');
      return;
    }
    if (!visitorPhone.trim() || visitorPhone.length < 8) {
      toast.error('Veuillez saisir un numéro de téléphone valide');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiPost<{ success: boolean; error?: string }>('/api/v1/real-estate/visits', {
        propertyId,
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        preferredDate,
        timeSlot: `${timeSlot} (${visitType === 'virtual' ? 'Visite virtuelle' : 'Sur place'})`,
        notes: visitorNotes.trim(),
      });

      if (response.success) {
        setIsSuccess(true);
        toast.success('Demande de visite transmise au propriétaire !');
      } else {
        toast.error(response.error || 'Erreur lors de la demande de visite');
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
            <h3 className="text-xl font-bold text-slate-900">Demande envoyée avec succès</h3>
            <p className="text-xs text-slate-600">
              Le propriétaire a bien reçu votre demande de visite pour{' '}
              <strong className="text-slate-800">{propertyTitle}</strong>. Il vous recontactera très prochainement.
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
              <h3 className="text-lg font-bold text-slate-900">Demander une visite</h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{propertyTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Votre nom complet</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Nom et Prénom"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 ps-9 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de téléphone</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="06XX XX XX XX"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 ps-9 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date souhaitée</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 ps-9 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Créneau horaire</label>
              <div className="relative">
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 ps-9 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                >
                  <option value="09:00 - 11:00">09:00 - 11:00 (Matin)</option>
                  <option value="11:00 - 13:00">11:00 - 13:00 (Midi)</option>
                  <option value="14:00 - 16:00">14:00 - 16:00 (Après-midi)</option>
                  <option value="16:00 - 18:00">16:00 - 18:00 (Fin de journée)</option>
                </select>
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type de visite</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitType('in_person')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    visitType === 'in_person'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📍 Sur place
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('virtual')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    visitType === 'virtual'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  💻 Visite virtuelle
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message pour le propriétaire (optionnel)</label>
              <textarea
                value={visitorNotes}
                onChange={(e) => setVisitorNotes(e.target.value)}
                rows={2}
                placeholder="Je souhaite visiter ce bien..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting ? 'Transmission...' : 'Confirmer la demande de visite'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
