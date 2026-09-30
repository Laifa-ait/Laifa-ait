import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useConfirm } from "../../hooks/useConfirm";
import { useOrdersAdmin } from "../../components/Admin/Orders/hooks/useOrdersAdmin";
import { printBulkOrderLabels } from "../../components/Admin/Orders/orderBulkPrint";
import { exportOrdersToCSV } from "../../components/Admin/Orders/orderExportCsv";
import { OrdersAdminHeader } from "../../components/Admin/Orders/OrdersAdminHeader";
import { OrdersStatsCards } from "../../components/Admin/Orders/OrdersStatsCards";
import { OrderFilters } from "../../components/Admin/Orders/OrderFilters";
import { OrderTable } from "../../components/Admin/Orders/OrderTable";
import { OrdersBulkBar } from "../../components/Admin/Orders/OrdersBulkBar";
import { OrderDetailsModal } from "../../components/Admin/Orders/OrderDetailsModal";

export const OrdersAdmin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();
  const isRtl = i18n.language === "ar";

  const {
    orders,
    loading,
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
  } = useOrdersAdmin(showConfirmModal);

  const handleBulkPrint = useCallback(() => {
    const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));
    printBulkOrderLabels(selectedOrders, t);
  }, [orders, selectedOrderIds, t]);

  const handleExportCSV = useCallback(() => {
    exportOrdersToCSV(filters.filteredOrders, statusLabels, getOrderDate, t);
  }, [filters.filteredOrders, statusLabels, getOrderDate, t]);

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <ConfirmationDialog />
      {/* Dynamic Print Iframe */}
      <iframe id="print-iframe-stealth-bulk" className="hidden" style={{ display: "none" }} />

      {/* Header */}
      <OrdersAdminHeader
        onExportCSV={handleExportCSV}
        onRefresh={() => {
          setRefreshTrigger((prev) => prev + 1);
          toast.success(t("Données actualisées"));
        }}
      />

      {/* Reactive Instant Bookkeeping Statistics */}
      <OrdersStatsCards
        totalVolume={totalVolume}
        totalCommission={totalCommission}
        sellersNetPayout={sellersNetPayout}
        filteredOrdersCount={filters.filteredOrders.length}
        totalOrdersCount={orders.length}
      />

      {/* Multidimensional Advanced Filters Panel */}
      <OrderFilters
        searchId={filters.searchId}
        setSearchId={filters.setSearchId}
        clientSearch={filters.clientSearch}
        setClientSearch={filters.setClientSearch}
        selectedWilaya={filters.selectedWilaya}
        setSelectedWilaya={filters.setSelectedWilaya}
        dynamicWilayas={filters.dynamicWilayas}
        selectedStatus={filters.selectedStatus}
        setSelectedStatus={filters.setSelectedStatus}
        sellerSearch={filters.sellerSearch}
        setSellerSearch={filters.setSellerSearch}
        startDate={filters.startDate}
        setStartDate={filters.setStartDate}
        endDate={filters.endDate}
        setEndDate={filters.setEndDate}
        statusLabels={statusLabels}
        onResetFilters={onResetFilters}
      />

      {/* Orders List Table Card */}
      <div className="space-y-4">
        <OrderTable
          loading={loading && orders.length === 0}
          ordersCount={orders.length}
          filteredOrders={filters.filteredOrders}
          selectedOrderIds={selectedOrderIds}
          calculatedOrdersMap={calculatedOrdersMap}
          statusLabels={statusLabels}
          statusColors={statusColors}
          handleSelectAll={handleSelectAll}
          handleSelectOrder={handleSelectOrder}
          setSelectedOrder={setSelectedOrder}
          getOrderDate={getOrderDate}
        />
        {hasMore && !loading && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => void fetchOrders(true)}
              className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
            >
              {t("Charger plus de commandes")}
            </button>
          </div>
        )}
        {loading && orders.length > 0 && (
          <div className="flex justify-center mt-4">
            <span className="text-zinc-500 font-bold text-xs uppercase animate-pulse">
              {t("Chargement en cours...")}
            </span>
          </div>
        )}
      </div>

      {/* Floating Bottom Massive Bulk Actions Controller */}
      <OrdersBulkBar
        selectedOrderIds={selectedOrderIds}
        statusLabels={statusLabels}
        handleBulkPrint={handleBulkPrint}
        handleBulkStatusChange={handleBulkStatusChange}
        setSelectedOrderIds={setSelectedOrderIds}
      />

      {/* Interactive Order Details Modal */}
      <OrderDetailsModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        statusLabels={statusLabels}
        calculatedOrdersMap={calculatedOrdersMap}
        isUpdatingStatus={isUpdatingStatus}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        setSelectedOrderIds={setSelectedOrderIds}
        handleBulkPrint={handleBulkPrint}
        setRefreshTrigger={setRefreshTrigger}
        getOrderDate={getOrderDate}
      />
    </div>
  );
};
