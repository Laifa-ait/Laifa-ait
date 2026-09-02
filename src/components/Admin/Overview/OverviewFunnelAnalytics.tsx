import React from "react";
import { Sparkles, Eye, ShoppingCart, TrendingUp, DollarSign, Search, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../utils/format";
import { analyticsEngine, AnalyticsEvent } from "../../../utils/analyticsEngine";
import { AnalyticsInsights, ProductViewInsight, SearchQueryInsight, CategoryHitInsight } from "../../../types/adminOverview";

interface OverviewFunnelAnalyticsProps {
  insights: AnalyticsInsights;
  analyticsEvents: AnalyticsEvent[];
  onRefresh: () => void;
}

export const OverviewFunnelAnalytics: React.FC<OverviewFunnelAnalyticsProps> = ({
  insights,
  analyticsEvents,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 bg-zinc-50/50 p-6 sm:p-10 rounded-[3.5rem] border border-zinc-200/50 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950 uppercase flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
            {t("Comportement & Funnel Client (useUserHabits)")}
          </h3>
          <p className="text-zinc-500 text-[10px] font-sans font-bold uppercase mt-1">
            {t("Statistiques d'achat & intentions capturées en temps réel sur la plateforme.")}
          </p>
        </div>
        <button
          onClick={() => {
            analyticsEngine.clear();
            onRefresh();
          }}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-sans font-bold text-[9px] uppercase tracking-widest rtl:tracking-normal rounded-xl transition-colors border-none cursor-pointer self-start sm:self-center"
        >
          {t("Réinitialiser Journal")}
        </button>
      </div>

      {/* Lightweight Analytics KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Consultations Produits",
            value: insights.totalViews,
            icon: Eye,
            dsc: "pages produits vues",
            color: "bg-white text-zinc-900 border-zinc-150",
          },
          {
            label: "Ajouts au Panier",
            value: insights.totalCarts,
            icon: ShoppingCart,
            dsc: `${insights.addToCartRate}% taux d'ajout`,
            color: "bg-white text-orange-600 border-orange-100",
          },
          {
            label: "Conversion Client",
            value: `${insights.conversionRate}%`,
            icon: TrendingUp,
            dsc: "vues vers commandes",
            color: "bg-white text-emerald-600 border-emerald-100",
          },
          {
            label: "Ventes Analytiques",
            value: formatPrice(insights.totalRevenue),
            icon: DollarSign,
            dsc: `${insights.totalPurchases} commandes`,
            color: "bg-zinc-950 text-white border-zinc-900",
          },
        ].map((k, i) => (
          <div key={i} className={`p-6 sm:p-8 rounded-[2rem] border ${k.color} shadow-sm relative overflow-hidden`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal opacity-80">
                {k.label}
              </span>
              <k.icon className="w-5 h-5 opacity-80" />
            </div>
            <h4 className="text-xl sm:text-2xl font-sans font-bold tracking-tighter rtl:tracking-normal mb-1">{k.value}</h4>
            <p className="text-[9px] font-bold uppercase opacity-60">{k.dsc}</p>
          </div>
        ))}
      </div>

      {/* Behavior Details Lists (Top Searches, Viewed Products, Category Heatmap) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        {/* Top Viewed */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-150 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[#ea580c] mb-6 flex items-center gap-2">
              <Eye className="w-4 h-4" /> {t("Articles Populaires")}
            </h4>
            {insights.productViews.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 font-bold uppercase">{t("Aucune vue détectée")}</p>
            ) : (
              <div className="space-y-4">
                {insights.productViews.map((item: ProductViewInsight, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold text-zinc-700">
                    <span className="truncate max-w-[150px]">{item.name}</span>
                    <span className="text-[9px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">
                      {item.count} {t("vues")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Search queries */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-150 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[#ea580c] mb-6 flex items-center gap-2">
              <Search className="w-4 h-4" /> {t("Recherches Populaires")}
            </h4>
            {insights.searchQueries.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 font-bold uppercase">{t("Aucun terme recherché")}</p>
            ) : (
              <div className="space-y-4">
                {insights.searchQueries.map((item: SearchQueryInsight, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold text-zinc-700">
                    <span>🎬 "{item.query}"</span>
                    <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                      {item.count} {t("fois")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Heatmap Weight */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-150 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[#ea580c] mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {t("Densité d'Intérêt Catégorie")}
            </h4>
            {insights.categoryHits.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 font-bold uppercase">{t("En attente de visites")}</p>
            ) : (
              <div className="space-y-4">
                {insights.categoryHits.map((item: CategoryHitInsight, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-sans font-bold text-zinc-700 uppercase">
                      <span>{item.name}</span>
                      <span>
                        {item.value} {t("pts")}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.value / Math.max(...insights.categoryHits.map((c: CategoryHitInsight) => c.value))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Event Stream Logs */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-zinc-150 shadow-sm">
        <h4 className="text-xs font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-zinc-900 mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-[#ea580c]" /> {t("Journal Temps Réel des Événements")}
        </h4>
        <div className="overflow-x-auto text-start">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-5 py-4 text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                  {t("Heure")}
                </th>
                <th className="px-5 py-4 text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                  {t("Session User")}
                </th>
                <th className="px-5 py-4 text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                  {t("Action")}
                </th>
                <th className="px-5 py-4 text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                  {t("Détails")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {analyticsEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-xs font-bold text-zinc-400">
                    {t("Aucun événement enregistré.")}
                  </td>
                </tr>
              ) : (
                analyticsEvents.map((evt, idx) => {
                  const formattedTime = new Date(evt.timestamp).toLocaleTimeString();
                  let badgeColor = "bg-zinc-100 text-zinc-700";
                  if (evt.name === "product_view") badgeColor = "bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]";
                  if (evt.name === "add_to_cart") badgeColor = "bg-orange-50 text-orange-600 border border-orange-100";
                  if (evt.name === "purchase_complete") badgeColor = "bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]";
                  if (evt.name === "wishlist_toggle") badgeColor = "bg-[#fdf2f8] text-[#db2777] border border-[#fbcfe8]";
                  if (evt.name === "search_query") badgeColor = "bg-amber-50 text-amber-600 border border-amber-100";
                  if (evt.name === "checkout_start") badgeColor = "bg-purple-50 text-purple-600 border border-purple-100";
                  if (evt.name === "remove_from_cart") badgeColor = "bg-red-50 text-red-600 border border-red-100";

                  return (
                    <tr key={`${evt.id}-${idx}`} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-bold text-zinc-400 whitespace-nowrap">{formattedTime}</td>
                      <td className="px-5 py-4 text-xs font-bold text-zinc-650 truncate max-w-[150px]">
                        {evt.userEmail || t("Visiteur Anonyme")}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`${badgeColor} inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider rtl:tracking-normal`}>
                          {evt.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-bold max-w-xs sm:max-w-md truncate">
                        {evt.name === "product_view" && `${t("Consulté")} "${evt.metadata.name}"`}
                        {evt.name === "add_to_cart" && `${t("Ajouté au panier:")} "${evt.metadata.name}"`}
                        {evt.name === "remove_from_cart" && `${t("Retiré du panier:")} "${evt.metadata.name}"`}
                        {evt.name === "wishlist_toggle" &&
                          `${evt.metadata.action === "add" ? t("Ajouté aux") : t("Retiré des")} ${t("favoris :")} ID ${evt.metadata.productId}`}
                        {evt.name === "search_query" &&
                          `${t("Recherche d'intérêt :")} "${evt.metadata.query}" (${evt.metadata.resultsCount} ${t("résultats")})`}
                        {evt.name === "purchase_complete" &&
                          `${t("Commande validée")} #${evt.metadata.orderId} - ${t("Total:")} ${formatPrice(Number(evt.metadata.totalAmount) || 0)}`}
                        {evt.name === "checkout_start" &&
                          `${t("Visite de l'entonnoir - Panier contenant")} ${evt.metadata.itemsCount} ${t("articles")}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
