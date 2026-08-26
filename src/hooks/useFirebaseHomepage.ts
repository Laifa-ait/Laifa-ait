import { useState, useCallback } from "react";
import { adminHomepageApi } from "../services/api/adminHomepage.api";
import { HomepageSection } from "../domains/home/homepage.types";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

export const useFirebaseHomepage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async (_collectionName: string) => {
    setIsLoading(true);
    try {
      const sections = await adminHomepageApi.getSections();
      return sections;
    } catch (err) {
      console.error("Error fetching homepage sections via API:", err);
      toast.error("Erreur de chargement des sections");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveItem = useCallback(async (_collectionName: string, id: string | null, payload: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      if (id) {
        await adminHomepageApi.updateSection(id, payload as Partial<HomepageSection>);
        toast.success("Section mise à jour !");
      } else {
        await adminHomepageApi.createSection(payload as Partial<HomepageSection>);
        toast.success("Section créée avec succès !");
      }
    } catch (err) {
      console.error("Error saving homepage section:", err);
      toast.error("Erreur de sauvegarde de la section");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadMedia = useCallback(async (file: File) => {
    try {
      toast.loading("Upload en cours...", { id: "upload-hp-media" });
      const storageRef = ref(storage, `homepage_media/${Date.now()}_${file.name.replace(/\s+/g, "_")}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      toast.success("Média importé !", { id: "upload-hp-media" });
      return url;
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Erreur d'import", { id: "upload-hp-media" });
      throw err;
    }
  }, []);

  return { isLoading, fetchData, saveItem, uploadMedia };
};
