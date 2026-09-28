import React from "react";
import { Package, Clock, ChevronRight, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import { normalizeTimestamp, AppTimestamp } from "../../utils/date";

export interface BuyerOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: AppTimestamp;
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  shippingAddress?: { wilaya: string; communes?: string; commune?: string };
  unreadBuyerMessages?: boolean;
  unreadSellerMessages?: boolean;
  lastMessageText?: string;
  lastMessageAt?: AppTimestamp;
}

interface OrdersSectionProps {
  orders: BuyerOrder[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatOrderDate = (createdAt: AppTimestamp | null | undefined) => {
    if (!createdAt) return "";
    try {
      return normalizeTimestamp(createdAt).toDate().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "livré":
      case "complete":
        return {
          bg: "bg-[#e6f4ea]",
          text: "text-[#137333]",
          border: "border-[#ceead6]",
          label: "Livré",
        };
      case "shipped":
      case "expédié":
      case "in_transit":
        return {
          bg: "bg-[#e8f0fe]",
          text: "text-[#1a73e8]",
          border: "border-[#d2e3fc]",
          label: "En cours de livraison",
        };
      case "cancelled":
      case "annulé":
        return {
          bg: "bg-[#fce8e6]",
          text: "text-[#c5221f]",
          border: "border-[#fad2cf]",
          label: "Annulé",
        };
      default:
        return {
          bg: "bg-[#fef7e0]",
          text: "text-[#b06000]",
          border: "border-[#feefc3]",
          label: "En préparation",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1f1f1f] tracking-tight">
            {t("Commandes et achats")}
          </h2>
          <p className="text-[#444746] text-xs sm:text-sm mt-0.5">
            {t("Consultez vos reçus, suivez l'acheminement et accédez à vos factures.")}
          </p>
        </div>
        <button
          onClick={() => navigate("/shop")}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#dadce0] bg-white hover:bg-[#f1f3f4] text-xs font-medium text-[#1a73e8] transition-colors cursor-pointer shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Continuer vos achats</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-[24px] border border-[#dadce0] p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#444746] mt-3">Chargement de vos commandes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#dadce0] p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f0f4f9] text-[#444746] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1f1f1f]">
              {t("Aucune commande enregistrée")}
            </h3>
            <p className="text-xs text-[#444746] mt-1 max-w-sm mx-auto">
              {t("Vos achats et suivis de colis apparaîtront ici dès votre première commande.")}
            </p>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-2.5 rounded-full bg-[#1a73e8] text-white text-xs sm:text-sm font-medium hover:bg-[#1557b0] transition-colors shadow-xs cursor-pointer border-none"
          >
            {t("Découvrir la boutique")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/dashboard/buyer/order/${order.id}`)}
                className="bg-white rounded-[24px] border border-[#dadce0] p-5 sm:p-6 hover:shadow-md hover:border-[#1a73e8]/40 transition-all cursor-pointer shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f3f4] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1f1f1f]">
                        Commande #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-[11px] text-[#444746] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                    <span className="font-semibold text-sm text-[#1f1f1f]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#444746]">
                  <div>
                    {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? "s" : ""} •{" "}
                    {order.shippingAddress?.wilaya || "Algérie"}
                  </div>
                  <div className="flex items-center gap-1 text-[#1a73e8] font-medium">
                    <span>Détails & Facture</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-full border border-[#dadce0] bg-white hover:bg-[#f1f3f4] text-xs font-medium text-[#1a73e8] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loadingMore ? "Chargement..." : "Charger plus de commandes"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
