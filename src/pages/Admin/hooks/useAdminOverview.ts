import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { apiGet } from "../../../lib/api";
import { useDebounce } from "../../../hooks/useDebounce";
import { analyticsEngine, AnalyticsEvent } from "../../../utils/analyticsEngine";
import {
  fetchCollectionSample,
  fetchAdminDoc,
  fetchDisputeOrdersCount,
  fetchAdminActivities,
  fetchOrdersSample,
  fetchInternalNotifications
} from "../../../services/adminRepository";
import {
  AdminAlert,
  DashboardData,
  RecentActivity,
  GlobalOrder,
  TopProduct,
  TopSeller,
  WilayaStat,
  AnalyticsInsights,
  OverviewStats
} from "../../../types/adminOverview";

export function useAdminOverview() {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();

  const [stats, setStats] = useState<OverviewStats>({
    totalSales: 0,
    activeVendors: 0,
    totalOrders: 0,
    netRevenue: 0,
    pendingVendors: 0,
    revenueChange: 0,
    ordersChange: 0
  });

  const [adminAlerts, setAdminAlerts] = useState<AdminAlert[]>([]);
  const [data, setData] = useState<DashboardData[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentActivity[]>([]);
  const [globalOrders, setGlobalOrders] = useState<GlobalOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [disputeCount, setDisputeCount] = useState(0);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('month');
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [wilayaStats, setWilayaStats] = useState<WilayaStat[]>([]);
  const [realTimeTraffic, setRealTimeTraffic] = useState<{ time: string; views: number; carts: number }[]>([]);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const [insights, setInsights] = useState<AnalyticsInsights>(() => {
    try {
      return analyticsEngine.getInsights();
    } catch {
      return {
        totalViews: 0,
        totalCarts: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        conversionRate: "0.0",
        addToCartRate: "0.0",
        categoryHits: [],
        productViews: [],
        searchQueries: []
      };
    }
  });

  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => {
    try {
      return analyticsEngine.getEvents().slice(-15).reverse();
    } catch {
      return [];
    }
  });

  const refreshAnalytics = useCallback(async () => {
    setLoadingRefresh(true);
    try {
      setInsights(analyticsEngine.getInsights());
      setAnalyticsEvents(analyticsEngine.getEvents().slice(-15).reverse());
      const dataRes = await apiGet<{ adminAlerts?: AdminAlert[] }>("/api/v1/admin/overview");
      if (dataRes) {
        setAdminAlerts(dataRes.adminAlerts || []);
      }
    } catch {
       // fallback
    } finally {
      setLoadingRefresh(false);
    }
  }, []);

  const debouncedRefresh = useDebounce(refreshAnalytics, 500);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== "admin") return;

    const fetchDisputes = async () => {
      const count = await fetchDisputeOrdersCount();
      setDisputeCount(count);
    };
    fetchDisputes();
    refreshAnalytics();
  }, [currentUser, userProfile, refreshAnalytics]);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== "admin") return;

    let cancelled = false;
    const fetchAnalyticsData = async () => {
      try {
        const docData = await fetchAdminDoc("analytics", "daily");

        if (!cancelled) {
          setStats({
            totalSales: docData?.totalSales || 0,
            activeVendors: docData?.activeVendors || 0,
            totalOrders: docData?.totalOrders || 0,
            netRevenue: (docData?.totalRevenue || 0) * 0.1,
            pendingVendors: docData?.pendingVendors || 0,
            revenueChange: docData?.revenueChange || 0,
            ordersChange: docData?.ordersChange || 0
          });

          if (docData?.chartData) {
            setData(docData.chartData);
          }

          const topProductsDocs = await fetchCollectionSample("products", 5);
          setTopProducts(topProductsDocs.map(d => ({ id: d.id, ...d } as TopProduct)));

          const topSellersDocs = await fetchCollectionSample("users", 5);
          setTopSellers(topSellersDocs.filter(u => u.role === "seller").map(d => ({ id: d.id, ...d } as TopSeller)));

          if (docData?.wilayaStats) {
             setWilayaStats(docData.wilayaStats);
          }

          try {
             const rtDocs = await fetchCollectionSample("analytics_events", 100);
             const intervalMinutes = 15;
             const trafficMap: Record<string, { views: number; carts: number }> = {};
             
             rtDocs.forEach(dataItem => {
                if(!dataItem.serverTimestamp) return;
                const date = typeof dataItem.serverTimestamp?.toDate === 'function' ? dataItem.serverTimestamp.toDate() : new Date(dataItem.serverTimestamp);
                const roundedMinutes = Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes;
                date.setMinutes(roundedMinutes, 0, 0);
                
                const timeKey = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (!trafficMap[timeKey]) trafficMap[timeKey] = { views: 0, carts: 0 };
                
                if (dataItem.name === 'product_view' || dataItem.name === 'search_query') trafficMap[timeKey].views++;
                if (dataItem.name === 'add_to_cart') trafficMap[timeKey].carts++;
             });
             
             const formattedTraffic = Object.entries(trafficMap)
                .map(([time, statsItem]) => ({ time, ...statsItem }))
                .sort((a, b) => a.time.localeCompare(b.time));
             
             setRealTimeTraffic(formattedTraffic);
          } catch (err: unknown) {
             console.error("Error fetching real time traffic", err instanceof Error ? err.message : err);
             setRealTimeTraffic([]);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) console.error("Erreur KPI:", err instanceof Error ? err.message : err);
      }
    };
    fetchAnalyticsData();

    const fetchActivities = async () => {
      const activities = await fetchAdminActivities(5);
      if (!cancelled) {
        setRecentEvents(activities as RecentActivity[]);
      }
    };
    fetchActivities();

    return () => { cancelled = true; };
  }, [t, dateFilter, currentUser, userProfile]);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== "admin") return;

    const fetchGlobalOrders = async () => {
      try {
        const orders = await fetchOrdersSample(50);
        setGlobalOrders(orders as GlobalOrder[]);
      } catch (err: unknown) {
        console.error(err instanceof Error ? err.message : err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchGlobalOrders();

    const fetchAlerts = async () => {
      try {
        const alerts = await fetchInternalNotifications(20);
        setAdminAlerts(alerts as AdminAlert[]);
      } catch (e: unknown) {
        (process.env.NODE_ENV === "development" ? console.log : function () {})("No admin alerts or missing index", e);
      }
    };
    fetchAlerts();
  }, [currentUser, userProfile]);

  return {
    t,
    stats,
    adminAlerts,
    data,
    recentEvents,
    globalOrders,
    loadingOrders,
    insights,
    analyticsEvents,
    loadingRefresh,
    refreshAnalytics,
    debouncedRefresh,
    disputeCount,
    dateFilter,
    setDateFilter,
    topProducts,
    topSellers,
    wilayaStats,
    realTimeTraffic
  };
}
