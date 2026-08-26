import { useCallback } from "react";
import { adminHomepageApi } from "../services/api/adminHomepage.api";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

export const useHomepageBuilder = () => {
  const deleteItem = useCallback(async (_activeTab: string, id: string) => {
    try {
      await adminHomepageApi.deleteSection(id);
      toast.success("Section supprimée");
      return true;
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error("Erreur de suppression");
      return false;
    }
  }, []);

  const uploadMedia = useCallback(async (file: File) => {
    try {
      toast.loading("Upload de l'image en cours...", { id: "upload-hp" });
      const storageRef = ref(storage, `homepage_media/${Date.now()}_${file.name.replace(/\s+/g, "_")}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      toast.success("Média importé avec succès !", { id: "upload-hp" });
      return url;
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'importation.", { id: "upload-hp" });
      throw err;
    }
  }, []);

  return {
    deleteItem,
    uploadMedia,
  };
};
