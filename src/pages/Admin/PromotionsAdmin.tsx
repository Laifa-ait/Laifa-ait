import React, { useState, useEffect, useCallback } from "react";
import { Tag, Plus, AlertCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiGet, apiPut, apiDelete } from "../../lib/api";
import { Coupon, CouponCard } from "../../components/Admin/CouponCard";
import { CouponModal } from "../../components/Admin/CouponModal";

export const PromotionsAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sellersList, setSellersList] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ success: boolean; coupons: Coupon[] }>("/api/v1/admin/promotions/coupons");
      setCoupons(res?.coupons || []);
      setError("");
    } catch (err: unknown) {
      console.error("Error fetching coupons:", err);
      setError(err instanceof Error ? err.message : t("Erreur de chargement des coupons"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadSellers = useCallback(async () => {
    try {
      const res = await apiGet<{ success: boolean; sellers: { id: string; name: string }[] }>("/api/v1/admin/sellers/list");
      setSellersList(res?.sellers || []);
    } catch (err: unknown) {
      console.error("Error fetching sellers for admin promotions page:", err instanceof Error ? err.message : err);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
    loadSellers();
  }, [loadCoupons, loadSellers]);

  const toggleStatus = async (coupon: Coupon) => {
    try {
      const nextStatus = !coupon.isActive;
      await apiPut(`/api/v1/admin/promotions/coupons/${coupon.id}/status`, {
        isActive: nextStatus,
      });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextStatus } : c))
      );
      toast.success(
        nextStatus
          ? t("Coupon activé avec succès !")
          : t("Coupon désactivé avec succès !")
      );
    } catch (err: unknown) {
      console.error("Error updating status:", err);
      toast.error(err instanceof Error ? err.message : t("Erreur lors de la mise à jour du statut."));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("Êtes-vous sûr de vouloir supprimer ce coupon ?"))) {
      try {
        await apiDelete(`/api/v1/admin/promotions/coupons/${id}`);
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success(t("Coupon supprimé avec succès !"));
      } catch (err: unknown) {
        console.error("Error deleting coupon:", err);
        toast.error(err instanceof Error ? err.message : t("Erreur lors de la suppression."));
      }
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header section with clean premium typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950 uppercase">
            {t("Codes Promo & Campagnes")}
          </h2>
          <p className="text-zinc-500 font-medium text-sm mt-1">
            {t("Gérez les réductions globales d'OLMART, les coupons spécifiques vendeurs et les limites d'utilisation.")}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-zinc-950 text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" /> {t("Créer un Coupon")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Clock className="w-8 h-8 text-zinc-400 animate-spin" />
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
            {t("Chargement des coupons d'OLMART...")}
          </p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-zinc-200/80 shadow-sm overflow-hidden p-16 text-center text-zinc-500 max-w-xl mx-auto">
          <Tag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-sans font-bold text-zinc-900 mb-2">{t("Aucun code promo créé")}</h3>
          <p className="text-sm font-medium text-zinc-500">
            {t("Créez votre première campagne promotionnelle pour stimuler l'activité de la marketplace.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              toggleStatus={toggleStatus}
              handleDelete={handleDelete}
              sellersList={sellersList}
            />
          ))}
        </div>
      )}

      {/* Coupon Modal component */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingCoupons={coupons}
        onCouponCreated={loadCoupons}
      />
    </div>
  );
};

