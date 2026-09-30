import React from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, FileText, RefreshCw } from "lucide-react";

export interface OrdersAdminHeaderProps {
  onExportCSV: () => void;
  onRefresh: () => void;
}

export const OrdersAdminHeader: React.FC<OrdersAdminHeaderProps> = ({
  onExportCSV,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-zinc-100 pb-5">
      <div>
        <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950 uppercase flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-[#F46B1D]" />
          {t("Global Manifest & Central Orders Admin")}
        </h2>
        <p className="text-zinc-500 font-bold text-sm">
          {t(
            "Comptabilité instantanée, filtrage multidimensionnel des 69 Wilayas et impression de bordereaux groupés."
          )}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onExportCSV}
          className="p-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl transition-all cursor-pointer flex items-center gap-2 font-bold text-xs uppercase"
        >
          <FileText className="w-4 h-4" />
          {t("Exporter CSV")}
        </button>
        <button
          onClick={onRefresh}
          className="p-3 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-zinc-650 transition-all cursor-pointer flex items-center gap-2 font-bold text-xs uppercase"
        >
          <RefreshCw className="w-4 h-4" />
          {t("Actualiser")}
        </button>
      </div>
    </div>
  );
};
