import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, MousePointerClick, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGet } from '../../lib/api';
import { formatPrice } from '../../utils/format';
import { useTranslation } from "react-i18next";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartItem {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface AnalyticsTopProduct {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
  image?: string;
  [key: string]: unknown;
}

interface SellerAnalyticsData {
  revenue: number;
  orders: number;
  aov: number;
  conversionRate: number;
  chartData: AnalyticsChartItem[];
  topProducts: AnalyticsTopProduct[];
}

export const SellerAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('7d');
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState<SellerAnalyticsData>({
    revenue: 0,
    orders: 0,
    aov: 0,
    conversionRate: 0,
    chartData: [],
    topProducts: []
  });

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const stats = await apiGet<SellerAnalyticsData>(`/api/v1/seller/analytics?period=${period}`);
        if (!cancelled && stats) {
          setData({
            revenue: stats.revenue || 0,
            orders: stats.orders || 0,
            aov: stats.aov || 0,
            conversionRate: stats.conversionRate || 0,
            chartData: stats.chartData || [],
            topProducts: stats.topProducts || []
          });
        }
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { cancelled = true; };
  }, [currentUser, period]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            {t("seller.analytics.title", "Analytiques")}
          </h2>
          <p className="text-slate-500 font-medium">{t("seller.analytics.subtitle", "Suivez les performances de votre boutique.")}</p>
        </div>
        
        <div className="flex bg-white rounded-xl shadow-sm p-1 border border-slate-200">
          {([
            { id: '7d' as const, label: '7 Derniers Jours' },
            { id: '30d' as const, label: '30 Derniers Jours' },
            { id: '12m' as const, label: '12 Mois' }
          ]).map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === p.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
           <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t("seller.analytics.revenue", "Chiffre d'Affaires")}</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatPrice(data.revenue)}</h3>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t("seller.analytics.orders", "Commandes")}</p>
              <h3 className="text-2xl font-bold text-slate-900">{data.orders}</h3>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t("seller.analytics.aov", "Panier Moyen")}</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatPrice(data.aov)}</h3>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t("seller.analytics.conversion", "Taux de Conversion")}</p>
              <h3 className="text-2xl font-bold text-slate-900">{data.conversionRate.toFixed(2)}%</h3>
            </motion.div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-bold text-slate-900">{t("seller.analytics.revenue_evolution", "Évolution du Chiffre d'Affaires")}</h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
