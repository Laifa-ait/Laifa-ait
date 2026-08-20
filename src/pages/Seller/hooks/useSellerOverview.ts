import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiGet } from "../../../lib/api";
import {
  SellerOverviewStatsData,
  SellerOverviewPayoutStats,
  SellerOverviewWilayaStat,
  SellerOverviewChartPoint,
  SellerOverviewTopProduct,
  SellerOverviewRecentOrder,
  SellerOverviewApiResponse,
} from "../../../types/seller";

export function useSellerOverview() {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState<SellerOverviewStatsData>({
    totalSales: 0,
    orderCount: 0,
    productCount: 0,
    growth: "N/A",
    pendingReturns: 0,
  });
  const [recentOrders, setRecentOrders] = useState<SellerOverviewRecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<SellerOverviewTopProduct[]>([]);
  const [payoutStats, setPayoutStats] = useState<SellerOverviewPayoutStats>({ available: 0, nextPaymentDate: "" });
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [wilayaStats, setWilayaStats] = useState<SellerOverviewWilayaStat[]>([]);
  const [chartData, setChartData] = useState<SellerOverviewChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const data = await apiGet<SellerOverviewApiResponse>("/api/v1/seller/overview-stats");
        if (!cancelled && data) {
          if (data.stats) setStats(data.stats);
          if (data.recentOrders) setRecentOrders(data.recentOrders);
          if (data.topProducts) setTopProducts(data.topProducts);
          if (data.payoutStats) setPayoutStats(data.payoutStats);
          if (data.outOfStockCount !== undefined) setOutOfStockCount(data.outOfStockCount);
          if (data.wilayaStats) setWilayaStats(data.wilayaStats);
          if (data.chartData) setChartData(data.chartData);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching overview stats:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  return {
    currentUser,
    userProfile,
    stats,
    recentOrders,
    topProducts,
    payoutStats,
    outOfStockCount,
    wilayaStats,
    chartData,
    loading,
  };
}
