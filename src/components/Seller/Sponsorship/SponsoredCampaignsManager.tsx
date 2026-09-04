import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Plus } from "lucide-react";
import { apiGet, apiPost } from "../../../lib/api";
import { Product } from "../../../domains/product/product.types";
import { SponsoredCampaign, SponsoredPlacement } from "../../../types/sponsoredCampaign";
import { toast } from "react-hot-toast";
import { SponsoredCampaignCreateModal } from "./SponsoredCampaignCreateModal";
import { SellerCampaignRow } from "./SellerCampaignRow";
import { SellerPaymentProofModal } from "./SellerPaymentProofModal";

interface SponsoredCampaignsManagerProps {
  products: Product[];
}

export const SponsoredCampaignsManager: React.FC<SponsoredCampaignsManagerProps> = ({ products }) => {
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [placement, setPlacement] = useState<SponsoredPlacement>("home");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 8);
    return d.toISOString().split("T")[0];
  });
  const [paymentProofReference, setPaymentProofReference] = useState("");
  const [paymentProofNotes, setPaymentProofNotes] = useState("");
  const [pricingPreview, setPricingPreview] = useState<{ durationDays: number; priceAmount: number } | null>(null);

  // Modal proof state
  const [proofCampaign, setProofCampaign] = useState<SponsoredCampaign | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: SponsoredCampaign[] }>("/api/v1/seller/sponsored-campaigns");
      if (res?.data) {
        setCampaigns(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Recalculate preview
  useEffect(() => {
    if (!placement || !startDate || !endDate) return;

    let isMounted = true;
    const startIso = new Date(startDate).toISOString();
    const endIso = new Date(endDate).toISOString();

    apiGet<{ success: boolean; data: { durationDays: number; priceAmount: number } }>(
      `/api/v1/seller/sponsored-campaigns/pricing/preview?placement=${placement}&startAt=${encodeURIComponent(startIso)}&endAt=${encodeURIComponent(endIso)}`
    )
      .then((res) => {
        if (isMounted && res?.data) {
          setPricingPreview(res.data);
        }
      })
      .catch(() => {
        if (isMounted) setPricingPreview(null);
      });

    return () => {
      isMounted = false;
    };
  }, [placement, startDate, endDate]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Veuillez sélectionner un produit.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productId: selectedProductId,
        placement,
        startAt: new Date(startDate).toISOString(),
        endAt: new Date(endDate).toISOString(),
        paymentProofReference: paymentProofReference.trim() || undefined,
        paymentProofNotes: paymentProofNotes.trim() || undefined,
      };

      const res = await apiPost<{ success: boolean; data: SponsoredCampaign }>(
        "/api/v1/seller/sponsored-campaigns",
        payload
      );

      if (res?.success) {
        toast.success("Campagne créée ! En attente de validation administrative.");
        setShowModal(false);
        setPaymentProofReference("");
        setPaymentProofNotes("");
        await fetchCampaigns();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette campagne ?")) return;

    try {
      const res = await apiPost<{ success: boolean; data: SponsoredCampaign }>(
        `/api/v1/seller/sponsored-campaigns/${campaignId}/cancel`,
        {}
      );
      if (res?.success) {
        toast.success("Campagne annulée.");
        await fetchCampaigns();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'annulation.";
      toast.error(msg);
    }
  };

  const handleSubmitProof = async (campaignId: string, reference: string, notes: string) => {
    try {
      const res = await apiPost<{ success: boolean; data: SponsoredCampaign }>(
        `/api/v1/seller/sponsored-campaigns/${campaignId}/payment-proof`,
        {
          paymentProofReference: reference,
          paymentProofNotes: notes,
        }
      );
      if (res?.success) {
        toast.success("Justificatif transmis avec succès !");
        await fetchCampaigns();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur envoi justificatif.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-orange-500/20">
        <div>
          <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Visibilité Maximale</span>
          </div>
          <h3 className="text-lg font-extrabold text-zinc-950">Booster vos Ventes avec les Produits Sponsorisés</h3>
          <p className="text-xs text-zinc-500 max-w-xl mt-0.5">
            Affichez vos articles en tête de l'accueil, dans les catégories ciblées ou dans les résultats de recherche.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une Campagne</span>
        </button>
      </div>

      {/* Campaigns Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-zinc-400">Chargement de vos campagnes...</div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-xs text-zinc-500">Vous n'avez aucune campagne sponsorisée active ou en attente.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-4 pr-3">Produit</th>
                <th className="py-3 pr-3">Emplacement</th>
                <th className="py-3 pr-3">Période</th>
                <th className="py-3 pr-3">Tarif</th>
                <th className="py-3 pr-3">Statut</th>
                <th className="py-3 pr-3">Performances</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {campaigns.map((c) => (
                <SellerCampaignRow
                  key={c.id}
                  campaign={c}
                  onCancel={handleCancelCampaign}
                  onAddProof={(campaign) => setProofCampaign(campaign)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SponsoredCampaignCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        products={products}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        placement={placement}
        setPlacement={setPlacement}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        paymentProofReference={paymentProofReference}
        setPaymentProofReference={setPaymentProofReference}
        paymentProofNotes={paymentProofNotes}
        setPaymentProofNotes={setPaymentProofNotes}
        pricingPreview={pricingPreview}
        submitting={submitting}
        onSubmit={handleCreateCampaign}
      />

      <SellerPaymentProofModal
        isOpen={Boolean(proofCampaign)}
        onClose={() => setProofCampaign(null)}
        campaign={proofCampaign}
        onSubmit={handleSubmitProof}
      />
    </div>
  );
};
