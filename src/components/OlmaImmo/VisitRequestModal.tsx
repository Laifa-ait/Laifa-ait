import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, User, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      toast.error(t('Veuillez renseigner tous les champs obligatoires.', 'Veuillez saisir votre nom complet'));
      return;
    }
    if (!visitorPhone.trim() || visitorPhone.length < 8) {
      toast.error(t('Veuillez renseigner tous les champs obligatoires.', 'Veuillez saisir un numéro de téléphone valide'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiPost<{ success: boolean; error?: string }>('/api/v1/real-estate/visits', {
        propertyId,
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        preferredDate,
        timeSlot: `${timeSlot} (${visitType === 'virtual' ? t('Visite virtuelle (Visio)') : t('Visite sur place')})`,
        notes: visitorNotes.trim(),
      });

      if (response.success) {
        setIsSuccess(true);
        toast.success(t('Demande transmise avec succès !'));
      } else {
        toast.error(response.error || t('Erreur lors de la soumission.'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('Erreur réseau', 'Erreur réseau');
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
            aria-label={t("Fermer")}
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
                <OlmaPill variant="success" size="sm" dot>{t("Demande transmise", "Demande transmise")}</OlmaPill>
              </div>
              <h3 id="visit-modal-title" className="text-xl font-bold text-[var(--olma-text-primary)]">
                {t("Demande transmise avec succès !")}
              </h3>
              <p className="text-xs text-[var(--olma-text-secondary)] mt-2 leading-relaxed">
                {t("L'annonceur prendra contact avec vous rapidement.")}
              </p>
            </div>
            <OlmaButton variant="primary" size="md" fullWidth onClick={onClose}>
              {t("Fermer")}
            </OlmaButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex mb-1.5">
                <OlmaPill variant="brand" size="sm">{t("Immobilier Olma", "Immobilier Olma")}</OlmaPill>
              </div>
              <h3 id="visit-modal-title" className="text-lg font-bold text-[var(--olma-text-primary)]">
                {t("Planifier une visite")}
              </h3>
              <p className="text-xs text-[var(--olma-text-muted)] line-clamp-1 mt-0.5">{propertyTitle}</p>
            </div>

            <OlmaInput
              fullWidth
              required
              id="visitor-name-input"
              label={t("Votre Nom *")}
              placeholder={t("Votre Nom *")}
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <OlmaInput
              fullWidth
              required
              type="tel"
              id="visitor-phone-input"
              label={t("Téléphone *")}
              placeholder={t("Ex: 0550 12 34 56")}
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <OlmaInput
              fullWidth
              required
              type="date"
              id="visitor-date-input"
              label={t("Date souhaitée")}
              min={new Date().toISOString().split('T')[0]}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <OlmaSelect
              fullWidth
              id="visitor-timeslot-select"
              label={t("Créneau horaire")}
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            >
              <option value="09:00 - 11:00">09:00 - 11:00 ({t("Matin", "Matin")})</option>
              <option value="11:00 - 13:00">11:00 - 13:00 ({t("Midi", "Midi")})</option>
              <option value="14:00 - 16:00">14:00 - 16:00 ({t("Après-midi", "Après-midi")})</option>
              <option value="16:00 - 18:00">16:00 - 18:00 ({t("Fin de journée", "Fin de journée")})</option>
            </OlmaSelect>

            <div>
              <label className="block text-xs font-semibold text-[var(--olma-text-primary)] mb-1.5">
                {t("Type de visite")}
              </label>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label={t("Type de visite")}>
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
                  <span>{t("Visite sur place")}</span>
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
                  <span>{t("Visite virtuelle (Visio)")}</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="visitor-notes" className="block text-xs font-semibold text-[var(--olma-text-primary)] mb-1">
                {t("Notes ou questions spécifiques")}
              </label>
              <textarea
                id="visitor-notes"
                value={visitorNotes}
                onChange={(e) => setVisitorNotes(e.target.value)}
                rows={2}
                placeholder={t("Je souhaite visiter ce bien...", "Je souhaite visiter ce bien...")}
                className="w-full bg-[var(--olma-surface-muted)] border border-[var(--olma-border-default)] text-[var(--olma-text-primary)] placeholder:text-[var(--olma-text-muted)] text-xs rounded-xl p-3 focus:bg-[var(--olma-surface-default)] focus:outline-none focus:ring-2 focus:ring-[var(--olma-brand-primary)] focus:border-transparent transition-all"
              />
            </div>

            <OlmaButton type="submit" variant="primary" size="md" fullWidth loading={isSubmitting} disabled={isSubmitting}>
              {t("Envoyer la demande de visite")}
            </OlmaButton>
          </form>
        )}
      </OlmaSurface>
    </div>
  );
};
