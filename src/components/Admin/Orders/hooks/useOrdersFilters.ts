import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Order } from "../../../../domains/order/order.types";

export const useOrdersFilters = (
  orders: Order[],
  getOrderDate: (createdAt?: unknown) => Date | null
) => {
  const { t } = useTranslation();

  const [searchId, setSearchId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sellerSearch, setSellerSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dynamicWilayas, setDynamicWilayas] = useState<string[]>([]);

  const extractWilayas = useCallback((ordersData: Order[]) => {
    const wilayas = Array.from(
      new Set(ordersData.map((o) => o.shippingAddress?.wilaya).filter(Boolean))
    ) as string[];
    setDynamicWilayas(wilayas);
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    if (searchId && !order.id.toLowerCase().includes(searchId.toLowerCase())) {
      return false;
    }
    if (clientSearch) {
      const qStr = clientSearch.toLowerCase();
      const name = (order.shippingAddress?.fullName || order.shippingAddress?.name || "").toLowerCase();
      const phone = (order.shippingAddress?.phone || "").toLowerCase();
      if (!name.includes(qStr) && !phone.includes(qStr)) {
        return false;
      }
    }
    if (selectedStatus !== "all" && (order.status || "").toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    if (selectedWilaya !== "all") {
      const orderWilaya = (order.shippingAddress?.wilaya || "").toLowerCase();
      const targetWilaya = selectedWilaya.toLowerCase();
      if (!orderWilaya.includes(targetWilaya) && !targetWilaya.includes(orderWilaya)) {
        return false;
      }
    }
    if (sellerSearch) {
      const queryStr = sellerSearch.toLowerCase();
      const matchSellerId = order.sellerIds?.some((id) => id.toLowerCase().includes(queryStr));
      const matchItemSeller = order.items?.some((it) => it.sellerId?.toLowerCase().includes(queryStr));
      if (!matchSellerId && !matchItemSeller) {
        return false;
      }
    }
    const orderDate = getOrderDate(order.createdAt);
    if (orderDate) {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
    } else if (startDate || endDate) {
      return false;
    }
    return true;
  }), [orders, searchId, clientSearch, selectedStatus, selectedWilaya, sellerSearch, startDate, endDate, getOrderDate]);

  const handleResetFilters = useCallback(() => {
    setSearchId("");
    setClientSearch("");
    setSelectedWilaya("all");
    setSelectedStatus("all");
    setSellerSearch("");
    setStartDate("");
    setEndDate("");
    toast.success(t("Filtres réinitialisés !"));
  }, [t]);

  return {
    searchId,
    setSearchId,
    clientSearch,
    setClientSearch,
    selectedWilaya,
    setSelectedWilaya,
    selectedStatus,
    setSelectedStatus,
    sellerSearch,
    setSellerSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    dynamicWilayas,
    extractWilayas,
    filteredOrders,
    handleResetFilters,
  };
};
