import React, { useState } from 'react';
import { ArtisanProfile, ArtisanStatus } from '../../../types/artisan';
import { adminUpdateArtisanStatus } from '../../../services/artisan.api';

interface AdminStatusModalProps {
  artisan: ArtisanProfile | null;
  targetStatus: ArtisanStatus | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const AdminStatusModal: React.FC<AdminStatusModalProps> = ({
  artisan,
  targetStatus,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!artisan || !targetStatus) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await adminUpdateArtisanStatus(artisan.id, targetStatus, reason.trim());
      if (res.success) {
        onClose();
        await onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <h3 className="text-base font-black text-slate-900">
          Confirmer le changement de statut
        </h3>
        <p className="text-xs text-slate-600">
          Voulez-vous passer l'artisan <strong>{artisan.fullName}</strong> en statut{' '}
          <strong className="text-amber-600 uppercase">{targetStatus}</strong> ?
        </p>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">
            Motif ou note administrative (Optionnel)
          </label>
          <textarea
            rows={3}
            placeholder="Précisez la raison (documents valides, non-conformité, etc.)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            {loading ? 'Traitement...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};
