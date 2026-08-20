import React from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Download, DownloadCloud } from "lucide-react";

interface OrdersHeaderProps {
  showGuide: boolean;
  loadingSheets: boolean;
  onToggleGuide: () => void;
  onExportCSV: () => void;
  onExportPremium: () => void;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  showGuide,
  loadingSheets,
  onToggleGuide,
  onExportCSV,
  onExportPremium,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">
          {t("Commandes Reçues")}
        </h2>
        <p className="text-zinc-500 font-medium">{t("Suivez et expédiez vos ventes à travers l'Algérie.")}</p>
      </div>
      <div className="flex items-center gap-3">
        {!showGuide && (
          <button
            onClick={onToggleGuide}
            className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal rounded-2xl hover:bg-orange-100 transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            {t("Afficher le Guide")}
          </button>
        )}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal rounded-2xl hover:bg-zinc-800 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          {t("Exporter Excel")}
        </button>
        <button
          onClick={onExportPremium}
          disabled={loadingSheets}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shrink-0"
        >
          <DownloadCloud className="w-4 h-4" />
          {loadingSheets ? t("Exportation...") : t("Bilan Premium (Sheets)")}
        </button>
      </div>
    </div>
  );
};
