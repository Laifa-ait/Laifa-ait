import React from "react";
import { ThumbsUp } from "lucide-react";
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
  renderStars: (rating: number) => React.ReactNode;
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

  return (
    <div className="border-b border-gray-100 pb-6 last:border-0">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
            {comment.name ? comment.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="font-medium text-gray-900 text-sm">
              {getMaskedName(comment.name)}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
              <span>DZ</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{formatDate(comment.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        {renderStars(comment.stars ?? comment.rating ?? 5)}
      </div>

      <p className="text-gray-800 text-sm leading-relaxed mb-4">
        {comment.text || comment.comment || ""}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
        <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer">
          <ThumbsUp className="w-4 h-4" />
          <span>Utile</span>
        </button>
      </div>
    </div>
  );
};
