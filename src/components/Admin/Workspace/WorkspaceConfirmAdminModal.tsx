import React from "react";
import { DownloadCloud, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WorkspaceConfirmAdminModalProps {
  loadingSheetAdmin: boolean;
  onClose: () => void;
  onConfirmAdminExport: () => void;
}

export const WorkspaceConfirmAdminModal: React.FC<WorkspaceConfirmAdminModalProps> = ({
  loadingSheetAdmin,
  onClose,
  onConfirmAdminExport,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-zinc-100 shadow-2xl space-y-6 text-start relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ea580c]/10 border border-[#ea580c]/20 flex items-center justify-center shrink-0">
            <DownloadCloud className="w-6 h-6 text-[#ea580c]" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-zinc-900 leading-tight">
              {t("Générer le Bordereau Global")}
            </h3>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-400">
              {t("Google Sheets Sync")}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
          {t(
            "Vous allez créer une Feuille de Calcul Google Sheets contenant la totalité des commandes clients, la ventilation des commissions Olmart et les données de livraison."
          )}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            {t("Annuler")}
          </button>
          <button
            onClick={onConfirmAdminExport}
            disabled={loadingSheetAdmin}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingSheetAdmin ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <DownloadCloud className="w-4 h-4" />
            )}
            <span>{t("Générer le Sheets")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
