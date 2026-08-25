import { useState, useCallback } from "react";
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { HomepageSection } from "../../domains/home/homepage.types";
import toast from "react-hot-toast";

export interface VersionInfo {
  id: string;
  name: string;
  sections: HomepageSection[];
  createdAt: string;
  adminEmail: string;
}

export function useHomepageVersions() {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [backupName, setBackupName] = useState("");
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  const fetchVersions = useCallback(async () => {
    setIsLoadingVersions(true);
    try {
      const q = query(collection(db, "homepage_versions"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setVersions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as VersionInfo)));
    } catch (err) {
      console.error("Error fetching versions:", err);
    } finally {
      setIsLoadingVersions(false);
    }
  }, []);

  const handleCreateBackup = useCallback(async (
    sections: HomepageSection[],
    userEmail?: string
  ) => {
    const name = backupName.trim() || `Sauvegarde du ${new Date().toLocaleString()}`;
    try {
      toast.loading("Création de la sauvegarde...", { id: "backup" });
      const payload = {
        name,
        sections,
        createdAt: new Date().toISOString(),
        adminEmail: userEmail || "admin@olmart.dz",
      };
      await addDoc(collection(db, "homepage_versions"), payload);
      setBackupName("");
      toast.success("Point de sauvegarde créé !", { id: "backup" });
      fetchVersions();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde", { id: "backup" });
    }
  }, [backupName, fetchVersions]);

  const handleRestoreBackup = useCallback(async (
    version: VersionInfo,
    fetchData: () => void
  ) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir restaurer la version "${version.name}" ? Les paramètres actuels des sections d'accueil seront écrasés.`)) {
      return;
    }
    try {
      toast.loading("Restauration de la sauvegarde...", { id: "restore" });

      const secSnap = await getDocs(collection(db, "homepage_sections"));
      for (const d of secSnap.docs) {
        await deleteDoc(doc(db, "homepage_sections", d.id));
      }

      const savedSections = version.sections || [];

      for (const item of savedSections) {
        const payload = { ...item };
        delete (payload as Record<string, unknown>).id;
        await addDoc(collection(db, "homepage_sections"), payload);
      }

      try {
        await deleteDoc(doc(db, "public", "homepage_cache"));
      } catch (err) {
        console.warn("Failed to delete homepage cache:", err);
      }

      toast.success("Restauration réussie avec succès !", { id: "restore" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la restauration", { id: "restore" });
    }
  }, []);

  const handleDeleteVersion = useCallback(async (id: string) => {
    if (!window.confirm("Supprimer cette sauvegarde définitivement ?")) return;
    try {
      await deleteDoc(doc(db, "homepage_versions", id));
      toast.success("Sauvegarde supprimée !");
      fetchVersions();
    } catch (err) {
      console.error(err);
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
