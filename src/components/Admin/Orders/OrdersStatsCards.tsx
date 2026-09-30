import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, Percent, DollarSign, FileText } from "lucide-react";
import { formatPrice } from "../../../utils/format";

export interface OrdersStatsCardsProps {
  totalVolume: number;
  totalCommission: number;
  sellersNetPayout: number;
  filteredOrdersCount: number;
  totalOrdersCount: number;
}

export const OrdersStatsCards: React.FC<OrdersStatsCardsProps> = ({
  totalVolume,
  totalCommission,
  sellersNetPayout,
  filteredOrdersCount,
  totalOrdersCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Volume */}
      <div className="p-6 bg-white border border-zinc-250/70 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden group">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
            {t("Volume Global (COD Total)")}
          </span>
          <strong className="block text-xl font-sans font-bold font-mono text-zinc-900 tracking-tight mt-1">
            {formatPrice(totalVolume)}
          </strong>
        </div>
        <div className="absolute end-3 top-3 opacity-10 font-mono text-4xl select-none font-bold">
          {t("admin_orders.cod_bg", "COD")}
        </div>
      </div>

      {/* Commission */}
      <div className="p-6 bg-white border border-zinc-250/70 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Percent className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
            {t("Commission Olmart (5%)")}
          </span>
          <strong className="block text-xl font-sans font-bold font-mono text-purple-600 tracking-tight mt-1">
            {formatPrice(totalCommission)}
          </strong>
        </div>
        <div className="absolute end-3 top-3 opacity-10 font-mono text-4xl select-none font-bold">5%</div>
      </div>

      {/* Payout */}
      <div className="p-6 bg-white border border-zinc-250/70 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
            {t("Net Estimé Vendeurs (95%)")}
          </span>
          <strong className="block text-xl font-sans font-bold font-mono text-emerald-600 tracking-tight mt-1">
            {formatPrice(sellersNetPayout)}
          </strong>
        </div>
        <div className="absolute end-3 top-3 opacity-10 font-mono text-4xl select-none font-bold">95%</div>
      </div>

      {/* Count */}
      <div className="p-6 bg-white border border-zinc-250/70 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
            {t("Commandes Filtrées")}
          </span>
          <strong className="block text-xl font-sans font-bold font-mono text-blue-600 tracking-tight mt-1">
            {filteredOrdersCount} / {totalOrdersCount} {t("com.")}
          </strong>
        </div>
        <div className="absolute end-3 top-3 opacity-10 font-mono text-4xl select-none font-bold">
          {t("admin_orders.qty_bg", "QTY")}
        </div>
      </div>
    </div>
  );
};
