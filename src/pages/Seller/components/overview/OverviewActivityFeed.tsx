import React from "react";
import { Activity, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { normalizeTimestamp } from "../../../../utils/date";
import { SellerOverviewRecentOrder } from "../../../../types/seller";
import { AppTimestamp } from "../../../../utils/date";

interface OverviewActivityFeedProps {
  recentOrders: SellerOverviewRecentOrder[];
}

export const OverviewActivityFeed: React.FC<OverviewActivityFeedProps> = ({ recentOrders }) => {
  const { t } = useTranslation();

  const formatOrderTime = (createdAt?: AppTimestamp): string => {
    if (!createdAt) return t("seller.overview.recent", "Récent");
    try {
      const date = normalizeTimestamp(createdAt).toDate();
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return t("seller.overview.recent", "Récent");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8" id="seller-overview-activity-feed">
      <div className="lg:col-span-3 bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-50">
          <h4 className="text-md sm:text-lg font-sans font-bold flex items-center gap-3 text-zinc-950">
            <Activity className="w-5 h-5 text-[#ea580c]" />
            {t("seller.overview.latest_activities", "Dernières Activités")}
          </h4>
        </div>
        <div className="divide-y divide-zinc-50">
          {recentOrders.map((o, i) => (
            <div key={o.id || i} className="p-6 flex items-center gap-4 hover:bg-zinc-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-sans font-bold text-zinc-950 truncate">
                  {t("seller.overview.new_order_prefix", "Nouvelle Commande #")}
                  {o.id.substring(0, 6)}
                </p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest rtl:tracking-normal">
                  {formatOrderTime(o.createdAt)}
                </p>
              </div>
              <div className="text-end">
                <p className="text-sm font-sans font-bold text-zinc-950">{formatPrice(o.total)}</p>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="p-6 text-center text-zinc-400 font-medium text-sm">
              {t("Aucune activité récente.")}
            </div>
          )}
        </div>
        {recentOrders.length > 0 && (
          <button
            type="button"
            id="seller-view-all-logs-btn"
            className="w-full py-4 text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal hover:text-orange-600 hover:bg-zinc-50 transition-all border-t border-zinc-50 cursor-pointer bg-transparent"
          >
            {t("Voir tous les journaux")}
          </button>
        )}
      </div>
    </div>
  );
};
