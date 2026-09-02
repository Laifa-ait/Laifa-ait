import React from "react";
import { ShoppingBag, Users, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../utils/format";
import { TopProduct, TopSeller, WilayaStat } from "../../../types/adminOverview";

interface OverviewTopListsProps {
  topProducts: TopProduct[];
  topSellers: TopSeller[];
  wilayaStats: WilayaStat[];
}

export const OverviewTopLists: React.FC<OverviewTopListsProps> = ({
  topProducts,
  topSellers,
  wilayaStats,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      {/* Top Products */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-zinc-100 shadow-sm">
        <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-zinc-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-500" /> {t("Top 5 Produits")}
        </h4>
        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <p className="text-xs text-zinc-400 font-bold uppercase">{t("Aucun produit")}</p>
          ) : (
            topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl bg-zinc-100 flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.images?.[0] || ""})` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">{p.name || t("Produit inconnu")}</p>
                  <p className="text-[10px] text-zinc-500 font-sans font-bold">{p.salesCount || 0} {t("ventes")}</p>
                </div>
                <div className="font-sans font-bold text-xs text-emerald-600">{formatPrice(p.price || 0)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Sellers */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-zinc-100 shadow-sm">
        <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-zinc-900 mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> {t("Top 5 Vendeurs")}
        </h4>
        <div className="space-y-4">
          {topSellers.length === 0 ? (
            <p className="text-xs text-zinc-400 font-bold uppercase">{t("Aucun vendeur")}</p>
          ) : (
            topSellers.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {s.displayName?.charAt(0) || "V"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">{s.displayName || s.email}</p>
                  <p className="text-[10px] text-zinc-500 font-sans font-bold">{s.wilaya || t("National")}</p>
                </div>
                <div className="font-sans font-bold text-xs text-blue-600">{formatPrice(s.totalRevenue || 0)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Wilaya Map Breakdown */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-zinc-100 shadow-sm">
        <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-zinc-900 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-emerald-500" /> {t("Commandes par Wilaya")}
        </h4>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {wilayaStats.length === 0 ? (
            <p className="text-xs text-zinc-400 font-bold uppercase">{t("Aucune donnée géographique")}</p>
          ) : (
            [...wilayaStats].sort((a, b) => (b.count || 0) - (a.count || 0)).map((w, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-sans font-bold text-zinc-700 uppercase">
                  <span>{w.wilaya}</span>
                  <span>{w.count || 0} {t("cmd")}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, ((w.count || 0) / Math.max(1, ...wilayaStats.map(x => x.count || 0))) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
