import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Truck, Printer } from "lucide-react";
import { Order, OrderStatus } from "../../../../domains/order/order.types";
import { formatPrice } from "../../../../utils/format";
import { getOptimizedImageUrl } from "../../../../utils/imageUtils";
import { OrderChatBox } from "../../../../components/OrderChatBox";
import { CalculatedOrder, formatOrderDate, getStatusLabel } from "./orderTypes";
import { OrderCustomerInfo } from "./OrderCustomerInfo";
import { OrderTrackingForm } from "./OrderTrackingForm";

interface OrderDetailsDrawerProps {
  selectedOrder: Order | null;
  onClose: () => void;
  onSetPrintingOrder: (order: Order) => void;
  calculatedOrdersMap: Record<string, CalculatedOrder>;
  commissionRate?: number;
  carrier: string;
  setCarrier: (val: string) => void;
  trackingNumber: string;
  setTrackingNumber: (val: string) => void;
  trackingLink: string;
  setTrackingLink: (val: string) => void;
  savingTracking: boolean;
  onSaveTracking: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const MAIN_STATUSES: OrderStatus[] = ["processing", "picked_up", "in_transit", "delivered"];
const CANCELLATION_STATUSES: OrderStatus[] = ["canceled", "returned"];

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  selectedOrder,
  onClose,
  onSetPrintingOrder,
  calculatedOrdersMap,
  commissionRate = 10,
  carrier,
  setCarrier,
  trackingNumber,
  setTrackingNumber,
  trackingLink,
  setTrackingLink,
  savingTracking,
  onSaveTracking,
  onUpdateStatus,
}) => {
  const { t, i18n } = useTranslation();

  if (!selectedOrder) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />
        <motion.div
          layoutId="order-modal"
          className="relative bg-white w-full max-w-4xl rounded-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        >
          <div className="flex-1 p-5 sm:p-10 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
              <div className="text-start">
                <h3 className="text-xl sm:text-2xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">
                  {t("Commande #")}
                  {selectedOrder.id.substring(0, 8).toUpperCase()}
                </h3>
                <p className="text-zinc-500 text-xs sm:text-sm font-medium mt-1">
                  {t("Reçu le ")}
                  {formatOrderDate(selectedOrder.createdAt, i18n.language.startsWith("ar") ? "ar-DZ" : "fr-DZ")}
                </p>
              </div>
              <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                {selectedOrder.trackingNumber && (
                  <div className="text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-zinc-500" />
                    Tracking: {selectedOrder.trackingNumber}
                  </div>
                )}
                <button
                  onClick={() => {
                    onSetPrintingOrder(selectedOrder);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 bg-[#ea580c] hover:bg-orange-600 px-4 py-2.5 rounded-xl text-white transition-colors text-[10px] uppercase tracking-widest rtl:tracking-normal font-sans font-bold shadow-md cursor-pointer border-none w-full sm:w-auto"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>{t("Bordereau / Ticket interne")}</span>
                </button>
                {selectedOrder.shippingLabelUrl && (
                  <a
                    href={selectedOrder.shippingLabelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-zinc-100 px-4 py-2.5 rounded-xl text-zinc-800 hover:bg-zinc-200 transition-colors text-[10px] uppercase tracking-widest rtl:tracking-normal font-sans font-bold w-full sm:w-auto"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>{t("Imprimer Ticket")}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-8">
                <OrderCustomerInfo order={selectedOrder} />

                <div className="space-y-4">
                  <h4 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-4 ml-1">
                    {t("Items Commandés")}
                  </h4>
                  {selectedOrder.items?.map((item, i: number) => (
                    <div key={i} className="flex gap-4 p-4 border border-zinc-100 rounded-2xl bg-white shadow-sm">
                      <div className="w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                        <img
                          loading="lazy"
                          src={getOptimizedImageUrl(item.productImage || "", 200)}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-bold text-zinc-950">{item.productName || item.name}</p>
                        {item.selectedVariant && (
                          <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-0.5 mb-1 uppercase tracking-widest">
                            {item.selectedVariant}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 font-medium">
                          {t("Qté:")}
                          {item.quantity || 1} • {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <OrderChatBox orderId={selectedOrder.id} buyerId={selectedOrder.userId} />
                </div>
              </div>

              <div className="space-y-8 text-center md:text-start">
                <div className="bg-white border-2 border-zinc-950 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 flex flex-col items-center justify-between h-fit">
                  <div className="w-full space-y-4 mb-4">
                    <div className="flex justify-between items-center text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                      <span>{t("Total Client")}</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-sans font-bold text-rose-500 uppercase tracking-widest rtl:tracking-normal">
                      <span>
                        {t("Commission OLMART (")}
                        {commissionRate}%)
                      </span>
                      <span>-{formatPrice(calculatedOrdersMap[selectedOrder?.id]?.commissionAmount || 0)}</span>
                    </div>
                    <div className="h-[1px] bg-zinc-100 w-full" />
                  </div>
                  <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2">
                    {t("Net à Percevoir")}
                  </p>
                  <h4 className="text-4xl font-sans font-bold tracking-tighter rtl:tracking-normal text-zinc-950 mb-8">
                    {formatPrice(calculatedOrdersMap[selectedOrder?.id]?.netRevenue || 0)}
                  </h4>
                  <div className="w-full space-y-3">
                    <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal text-center mb-1">
                      {t("Mettre à jour l'état")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {MAIN_STATUSES.map((s) => {
                        const currentLower = (selectedOrder.status || "").toLowerCase();
                        const targetLower = s.toLowerCase();

                        let effectiveCurrent = currentLower;
                        if (currentLower === "preparing" || currentLower === "confirmed") effectiveCurrent = "processing";
                        if (currentLower === "shipped") effectiveCurrent = "in_transit";

                        const isCurrent = effectiveCurrent === targetLower;

                        return (
                          <button
                            key={s}
                            disabled={isCurrent}
                            onClick={() => !isCurrent && onUpdateStatus(selectedOrder.id, s)}
                            className={`py-3.5 px-2 rounded-xl font-black text-[9px] uppercase tracking-widest rtl:tracking-normal transition-all border cursor-pointer ${
                              isCurrent
                                ? "bg-zinc-950 text-white border-zinc-950 shadow-md cursor-default"
                                : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600 active:scale-[0.98]"
                            }`}
                          >
                            {getStatusLabel(s.toUpperCase())}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex gap-2 pt-1">
                      {CANCELLATION_STATUSES.map((s) => {
                        const isCurrent = (selectedOrder.status || "").toLowerCase() === s;
                        return (
                          <button
                            key={s}
                            disabled={isCurrent}
                            onClick={() => !isCurrent && onUpdateStatus(selectedOrder.id, s)}
                            className={`flex-1 py-2 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all border cursor-pointer ${
                              isCurrent
                                ? "bg-rose-950 text-white border-rose-950 opacity-80"
                                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-600 hover:text-white"
                            }`}
                          >
                            {getStatusLabel(s.toUpperCase())}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <OrderTrackingForm
                  carrier={carrier}
                  setCarrier={setCarrier}
                  trackingNumber={trackingNumber}
                  setTrackingNumber={setTrackingNumber}
                  trackingLink={trackingLink}
                  setTrackingLink={setTrackingLink}
                  savingTracking={savingTracking}
                  onSaveTracking={onSaveTracking}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
