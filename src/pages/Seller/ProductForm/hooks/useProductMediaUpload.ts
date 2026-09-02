import { useState } from "react";
import { AuthUser as User } from "../../../../domains/user/user.types";
import { uploadFileWithProgress } from "../../../../services/storage.service";
import toast from "react-hot-toast";
import { ProductFormData } from "../../../../types/seller";
import { compressClientImage } from "../../../../utils/imageUtils";

const MAX_IMAGES = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // Permet jusqu'à 15MB grâce à la compression client

export function useProductMediaUpload(
  formData: ProductFormData,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>,
  currentUser: User | null
) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [dragOverImageIdx, setDragOverImageIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedImageIdx === null || draggedImageIdx === index) return;
    setDragOverImageIdx(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIdx === null || draggedImageIdx === index) {
      setDragOverImageIdx(null);
      setDraggedImageIdx(null);
      return;
    }
    setFormData((prev) => {
      const newImages = [...prev.images];
      const draggedItem = newImages[draggedImageIdx];
      newImages.splice(draggedImageIdx, 1);
      newImages.splice(index, 0, draggedItem);
      return { ...prev, images: newImages };
    });
    setDragOverImageIdx(null);
    setDraggedImageIdx(null);
  };

  const handleDragEnd = () => {
    setDragOverImageIdx(null);
    setDraggedImageIdx(null);
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video", index?: number) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (type === "image") {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image trop lourde. Maximum 5MB.");
        return;
      }
      if (index === undefined && formData.images && formData.images.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images par produit`);
        return;
      }
    }
    if (type === "video") {
      if (!file.type.startsWith("video/")) {
        toast.error("Format non supporté. Veuillez uploader une vidéo valide.");
        return;
      }
      if (file.name.match(/\.(exe|js|php|html|sh|bat)$/i)) {
        toast.error("Fichier exécutable interdit.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Vidéo trop lourde (Max 10Mo)");
        return;
      }
    }

    const uploadKey = index !== undefined ? `image-${index}` : type;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      let uploadFile: File | Blob = file;
      if (type === "image") {
        uploadFile = await compressClientImage(file);
      }
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${currentUser.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}.${type === "image" ? "webp" : fileExt}`;
      const storagePath = `products/${type}s/${fileName}`;
      const downloadURL = await new Promise<string>((resolve, reject) => {
        const cancel = uploadFileWithProgress(
          storagePath,
          uploadFile as Blob,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [uploadKey]: Math.round(progress) }));
          },
          (err) => reject(err),
          (url) => resolve(url)
        );
        setTimeout(() => {
          cancel();
          reject(new Error("TIMEOUT_STORAGE"));
        }, 60000);
      });

      if (type === "image" && index !== undefined) {
        const newImages = [...formData.images];
        newImages[index] = downloadURL;
        setFormData((prev) => ({ ...prev, images: newImages }));
        toast.success("Image importée ! 📸");
      } else if (type === "video") {
        setFormData((prev) => ({ ...prev, video: downloadURL }));
        toast.success("Vidéo importée ! 🎥");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const isTimeout = err instanceof Error && err.message === "TIMEOUT_STORAGE";
      if (isTimeout) {
        toast.error("Le délai d'envoi est dépassé. Veuillez activer 'Storage' dans votre console Firebase.", { duration: 5000 });
      } else {
        const msg = err instanceof Error ? err.message : "Permission refusée ou type invalide.";
        toast.error(`Erreur d'envoi: ${msg}`);
      }
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  return {
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
    draggedImageIdx,
    setDraggedImageIdx,
    dragOverImageIdx,
    setDragOverImageIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    updateImage,
    handleFileUpload,
  };
}

