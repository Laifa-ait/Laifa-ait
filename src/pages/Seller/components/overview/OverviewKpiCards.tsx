import React from "react";
import { motion } from "motion/react";
import { DollarSign, ShoppingBag, Package, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { SellerOverviewStatsData } from "../../../../types/seller";

interface OverviewKpiCardsProps {
  stats: SellerOverviewStatsData;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({ stats }) => {
  const { t } = useTranslation();

  const cards = [
    {
      label: t("seller.overview.total_sales", "Ventes Totales"),
      value: formatPrice(stats.totalSales),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      id: "seller-kpi-total-sales",
    },
    {
      label: t("seller.overview.orders", "Commandes"),
      value: stats.orderCount,
      icon: ShoppingBag,
      color: "text-[#ea580c]",
      bg: "bg-orange-50",
      id: "seller-kpi-orders",
    },
    {
      label: t("seller.overview.active_items", "Articles Actifs"),
      value: stats.productCount,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      id: "seller-kpi-active-items",
    },
    {
      label: t("seller.overview.pending_returns", "Retours en attente"),
      value: stats.pendingReturns,
      icon: RotateCcw,
      color: "text-purple-600",
      bg: "bg-purple-50",
      id: "seller-kpi-pending-returns",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" id="seller-overview-kpi-cards">
      {cards.map((s, i) => (
        <motion.div
          key={i}
          id={s.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col items-center text-center gap-3 sm:gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center transition-transform group-hover:scale-110`}
          >
            <s.icon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-0.5 sm:mb-1">
              {s.label}
            </p>
            <p className="text-lg sm:text-2xl font-sans font-bold text-zinc-950 tracking-tighter rtl:tracking-normal">
              {s.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
