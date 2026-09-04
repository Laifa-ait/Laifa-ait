import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tag, Plus, Search, Sparkles, CheckCircle2, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiGet, apiPut, apiDelete } from "../../lib/api";
import { Coupon } from "../../domains/marketing/coupon.types";
import { SellerCouponCard } from "./components/coupons/SellerCouponCard";
import { SellerCouponModal } from "./components/coupons/SellerCouponModal";
import { SellerCouponDeleteModal } from "./components/coupons/SellerCouponDeleteModal";
import { Spinner } from "../../components/ui/Spinner";

export const SellerCoupons: React.FC = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ success: boolean; coupons: Coupon[] }>("/api/v1/seller/coupons");
      if (res && res.success && Array.isArray(res.coupons)) {
        setCoupons(res.coupons);
      }
    } catch {
      toast.error(t("seller.coupons.error_load", "Impossible de charger vos codes promo."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      setUpdatingId(coupon.id);
      const newStatus = !coupon.isActive;
      const res = await apiPut<{ success: boolean; message?: string }>(
        `/api/v1/seller/coupons/${coupon.id}/status`,
        { isActive: newStatus }
      );

      if (res && res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c))
        );
        toast.success(
          newStatus
            ? t("seller.coupons.activated_toast", "Coupon activé !")
            : t("seller.coupons.deactivated_toast", "Coupon désactivé !")
        );
      }
    } catch {
      toast.error(t("seller.coupons.error_toggle", "Erreur lors du changement de statut."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await apiDelete<{ success: boolean; message?: string }>(
        `/api/v1/seller/coupons/${deleteTargetId}`
      );
      if (res && res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== deleteTargetId));
        toast.success(t("seller.coupons.deleted_toast", "Coupon supprimé avec succès."));
      }
    } catch {
      toast.error(t("seller.coupons.error_delete", "Erreur lors de la suppression du coupon."));
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleCreated = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons;
    const q = searchQuery.toLowerCase().trim();
    return coupons.filter((c) => c.code.toLowerCase().includes(q));
  }, [coupons, searchQuery]);

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive).length;
    const totalUses = coupons.reduce((sum, c) => sum + Number(c.usedCount ?? c.usageCount ?? 0), 0);
    return { total, active, totalUses };
  }, [coupons]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              {t("seller.coupons.title", "Mes codes promo")}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
              {stats.total}
            </span>
          </div>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            {t("seller.coupons.subtitle", "Créez et gérez des réductions applicables exclusivement sur votre boutique et vos fiches produits.")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t("seller.coupons.btn_new", "Nouveau code promo")}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-zinc-950">{stats.total}</div>
            <div className="text-xs font-semibold text-zinc-500">{t("seller.coupons.stat_total", "Codes créés")}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-zinc-950">{stats.active}</div>
            <div className="text-xs font-semibold text-zinc-500">{t("seller.coupons.stat_active", "Actuellement actifs")}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-zinc-950">{stats.totalUses}</div>
            <div className="text-xs font-semibold text-zinc-500">{t("seller.coupons.stat_uses", "Utilisations totales")}</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
        <input
          type="text"
          placeholder={t("seller.coupons.search_placeholder", "Rechercher par code promo (ex: PROMO10)...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-zinc-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-zinc-900 placeholder:text-zinc-400"
        />
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-orange-600" />
          <p className="text-xs font-medium text-zinc-500">{t("common.loading", "Chargement...")}</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white border border-dashed border-zinc-300 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">
            {searchQuery ? t("seller.coupons.no_results", "Aucun coupon trouvé pour cette recherche.") : t("seller.coupons.empty_title", "Vous n'avez pas encore de code promo")}
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {t("seller.coupons.empty_desc", "Offrez des réductions ciblées à vos clients pour booster vos ventes. Vos coupons s'afficheront discrètement sur votre boutique et vos fiches produits.")}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t("seller.coupons.btn_create_first", "Créer mon premier coupon")}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCoupons.map((coupon) => (
            <SellerCouponCard
              key={coupon.id}
              coupon={coupon}
              onToggleStatus={handleToggleStatus}
              onDelete={(id) => setDeleteTargetId(id)}
              isUpdatingStatus={updatingId === coupon.id}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <SellerCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />

      {/* Delete Confirmation Modal */}
      <SellerCouponDeleteModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteCoupon}
      />
    </div>
  );
};

export default SellerCoupons;
