import React from "react";
import { DownloadCloud, Video, FileUp, Loader2, Store } from "lucide-react";
import { useWorkspaceActions } from "./hooks/useWorkspaceActions";
import { WorkspaceAlertModal } from "./Workspace/WorkspaceAlertModal";
import { WorkspaceModals } from "./Workspace/WorkspaceModals";

export const WorkspaceActions: React.FC = () => {
  const {
    t,
    loadingSheetAdmin,
    loadingSheetSeller,
    loadingDrive,
    loadingMeet,
    sellers,
    activeModal,
    setActiveModal,
    selectedSeller,
    setSelectedSeller,
    customSellerId,
    setCustomSellerId,
    meetEmail,
    setMeetEmail,
    meetSearchTerm,
    setMeetSearchTerm,
    selectedMeetEmails,
    statusAlert,
    setStatusAlert,
    executeExportAdmin,
    executeExportSeller,
    executeUploadDrive,
    executeScheduleMeet,
    handleToggleMeetEmail,
    filteredMeetSellers,
  } = useWorkspaceActions();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#ea580c] bg-orange-50 px-2.5 py-1 rounded-lg">
              Google Workspace Cloud Integration
            </span>
            <h2 className="text-lg md:text-xl font-sans font-bold text-zinc-900 uppercase tracking-tight mt-1">
              {t("Centre de Contrôle & Exportations API")}
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              {t("Générez des rapports comptables Sheets en temps réel, stockez sur Drive et organisez des audits Google Meet.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-zinc-50 hover:bg-zinc-100/80 rounded-2xl p-5 border border-zinc-200/60 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#ea580c]/10 border border-[#ea580c]/20 flex items-center justify-center text-[#ea580c]">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-sans font-bold text-zinc-900 uppercase tracking-wide">
                {t("Bordereau de Livraison Global")}
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                {t("Exporte l'intégralité des commandes, wilayas, et retenues de commissions sous forme de tableur Google Sheets formaté.")}
              </p>
            </div>
            <button
              onClick={() => setActiveModal("confirm_admin")}
              disabled={loadingSheetAdmin}
              className="w-full py-3 bg-[#ea580c] hover:bg-orange-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/20 cursor-pointer disabled:opacity-50"
            >
              {loadingSheetAdmin ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4" />
              )}
              <span>{t("Générer Sheets Global")}</span>
            </button>
          </div>

          <div className="bg-zinc-50 hover:bg-zinc-100/80 rounded-2xl p-5 border border-zinc-200/60 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-sans font-bold text-zinc-900 uppercase tracking-wide">
                {t("Relevé de Compte Vendeur")}
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                {t("Génère un décompte personnalisé des ventes et des remboursements nets à reverser pour un artisan spécifique.")}
              </p>
            </div>
            <button
              onClick={() => setActiveModal("select_seller")}
              disabled={loadingSheetSeller}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
            >
              {loadingSheetSeller ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Store className="w-4 h-4" />
              )}
              <span>{t("Générer Relevé Vendeur")}</span>
            </button>
          </div>

          <div className="bg-zinc-50 hover:bg-zinc-100/80 rounded-2xl p-5 border border-zinc-200/60 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <FileUp className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-sans font-bold text-zinc-900 uppercase tracking-wide">
                {t("Sauvegarde Backup Drive")}
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                {t("Archive les fiches vendeurs et le catalogue complet sous forme de fichier JSON sécurisé dans Google Drive.")}
              </p>
            </div>
            <button
              onClick={executeUploadDrive}
              disabled={loadingDrive}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {loadingDrive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileUp className="w-4 h-4" />
              )}
              <span>{t("Exporter vers Drive")}</span>
            </button>
          </div>

          <div className="bg-zinc-50 hover:bg-zinc-100/80 rounded-2xl p-5 border border-zinc-200/60 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-sans font-bold text-zinc-900 uppercase tracking-wide">
                {t("Audit & Meet Vendeur")}
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                {t("Planifie une réunion de contrôle qualité et de vérification d'identité en visioconférence via Google Calendar & Meet.")}
              </p>
            </div>
            <button
              onClick={() => setActiveModal("input_meet")}
              disabled={loadingMeet}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
            >
              {loadingMeet ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              <span>{t("Planifier Google Meet")}</span>
            </button>
          </div>
        </div>
      </div>

      {statusAlert && (
        <WorkspaceAlertModal
          alert={statusAlert}
          onClose={() => setStatusAlert(null)}
        />
      )}

      <WorkspaceModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        loadingSheetAdmin={loadingSheetAdmin}
        onConfirmAdminExport={executeExportAdmin}
        sellers={sellers}
        selectedSeller={selectedSeller}
        setSelectedSeller={setSelectedSeller}
        customSellerId={customSellerId}
        setCustomSellerId={setCustomSellerId}
        loadingSheetSeller={loadingSheetSeller}
        onConfirmSellerExport={executeExportSeller}
        meetEmail={meetEmail}
        setMeetEmail={setMeetEmail}
        meetSearchTerm={meetSearchTerm}
        setMeetSearchTerm={setMeetSearchTerm}
        selectedMeetEmails={selectedMeetEmails}
        onToggleMeetEmail={handleToggleMeetEmail}
        filteredMeetSellers={filteredMeetSellers}
        loadingMeet={loadingMeet}
        onConfirmMeetSchedule={executeScheduleMeet}
      />
    </div>
  );
};
