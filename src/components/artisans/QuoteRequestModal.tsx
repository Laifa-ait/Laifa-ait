import React, { useState } from 'react';
import { X, Send, Calendar, AlertCircle } from 'lucide-react';
import { ArtisanProfile } from '../../types/artisan';
import { submitClientQuoteRequest } from '../../services/artisan.api';
import { useAuth } from '../../context/AuthContext';
import { WilayaCommuneSelector } from './WilayaCommuneSelector';
import { QuoteRequestSuccess } from './QuoteRequestSuccess';

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

  const [clientName, setClientName] = useState(user?.displayName || user?.name || '');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Votre Nom *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email (Optionnel)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Budget max (DZD)</label>
                <input
                  type="number"
                  placeholder="Ex: 5000"
                  value={estimatedBudget || ''}
                  onChange={(e) =>
                    setEstimatedBudget(e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Titre des travaux *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description du besoin *</label>
              <textarea
                rows={3}
                required
                placeholder="Décrivez les réparations, surface, pannes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Lieu d'intervention</label>
              <WilayaCommuneSelector
                selectedWilaya={wilaya}
                selectedCommune={commune}
                onChange={(w, c) => {
                  setWilaya(w);
                  setCommune(c);
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Adresse / Repère (Optionnel)</label>
              <input
                type="text"
                placeholder="Cité, numéro de rue..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Niveau d'urgence</label>
                <select
                  value={urgency}
                  onChange={(e) =>
                    setUrgency(e.target.value as 'urgent' | 'standard' | 'flexible')
                  }
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                >
                  <option value="standard">Standard (Sous 48h)</option>
                  <option value="urgent">Urgent (Aujourd'hui)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Date souhaitée</label>
                <div className="relative">
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

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
