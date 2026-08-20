import React from "react";
import { Eye, MousePointerClick, TrendingUp, ShoppingBag, Coins, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SponsorshipAnalyticsHeaderProps {
  summary: {
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    totalSales: number;
    totalRevenue: number;
    activeSponsorshipsCount: number;
  };
}

export const SponsorshipAnalyticsHeader: React.FC<SponsorshipAnalyticsHeaderProps> = ({
  summary
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-amber-950 rounded-2xl p-4 text-white flex items-center justify-between border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-sans uppercase tracking-wide">
                {t("Tableau de Bord Sponsoring & Performance")}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                {summary.activeSponsorshipsCount} {t("Actif(s)")}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t("Boostez la conversion de vos produits avec les badges Bronze, Silver & Gold.")}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Impressions */}
        <div className="bg-white rounded-xl p-3.5 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("Impressions")}</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black font-sans text-zinc-900">
              {summary.totalImpressions.toLocaleString()}
            </span>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{t("Vues en rayon")}</p>
          </div>
        </div>

        {/* Clics */}
        <div className="bg-white rounded-xl p-3.5 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("Clics Générés")}</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black font-sans text-zinc-900">
              {summary.totalClicks.toLocaleString()}
            </span>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{t("Visites fiches")}</p>
          </div>
        </div>

        {/* CTR */}
        <div className="bg-white rounded-xl p-3.5 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("Taux de Clic (CTR)")}</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black font-sans text-purple-700">
              {summary.avgCtr}%
            </span>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{t("Ratio Clics/Vues")}</p>
          </div>
        </div>

        {/* Ventes */}
        <div className="bg-white rounded-xl p-3.5 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("Ventes Concrétisées")}</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black font-sans text-emerald-700">
              {summary.totalSales}
            </span>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{t("Commandes sponsorisées")}</p>
          </div>
        </div>

        {/* Chiffre d'Affaires */}
        <div className="bg-white rounded-xl p-3.5 border border-zinc-200/80 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("Chiffre d'Affaires")}</span>
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black font-mono text-orange-600">
              {summary.totalRevenue.toLocaleString()} <span className="text-xs font-sans">DA</span>
            </span>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{t("Revenus générés")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
