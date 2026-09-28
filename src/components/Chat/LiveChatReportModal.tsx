import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface LiveChatReportModalProps {
  messageId: string | null;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const LiveChatReportModal: React.FC<LiveChatReportModalProps> = ({
  messageId,
  orderId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!messageId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reason.trim()) return;

    setSubmitting(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/v1/messages/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          messageId,
          reason,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors du signalement');
      toast.success(t('Message signalé. Notre équipe de modération va intervenir.'));
      onSuccess();
      onClose();
    } catch {
      toast.error('Impossible de signaler le message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm border border-stone-200 shadow-xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag className="w-4 h-4" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {t('Signaler ce message')}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-xl text-[11px] text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{t('Signalez tout comportement abusif ou tentative de paiement non autorisé.')}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-700">{t('Motif du signalement :')}</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('Expliquez brièvement le problème...')}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-normal text-stone-900 focus:bg-white focus:border-rose-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg cursor-pointer"
            >
              {t('Annuler')}
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('Confirmer')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
