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
    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#e8e2d4] rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl text-slate-800"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#1e3835] flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-600" />
            <span>Signaler ce message</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f4ecd8] text-slate-400 hover:text-[#1e3835] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <label className="block text-slate-700 font-bold">Motif du signalement :</label>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full bg-[#faf8f5] border border-[#e8e2d4] rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1e3835]"
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
            className="w-full bg-[#faf8f5] border border-[#e8e2d4] rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#1e3835] h-20 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e8e2d4]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-[#f4ecd8] text-[#1e3835] rounded-xl text-xs font-bold hover:bg-[#ebdcb8] cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Confirmer le signalement
          </button>
        </div>
      </form>
    </div>
  );
};
