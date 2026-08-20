import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage";
import { User } from "firebase/auth";
import { storage } from "../../../../lib/firebase";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { ProductFormData } from "../../../../types/seller";

const MAX_IMAGES = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${currentUser.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}.${type === "image" ? "webp" : fileExt}`;
      const storageRef = ref(storage, `products/${type}s/${fileName}`);

      let uploadFile: File | Blob = file;
      if (type === "image") {
        if (index === 0) {
          toast("Traitement IA : Détourage et normalisation du fond (#FAF8F5)...", { icon: "✨", duration: 4000 });
        }

        const applyWatermark = async (imageFile: File | Blob): Promise<Blob> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return resolve(imageFile);

              ctx.drawImage(img, 0, 0);
              ctx.globalAlpha = 0.5;
              ctx.font = `bold ${Math.floor(img.width * 0.05)}px sans-serif`;
              ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
              ctx.textAlign = "right";
              ctx.textBaseline = "bottom";
              ctx.shadowColor = "rgba(0,0,0,0.3)";
              ctx.shadowBlur = 4;
              ctx.fillText("OLMART", img.width - 20, img.height - 20);

              canvas.toBlob(
                (blob) => {
                  resolve(blob || imageFile);
                },
                "image/webp",
                0.9
              );
            };
            img.src = URL.createObjectURL(imageFile);
          });
        };

        const options = {
          maxSizeMB: 0.08,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.8,
        };
        try {
          const compressed = await imageCompression(file, options);
          uploadFile = await applyWatermark(compressed);
        } catch (err) {
          console.error("Compression/Watermark failed:", err);
        }
      }

      const metadata = {
        contentType: type === "image" ? "image/webp" : file.type || "video/mp4",
      };

      const uploadPromise = new Promise<UploadTaskSnapshot>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, uploadFile as Blob, metadata);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prev) => ({ ...prev, [uploadKey]: Math.round(progress) }));
          },
          (error) => reject(error),
          () => resolve(uploadTask.snapshot)
        );
      });
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT_STORAGE")), 60000));

      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      const downloadURL = await getDownloadURL(snapshot.ref);

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

