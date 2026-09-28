import React, { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { ReviewDocument } from "../../domains/review/review.types";
import { BuyerOrder } from "./OrdersSection";
import { getRetroAvatar } from "../../utils/avatar";

interface PendingReviewItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  orderId: string;
  orderDate?: string;
  price?: number;
}

export const MyReviews: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchReviewsAndOrders = async () => {
      setLoading(true);
      try {
        // 1. Fetch real buyer reviews
        const reviewRes = await apiGet<{ reviews: ReviewDocument[] }>("/api/v1/reviews/my-reviews");
        const userReviews = reviewRes?.reviews || [];
        if (!cancelled) setReviews(userReviews);

        // 2. Fetch real buyer orders to find delivered products not yet reviewed
        const orderRes = await apiGet<{ orders: BuyerOrder[] }>("/api/v1/buyer/orders?limit=30");
        const userOrders = orderRes?.orders || [];

        const reviewedProductIds = new Set(userReviews.map((r) => r.productId));
        const pending: PendingReviewItem[] = [];

        userOrders.forEach((ord) => {
          if (ord.status === "delivered" || ord.status === "completed" || ord.status === "shipped") {
            ord.items?.forEach((it, idx) => {
              const pId = it.productId || it.id;
              if (pId && !reviewedProductIds.has(pId)) {
                pending.push({
                  id: `${ord.id}_${pId}_${idx}`,
                  productId: pId,
                  productName: it.title || it.name || t("Produit commandé"),
                  image: it.image || it.imageUrl || getRetroAvatar(it.title || pId),
                  orderId: ord.orderNumber || ord.id,
                  orderDate: ord.createdAt
                    ? new Date(ord.createdAt as string).toLocaleDateString()
                    : undefined,
                  price: it.price,
                });
              }
            });
          }
        });

        if (!cancelled) setPendingReviews(pending);
      } catch (err) {
        if (!cancelled) console.error("Error fetching reviews:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviewsAndOrders();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="my-reviews-module">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          {t("Avis et évaluations")}
        </h2>
        <p className="text-[#5f6368] text-sm mt-1">
          {t("Gérez vos avis sur vos achats et aidez la communauté d'acheteurs en Algérie.")}
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-[24px] border border-[#dadce0]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1a73e8]" />
        </div>
      ) : (
        <>
          {/* Pending Reviews Card (Google Style) */}
          <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#f1f3f4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
                  <Star className="w-4.5 h-4.5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#202124]">
                    {t("Avis en attente ({{count}})", { count: pendingReviews.length })}
                  </h3>
                  <p className="text-xs text-[#5f6368]">
                    {t("Articles livrés que vous pouvez évaluer.")}
                  </p>
                </div>
              </div>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#f0f4f9] text-[#5f6368] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-[#1e8e3e]" />
                </div>
                <p className="text-sm font-medium text-[#202124]">
                  {t("Aucun avis en attente")}
                </p>
                <p className="text-xs text-[#5f6368] max-w-sm mx-auto">
                  {t("Tous vos achats livrés ont été évalués ou aucune nouvelle commande n'est en attente.")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f1f3f4]">
                {pendingReviews.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f8fafd] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-2xl border border-[#dadce0] bg-[#f0f4f9] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getRetroAvatar(item.productName);
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[#202124] truncate">
                          {item.productName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#5f6368] mt-0.5">
                          {item.orderDate && (
                            <span>{t("Commandé le {{date}}", { date: item.orderDate })}</span>
                          )}
                          {item.price && (
                            <span className="font-medium text-[#202124]">
                              • {item.price.toLocaleString()} DA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/product/${item.productId}?review=true`)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium rounded-full shadow-xs transition-colors cursor-pointer shrink-0 border-none"
                    >
                      <Star className="w-4 h-4 fill-current" />
                      <span>{t("Donner mon avis")}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Published Reviews History Card */}
          <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#f1f3f4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#202124]">
                    {t("Historique de vos avis ({{count}})", { count: reviews.length })}
                  </h3>
                  <p className="text-xs text-[#5f6368]">
                    {t("Vos commentaires et notes publiés sur la marketplace.")}
                  </p>
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#f8fafd] border border-[#dadce0] text-[#5f6368] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-sm font-semibold text-[#202124]">
                    {t("Aucun avis publié pour le moment")}
                  </p>
                  <p className="text-xs text-[#5f6368]">
                    {t("Vos évaluations sur les produits commandés s'afficheront ici après publication.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/buyer?tab=orders")}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#f0f4f9] hover:bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium rounded-full transition-colors cursor-pointer border-none"
                >
                  <span>{t("Voir mes commandes")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#f1f3f4]">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-[#dadce0]"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#5f6368]">
                        {rev.createdAt
                          ? new Date(
                              typeof rev.createdAt === "object" && "toMillis" in rev.createdAt
                                ? (rev.createdAt as { toMillis: () => number }).toMillis()
                                : (rev.createdAt as string)
                            ).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    {rev.comment && (
                      <p className="text-sm text-[#202124] leading-relaxed">{rev.comment}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-[#1e8e3e]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="font-medium">{t("Achat vérifié sur Olmart")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
