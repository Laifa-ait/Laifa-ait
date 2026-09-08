import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, User, CheckCircle2 } from 'lucide-react';
import { apiPost } from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { OlmaSurface } from './primitives/OlmaSurface';
import { OlmaPill } from './primitives/OlmaPill';
import { OlmaInput } from './primitives/OlmaInput';
import { OlmaSelect } from './primitives/OlmaSelect';
import { OlmaButton } from './primitives/OlmaButton';

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
  const [preferredDate, setPreferredDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 - 11:00');
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 olma-immo-scope">
      <OlmaSurface
        variant="default"
        elevation="floating"
        radius="3xl"
        bordered
        borderVariant="subtle"
        padding="lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-modal-title"
        className="max-w-md w-full relative animate-scale-up max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-4 right-4 z-10">
          <OlmaButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="rounded-full"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </OlmaButton>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-[var(--olma-semantic-success-light)] text-[var(--olma-semantic-success)] rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
            </div>
            <div>
              <div className="inline-flex mb-2">
                <OlmaPill variant="success" size="sm" dot>Demande transmise</OlmaPill>
              </div>
              <h3 id="visit-modal-title" className="text-xl font-bold text-[var(--olma-text-primary)]">
                Demande envoyée avec succès
              </h3>
              <p className="text-xs text-[var(--olma-text-secondary)] mt-2 leading-relaxed">
                Le propriétaire a bien reçu votre demande de visite pour{' '}
                <strong className="text-[var(--olma-text-primary)] font-semibold">{propertyTitle}</strong>. Il vous recontactera très prochainement.
              </p>
            </div>
            <OlmaButton variant="primary" size="md" fullWidth onClick={onClose}>
              Fermer
            </OlmaButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex mb-1.5">
                <OlmaPill variant="brand" size="sm">Immobilier Olma</OlmaPill>
              </div>
              <h3 id="visit-modal-title" className="text-lg font-bold text-[var(--olma-text-primary)]">
                Demander une visite
              </h3>
              <p className="text-xs text-[var(--olma-text-muted)] line-clamp-1 mt-0.5">{propertyTitle}</p>
            </div>

            <OlmaInput
              fullWidth
              required
              id="visitor-name-input"
              label="Votre nom complet"
              placeholder="Nom et Prénom"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <OlmaInput
              fullWidth
              required
              type="tel"
              id="visitor-phone-input"
              label="Numéro de téléphone"
              placeholder="06XX XX XX XX"
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <OlmaInput
              fullWidth
              required
              type="date"
              id="visitor-date-input"
              label="Date souhaitée"
              min={new Date().toISOString().split('T')[0]}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <OlmaSelect
              fullWidth
              id="visitor-timeslot-select"
              label="Créneau horaire"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            >
              <option value="09:00 - 11:00">09:00 - 11:00 (Matin)</option>
              <option value="11:00 - 13:00">11:00 - 13:00 (Midi)</option>
              <option value="14:00 - 16:00">14:00 - 16:00 (Après-midi)</option>
              <option value="16:00 - 18:00">16:00 - 18:00 (Fin de journée)</option>
            </OlmaSelect>

            <div>
              <label className="block text-xs font-semibold text-[var(--olma-text-primary)] mb-1.5">
                Type de visite
              </label>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Type de visite souhaité">
                <button
                  type="button"
                  onClick={() => setVisitType('in_person')}
                  aria-pressed={visitType === 'in_person'}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[42px] flex items-center justify-center gap-1.5 ${
                    visitType === 'in_person'
                      ? 'bg-[var(--olma-brand-primary)] text-[var(--olma-brand-highlight)] border-[var(--olma-brand-primary)] shadow-xs'
                      : 'bg-[var(--olma-surface-muted)] text-[var(--olma-text-secondary)] border-[var(--olma-border-default)] hover:bg-[var(--olma-surface-subtle)] hover:text-[var(--olma-text-primary)]'
                  }`}
                >
                  <span aria-hidden="true">📍</span>
                  <span>Sur place</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('virtual')}
                  aria-pressed={visitType === 'virtual'}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[42px] flex items-center justify-center gap-1.5 ${
                    visitType === 'virtual'
                      ? 'bg-[var(--olma-brand-primary)] text-[var(--olma-brand-highlight)] border-[var(--olma-brand-primary)] shadow-xs'
                      : 'bg-[var(--olma-surface-muted)] text-[var(--olma-text-secondary)] border-[var(--olma-border-default)] hover:bg-[var(--olma-surface-subtle)] hover:text-[var(--olma-text-primary)]'
                  }`}
                >
                  <span aria-hidden="true">💻</span>
                  <span>Visite virtuelle</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="visitor-notes" className="block text-xs font-semibold text-[var(--olma-text-primary)] mb-1">
                Message pour le propriétaire (optionnel)
              </label>
              <textarea
                id="visitor-notes"
                value={visitorNotes}
                onChange={(e) => setVisitorNotes(e.target.value)}
                rows={2}
                placeholder="Je souhaite visiter ce bien..."
                className="w-full bg-[var(--olma-surface-muted)] border border-[var(--olma-border-default)] text-[var(--olma-text-primary)] placeholder:text-[var(--olma-text-muted)] text-xs rounded-xl p-3 focus:bg-[var(--olma-surface-default)] focus:outline-none focus:ring-2 focus:ring-[var(--olma-brand-primary)] focus:border-transparent transition-all"
              />
            </div>

            <OlmaButton type="submit" variant="primary" size="md" fullWidth loading={isSubmitting} disabled={isSubmitting}>
              Confirmer la demande de visite
            </OlmaButton>
          </form>
        )}
      </OlmaSurface>
    </div>
  );
};
