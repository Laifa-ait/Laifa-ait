import React from "react";
import { ShippingLabelPrinter } from "../../components/Seller/ShippingLabelPrinter";
import { useSellerOrders } from "./hooks/useSellerOrders";
import { OrdersHeader } from "./components/orders/OrdersHeader";
import { OrdersGuide } from "./components/orders/OrdersGuide";
import { OrdersFilters } from "./components/orders/OrdersFilters";
import { OrdersList } from "./components/orders/OrdersList";
import { OrderDetailsDrawer } from "./components/orders/OrderDetailsDrawer";

export const Orders: React.FC = () => {
  const {
    currentUser,
    commissionRate,
    orders,
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
    exportCSV,
    handleExportPremium,
  } = useSellerOrders();

  if (printingOrder) {
    return <ShippingLabelPrinter order={printingOrder} onClose={() => setPrintingOrder(null)} />;
  }

  return (
    <div className="space-y-10">
      <OrdersHeader
        showGuide={showGuide}
        loadingSheets={loadingSheets}
        onToggleGuide={handleToggleGuide}
        onExportCSV={exportCSV}
        onExportPremium={handleExportPremium}
      />

      <OrdersGuide showGuide={showGuide} onToggleGuide={handleToggleGuide} />

      <OrdersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedIds={selectedIds}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onBulkGenerateTracking={handleBulkGenerateTracking}
      />

      <OrdersList
        orders={orders}
        currentUserId={currentUser?.uid}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelection}
        onSelectOrder={setSelectedOrder}
      />

      <OrderDetailsDrawer
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSetPrintingOrder={setPrintingOrder}
        calculatedOrdersMap={calculatedOrdersMap}
        commissionRate={commissionRate}
        carrier={carrier}
        setCarrier={setCarrier}
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        trackingLink={trackingLink}
        setTrackingLink={setTrackingLink}
        savingTracking={savingTracking}
        onSaveTracking={handleSaveTracking}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
