import React, { useState } from "react";
import { CreditCard, X } from "lucide-react";
import { SponsoredCampaign } from "../../../types/sponsoredCampaign";

interface SellerPaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: SponsoredCampaign | null;
  onSubmit: (campaignId: string, reference: string, notes: string) => Promise<void>;
}

export const SellerPaymentProofModal: React.FC<SellerPaymentProofModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSubmit,
}) => {
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(campaign.id, reference.trim(), notes.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-sm text-zinc-950">Transmettre le Justificatif</h4>
              <p className="text-xs text-zinc-500">Campagne #{campaign.id.substring(0, 8)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-xs">
            <p className="text-zinc-500">Montant à régler :</p>
            <p className="font-extrabold text-sm text-orange-600 font-mono">
              {campaign.priceAmount?.toLocaleString()} {campaign.currency}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Référence de la transaction / reçu *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: RIP/BMOD-92837492 ou N° de reçu CCP"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Notes complémentaires
            </label>
            <textarea
              rows={2}
              placeholder="Détails du compte émetteur, date/heure du virement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !reference.trim()}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? "Envoi..." : "Envoyer le Justificatif"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
