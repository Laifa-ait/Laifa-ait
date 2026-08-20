import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { SellerOverviewChartPoint } from "../../../../types/seller";

interface OverviewPerformanceChartProps {
  growth: string;
  chartData: SellerOverviewChartPoint[];
}

export const OverviewPerformanceChart: React.FC<OverviewPerformanceChartProps> = ({
  growth,
  chartData,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-zinc-100 shadow-sm p-6 sm:p-10 overflow-hidden relative"
      id="seller-weekly-sales-chart"
    >
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <h4 className="text-lg sm:text-xl font-sans font-bold flex items-center gap-3 text-zinc-950">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#ea580c]" />
          {t("seller.overview.weekly_sales", "Ventes de la Semaine")}
        </h4>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal">
            {growth}
          </span>
        </div>
      </div>
      <div className="h-[250px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: "#999" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: "#999" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                fontWeight: 900,
              }}
              itemStyle={{ color: "#ea580c" }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#ea580c"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
