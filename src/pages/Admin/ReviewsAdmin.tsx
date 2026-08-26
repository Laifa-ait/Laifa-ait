import React, { useEffect, useState, useCallback } from "react";
import { MessageSquareWarning, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../hooks/useConfirm";
import toast from "react-hot-toast";
import { ReviewsAdminCard, AdminReviewItem } from "./ReviewsAdminCard";
import { ReviewsAdminToolbar } from "./ReviewsAdminToolbar";

export const ReviewsAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();

  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"flagged" | "all" | "approved">("flagged");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | "all">("all");

  // Metrics
  const [stats, setStats] = useState({
    total: 0,
    flaggedCount: 0,
    avgRating: 0,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) return;

      const params = new URLSearchParams();
      if (activeTab !== "all") {
        params.append("status", activeTab);
      }
      params.append("limit", "100");

      const res = await fetch(`/api/v1/reviews/admin?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(t("Erreur lors de la récupération des avis"));
      }

      const data = await res.json();
      setReviews(data.reviews || []);
      setStats({
        total: data.total || 0,
        flaggedCount: data.flaggedCount || 0,
        avgRating: data.avgRating || 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Erreur serveur");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeTab, t]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (reviewId: string) => {
    setActionLoading(true);
    try {
      const token = await currentUser?.getIdToken(true);
      const res = await fetch(`/api/v1/reviews/${reviewId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || t("Impossible d'approuver l'avis"));
      }

      toast.success(t("Avis approuvé et publié"));
      fetchReviews();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Erreur serveur");
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    const ok = await showConfirmModal(
      t("Cette action supprimera définitivement l'avis et recalculera automatiquement la note moyenne du produit."),
      t("Supprimer cet avis ?")
    );

    if (!ok) return;

    setActionLoading(true);
    try {
      const token = await currentUser?.getIdToken(true);
      const res = await fetch(`/api/v1/reviews/${reviewId}/delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || t("Impossible de supprimer l'avis"));
      }

      toast.success(t("Avis supprimé avec succès"));
      fetchReviews();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Erreur serveur");
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter in memory for search & rating
  const filteredReviews = reviews.filter((r) => {
    if (selectedRating !== "all" && r.rating !== selectedRating) {
      return false;
    }
    if (searchTerm.trim().length > 0) {
      const term = searchTerm.toLowerCase();
      const matchComment = r.comment?.toLowerCase().includes(term);
      const matchUser = r.userName?.toLowerCase().includes(term);
      const matchProduct = r.productName?.toLowerCase().includes(term);
      const matchOrder = r.orderId?.toLowerCase().includes(term);
      return matchComment || matchUser || matchProduct || matchOrder;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-sans font-bold tracking-tight text-zinc-950 uppercase">
            {t("Modération des Avis")}
          </h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            {t("Surveillez, validez et modérez les retours d'expérience et notes des acheteurs.")}
          </p>
        </div>

        <button
          id="btn-refresh-reviews"
          onClick={fetchReviews}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {t("Actualiser")}
        </button>
      </div>

      {/* KPI Toolbar */}
      <ReviewsAdminToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        stats={stats}
      />

      {/* Review List or Empty State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-xs font-bold uppercase tracking-wider">{t("Chargement des avis...")}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center text-zinc-500 space-y-2">
          <MessageSquareWarning className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900">
            {activeTab === "flagged" ? t("Aucun avis à modérer") : t("Aucun avis trouvé")}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {activeTab === "flagged"
              ? t("Tous les avis récents respectent nos conditions d'utilisation et aucune alerte n'a été signalée.")
              : t("Aucun commentaire ne correspond à vos critères de recherche ou de filtre actuels.")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewsAdminCard
              key={review.id}
              review={review}
              onApprove={handleApprove}
              onDelete={handleDelete}
              isActionLoading={actionLoading}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog />
    </div>
  );
};
