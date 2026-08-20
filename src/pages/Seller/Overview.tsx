import React from "react";
import { OverviewHeader } from "./components/overview/OverviewHeader";
import { OverviewQuickActions } from "./components/overview/OverviewQuickActions";
import { OverviewKpiCards } from "./components/overview/OverviewKpiCards";
import { OverviewPerformanceChart } from "./components/overview/OverviewPerformanceChart";
import { OverviewTopProducts } from "./components/overview/OverviewTopProducts";
import { OverviewWilayaAndHealth } from "./components/overview/OverviewWilayaAndHealth";
import { OverviewActivityFeed } from "./components/overview/OverviewActivityFeed";
import { useSellerOverview } from "./hooks/useSellerOverview";

export const Overview: React.FC = () => {
  const {
    userProfile,
    stats,
    recentOrders,
    topProducts,
    outOfStockCount,
    wilayaStats,
    chartData,
    loading,
  } = useSellerOverview();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20" id="seller-overview-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ea580c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 max-w-7xl mx-auto pb-24 sm:pb-12" id="seller-overview-page">
      {/* 1. Header with greeting and badges */}
      <OverviewHeader userProfile={userProfile} outOfStockCount={outOfStockCount} />

      {/* 2. Quick Actions */}
      <OverviewQuickActions />

      {/* 3. Main Metrics Grid (4 KPI Cards) */}
      <OverviewKpiCards stats={stats} />

      {/* 4. Sales Chart & Geographic breakdown + Account Health */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <OverviewPerformanceChart growth={stats.growth} chartData={chartData} />
          <OverviewTopProducts topProducts={topProducts} />
        </div>
        <OverviewWilayaAndHealth wilayaStats={wilayaStats} userProfile={userProfile} />
      </div>

      {/* 5. Recent Activity Feed */}
      <OverviewActivityFeed recentOrders={recentOrders} />
    </div>
  );
};
