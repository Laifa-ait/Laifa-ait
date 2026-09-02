import React from "react";
import { Star, ShieldAlert, CheckCircle2, Trash2, Package, Check, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export interface AdminReviewItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  productImage?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  status: "pending" | "approved" | "published" | "flagged" | "replied";
  flags?: number;
  lastReportedReason?: string;
  lastReportedAt?: unknown;
  createdAt?: unknown;
  replies?: Array<{
    sellerId: string;
    text: string;
    createdAt: string;
  }>;
}

interface ReviewsAdminCardProps {
  review: AdminReviewItem;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  isActionLoading: boolean;
}

export const ReviewsAdminCard: React.FC<ReviewsAdminCardProps> = ({
  review,
  onApprove,
  onDelete,
  isActionLoading,
}) => {
  const { t } = useTranslation();
  const isFlagged = review.status === "flagged" || (review.flags && review.flags > 0);

  const formatDate = (val: unknown) => {
    if (!val) return t("Date inconnue");
    try {
      if (typeof val === "object" && val !== null && "toDate" in val) {
        return (val as { toDate: () => Date }).toDate().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return new Date(val as string).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return t("Date inconnue");
    }
  };

  return (
    <div
      id={`review-card-${review.id}`}
      className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
        isFlagged
          ? "border-amber-300 bg-amber-50/20 shadow-amber-100/50"
          : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      {/* Card Header: Product Info & Status */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {review.productImage ? (
              <img loading="lazy" decoding="async" src={review.productImage}
                alt={review.productName || "Produit"}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              to={`/product/${review.productId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-zinc-900 hover:text-amber-600 transition-colors line-clamp-1"
            >
              {review.productName || t("Produit réf : {{id}}", { id: review.productId })}
            </Link>
            <p className="text-xs text-zinc-400">
              {t("Commande")} : <span className="font-mono text-zinc-600">{review.orderId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFlagged ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              {t("Signalé ({{count}})", { count: review.flags || 1 })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3 h-3" />
              {t("Publié")}
            </span>
          )}
        </div>
      </div>

      {/* Flag Alert Box if Reported */}
      {isFlagged && review.lastReportedReason && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{t("Motif du signalement")} : </span>
            <span>{review.lastReportedReason}</span>
          </div>
        </div>
      )}

      {/* Rating & Reviewer info */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-zinc-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-zinc-800 ml-1">
            {review.rating} / 5
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {review.userName}
          </span>
          <span>•</span>
          <span>{formatDate(review.createdAt)}</span>
        </div>
      </div>

      {/* Comment Body */}
      {review.comment ? (
        <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
          "{review.comment}"
        </p>
      ) : (
        <p className="text-xs text-zinc-400 italic">
          {t("Aucun commentaire textuel laissé.")}
        </p>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {review.images.map((img, idx) => (
            <a
              key={idx}
              href={img}
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0 hover:opacity-90 transition-opacity"
            >
              <img loading="lazy" decoding="async" src={img}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {/* Seller Replies */}
      {review.replies && review.replies.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-zinc-100">
          {review.replies.map((reply, rIdx) => (
            <div
              key={rIdx}
              className="p-3 bg-zinc-100/80 rounded-xl text-xs space-y-1 border border-zinc-200/60"
            >
              <div className="flex items-center gap-1 font-bold text-zinc-800">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>{t("Réponse du Vendeur")}</span>
              </div>
              <p className="text-zinc-600 pl-4">{reply.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
        {isFlagged && (
          <button
            id={`btn-approve-review-${review.id}`}
            onClick={() => onApprove(review.id)}
            disabled={isActionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t("Approuver / Débloquer")}
          </button>
        )}

        <button
          id={`btn-delete-review-${review.id}`}
          onClick={() => onDelete(review.id)}
          disabled={isActionLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {t("Supprimer l'avis")}
        </button>
      </div>
    </div>
  );
};
