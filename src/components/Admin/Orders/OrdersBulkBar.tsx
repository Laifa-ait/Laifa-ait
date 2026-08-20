import React from "react";
import { Printer } from "lucide-react";
import { OrderStatus } from "../../../domains/order/order.types";
import { useTranslation } from "react-i18next";

interface OrdersBulkBarProps {
  selectedOrderIds: string[];
  statusLabels: Record<string, string>;
  handleBulkPrint: () => void;
  handleBulkStatusChange: (status: OrderStatus) => void;
  setSelectedOrderIds: (ids: string[]) => void;
}

export const OrdersBulkBar: React.FC<OrdersBulkBarProps> = ({
  selectedOrderIds,
  statusLabels,
  handleBulkPrint,
  handleBulkStatusChange,
  setSelectedOrderIds,
}) => {
  const { t } = useTranslation();

  if (selectedOrderIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 start-1/2 -translate-x-1/2 bg-zinc-950 text-white p-4 sm:p-5 rounded-[2.5rem] shadow-2xl z-55 w-[90%] max-w-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-[#ea580c] flex items-center justify-center font-sans font-bold text-sm text-white">
          {selectedOrderIds.length}
        </span>
        <div>
          <strong className="text-xs uppercase tracking-wider block font-sans font-bold text-white">
            {t("Commandes sélectionnées")}
          </strong>
          <span className="text-[10px] text-zinc-400 font-bold">{t("Manifeste groupé prêt")}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
        <button
          onClick={handleBulkPrint}
          className="py-2.5 px-4 bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md"
        >
          <Printer className="w-3.5 h-3.5 text-[#F46B1D]" />
          {t("Print Labels Bulk")} {t("admin_orders.pdf", "(PDF)")}
        </button>

        <select
          onChange={(e) => {
            if (e.target.value) {
              handleBulkStatusChange(e.target.value as OrderStatus);
              e.target.value = "";
            }
          }}
          className="py-2.5 px-3 bg-zinc-800 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer border-none transition-all focus:outline-none"
        >
          <option value="">⚙️ {t("Changer Statut (Bulk)")}</option>
          {Object.keys(statusLabels).map((k) => (
            <option key={k} value={k}>
              {statusLabels[k]}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSelectedOrderIds([])}
          className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer border-none transition-all"
        >
          {t("Désélectionner")}
        </button>
      </div>
    </div>
  );
};
