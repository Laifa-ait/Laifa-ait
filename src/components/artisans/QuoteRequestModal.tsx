import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { ArtisanProfile } from '../../types/artisan';
import { submitClientQuoteRequest } from '../../services/artisan.api';
import { useAuth } from '../../context/AuthContext';
import { QuoteRequestSuccess } from './QuoteRequestSuccess';
import { QuoteRequestFormFields } from './quotes/QuoteRequestFormFields';

interface QuoteRequestModalProps {
  artisan: ArtisanProfile | null;
  isOpen: boolean;
  onClose: () => void;
  selectedServiceTitle?: string;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  artisan,
  isOpen,
  onClose,
  selectedServiceTitle = '',
}) => {
  const { user, currentUser } = useAuth();

  const [clientName, setClientName] = useState<string>(user?.displayName || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [title, setTitle] = useState(
    selectedServiceTitle
      ? `Demande: ${selectedServiceTitle}`
      : `Travaux de ${artisan?.tradeName || 'Bricolage'}`
  );
  const [description, setDescription] = useState('');
  const [wilaya, setWilaya] = useState(artisan?.wilaya || 'Alger');
  const [commune, setCommune] = useState(artisan?.commune || '');
  const [address, setAddress] = useState('');
  const [urgency, setUrgency] = useState<'urgent' | 'standard' | 'flexible'>('standard');
  const [preferredDate, setPreferredDate] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !artisan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !clientName.trim() ||
      !clientPhone.trim() ||
      !title.trim() ||
      !description.trim() ||
      !wilaya ||
      !commune
    ) {
      setErrorMsg('Veuillez renseigner tous les champs obligatoires (*).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitClientQuoteRequest({
        artisanId: artisan.id,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        tradeId: artisan.tradeId,
        serviceTitle: selectedServiceTitle,
        title: title.trim(),
        description: description.trim(),
        wilaya,
        commune,
        address: address.trim(),
        urgency,
        preferredDate,
        estimatedBudget,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Une erreur est survenue lors de l'envoi.");
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg("Impossible d'envoyer la demande pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto" onTouchMove={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <QuoteRequestSuccess artisan={artisan} onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Demander un Devis à {artisan.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                {artisan.tradeName} • Devis gratuit et sans engagement
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <QuoteRequestFormFields
              clientName={clientName}
              setClientName={setClientName}
              clientPhone={clientPhone}
              setClientPhone={setClientPhone}
              clientEmail={clientEmail}
              setClientEmail={setClientEmail}
              estimatedBudget={estimatedBudget}
              setEstimatedBudget={setEstimatedBudget}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              wilaya={wilaya}
              setWilaya={setWilaya}
              commune={commune}
              setCommune={setCommune}
              address={address}
              setAddress={setAddress}
              urgency={urgency}
              setUrgency={setUrgency}
              preferredDate={preferredDate}
              setPreferredDate={setPreferredDate}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Envoi...' : 'Envoyer la demande'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

