import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
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
    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-zinc-950 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            {t("Points de Sauvegarde et Versions d'Accueil")}
          </h3>
          <p className="text-xs text-zinc-650 mt-1">
            {t("Sauvegardez l'état complet actuel ou restaurez une ancienne version de la page d'accueil d'Olmart.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder={t("Nom de la sauvegarde (optionnel)...") || "Nom de la sauvegarde..."}
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold focus:outline-none focus:border-orange-600 max-w-xs"
          />
          <button
            type="button"
            onClick={handleCreateBackup}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-colors cursor-pointer border-none"
          >
            {t("Sauvegarder")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-200 overflow-hidden">
        {isLoadingVersions ? (
          <div className="p-4 text-center text-xs font-bold text-zinc-400 animate-pulse">{t("Chargement...")}</div>
        ) : versions.length === 0 ? (
          <div className="p-6 text-center text-xs font-semibold text-zinc-500">
            {t("Aucune sauvegarde enregistrée pour le moment.")}
          </div>
        ) : (
          versions.map((version) => (
            <div key={version.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50">
              <div>
                <h4 className="font-bold text-zinc-950 text-xs">{version.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {new Date(version.createdAt).toLocaleString()} | {t("Par :")} {version.adminEmail} |{" "}
                  {version.sections?.length || 0} {t("sections")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRestoreBackup(version)}
                  className="px-3 py-1.5 bg-zinc-950 text-white rounded-lg font-sans font-bold text-[9px] uppercase tracking-wider cursor-pointer border-none"
                >
                  {t("Restaurer")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVersion(version.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-sans font-bold text-[9px] uppercase tracking-wider cursor-pointer border-none"
                >
                  {t("Supprimer")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
