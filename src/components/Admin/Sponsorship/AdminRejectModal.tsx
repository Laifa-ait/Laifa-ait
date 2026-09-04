import React from "react";

interface AdminRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  rejectionReason: string;
  setRejectionReason: (val: string) => void;
  actionLoading: boolean;
}

export const AdminRejectModal: React.FC<AdminRejectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rejectionReason,
  setRejectionReason,
  actionLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100">
        <h4 className="font-bold text-base text-zinc-950 mb-1">Rejeter la campagne</h4>
        <p className="text-xs text-zinc-500 mb-4">
          Veuillez indiquer le motif du refus qui sera notifié au vendeur.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            required
            rows={3}
            placeholder="Ex : Image non conforme, produit non éligible..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-red-500"
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading || !rejectionReason.trim()}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? "Rejet en cours..." : "Confirmer le Rejet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
