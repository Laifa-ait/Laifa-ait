import React, { Suspense } from "react";
import { AlertTriangle, RefreshCw, BarChart3, Activity } from "lucide-react";
import toast from "react-hot-toast";

const OverviewChart = React.lazy(() => import("../../components/Admin/OverviewChart"));
const TrafficChart = React.lazy(() => import("../../components/Admin/TrafficChart"));

import { WorkspaceActions } from "../../components/Admin/WorkspaceActions";
import { AdminManualGuide } from "../../components/Admin/AdminManualGuide";
import { useAdminOverview } from "./hooks/useAdminOverview";

import { OverviewKpiCards } from "../../components/Admin/Overview/OverviewKpiCards";
import { OverviewQuickActions } from "../../components/Admin/Overview/OverviewQuickActions";
import { OverviewFunnelAnalytics } from "../../components/Admin/Overview/OverviewFunnelAnalytics";
import { OverviewTopLists } from "../../components/Admin/Overview/OverviewTopLists";
import { OverviewGlobalOrdersTable } from "../../components/Admin/Overview/OverviewGlobalOrdersTable";

export const Overview: React.FC = () => {
  const {
    t,
    stats,
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
    topProducts,
    topSellers,
    wilayaStats,
    realTimeTraffic,
  } = useAdminOverview();

  const handleDangerReset = async () => {
    const confirmInput = prompt(t("DANGER: Taper 'DANGER' pour réinitialiser la base de données"));
    if (confirmInput === "DANGER") {
      toast.success(t("Demande de réinitialisation envoyée au serveur sécurisé..."));
    }
  };

  return (
    <div className="p-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="text-3xl font-sans font-bold uppercase tracking-tight text-zinc-900 flex items-center gap-4">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            {t("Tableau de Bord Exécutif")}
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            {t("Vue synthétique des métriques financières, de l'état des opérations et des alertes critiques.")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refreshAnalytics();
              debouncedRefresh();
            }}
            disabled={loadingRefresh}
            className="px-5 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRefresh ? "animate-spin" : ""}`} />
            <span>{t("Actualiser")}</span>
          </button>
        </div>
      </div>

      <OverviewKpiCards stats={stats} disputeCount={disputeCount} />

      <OverviewQuickActions />

      <AdminManualGuide />

      <WorkspaceActions />

      <div className="bg-white rounded-[3.5rem] p-10 border border-zinc-100 shadow-sm space-y-6">
        <h3 className="text-lg font-sans font-bold text-zinc-900 uppercase tracking-wide">
          {t("Évolution des Revenus & Commandes")}
        </h3>
        <div className="h-[350px] w-full">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <OverviewChart data={data} />
          </Suspense>
        </div>
      </div>

      <OverviewFunnelAnalytics analyticsEvents={analyticsEvents} insights={insights} onRefresh={refreshAnalytics} />

      <OverviewTopLists topProducts={topProducts} topSellers={topSellers} wilayaStats={wilayaStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-50 pb-6 mb-6">
            <h4 className="text-xl font-sans font-bold flex items-center gap-4 text-zinc-900">
              <Activity className="w-7 h-7 text-indigo-500 animate-pulse" />
              {t("Graphique de Trafic & Conversions en Temps Réel")}
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <TrafficChart data={realTimeTraffic} t={t} />
            </Suspense>
          </div>
        </div>

        <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-zinc-50">
            <h4 className="text-lg font-sans font-bold flex items-center gap-3">
              <Activity className="w-5 h-5 text-orange-500" />
              {t("Flux d'Activité")}
            </h4>
          </div>
          <div className="flex-1 divide-y divide-zinc-50 overflow-y-auto max-h-[320px]">
            {recentEvents.map((e, i) => (
              <div key={i} className="p-6 hover:bg-zinc-50/50 transition-colors flex gap-4">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${(e.color || "text-zinc-400").replace("text-", "bg-")}`} />
                <div>
                  <p className="text-xs font-sans font-bold text-zinc-950 leading-tight">{e.label}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-zinc-50/50">
            <button
              onClick={handleDangerReset}
              className="w-full bg-red-50 text-red-600 py-3 rounded-2xl font-sans font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-md group cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
              {t("Danger Zone: Reset DB")}
            </button>
          </div>
        </div>
      </div>

      <OverviewGlobalOrdersTable globalOrders={globalOrders} loadingOrders={loadingOrders} />
    </div>
  );
};
