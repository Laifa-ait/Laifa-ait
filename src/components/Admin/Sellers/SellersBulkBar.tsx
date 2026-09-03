import React from "react";
import { UserCheck, UserX, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellersBulkBarProps {
  selectedSellerIds: string[];
  bulkLoading: boolean;
  handleBulkApproveSellers: () => void;
  handleBulkSuspendSellers: () => void;
  handleBulkDeleteSellers: () => void;
  setSelectedSellerIds: (ids: string[]) => void;
}

export const SellersBulkBar: React.FC<SellersBulkBarProps> = ({
  selectedSellerIds,
  bulkLoading,
  handleBulkApproveSellers,
  handleBulkSuspendSellers,
  handleBulkDeleteSellers,
  setSelectedSellerIds,
}) => {
  const { t } = useTranslation();

  if (selectedSellerIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 start-1/2 -translate-x-1/2 bg-zinc-950 text-white p-4 sm:p-5 rounded-[2.5rem] shadow-2xl z-55 w-[90%] max-w-xl flex items-center justify-between gap-4 border border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-sans font-bold text-sm text-white">
          {selectedSellerIds.length}
        </span>
        <div>
          <strong className="text-xs uppercase tracking-wider block font-sans font-bold text-white">
            {t("Vendeurs sélectionnés")}
          </strong>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleBulkApproveSellers}
          disabled={bulkLoading}
          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-2xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md disabled:opacity-50"
          title={t("Approuver la sélection")}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("Approuver")}</span>
        </button>
        <button
          onClick={handleBulkSuspendSellers}
          disabled={bulkLoading}
          className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-2xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md disabled:opacity-50"
          title={t("Suspendre la sélection")}
        >
          <UserX className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("Suspendre")}</span>
        </button>
        <button
          onClick={handleBulkDeleteSellers}
          disabled={bulkLoading}
          className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-2xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md disabled:opacity-50"
          title={t("Supprimer la sélection")}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("Supprimer")}</span>
        </button>
        <button
          onClick={() => setSelectedSellerIds([])}
          className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-2xl cursor-pointer border-none transition-all"
        >
          {t("Désélectionner")}
        </button>
      </div>
    </div>
  );
};
