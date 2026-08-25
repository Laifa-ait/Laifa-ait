import React from "react";
import { CheckSquare, Square, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Order } from "../../../domains/order/order.types";
import { formatPrice } from "../../../utils/format";
import { AdminDataTable } from "../../ui/Admin/AdminDataTable";
import { StatusBadge } from "../../ui/Admin/StatusBadge";

interface CalculatedOrder {
  id: string;
  commissionAmount: number;
  netRevenue: number;
  platformFee: number;
  sellerPayout: number;
  commissionCalc?: number; // added based on usage
}

interface OrderTableProps {
  loading: boolean;
  ordersCount?: number;
  filteredOrders: Order[];
  selectedOrderIds: string[];
  calculatedOrdersMap: Record<string, CalculatedOrder>;
  statusLabels: Record<string, string>;
  statusColors?: Record<string, string>;
  handleSelectAll: (checked: boolean) => void;
  handleSelectOrder: (orderId: string, checked: boolean) => void;
  setSelectedOrder: (order: Order | null) => void;
  getOrderDate: (createdAt: unknown) => Date | null;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  loading,
  filteredOrders,
  selectedOrderIds,
  calculatedOrdersMap,
  statusLabels,
  handleSelectAll,
  handleSelectOrder,
  setSelectedOrder,
  getOrderDate,
}) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAll(selectedOrderIds.length !== filteredOrders.length);
          }}
          className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer bg-transparent border-none"
        >
          {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? (
            <CheckSquare className="w-5 h-5 text-orange-500" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
      ),
      accessor: (order: Order) => {
        const isSelected = selectedOrderIds.includes(order.id);
        return (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleSelectOrder(order.id, !isSelected)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors inline-block cursor-pointer bg-transparent border-none p-0"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-[#ea580c]" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
          </div>
        );
      },
      className: "w-12 text-center"
    },
    {
      header: t("Manifeste & ID"),
      accessor: (order: Order) => {
        const dateVal = getOrderDate(order.createdAt);
        return (
          <div>
            <span className="text-xs font-bold font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded inline-block">
              {order.id.slice(-8).toUpperCase()}
            </span>
            <div className="text-[10px] tracking-wide text-zinc-400 font-bold mt-1">
              {dateVal ? dateVal.toLocaleString() : "N/A"}
            </div>
          </div>
        );
      }
    },
    {
      header: t("Client & Livrable"),
      accessor: (order: Order) => (
        <div>
          <strong className="block text-sm text-zinc-900 font-sans font-bold">
            {order.shippingAddress?.fullName || order.shippingAddress?.name || "Client Olmart"}
          </strong>
          <div className="text-[10px] font-bold text-zinc-450 uppercase flex items-center gap-1 mt-1">
            <span>📍</span>
            <span>
              {order.shippingAddress?.wilaya} • {order.shippingAddress?.commune}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("Produits"),
      accessor: (order: Order) => (
        <div className="flex flex-col gap-1 max-h-16 overflow-y-auto pr-1">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-[10px]">
              <span
                className="font-semibold text-zinc-700 truncate max-w-[120px]"
                title={item.productName || item.name || "Produit"}
              >
                {item.productName || item.name || "Produit"}
              </span>
              <span className="font-mono font-bold text-zinc-500 ml-2">x{item.quantity}</span>
            </div>
          ))}
        </div>
      ),
      className: "w-48"
    },
    {
      header: t("Encaissable COD / 5% Math"),
      accessor: (order: Order) => (
        <div className="font-sans">
          <strong className="block text-base font-sans font-bold text-zinc-950 tracking-tight">
            {formatPrice(order.total)}
          </strong>
          <span className="text-[9px] font-sans font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded inline-block uppercase tracking-wide mt-1">
            {t("Portion (5%):")} {formatPrice(calculatedOrdersMap[order.id]?.commissionCalc || 0)}
          </span>
        </div>
      )
    },
    {
      header: t("ID Suivi / Transport"),
      accessor: (order: Order) => (
        <div>
          {order.trackingId || order.trackingNumber ? (
            <div className="space-y-1">
              <span className="text-[11px] font-sans font-bold font-mono bg-zinc-950 text-white rounded px-2 py-0.5 inline-block uppercase select-all">
                {order.trackingId || order.trackingNumber}
              </span>
              <span className="block text-[8px] font-sans font-bold uppercase text-zinc-400">
                {order.deliveryProvider || "LIVRAISON DIRECTE"}
              </span>
            </div>
          ) : (
            <span className="text-zinc-400 text-xs italic font-semibold">{t("Non synchronisé")}</span>
          )}
        </div>
      )
    },
    {
      header: t("Statut Étape"),
      accessor: (order: Order) => (
        <StatusBadge 
          status={order.status?.toLowerCase()} 
          label={statusLabels[order.status?.toLowerCase()] || order.status}
        />
      )
    }
  ];

  return (
    <div className="pb-10">
      <AdminDataTable 
        data={filteredOrders}
        columns={columns}
        keyExtractor={(order) => order.id}
        isLoading={loading}
        onRowClick={(order) => setSelectedOrder(order)}
        emptyState={
          <>
            <HelpCircle className="w-12 h-12 mx-auto text-zinc-350 mb-3 animate-bounce" />
            <strong className="block text-sm font-bold">{t("Aucune commande correspondante")}</strong>
            <p className="text-xs text-zinc-450 mt-1">
              {t("Ajustez vos critères de filtrage ou réinitialisez la recherche.")}
            </p>
          </>
        }
      />
    </div>
  );
};
