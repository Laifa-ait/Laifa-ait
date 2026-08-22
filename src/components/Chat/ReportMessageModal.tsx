import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';

interface ReportMessageModalProps {
  messageId: string | null;
  onClose: () => void;
  onSubmit: (messageId: string, reason: string, description?: string) => Promise<void>;
}

export const ReportMessageModal: React.FC<ReportMessageModalProps> = ({
  messageId,
  onClose,
  onSubmit
}) => {
  const [reportReason, setReportReason] = useState('PROFANITY_OR_ABUSE');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!messageId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(messageId, reportReason, reportDescription);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-20">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-red-400" />
            <span>Signaler ce message</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block text-slate-300 font-medium">Motif du signalement :</label>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="PROFANITY_OR_ABUSE">Propos abusifs ou insultants</option>
            <option value="CONTACT_EXCHANGE_ATTEMPT">Tentative d'échange de contact hors plateforme</option>
            <option value="FRAUD_OR_SCAM">Suspicion de fraude ou d'arnaque</option>
            <option value="SPAM">Spam ou publicité non sollicitée</option>
            <option value="OTHER">Autre motif</option>
          </select>

          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Précisions supplémentaires (optionnel)..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 h-20 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Confirmer le signalement
          </button>
        </div>
      </form>
    </div>
  );
};
