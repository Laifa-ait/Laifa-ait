import React, { useMemo } from "react";
import { Star, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductReviewItem, ProductComment } from "./ProductReviewItem";

interface ReviewsProps {
  comments: ProductComment[];
  stats?: {
    reviewCount: number;
    averageRating: number;
    totalRatingSum: number;
  };
  userCanReview?: boolean;
  submittingReview?: boolean;
  newReviewText?: string;
  setNewReviewText?: (text: string) => void;
  newReviewStars?: number;
  setNewReviewStars?: (stars: number) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export const ProductReviews: React.FC<ReviewsProps> = ({ comments, stats }) => {
  const { t } = useTranslation();
  const [filterStar, setFilterStar] = React.useState<number | null>(null);

  // Strictly compute real stats from database or real comments
  const aggregatedStats = useMemo(() => {
    if (stats && typeof stats.reviewCount === "number" && stats.reviewCount > 0) {
      return {
        average: Number(stats.averageRating) || 0,
        count: Number(stats.reviewCount) || 0,
      };
    }
    if (comments && comments.length > 0) {
      const sum = comments.reduce((acc, c) => acc + (c.stars ?? c.rating ?? 0), 0);
      return {
        average: sum / comments.length,
        count: comments.length,
      };
    }
    return { average: 0, count: 0 };
  }, [stats, comments]);

  const filteredComments = useMemo(() => {
    if (!filterStar) return comments;
    return comments.filter((c) => Math.round(c.stars ?? c.rating ?? 0) === filterStar);
  }, [comments, filterStar]);

  const hasReviews = aggregatedStats.count > 0;

  return (
    <div className="space-y-4 pt-1">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
          {t("product.reviews_title") && !t("product.reviews_title").startsWith("product.")
            ? t("product.reviews_title")
            : "Avis Clients"}
          {hasReviews ? ` (${aggregatedStats.count})` : ""}
        </h2>
      </div>

      {/* Real Review Summary if reviews exist */}
      {hasReviews ? (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
          <div className="flex items-baseline gap-2">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500 shrink-0 self-center" />
            <span className="text-2xl font-black text-zinc-950 tabular-nums">
              {aggregatedStats.average.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              ({aggregatedStats.count} avis)
            </span>
          </div>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStar(filterStar === s ? null : s)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  filterStar === s
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {s}★
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Real Honest Empty State */
        <div className="py-8 px-4 rounded-2xl bg-zinc-50/70 border border-zinc-100 text-center space-y-1.5">
          <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-700">
            Aucun avis pour le moment
          </p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Soyez le premier à donner votre avis après l'achat de cet article !
          </p>
        </div>
      )}

      {/* Real Comments List */}
      {hasReviews && filteredComments.length > 0 && (
        <div className="space-y-3 pt-2">
          {filteredComments.map((comment) => (
            <ProductReviewItem
              key={comment.id}
              comment={comment}
              renderStars={(score) => (
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
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
