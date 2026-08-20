import React from "react";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerUserProfile, SellerOverviewWilayaStat } from "../../../../types/seller";

interface OverviewWilayaAndHealthProps {
  wilayaStats: SellerOverviewWilayaStat[];
  userProfile: SellerUserProfile | null;
}

export const OverviewWilayaAndHealth: React.FC<OverviewWilayaAndHealthProps> = ({
  wilayaStats,
  userProfile,
}) => {
  const { t } = useTranslation();
  const maxCount = Math.max(...wilayaStats.map((x) => x.count), 1);

  return (
    <div className="space-y-8 flex flex-col" id="seller-overview-wilaya-health">
      {/* Wilaya Stats */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8" id="seller-delivery-zones-card">
        <h4 className="text-sm font-sans font-bold text-zinc-950 uppercase tracking-widest rtl:tracking-normal mb-8">
          {t("seller.overview.flash_delivery_zones", "Zones de Livraison Flash")}
        </h4>
        <div className="space-y-6">
          {wilayaStats.map((w, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-sans font-bold text-zinc-700">{w.name}</span>
                <span className="text-[10px] font-bold text-zinc-400">
                  {w.count} {t("seller.overview.order", "Commande")}
                  {w.count > 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(w.count / maxCount) * 100}%` }}
                  className="h-full bg-orange-500 rounded-full"
                />
              </div>
            </div>
          ))}
          {wilayaStats.length === 0 && (
            <p className="text-[10px] font-bold text-zinc-400 text-center py-10 italic">
              {t("seller.overview.no_geo_data", "Pas encore assez de données géographiques.")}
            </p>
          )}
        </div>
      </div>

      {/* Account Health */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 flex flex-col items-center text-center" id="seller-account-health-card">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <h4 className="text-sm font-sans font-bold text-zinc-950 uppercase tracking-widest rtl:tracking-normal mb-1">
          {t("seller.overview.account_health", "Santé du Compte")}
        </h4>
        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-6">
          {t("seller.overview.excellent", "Excellente")}
        </p>

        <div className="w-full space-y-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight rtl:tracking-normal">
            <span className="text-zinc-400">{t("seller.overview.seller_rating", "Note Vendeur")}</span>
            <span className="text-zinc-950">
              {userProfile?.rating !== undefined && userProfile?.rating !== null
                ? `${Number(userProfile.rating).toFixed(1)}/5`
                : t("seller.overview.no_rating", "Aucun avis")}
            </span>
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight rtl:tracking-normal">
            <span className="text-zinc-400">{t("seller.overview.return_rate", "Taux de retour")}</span>
            <span className="text-emerald-500">0.4%</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight rtl:tracking-normal">
            <span className="text-zinc-400">{t("seller.overview.shipping_delay", "Délai d'expédition")}</span>
            <span className="text-zinc-950">{t("seller.overview.delay_val", "1.2 jours")}</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-50 w-full">
          <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
            {t("seller.overview.top_5", '"Votre boutique est dans le top 5% des vendeurs OLMART."')}
          </p>
        </div>
      </div>
    </div>
  );
};
