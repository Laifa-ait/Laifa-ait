import React from "react";
import { Store, DownloadCloud, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerMetadata } from "../hooks/useWorkspaceActions";

interface WorkspaceSelectSellerModalProps {
  sellers: SellerMetadata[];
  selectedSeller: string;
  setSelectedSeller: (id: string) => void;
  customSellerId: string;
  setCustomSellerId: (id: string) => void;
  loadingSheetSeller: boolean;
  onClose: () => void;
  onConfirmSellerExport: () => void;
}

export const WorkspaceSelectSellerModal: React.FC<WorkspaceSelectSellerModalProps> = ({
  sellers,
  selectedSeller,
  setSelectedSeller,
  customSellerId,
  setCustomSellerId,
  loadingSheetSeller,
  onClose,
  onConfirmSellerExport,
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
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-zinc-900 leading-tight">
              {t("Sélectionner la Boutique Vendeur")}
            </h3>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-400">
              {t("Relevé de Compte Vendeur")}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">
            {t("Choisissez un artisan dans le registre :")}
          </label>

          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-500 font-bold"
          >
            <option value="">-- {t("Sélectionnez dans la liste")} --</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shopName || s.name} ({s.id.slice(0, 8)}...)
              </option>
            ))}
            <option value="custom">{t("Saisir un ID personnalisé...")}</option>
          </select>

          {selectedSeller === "custom" && (
            <input
              type="text"
              value={customSellerId}
              onChange={(e) => setCustomSellerId(e.target.value)}
              placeholder={t("ID Utilisateur Vendeur (ex: uid-firestore)")}
              className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-500 font-mono font-bold"
            />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            {t("Annuler")}
          </button>
          <button
            onClick={onConfirmSellerExport}
            disabled={loadingSheetSeller}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingSheetSeller ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <DownloadCloud className="w-4 h-4" />
            )}
            <span>{t("Générer Relevé")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
