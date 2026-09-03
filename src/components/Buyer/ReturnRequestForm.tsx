import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Camera, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadFile } from "../../services/storage.service";
import { useTranslation } from "react-i18next";

interface ReturnRequestProps {
  orderId: string;
  onClose: () => void;
  onSubmit: (data: { reason: string; details: string; photos: string[]; refundMethod?: string; timestamp?: string }) => Promise<void>;
}

const REASONS = [
  "Produit défectueux / cassé",
  "Mauvaise taille / modèle",
  "Différent de la description",
  "Produit incomplète",
  "Changement d'avis",
];

export const ReturnRequestForm: React.FC<ReturnRequestProps> = ({ orderId, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<{ url: string; uploading: boolean; size: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    if (photos.length + files.length > 5) {
      toast.error("Vous ne pouvez télécharger que 5 photos maximum.");
      return;
    }

    const MAX_CUMULATIVE_SIZE = 10 * 1024 * 1024; // 10 Mo
    setLoading(true);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 1 * 1024 * 1024) {
        toast.error(`Le fichier « ${file.name} » dépasse la taille maximale autorisée de 1 Mo.`);
        continue;
      }

      // Calculer la taille cumulée actuelle
      const currentTotalSize = photos.reduce((acc, p) => acc + (p.size || 0), 0);
      if (currentTotalSize + file.size > MAX_CUMULATIVE_SIZE) {
        toast.error(`Le fichier « ${file.name} » dépasse la limite totale cumulée autorisée de 10 Mo.`);
        continue;
      }

      const newPhotoObj = { url: "", uploading: true, size: file.size };
      setPhotos((prev) => [...prev, newPhotoObj]);

      try {
        const url = await uploadFile(`returns/${orderId}/${Date.now()}_${file.name}`, file);

        setPhotos((prev) => {
          const newPhotos = [...prev];
          // Find the first uploading photo and complete it
          const idx = newPhotos.findIndex((p) => p.uploading);
          if (idx !== -1) {
            newPhotos[idx] = { url, uploading: false, size: file.size };
          }
          return newPhotos;
        });
      } catch (error) {
        console.error("Error uploading return photo:", error);
        toast.error(`Erreur lors du téléchargement de ${file.name}`);
        setPhotos((prev) => prev.filter((p) => p.uploading === false)); // remove failed
      }
    }
    setLoading(false);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.some((p) => p.uploading)) {
      toast.error("Veuillez patienter pendant le téléchargement des images.");
      return;
    }

    setLoading(true);
    try {
      const photoUrls = photos.filter((p) => !p.uploading).map((p) => p.url);
      // Adding default values for return request like refundMethod since OrderDetails renders it
      await onSubmit({
        reason,
        details,
        photos: photoUrls,
        refundMethod: "ccp",
        timestamp: new Date().toISOString(),
      });
      toast.success("Demande de retour envoyée avec succès.");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Return request submission error:", msg);
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button type="button" onClick={onClose} className="absolute top-4 end-4 p-2 text-zinc-400 hover:text-zinc-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-sans font-bold text-zinc-900 mb-6">{t("Demander un retour")}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs rtl:text-sm font-bold text-zinc-500 uppercase mb-2">{t("Motif")}</label>
            <select
              value={reason || ""}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 bg-transparent border border-zinc-200 rounded-2xl font-medium text-zinc-800"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs rtl:text-sm font-bold text-zinc-500 uppercase mb-2">{t("Détails")}</label>
            <textarea
              value={details || ""}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-4 bg-transparent border border-zinc-200 rounded-2xl h-24 font-medium text-zinc-800 resize-none"
              placeholder={t("Expliquez en détail le problème...") || "Expliquez en détail le problème..."}
            />
          </div>

          <div>
            <label className="block text-xs rtl:text-sm font-bold text-zinc-500 uppercase mb-2">
              {t("Preuves (Photos)")}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200"
                  >
                    {photo.uploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <img
                          loading="lazy"
                          src={photo.url}
                          alt={`Preuve ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 rounded-2xl text-zinc-500 hover:bg-transparent hover:text-zinc-700 transition-colors disabled:opacity-50 font-bold"
              >
                <Camera className="w-5 h-5" /> {t("Ajouter des photos (Max 5)")}
              </button>
            )}
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full mt-6 py-4 flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-[#A94320] transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Envoi en cours..." : "Envoyer la demande"}
        </button>
      </form>
    </motion.div>
  );
};
