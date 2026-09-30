import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Order, OrderStatus } from "../../../../domains/order/order.types";
import { useAuth } from "../../../../context/AuthContext";
import { AppTimestamp, normalizeTimestamp } from "../../../../utils/date";
import { useOrdersFilters } from "./useOrdersFilters";
import { useOrdersCommissions, CalculatedOrder } from "./useOrdersCommissions";

export type { CalculatedOrder };

export const useOrdersAdmin = (showConfirmModal: (msg: string) => Promise<boolean>) => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statusLabels: Record<string, string> = useMemo(() => ({
    new: t("Nouveau") || "Nouveau",
    processing: t("En Préparation") || "En Préparation",
    shipped: t("Expédié") || "Expédié",
    delivered: t("Livré") || "Livré",
    canceled: t("Annulé") || "Annulé",
    cancelled_by_client: t("Annulé Par Client") || "Annulé Par Client",
    return_requested: t("Retour Demandé") || "Retour Demandé",
    return_approved: t("Retour Approuvé") || "Retour Approuvé",
    return_rejected: t("Retour Refusé") || "Retour Refusé",
    returning: t("En cours de retour") || "En cours de retour",
    returned: t("Retourné") || "Retourné",
    refunded: t("Remboursé") || "Remboursé",
    dispute_open: t("Litige Ouvert") || "Litige Ouvert",
    dispute_resolved: t("Litige Résolu") || "Litige Résolu",
  }), [t]);

  const statusColors: Record<string, string> = useMemo(() => ({
    new: "bg-blue-50 text-blue-700 border-blue-100",
    processing: "bg-amber-50 text-amber-700 border-amber-100",
    shipped: "bg-purple-50 text-purple-700 border-purple-100",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    canceled: "bg-rose-50 text-rose-700 border-rose-100",
    cancelled_by_client: "bg-red-50 text-red-700 border-red-100",
    returned: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dispute_open: "bg-[var(--color-orange-600, #ea580c)]/15 text-[#ea580c] border-[var(--color-orange-600, #ea580c)]/20",
  }), []);

  const getOrderDate = useCallback((createdAt?: unknown): Date | null => {
    if (!createdAt) return null;
    const date = normalizeTimestamp(createdAt as AppTimestamp).toDate();
    return isNaN(date.getTime()) ? null : date;
  }, []);

  const filters = useOrdersFilters(orders, getOrderDate);

  const {
    totalVolume,
    totalCommission,
    sellersNetPayout,
    calculatedOrdersMap,
  } = useOrdersCommissions(filters.filteredOrders);

  const fetchOrders = useCallback(async (_isLoadMore = false) => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      if (!token) throw new Error("Non authentifié");

      const response = await fetch("/api/v1/admin/workspace/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur de chargement des commandes.");
      const data = await response.json();
      const fetched: Order[] = data.orders || [];

      setOrders(fetched);
      filters.extractWilayas(fetched);
      setHasMore(false);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      toast.error(t("Erreur de chargement des commandes."));
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters, t]);

  useEffect(() => {
    setHasMore(true);
    void fetchOrders(false);
  }, [refreshTrigger, filters.startDate, filters.endDate, fetchOrders]);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedOrderIds(checked ? filters.filteredOrders.map((o) => o.id) : []);
  }, [filters.filteredOrders]);

  const handleSelectOrder = useCallback((orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => (checked ? [...prev, orderId] : prev.filter((id) => id !== orderId)));
  }, []);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    if (!currentUser || userProfile?.role !== "admin") {
      toast.error(t("Veuillez vous authentifier d'abord."));
      return;
    }
    const confirmed = await showConfirmModal(`Modifier le statut de la commande en "${statusLabels[newStatus]}" ?`);
    if (!confirmed) return;
    setIsUpdatingStatus(true);
    const progressToast = toast.loading(t("Mise à jour du statut..."));
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch("/api/v1/seller/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderIds: [orderId], status: newStatus }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || t("Échec de la validation serveur."));
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      setSelectedOrder((prev) => (prev?.id === orderId ? { ...prev, status: newStatus } : prev));
      toast.success(t("Statut mis à jour et validé côté serveur avec commission et historique."), { id: progressToast });
    } catch (err: unknown) {
      console.error(err);
      toast.error(`${t("Erreur de mise à jour :")} ${err instanceof Error ? err.message : t("Erreur interne")}`, { id: progressToast });
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [currentUser, userProfile?.role, showConfirmModal, statusLabels, t]);

  const handleBulkStatusChange = useCallback(async (newStatus: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    if (!currentUser || userProfile?.role !== "admin") {
      toast.error(t("Veuillez vous authentifier d'abord."));
      return;
    }
    const confirmed = await showConfirmModal(`Modifier le statut de ${selectedOrderIds.length} commandes en "${statusLabels[newStatus]}" ?`);
    if (!confirmed) return;

    const progressToast = toast.loading(`${t("Mise à jour en masse de")} ${selectedOrderIds.length} ${t("commandes...")}`);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch("/api/v1/seller/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderIds: selectedOrderIds, status: newStatus }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || t("Échec de la validation groupée serveur."));
      }
      toast.success(`${selectedOrderIds.length} ${t("commandes mises à jour avec succès via le serveur !")}`, { id: progressToast });
      setSelectedOrderIds([]);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error(err);
      toast.error(`${t("Erreur de mise à jour groupée :")} ${err instanceof Error ? err.message : t("Erreur interne")}`, { id: progressToast });
    }
  }, [selectedOrderIds, currentUser, userProfile?.role, showConfirmModal, statusLabels, t]);

  const onResetFilters = useCallback(() => {
    filters.handleResetFilters();
    setSelectedOrderIds([]);
  }, [filters]);

  return {
    orders,
    loading,
    refreshTrigger,
    setRefreshTrigger,
    filters,
    totalVolume,
    totalCommission,
    sellersNetPayout,
    calculatedOrdersMap,
    selectedOrderIds,
    setSelectedOrderIds,
    hasMore,
    selectedOrder,
    setSelectedOrder,
    isUpdatingStatus,
    statusLabels,
    statusColors,
    getOrderDate,
    fetchOrders,
    handleSelectAll,
    handleSelectOrder,
    handleUpdateOrderStatus,
    handleBulkStatusChange,
    onResetFilters,
  };
};
