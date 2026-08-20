import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrderStatus } from "../../../../domains/order/order.types";

interface OrdersFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedIds: string[];
  onBulkUpdateStatus: (status: OrderStatus) => void;
  onBulkGenerateTracking: () => void;
}

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedIds,
  onBulkUpdateStatus,
  onBulkGenerateTracking,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="relative flex-1 w-full max-w-lg">
        <Search className="absolute start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder={t("Rechercher par N° Commande...") || "Rechercher par N° Commande..."}
          className="w-full ps-14 pe-6 py-4 bg-white border border-zinc-100 rounded-2xl outline-none font-medium focus:ring-4 ring-orange-500/5 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Actions en Lot */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 bg-white border border-zinc-200 px-6 py-3 rounded-2xl shadow-sm"
          >
            <span className="text-sm font-bold text-zinc-700">
              {selectedIds.length} {t("sélectionnée(s)")}
            </span>
            <div className="h-6 w-[1px] bg-zinc-200" />
            <div className="flex gap-2">
              <button
                onClick={() => onBulkUpdateStatus("confirmed")}
                className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-sans font-bold uppercase rounded-xl hover:bg-blue-100 transition-colors"
              >
                {t("Confirmer")}
              </button>
              <button
                onClick={onBulkGenerateTracking}
                className="px-4 py-2 bg-zinc-950 text-white text-xs font-sans font-bold uppercase rounded-xl hover:bg-zinc-800 transition-colors"
              >
                {t("Étiquettes(PDF)")}
              </button>
              <button
                onClick={() => onBulkUpdateStatus("shipped")}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-sans font-bold uppercase rounded-xl hover:bg-indigo-100 transition-colors"
              >
                {t("Expédiée")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
