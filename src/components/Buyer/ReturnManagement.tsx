import React, { useState, useEffect, useMemo } from "react";
import { 
  RotateCcw, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Package,
  ChevronRight,
  Store
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { UserProfile } from "../../domains/user/user.types";
import { Order } from "../../domains/order/order.types";
import { normalizeTimestamp } from "../../utils/date";
import { formatPrice } from "../../utils/format";

export const ReturnManagement: React.FC<{ currentUser: UserProfile | { uid: string } | null }> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [returns, setReturns] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReturns = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const data = await apiGet<{ returns: Order[] }>('/api/v1/buyer/returns');
        if (data?.returns) {
          const list = [...data.returns].sort((a: Order, b: Order) => {
            const tA = a.returnRequest?.createdAt 
              ? normalizeTimestamp(a.returnRequest.createdAt).toDate().getTime() 
              : a.updatedAt ? normalizeTimestamp(a.updatedAt).toDate().getTime() : 0;
            const tB = b.returnRequest?.createdAt 
              ? normalizeTimestamp(b.returnRequest.createdAt).toDate().getTime() 
              : b.updatedAt ? normalizeTimestamp(b.updatedAt).toDate().getTime() : 0;
            return tB - tA;
          });
          setReturns(list);
        }
      } catch (err: unknown) {
        console.error("Error fetching returns for buyer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, [currentUser]);

  const getStatusBadge = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return { label: t("Validation en cours") || "Validation en cours", bg: "bg-amber-50 text-amber-800 border-amber-200/80", icon: Clock };
      case "approved":
        return { label: t("Retour Accepté par le vendeur") || "Retour Accepté", bg: "bg-sky-50 text-sky-800 border-sky-200/80", icon: CheckCircle2 };
      case "returning":
        return { label: t("Colis en cours de renvoi") || "En cours de renvoi", bg: "bg-indigo-50 text-indigo-800 border-indigo-200/80", icon: RotateCcw };
      case "received":
        return { label: t("Réceptionné par le vendeur") || "Réceptionné", bg: "bg-purple-50 text-purple-800 border-purple-200/80", icon: Package };
      case "completed":
      case "refunded":
        return { label: t("Remboursé") || "Remboursé", bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80", icon: CreditCard };
      case "rejected":
        return { label: t("Demande non retenue") || "Refusée", bg: "bg-rose-50 text-rose-800 border-rose-200/80", icon: XCircle };
      default:
        return { label: status || t("En traitement"), bg: "bg-stone-100 text-stone-700 border-stone-200", icon: Clock };
    }
  };

  const filteredReturns = useMemo(() => {
    if (filter === "pending") {
      return returns.filter((r) => (r.returnRequest?.status || "").toLowerCase() === "pending");
    }
    if (filter === "resolved") {
      return returns.filter((r) => ["approved", "completed", "refunded", "rejected"].includes((r.returnRequest?.status || "").toLowerCase()));
    }
    return returns;
  }, [returns, filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
          {t("Mes Retours & Réclamations") || "Mes Retours & Réclamations"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
          {t("Suivez l'état de vos demandes de retour et échanges auprès des vendeurs.") || "Suivez l'état de vos retours."}
        </p>
      </div>

      {/* Filter Segmented Controls */}
      {returns.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl w-fit text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === "all" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t("Tous")} ({returns.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === "pending" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t("En attente")}
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === "resolved" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t("Clôturés")}
          </button>
        </div>
      )}

      {/* Returns List Container */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 bg-stone-200/70 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="w-1/3 h-4 bg-stone-200/70 rounded" />
                  <div className="w-1/2 h-3 bg-stone-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              {filter === "all" ? t("Aucune demande de retour enregistrée") : t("Aucun retour dans cette catégorie")}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mb-6 leading-relaxed">
              {t("Si vous constatez un défaut ou une non-conformité sur une commande livrée, vous pouvez contacter directement le vendeur depuis le détail de votre commande.")}
            </p>
            <button
              onClick={() => navigate("/dashboard/buyer?tab=orders")}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {t("Consulter mes commandes")}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredReturns.map((req) => {
              const badge = getStatusBadge(req.returnRequest?.status);
              const BadgeIcon = badge.icon;
              const dateStr = req.returnRequest?.createdAt
                ? normalizeTimestamp(req.returnRequest.createdAt).toDate().toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })
                : "Date récente";

              return (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 hover:bg-stone-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">
                        #{req.id.substring(0, 10).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2.5 py-0.5 ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{dateStr}</span>
                      </div>
                      <div>
                        <span>{t("Montant :")} </span>
                        <strong className="text-stone-900 tabular-nums">{formatPrice(req.total)}</strong>
                      </div>
                      {req.returnRequest?.refundMethod && (
                        <div className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          {req.returnRequest.refundMethod === "ccp" ? t("Virement CCP") : t("Avoir Boutique")}
                        </div>
                      )}
                    </div>

                    {req.returnRequest?.reason && (
                      <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60 text-xs text-stone-700">
                        <span className="font-semibold text-stone-900 block">
                          {t("Motif :")} {req.returnRequest.reason}
                        </span>
                        {req.returnRequest.details && (
                          <p className="text-stone-500 italic mt-0.5 line-clamp-2">
                            "{req.returnRequest.details}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center">
                    <button
                      onClick={() => navigate(`/dashboard/buyer/order/${req.id}`)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>{t("Détail de la commande")}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-stone-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notice on Seller Delivery Responsibility */}
      <div className="bg-stone-50 border border-stone-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <Store className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-stone-900">
            {t("Responsabilité et gestion de la livraison") || "Responsabilité de la livraison"}
          </h4>
          <p className="text-stone-600 leading-relaxed">
            {t("Sur Olmart, chaque vendeur indépendant assure à 100% la préparation, l'expédition et la livraison de ses commandes. Le paiement s'effectue en espèces à la livraison auprès du livreur. Pour toute demande de retour ou échange, vous échangez directement avec le vendeur depuis votre espace commande.") || 
              "La livraison est assurée à 100% par le vendeur. Le paiement se fait à la livraison. Pour tout retour, contactez directement le vendeur."}
          </p>
        </div>
      </div>
    </div>
  );
};
