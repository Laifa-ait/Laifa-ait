import React from "react";
import { Sparkles, X, Info, CreditCard } from "lucide-react";
import { Product } from "../../../domains/product/product.types";
import { SponsoredPlacement } from "../../../types/sponsoredCampaign";
import { SPONSORED_DAILY_RATES } from "../../../config/sponsoredPricing";

interface SponsoredCampaignCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  placement: SponsoredPlacement;
  setPlacement: (p: SponsoredPlacement) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  paymentProofReference: string;
  setPaymentProofReference: (ref: string) => void;
  paymentProofNotes: string;
  setPaymentProofNotes: (notes: string) => void;
  pricingPreview: { durationDays: number; priceAmount: number } | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const SponsoredCampaignCreateModal: React.FC<SponsoredCampaignCreateModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductId,
  setSelectedProductId,
  placement,
  setPlacement,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  paymentProofReference,
  setPaymentProofReference,
  paymentProofNotes,
  setPaymentProofNotes,
  pricingPreview,
  submitting,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-base text-zinc-950">Nouvelle Campagne Sponsorisée</h4>
              <p className="text-xs text-zinc-500">Paiement vérifié administrativement (CCP / BaridiMob).</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Produit à sponsoriser *
            </label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-orange-500"
            >
              <option value="">-- Choisir un produit publié --</option>
              {products
                .filter((p) => p.status === "active" || p.status === "approved")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price?.toLocaleString()} DZD)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
              Emplacement de diffusion *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["home", "category", "search"] as SponsoredPlacement[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlacement(p)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    placement === p
                      ? "border-orange-500 bg-orange-50/50 text-orange-900 ring-2 ring-orange-500/20"
                      : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700"
                  }`}
                >
                  <p className="font-bold text-xs capitalize">
                    {p === "home" ? "Accueil" : p === "category" ? "Catégorie" : "Recherche"}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    {SPONSORED_DAILY_RATES[p]} DZD/j
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                required
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Date de fin *
              </label>
              <input
                type="date"
                required
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {pricingPreview && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-800">Montant à régler</span>
                <p className="text-[11px] text-zinc-500">
                  {pricingPreview.durationDays} jour(s) × {SPONSORED_DAILY_RATES[placement]} DZD
                </p>
              </div>
              <span className="text-base font-extrabold text-orange-600 font-mono">
                {pricingPreview.priceAmount.toLocaleString()} DZD
              </span>
            </div>
          )}

          {/* Manual payment proof fields */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <CreditCard className="w-4 h-4 text-amber-700" />
              <span>Paiement administratif manuel</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Effectuez le virement vers le compte officiel Olmart (CCP / BaridiMob), puis indiquez la référence du virement ci-dessous ou après validation.
            </p>
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                  Référence du reçu ou transaction (optionnel à la création)
                </label>
                <input
                  type="text"
                  placeholder="Ex: RIP/BMOD-84920482 ou N° de mandat CCP"
                  value={paymentProofReference}
                  onChange={(e) => setPaymentProofReference(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-0.5">
                  Notes ou détails du virement
                </label>
                <input
                  type="text"
                  placeholder="Ex: Virement BaridiMob effectué depuis le compte 007..."
                  value={paymentProofNotes}
                  onChange={(e) => setPaymentProofNotes(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-50 p-2.5 rounded-xl">
            <Info className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>La campagne sera examinée et activée dès confirmation de votre paiement par l'équipe administrative.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !pricingPreview}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? "Création en cours..." : "Créer la Campagne"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
