import React from "react";
import { useTranslation } from "react-i18next";
import { Eye, MousePointerClick, TrendingUp, ShoppingBag, Coins, Zap } from "lucide-react";
import { getOptimizedImageUrl } from "../../../utils/imageUtils";
import { SponsorshipRequest } from "../../../domains/seller/sponsorship.types";

interface SponsorshipHistoryListProps {
  requests: SponsorshipRequest[];
}

export const SponsorshipHistoryList: React.FC<SponsorshipHistoryListProps> = ({ requests }) => {
  const { t } = useTranslation();

  if (!requests || requests.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-base font-bold font-sans text-zinc-950 uppercase tracking-wide">
            {t("Suivi & Performance des Campagnes")}
          </h3>
          <p className="text-xs text-zinc-500">
            {t("Historique de vos placements sponsorisés et statistiques en temps réel.")}
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
          {requests.length} {t("Demande(s)")}
        </span>
      </div>

      <div className="space-y-3">
        {requests.map((req) => {
          const impressions = req.impressionsCount || 0;
          const clicks = req.clicksCount || 0;
          const sales = req.salesCount || 0;
          const revenue = req.revenueGenerated || 0;
          const ctr = req.ctr ?? (impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0);

          const tierBadge = req.tier === "gold" ? "bg-amber-500 text-zinc-950 font-black" :
                            req.tier === "silver" ? "bg-slate-700 text-white font-bold" :
                            "bg-amber-800 text-white font-bold";

          return (
            <div key={req.id} className="bg-zinc-50/70 border border-zinc-200/60 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-zinc-50">
              {/* Product Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  loading="lazy"
                  src={getOptimizedImageUrl(req.productImage, 120) || 'https://via.placeholder.com/150'}
                  alt={req.productName}
                  className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-950 truncate">{req.productName}</h4>
                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded-md ${tierBadge}`}>
                      {req.tier ? req.tier.toUpperCase() : "STANDARD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1 font-mono">
                    <span>{req.durationDays || 7} {t("Jours")}</span>
                    <span>•</span>
                    <span>{req.price ? `${req.price.toLocaleString()} DA` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Analytics metrics per item */}
              <div className="grid grid-cols-4 gap-4 bg-white px-4 py-2.5 rounded-xl border border-zinc-200/60 text-center w-full md:w-auto">
                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
                    <Eye className="w-3 h-3 text-blue-500" /> {t("Vues")}
                  </div>
                  <p className="text-xs font-black font-sans text-zinc-900 mt-0.5">{impressions.toLocaleString()}</p>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
                    <MousePointerClick className="w-3 h-3 text-amber-500" /> {t("Clics")}
                  </div>
                  <p className="text-xs font-black font-sans text-zinc-900 mt-0.5">{clicks.toLocaleString()}</p>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
                    <TrendingUp className="w-3 h-3 text-purple-500" /> {t("CTR")}
                  </div>
                  <p className="text-xs font-black font-sans text-purple-700 mt-0.5">{ctr}%</p>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
                    <ShoppingBag className="w-3 h-3 text-emerald-500" /> {t("Ventes")}
                  </div>
                  <p className="text-xs font-black font-sans text-emerald-700 mt-0.5">{sales}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 self-end md:self-center">
                <span className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border ${
                  req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {req.status === 'pending' ? t("En Attente") : req.status === 'approved' ? t("Actif") : t("Expiré / Rejeté")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
