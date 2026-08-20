import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { apiGet, apiPost } from "../../../lib/api";
import { Order, OrderStatus } from "../../../domains/order/order.types";
import { CalculatedOrder, exportOrdersToCSV } from "../components/orders/orderTypes";
import { useSellerOrdersExport } from "./useSellerOrdersExport";

export const useSellerOrders = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showGuide, setShowGuide] = useState(() => localStorage.getItem("olmart_hide_order_guide") !== "true");
  const [calculatedOrdersMap, setCalculatedOrdersMap] = useState<Record<string, CalculatedOrder>>({});

  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  const { loadingSheets, handleExportPremium } = useSellerOrdersExport();

  useEffect(() => {
    if (selectedOrder) {
      setCarrier(selectedOrder.deliveryProvider || "");
      setTrackingNumber(selectedOrder.trackingNumber || "");
      setTrackingLink("");
    } else {
      setCarrier("");
      setTrackingNumber("");
      setTrackingLink("");
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (orders.length === 0) {
      setCalculatedOrdersMap({});
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const res = await apiPost<{ calculatedOrders: CalculatedOrder[] }>("/api/v1/calculate-commissions", { orders });
        if (!cancelled) {
          const map: Record<string, CalculatedOrder> = {};
          res.calculatedOrders?.forEach((co) => { map[co.id] = co; });
          setCalculatedOrdersMap(map);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error("Erreur calcul commissions");
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [orders, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      if (searchTerm.trim() === "") {
        try {
          const res = await apiGet<{ orders?: Order[] }>("/api/v1/seller/orders");
          if (res?.orders) setOrders(res.orders);
        } catch (err) {
          console.error("Error loading seller orders:", err);
        }
      } else {
        try {
          const res = await apiGet<{ order?: Order }>(`/api/v1/seller/orders/${searchTerm.trim()}`);
          setOrders(res?.order ? [res.order] : []);
        } catch {
          setOrders([]);
        }
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUser, refreshTrigger]);

  const handleToggleGuide = useCallback(() => {
    setShowGuide((prev) => {
      const newVal = !prev;
      localStorage.setItem("olmart_hide_order_guide", (!newVal).toString());
      return newVal;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiPost("/api/v1/seller/orders/status", { orderIds: [orderId], status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleBulkUpdateStatus = async (newStatus: OrderStatus) => {
    if (selectedIds.length === 0) return;
    const eligibleIds = selectedIds.filter((id) => {
      const o = orders.find((ord) => ord.id === id);
      return o && (o.status || "pending").toLowerCase() !== newStatus.toLowerCase();
    });

    if (eligibleIds.length === 0) {
      toast.error(`Aucune commande éligible pour "${newStatus.toUpperCase()}".`);
      return;
    }

    toast.loading("Mise à jour en cours...", { id: "bulk" });
    try {
      await apiPost("/api/v1/seller/orders/status", { orderIds: eligibleIds, status: newStatus });
      setOrders((prev) => prev.map((o) => (eligibleIds.includes(o.id) ? { ...o, status: newStatus } : o)));
      setSelectedIds([]);
      toast.success(`Statut mis à jour (${eligibleIds.length}) !`, { id: "bulk" });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour en lot.", { id: "bulk" });
    }
  };

  const handleBulkGenerateTracking = async () => {
    if (selectedIds.length === 0 || !currentUser) return;
    const eligibleIds = selectedIds.filter((id) => {
      const o = orders.find((ord) => ord.id === id);
      return o && (o.status || "").toLowerCase() === "confirmed";
    });

    if (eligibleIds.length === 0) {
      toast.error("Aucune commande éligible pour étiquettes ('CONFIRMED' requis).");
      return;
    }

    toast.loading("Génération des étiquettes...", { id: "bulk_tracking" });
    try {
      const data = await apiPost<{ trackingNumbers?: Record<string, string>; pdfUrl?: string }>(
        "/api/v1/prepare-shipment",
        { orderIds: eligibleIds, provider: "LIVRAISON DIRECTE" }
      );
      if (data.trackingNumbers) {
        toast.success("Étiquettes générées !", { id: "bulk_tracking" });
        if (data.pdfUrl) window.open(data.pdfUrl, "_blank");
        setRefreshTrigger((prev) => prev + 1);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur génération étiquettes.", { id: "bulk_tracking" });
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    if (!carrier.trim() || !trackingNumber.trim()) {
      toast.error(t("Transporteur et numéro de suivi obligatoires."));
      return;
    }

    setSavingTracking(true);
    try {
      await apiPost("/api/v1/seller/orders/tracking", {
        orderId: selectedOrder.id,
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
        trackingLink: trackingLink.trim(),
      });

      toast.success(t("Suivi enregistré !"));
      const updatedProvider = (carrier.trim() as 'Livraison Directe' | 'Maystro' | 'KaziTour' | 'Autre');

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, deliveryProvider: updatedProvider || o.deliveryProvider, trackingNumber: trackingNumber.trim() }
            : o
        )
      );

      setSelectedOrder((prev) =>
        prev
          ? { ...prev, deliveryProvider: updatedProvider || prev.deliveryProvider, trackingNumber: trackingNumber.trim() }
          : null
      );
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : t("Erreur enregistrement suivi."));
    } finally {
      setSavingTracking(false);
    }
  };

  const commissionRate =
    userProfile?.role === "seller" && typeof userProfile.commissionRate === "number"
      ? userProfile.commissionRate
      : 10;

  return {
    currentUser,
    userProfile,
    commissionRate,
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    selectedOrder,
    setSelectedOrder,
    printingOrder,
    setPrintingOrder,
    selectedIds,
    showGuide,
    calculatedOrdersMap,
    loadingSheets,
    carrier,
    setCarrier,
    trackingNumber,
    setTrackingNumber,
    trackingLink,
    setTrackingLink,
    savingTracking,
    handleToggleGuide,
    toggleSelection,
    handleUpdateStatus,
    handleBulkUpdateStatus,
    handleBulkGenerateTracking,
    handleSaveTracking,
    exportCSV: () => exportOrdersToCSV(orders),
    handleExportPremium,
  };
};
