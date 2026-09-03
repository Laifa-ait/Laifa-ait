import React, { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { ArtisanProfile, ArtisanStatus } from '../../../types/artisan';
import { adminUpdateArtisanStatus } from '../../../services/artisan.api';

interface AdminStatusModalProps {
  artisan: ArtisanProfile | null;
  targetStatus: ArtisanStatus | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminStatusModal: React.FC<AdminStatusModalProps> = ({
  artisan,
  targetStatus,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!artisan || !targetStatus) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await adminUpdateArtisanStatus(artisan.id, targetStatus, reason || undefined);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Une erreur est survenue lors du changement de statut.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: ArtisanStatus) => {
    switch (status) {
      case 'approved':
        return 'Approuver & Activer';
      case 'under_review':
        return 'Mettre en Examen';
      case 'rejected':
        return 'Refuser la Candidature';
      case 'suspended':
        return 'Suspendre temporairement';
      case 'blocked':
        return 'Bloquer définitivement';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <h3 className="font-bold text-zinc-900 text-sm">Changement de Statut Moderation</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-xs">
            <p className="font-bold text-zinc-900">{artisan.fullName}</p>
            <p className="text-zinc-500">{artisan.tradeName} • {artisan.wilaya}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Action sélectionnée : <span className="text-amber-600">{getStatusLabel(targetStatus)}</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motif ou commentaire administratif (optionnel)..."
              className="w-full px-3 py-2 rounded-2xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-hidden"
            />
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirmer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
