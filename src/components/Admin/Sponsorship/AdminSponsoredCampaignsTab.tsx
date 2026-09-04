import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { apiGet, apiPost } from "../../../lib/api";
import { SponsoredCampaign } from "../../../types/sponsoredCampaign";
import { toast } from "react-hot-toast";
import { AdminCampaignRow } from "./AdminCampaignRow";
import { AdminRejectModal } from "./AdminRejectModal";

export const AdminSponsoredCampaignsTab: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Rejection modal
  const [rejectingCampaignId, setRejectingCampaignId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: SponsoredCampaign[] }>(
        "/api/v1/admin/sponsored-campaigns"
      );
      if (res?.data) {
        setCampaigns(res.data);
      }
    } catch {
      toast.error("Erreur de chargement des campagnes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleApprove = async (campaignId: string) => {
    try {
      const res = await apiPost<{ success: boolean; data: SponsoredCampaign }>(
        `/api/v1/admin/sponsored-campaigns/${campaignId}/approve`,
        {}
      );
      if (res?.success) {
        toast.success("Campagne approuvée avec succès.");
        await fetchCampaigns();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'approbation.";
      toast.error(msg);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCampaignId || !rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await apiPost<{ success: boolean; data: SponsoredCampaign }>(
        `/api/v1/admin/sponsored-campaigns/${rejectingCampaignId}/reject`,
        { reason: rejectionReason.trim() }
      );
      if (res?.success) {
        toast.success("Campagne rejetée.");
        setRejectingCampaignId(null);
        setRejectionReason("");
        await fetchCampaigns();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du rejet.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (campaignId: string) => {
    const reason = window.prompt("Motif de la suspension (optionnel) :") || "Suspendue par l'administrateur";
    try {
      const res = await apiPost<{ success: boolean; data: SponsoredCampaign }>(
        `/api/v1/admin/sponsored-campaigns/${campaignId}/suspend`,
        { reason }
      );
      if (res?.success) {
        toast.success("Campagne suspendue.");
        await fetchCampaigns();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suspension.";
      toast.error(msg);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      (c.productName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      c.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sellerId.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return c.moderationStatus === "pending";
    if (statusFilter === "approved") return c.moderationStatus === "approved";
    if (statusFilter === "rejected") return c.moderationStatus === "rejected";
    if (statusFilter === "suspended") return c.moderationStatus === "suspended";
    return true;
  });

  const pendingCount = campaigns.filter((c) => c.moderationStatus === "pending").length;

  return (
    <div className="space-y-6">
      {/* Metric / Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-zinc-950">Modération des Produits Sponsorisés</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Gérez la visibilité des campagnes créées par les vendeurs du marché Olmart.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            {pendingCount} en attente d'approbation
          </span>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher par produit ou vendeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-medium focus:border-zinc-900 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "Toutes" },
            { id: "pending", label: "À modérer" },
            { id: "approved", label: "Approuvées" },
            { id: "rejected", label: "Rejetées" },
            { id: "suspended", label: "Suspendues" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">Chargement des campagnes...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400">Aucune campagne correspondante.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 pl-4 pr-3">Produit & Vendeur</th>
                  <th className="py-3 pr-3">Emplacement</th>
                  <th className="py-3 pr-3">Période</th>
                  <th className="py-3 pr-3">Budget</th>
                  <th className="py-3 pr-3">Modération</th>
                  <th className="py-3 pr-3">Métriques</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredCampaigns.map((c) => (
                  <AdminCampaignRow
                    key={c.id}
                    campaign={c}
                    onApprove={handleApprove}
                    onRejectClick={(id) => {
                      setRejectingCampaignId(id);
                      setRejectionReason("");
                    }}
                    onSuspend={handleSuspend}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminRejectModal
        isOpen={!!rejectingCampaignId}
        onClose={() => setRejectingCampaignId(null)}
        onSubmit={handleRejectSubmit}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        actionLoading={actionLoading}
      />
    </div>
  );
};
