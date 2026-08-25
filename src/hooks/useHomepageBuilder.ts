import { useCallback } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import toast from "react-hot-toast";

export const useHomepageBuilder = () => {
  const deleteItem = useCallback(async (_activeTab: string, id: string) => {
    try {
      const collectionName = "homepage_sections";
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Section supprimée");

      // Clear homepage compile cache so storefront picks up live edits instantly
      try {
        await deleteDoc(doc(db, "public", "homepage_cache"));
      } catch (cacheErr) {
        console.warn("Could not clear homepage cache:", cacheErr);
      }

      return true;
    } catch {
      toast.error("Erreur de suppression");
      return false;
    }
  }, []);

  const uploadMedia = useCallback(async (file: File) => {
    try {
      toast.loading("Upload de l'image/GIF en cours...", { id: "upload-hp" });
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
