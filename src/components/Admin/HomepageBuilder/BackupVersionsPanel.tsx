import React from "react";
import { useTranslation } from "react-i18next";
import { History, RotateCcw, Trash2 } from "lucide-react";
import { VersionInfo } from "../../../hooks/useHomepageBuilderState";

interface BackupVersionsPanelProps {
  backupName: string;
  setBackupName: (val: string) => void;
  handleCreateBackup: () => void;
  isLoadingVersions: boolean;
  versions: VersionInfo[];
  handleRestoreBackup: (version: VersionInfo) => void | Promise<void>;
  handleDeleteVersion: (id: string) => void;
}

export const BackupVersionsPanel: React.FC<BackupVersionsPanelProps> = ({
  backupName,
  setBackupName,
  handleCreateBackup,
  isLoadingVersions,
  versions,
  handleRestoreBackup,
  handleDeleteVersion,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="backup-versions-panel">
      {/* Header & Create snapshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {t("Historique & Points de Sauvegarde")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("Créez des instantanés ou restaurez l'intégralité de la vitrine en 1 clic")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder={t("Nom de la version (ex: Avant Ramadan)...")}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 max-w-xs"
          />
          <button
            type="button"
            onClick={handleCreateBackup}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            {t("Créer Snapshot")}
          </button>
        </div>
      </div>

      {/* Versions List */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
        {isLoadingVersions ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            {t("Chargement des versions...")}
          </div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {t("Aucun point de sauvegarde enregistré pour le moment.")}
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{version.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {version.sections?.length || 0} {t("sections")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{new Date(version.createdAt).toLocaleString("fr-FR")}</span>
                  <span>•</span>
                  <span>{t("Auteur :")} {version.adminEmail}</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRestoreBackup(version)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-2xs transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  {t("Restaurer")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVersion(version.id)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  title={t("Supprimer")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
