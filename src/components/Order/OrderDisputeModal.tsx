import React, { useState } from 'react';
import { X, AlertTriangle, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface OrderDisputeModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderDisputeModal: React.FC<OrderDisputeModalProps> = ({
  isOpen,
  orderId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [reason, setReason] = useState('Produit endommagé / non conforme');
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<{ url: string; uploading: boolean }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > 3) {
      toast.error(t("Vous ne pouvez télécharger que 3 photos maximum.") || "3 photos maximum.");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 2 Mo.`);
        continue;
      }

      setPhotos((prev) => [...prev, { url: '', uploading: true }]);
      try {
        const { uploadBytes, getDownloadURL, ref, getStorage } = await import('firebase/storage');
        const storage = getStorage();
        const storageRef = ref(storage, `disputes/${orderId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        setPhotos((prev) => {
          const next = [...prev];
          const idx = next.findIndex((p) => p.uploading);
          if (idx !== -1) next[idx] = { url: downloadUrl, uploading: false };
          return next;
        });
      } catch {
        toast.error("Erreur de téléchargement d'image");
        setPhotos((prev) => prev.filter((p) => !p.uploading));
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (photos.some((p) => p.uploading)) {
      toast.error(t("Veuillez patienter pendant le téléchargement des photos."));
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/v1/buyer/orders/dispute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId,
          disputeReason: reason,
          disputeDetails: details,
          disputePhotos: photos.map((p) => p.url).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Impossible d'ouvrir le litige.");
      }

      toast.success(t("Litige enregistré. La médiation Olmart a été notifiée.") || "Litige enregistré.");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Dispute error:", err);
      toast.error(err instanceof Error ? err.message : "Erreur d'ouverture du litige");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-stone-900">
              {t("Ouvrir une réclamation / litige") || "Ouvrir une réclamation"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
            {t("La médiation Olmart intervient pour garantir vos droits. Le vendeur dispose de 24h ouvrées pour vous proposer un arrangement ou un remplacement.")}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-800">
              {t("Motif du litige") || "Motif du litige"}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:border-orange-500 outline-none"
            >
              <option value="Produit endommagé / non conforme">{t("Article non conforme ou endommagé")}</option>
              <option value="Article manquant dans le colis">{t("Article manquant dans le colis")}</option>
              <option value="Le livreur réclame un montant supérieur">{t("Prix demandé différent de la commande")}</option>
              <option value="Retard de livraison excessif">{t("Retard de livraison anormal")}</option>
              <option value="Autre anomalie">{t("Autre problème")}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-800">
              {t("Photos justificatives (Optionnel, Max 3)")}
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                  {photo.uploading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                    </div>
                  ) : (
                    <>
                      <img src={photo.url} alt="Preuve" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded hover:bg-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {photos.length < 3 && (
                <label className="w-16 h-16 border-2 border-dashed border-stone-200 hover:border-orange-500 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:text-orange-600 cursor-pointer bg-stone-50 hover:bg-orange-50/30 transition-colors">
                  <UploadCloud className="w-5 h-5" />
                  <span className="text-[9px] font-medium mt-0.5">{t("Ajouter")}</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-800">
              {t("Description détaillée des faits")} <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("Expliquez clairement ce qui s'est passé...")}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-normal text-stone-900 focus:bg-white focus:border-orange-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              disabled={submitting || !details.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? t("Envoi...") : t("Soumettre la réclamation")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
