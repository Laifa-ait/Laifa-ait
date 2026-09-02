import React from "react";
import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminDataTable } from "../../ui/Admin/AdminDataTable";
import { StatusBadge } from "../../ui/Admin/StatusBadge";
import { GlobalOrder } from "../../../types/adminOverview";

interface OverviewGlobalOrdersTableProps {
  globalOrders: GlobalOrder[];
  loadingOrders: boolean;
}

export const OverviewGlobalOrdersTable: React.FC<OverviewGlobalOrdersTableProps> = ({
  globalOrders,
  loadingOrders,
}) => {
  const { t } = useTranslation();

  const globalOrdersColumns = [
    {
      header: t("N° Commande"),
      accessor: (order: GlobalOrder) => (
        <span className="text-sm font-sans font-bold text-zinc-950">
          #{order.id.substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: t("Client"),
      accessor: (order: GlobalOrder) => (
        <div>
          <p className="text-sm font-sans font-bold text-zinc-950">{order.customerName || "—"}</p>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{order.city || "—"}</p>
        </div>
      ),
    },
    {
      header: t("Montant"),
      accessor: (order: GlobalOrder) => (
        <span className="text-sm font-sans font-bold text-zinc-950">
          {(order.totalAmount ?? 0).toLocaleString()} DZD
        </span>
      ),
    },
    {
      header: t("Statut"),
      accessor: (order: GlobalOrder) => <StatusBadge status={order.status || "pending"} />,
    },
    {
      header: t("Date"),
      accessor: (order: GlobalOrder) => (
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          {order.date || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col mt-12">
      <div className="p-10 border-b border-zinc-50">
        <h4 className="text-xl font-sans font-bold flex items-center gap-4">
          <Truck className="w-7 h-7 text-orange-500" />
          {t("Surveillance Globale des Expéditions")}
        </h4>
      </div>
      <div className="pb-6">
        <AdminDataTable
          data={globalOrders}
          columns={globalOrdersColumns}
          keyExtractor={(item) => item.id}
          isLoading={loadingOrders}
          emptyState={
            <div className="text-center text-sm font-bold text-zinc-400">
              {t("Aucune commande trouvée.")}
            </div>
          }
        />
      </div>
    </div>
  );
};
