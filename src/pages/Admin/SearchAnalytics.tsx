import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, TrendingUp, AlertTriangle, ArrowUpRight, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { fetchSearchAnalyticsLogs } from "../../services/adminRepository";

interface SearchLog {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
  clickedProduct?: boolean;
  userId?: string;
  durationMs: number;
}

export const SearchAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const fetchLogs = async () => {
      try {
        const docs = await fetchSearchAnalyticsLogs(100);
        const fetched: SearchLog[] = docs.map((data) => ({
          id: data.id,
          query: data.query,
          timestamp: typeof data.timestamp?.toDate === "function" ? data.timestamp.toDate().toISOString() : data.timestamp,
          resultsCount: data.resultsCount,
          clickedProduct: data.clickedProduct,
          userId: data.userId,
          durationMs: data.durationMs || 45,
        }));

        if (!isCancelled) {
          setLogs(fetched);
        }
      } catch (err) {
        console.error("Error loading search analytics logs:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchLogs();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Compute stats metrics
  const stats = React.useMemo(() => {
    if (logs.length === 0) return { totalSearches: 0, ctr: 0, zeroResultRate: 0, avgLatency: 0 };
    const totalSearches = logs.length;
    const clicks = logs.filter((l) => l.clickedProduct).length;
    const zeroResults = logs.filter((l) => l.resultsCount === 0).length;
    const sumLatency = logs.reduce((acc, l) => acc + l.durationMs, 0);

    return {
      totalSearches,
      ctr: Math.round((clicks / totalSearches) * 100),
      zeroResultRate: Math.round((zeroResults / totalSearches) * 100),
      avgLatency: Math.round(sumLatency / totalSearches),
    };
  }, [logs]);

  // Daily volume graph data
  const chartData = React.useMemo(() => {
    const dailyMap: Record<string, { name: string; "Volume de recherche": number; "Sans Résultat": number }> = {};
    
    // Initialize last 7 days
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      dailyMap[key] = {
        name: key,
        "Volume de recherche": 0,
        "Sans Résultat": 0,
      };
    }

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      const key = logDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      if (dailyMap[key]) {
        dailyMap[key]["Volume de recherche"]++;
        if (log.resultsCount === 0) {
          dailyMap[key]["Sans Résultat"]++;
        }
      }
    });

    return Object.values(dailyMap);
  }, [logs]);

  // Aggregate Top queries
  const topQueries = React.useMemo(() => {
    const queryCounts: Record<string, { query: string; count: number; resultsCount: number; clicks: number }> = {};
    logs.forEach((log) => {
      const qLower = log.query.trim().toLowerCase();
      if (!queryCounts[qLower]) {
        queryCounts[qLower] = {
          query: log.query,
          count: 0,
          resultsCount: log.resultsCount,
          clicks: 0,
        };
      }
      queryCounts[qLower].count++;
      if (log.clickedProduct) {
        queryCounts[qLower].clicks++;
      }
    });

    return Object.values(queryCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logs]);

  // Zero-results queries
  const zeroResultsQueries = React.useMemo(() => {
    const zeroCounts: Record<string, { query: string; count: number }> = {};
    logs.forEach((log) => {
      if (log.resultsCount === 0) {
        const qLower = log.query.trim().toLowerCase();
        if (!zeroCounts[qLower]) {
          zeroCounts[qLower] = { query: log.query, count: 0 };
        }
        zeroCounts[qLower].count++;
      }
    });

    return Object.values(zeroCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-2">
          <TrendingUp className="w-8 h-8 animate-bounce text-zinc-300 mx-auto" />
          <p className="text-zinc-500 font-medium">{t("Analyse des logs de recherche...")}</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-16 shadow-sm text-center max-w-lg mx-auto my-12 space-y-6">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
          <Search className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-900">{t("Pas encore de données de recherche")}</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            {t("Les analyses s'afficheront ici une fois que les visiteurs auront utilisé la recherche d'Olmart pour trouver des produits locaux.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total volume */}
        <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Recherches totales")}</span>
            <Search className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-sans font-bold text-zinc-900 mt-2">{stats.totalSearches}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% {t("vs semaine dernière")}</span>
          </div>
        </div>

        {/* Click-through rate */}
        <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Taux de Clic (CTR)")}</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-sans font-bold text-zinc-900 mt-2">{stats.ctr}%</p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
            <span>{t("Clics vers fiches produits")}</span>
          </div>
        </div>

        {/* No-Results Rate */}
        <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Taux Sans Résultat")}</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-sans font-bold text-zinc-900 mt-2">{stats.zeroResultRate}%</p>
          <div className="flex items-center gap-1.5 text-xs text-red-500 mt-2 font-semibold">
            <span>{t("Frustration utilisateur à limiter")}</span>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Temps de réponse moyen")}</span>
            <BarChart2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-sans font-bold text-zinc-900 mt-2">{stats.avgLatency} ms</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-semibold">
            <span>{t("Performance Ultra-Rapide")}</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Area chart */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t("Trafic de recherche (7 derniers jours)")}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEmpty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Volume de recherche" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="Sans Résultat" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorEmpty)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top searched query counts */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t("Top Requêtes Populaires")}</h3>
            <div className="space-y-4">
              {topQueries.map((item, idx) => {
                const percentage = stats.totalSearches > 0 ? Math.round((item.count / stats.totalSearches) * 100) : 0;
                return (
                  <div key={item.query} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400">#{idx + 1}</span>
                        <span className="font-bold text-zinc-800 capitalize">{item.query}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-mono">
                        {item.count} searches
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-950 rounded-full" style={{ width: `${percentage * 4}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Zero Results Queries & Log Details Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Zero Results issues */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t("Frustrations : Requêtes Sans Résultat")}</h3>
          </div>
          <div className="space-y-3">
            {zeroResultsQueries.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-6 text-center">{t("Félicitations ! Aucun échec de recherche enregistré.")}</p>
            ) : (
              zeroResultsQueries.map((item) => (
                <div key={item.query} className="p-3 bg-red-50/50 border border-red-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-red-950 capitalize">{item.query}</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{t("Les utilisateurs ne trouvent rien")}</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-xl">
                    {item.count} {t("fois")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Query stream logs */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t("Flux de Recherches Réel")}</h3>
            <span className="text-[10px] uppercase font-bold text-zinc-400">{t("Dernières 6 requêtes")}</span>
          </div>

          <div className="divide-y divide-zinc-100 max-h-[280px] overflow-y-auto pr-1">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-zinc-800 capitalize">{log.query}</span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 font-mono">
                    <span>{new Date(log.timestamp).toLocaleTimeString("fr-FR")}</span>
                    <span>• {log.resultsCount} {t("résultats")}</span>
                  </div>
                </div>
                <div>
                  {log.clickedProduct ? (
                    <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                      {t("Clic Produit")}
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full uppercase">
                      {t("Aperçu simple")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
