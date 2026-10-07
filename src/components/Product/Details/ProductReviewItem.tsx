import React from "react";
import { ThumbsUp, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface ProductComment {
  id?: string;
  stars?: number;
  rating?: number;
  comment?: string;
  text?: string;
  userName?: string;
  name?: string;
  createdAt?: string | number | Date | { seconds: number; nanoseconds?: number; toDate?: () => Date };
  [key: string]: unknown;
}

interface ProductReviewItemProps {
  comment: ProductComment;
  renderStars?: (rating: number) => React.ReactNode;
}

export const ProductReviewItem: React.FC<ProductReviewItemProps> = ({
  comment,
  renderStars,
}) => {
  const getMaskedName = (name?: string) => {
    if (!name) return "Client Olmart";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  };

  const formatDate = (dateVal?: unknown) => {
    if (!dateVal) return "Récemment";
    try {
      if (typeof dateVal === "object" && dateVal !== null && "toDate" in dateVal && typeof (dateVal as { toDate: () => Date }).toDate === "function") {
        return format((dateVal as { toDate: () => Date }).toDate(), "d MMMM yyyy", { locale: fr });
      }
      return format(new Date(dateVal as string | number | Date), "d MMMM yyyy", { locale: fr });
    } catch {
      return "Récemment";
    }
  };

  const ratingScore = Number(comment.stars ?? comment.rating ?? 5);

  const defaultRenderStars = (score: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(score) ? "fill-amber-500 text-amber-500" : "fill-zinc-200 text-zinc-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="border-b border-zinc-100 pb-5 last:border-0">
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700 font-bold text-xs">
            {comment.name ? comment.name.charAt(0).toUpperCase() : (comment.userName ? comment.userName.charAt(0).toUpperCase() : "C")}
          </div>
          <div>
            <div className="font-bold text-zinc-900 text-sm">
              {getMaskedName(comment.name || comment.userName)}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>Acheteur vérifié</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300" />
              <span>{formatDate(comment.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2">
        {renderStars ? renderStars(ratingScore) : defaultRenderStars(ratingScore)}
      </div>

      <p className="text-zinc-700 text-sm leading-relaxed mb-3">
        {comment.text || comment.comment || ""}
      </p>

      <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors cursor-pointer border-none bg-transparent"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Utile</span>
        </button>
      </div>
    </div>
  );
};
