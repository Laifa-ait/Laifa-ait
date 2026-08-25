import React from "react";
import { X, Truck, Printer, ExternalLink } from "lucide-react";
import { Order, OrderStatus } from "../../../domains/order/order.types";
import { useTranslation } from "react-i18next";
import {
  OrderClientProfileCard,
  OrderItemsTable,
  OrderCommissionCard
} from "./OrderDetailsSections";

interface OrderDetailsModalProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  statusLabels: Record<string, string>;
  calculatedOrdersMap: Record<string, { commissionAmount: number; netRevenue: number }>;
  isUpdatingStatus: boolean;
  handleUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  setSelectedOrderIds: (ids: string[]) => void;
  handleBulkPrint: () => void;
  setRefreshTrigger?: React.Dispatch<React.SetStateAction<number>>;
  getOrderDate: (val: unknown) => Date | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  selectedOrder,
  setSelectedOrder,
  statusLabels,
  calculatedOrdersMap,
  isUpdatingStatus,
  handleUpdateOrderStatus,
  setSelectedOrderIds,
  handleBulkPrint,
  getOrderDate,
}) => {
  const { t } = useTranslation();

  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl border border-zinc-100 max-h-[90vh] flex flex-col scale-100 transition-all duration-300">
        <div className="p-6 bg-zinc-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#ea580c] block">
              {t("Manifeste n°")} {selectedOrder.id.toUpperCase()}
            </span>
            <h3 className="text-lg font-sans font-bold uppercase text-white mt-1">
              {t("Fiche Commande Complète")}
            </h3>
          </div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer border-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-800">
          <OrderClientProfileCard selectedOrder={selectedOrder} />
          <OrderItemsTable items={selectedOrder.items || []} />
          <OrderCommissionCard selectedOrder={selectedOrder} calculatedOrdersMap={calculatedOrdersMap} />

          <div className="p-5 border border-zinc-200 rounded-[2rem] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <strong className="block text-xs uppercase tracking-wider text-zinc-700 font-sans font-bold">
                  {t("Modifier le statut de la commande")}
                </strong>
                <span className="text-[10px] text-zinc-400 block">
                  {t("Prend effet immédiatement côté vendeur et acheteur")}
                </span>
              </div>

              <select
                disabled={isUpdatingStatus}
                value={selectedOrder.status?.toLowerCase() || ""}
                onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                className="p-3 border border-zinc-200 bg-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider text-zinc-800 outline-none cursor-pointer"
              >
                {Object.keys(statusLabels).map((key) => (
                  <option key={key} value={key}>
                    {statusLabels[key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <strong className="block text-xs uppercase tracking-wider text-zinc-700 font-sans font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-500" />
                  {t("Attribution Logistique & Expédition")}
                </strong>
                <span className="text-[10px] text-zinc-400 block mt-1">
                  {selectedOrder.trackingNumber
                    ? t("Numéro de Suivi : ") + selectedOrder.trackingNumber
                    : t("Aucun bordereau généré.")}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedOrder.trackingNumber && (
                  <a
                    href={`/tracking?id=${selectedOrder.trackingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-sans font-bold text-[10px] uppercase tracking-widest rounded-xl transition-colors border border-orange-200 flex items-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t("Suivre l'envoi")}
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h5 className="text-[10px] font-sans font-bold uppercase text-zinc-500 mb-3">
                {t("Journal Logistique (Delivery Logs)")}
              </h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-zinc-500">
                    {selectedOrder.createdAt ? getOrderDate(selectedOrder.createdAt)?.toLocaleString() : ""}
                  </span>
                  <strong className="text-zinc-800">{t("Commande créée")}</strong>
                </div>
                {selectedOrder.status?.toUpperCase() !== "NEW" && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <span className="text-zinc-500">{new Date().toLocaleString()}</span>
                    <strong className="text-zinc-800">
                      {t("Mise à jour : ")} {statusLabels[selectedOrder.status] || selectedOrder.status}
                    </strong>
                  </div>
                )}
                {selectedOrder.deliveryBoyId && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-zinc-500">{new Date().toLocaleString()}</span>
                    <strong className="text-zinc-800">
                      {t("Assigné au livreur")} {selectedOrder.deliveryBoyName}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between">
          <div>
            <button
              onClick={() => {
                setSelectedOrderIds([selectedOrder.id]);
                setTimeout(() => {
                  handleBulkPrint();
                  setSelectedOrderIds([]);
                }, 100);
              }}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-sans font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-1 cursor-pointer transition-all border-none"
            >
              <Printer className="w-4 h-4" />
              {t("Imprimer Ticket")} {t("admin_orders.pdf", "(PDF)")}
            </button>
          </div>

          <button
            onClick={() => setSelectedOrder(null)}
            className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-sans font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all border-none"
          >
            {t("Fermer")}
          </button>
        </div>
      </div>
    </div>
  );
};
