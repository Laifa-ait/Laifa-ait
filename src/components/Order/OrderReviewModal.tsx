import React, { useState } from 'react';
import { X, Star, ShieldCheck, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { OrderItem } from '../../domains/order/order.types';
import { useAuth } from '../../context/AuthContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

interface OrderReviewModalProps {
  isOpen: boolean;
  orderId: string;
  item: OrderItem | null;
  onClose: () => void;
  onSuccess: (productId: string, rating: number, comment: string) => void;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  orderId,
  item,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error(t("Vous devez être connecté.") || "Vous devez être connecté.");
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          orderId: orderId,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de l'enregistrement de l'avis");
      }

      toast.success(t("Merci ! Votre avis a été publié.") || "Merci ! Votre avis a été publié.");
      onSuccess(item.productId, rating, comment);
      onClose();
    } catch (err: unknown) {
      console.error("Failed to post review:", err);
      toast.error(err instanceof Error ? err.message : "Impossible d'envoyer l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-bold text-stone-900">
              {t("Donner mon avis d'acheteur") || "Donner mon avis d'acheteur"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product pill */}
          <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200/60">
              {item.productImage && (
                <img
                  src={getOptimizedImageUrl(item.productImage, 80)}
                  alt={item.name || item.productName || "Article"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-900 truncate">
                {item.name || item.productName}
              </p>
              {item.selectedVariant && (
                <p className="text-[10px] text-stone-500 font-medium">{item.selectedVariant}</p>
              )}
            </div>
          </div>

          {/* Rating stars */}
          <div className="text-center py-2 space-y-1">
            <p className="text-xs font-medium text-stone-600">
              {t("Quelle note attribuez-vous à cet article ?") || "Votre note :"}
            </p>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                        : 'text-stone-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] font-semibold text-amber-700">
              {rating === 5 ? t("Excellent") : rating === 4 ? t("Très bon") : rating === 3 ? t("Moyen") : rating === 2 ? t("Décevant") : t("Très insatisfaisant")}
            </p>
          </div>

          {/* Comment textarea */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-700">
              {t("Votre commentaire (optionnel)") || "Votre commentaire"}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("Partagez la qualité, la conformité ou votre satisfaction...") || "Votre avis..."}
              className="w-full px-3 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-xs font-normal text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              {t("Annuler") || "Annuler"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? t("Publication...") : t("Publier mon avis")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
