import { useState, useCallback } from "react";
import { adminHomepageApi, VersionSnapshot } from "../../services/api/adminHomepage.api";
import { HomepageSection } from "../../domains/home/homepage.types";
import toast from "react-hot-toast";

export type VersionInfo = VersionSnapshot;

export function useHomepageVersions() {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [backupName, setBackupName] = useState("");
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  const fetchVersions = useCallback(async () => {
    setIsLoadingVersions(true);
    try {
      const list = await adminHomepageApi.getVersions();
      setVersions(list);
    } catch (err) {
      console.error("Error fetching versions:", err);
    } finally {
      setIsLoadingVersions(false);
    }
  }, []);

  const handleCreateBackup = useCallback(async (
    _sections: HomepageSection[],
    _userEmail?: string
  ) => {
    const name = backupName.trim() || `Point de sauvegarde du ${new Date().toLocaleString("fr-FR")}`;
    try {
      toast.loading("Création du point de sauvegarde...", { id: "backup-hp" });
      await adminHomepageApi.createVersion(name);
      setBackupName("");
      toast.success("Point de sauvegarde créé avec succès !", { id: "backup-hp" });
      await fetchVersions();
    } catch (err) {
      console.error("Error creating backup:", err);
      toast.error("Erreur lors de la sauvegarde", { id: "backup-hp" });
    }
  }, [backupName, fetchVersions]);

  const handleRestoreBackup = useCallback(async (
    version: VersionInfo,
    fetchData: () => void
  ) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir restaurer la version "${version.name}" ? Les paramètres actuels des sections d'accueil seront remplacés.`)) {
      return;
    }
    try {
      toast.loading("Restauration de la version...", { id: "restore-hp" });
      await adminHomepageApi.restoreVersion(version.id);
      toast.success("Restauration réussie avec succès !", { id: "restore-hp" });
      fetchData();
      await fetchVersions();
    } catch (err) {
      console.error("Error restoring version:", err);
      toast.error("Erreur lors de la restauration", { id: "restore-hp" });
    }
  }, [fetchVersions]);

  const handleDeleteVersion = useCallback(async (id: string) => {
    if (!window.confirm("Supprimer cette sauvegarde définitivement ?")) return;
    try {
      await adminHomepageApi.deleteVersion(id);
      toast.success("Point de sauvegarde supprimé !");
      await fetchVersions();
    } catch (err) {
      console.error("Error deleting version:", err);
      toast.error("Erreur de suppression");
    }
  }, [fetchVersions]);

  return {
    versions,
    setVersions,
    backupName,
    setBackupName,
    isLoadingVersions,
    setIsLoadingVersions,
    fetchVersions,
    handleCreateBackup,
    handleRestoreBackup,
    handleDeleteVersion,
  };
}
