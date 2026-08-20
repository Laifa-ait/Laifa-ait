import { useState, useCallback } from "react";
import { HomepageSection } from "../../domains/home/homepage.types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import toast from "react-hot-toast";

export function useHomepageModalState() {
  const [activeTab, setActiveTab] = useState<"sections" | "categories">("sections");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<HomepageSection | null>(null);
  const [activeModalStep, setActiveModalStep] = useState(1);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<"desktop" | "mobile">("mobile");

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Le fichier est trop lourd ! (Maximum 15 Mo)");
      return;
    }

    try {
      toast.loading("Upload de l'image/GIF en cours...", { id: "upload-hp" });
      const uniqueFilename = `${crypto.randomUUID()}_${file.name.replace(/\s+/g, "_")}`;
      const storageRef = ref(storage, `homepage_media/${uniqueFilename}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setter(url);
      } catch (storageErr) {
        console.warn("Storage upload failed, falling back to base64:", storageErr);
        const reader = new FileReader();
        reader.onloadend = () => {
          setter(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      toast.success("Média importé avec succès !", { id: "upload-hp" });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'importation.", { id: "upload-hp" });
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    editItem,
    setEditItem,
    activeModalStep,
    setActiveModalStep,
    draggedIdx,
    setDraggedIdx,
    previewDeviceMode,
    setPreviewDeviceMode,
    handleFileUpload,
  };
}
