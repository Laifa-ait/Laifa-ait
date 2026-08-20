import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerUserProfile } from "../../../../types/seller";

interface OverviewHeaderProps {
  userProfile: SellerUserProfile | null;
  outOfStockCount: number;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  userProfile,
  outOfStockCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" id="seller-overview-header">
      <div>
        <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">
          {t("seller.overview.hello", "Bonjour, ")}
          {userProfile?.shopName || userProfile?.displayName}
        </h2>
        <p className="text-zinc-500 font-medium">
          {t("seller.overview.welcome_desc", "Voici ce qui se passe dans votre boutique aujourd'hui.")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {userProfile?.sellerTrustScore !== undefined && (
          <div
            className="flex items-center gap-2 p-1 bg-white border border-zinc-100 rounded-2xl shadow-sm cursor-help"
            title={t(
              "seller.overview.trust_score_desc",
              "Votre Trust Score garantit votre visibilité sur Olmart. Une plainte ou communication hors-ligne peut le faire baisser."
            )}
            id="seller-trust-score-card"
          >
            <span
              className={`p-3 rounded-xl ${
                userProfile.sellerTrustScore >= 80
                  ? "bg-emerald-50 text-emerald-500"
                  : userProfile.sellerTrustScore >= 50
                  ? "bg-amber-50 text-amber-500"
                  : "bg-red-50 text-red-500"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div className="pe-4 py-2 text-start">
              <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-none mb-1">
                {t("seller.overview.trust_score", "Trust Score")}
              </p>
              <p
                className={`text-[10px] font-black uppercase tracking-wider rtl:tracking-normal ${
                  userProfile.sellerTrustScore >= 80
                    ? "text-emerald-700"
                    : userProfile.sellerTrustScore >= 50
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
              >
                {userProfile.sellerTrustScore} / 100
              </p>
            </div>
          </div>
        )}
        {outOfStockCount > 0 && (
          <div className="flex items-center gap-2 p-1 bg-white border border-zinc-100 rounded-2xl shadow-sm" id="seller-stock-alert-card">
            <span className="p-3 bg-red-50 text-red-500 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div className="pr-4 py-2">
              <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-none mb-1">
                {t("seller.overview.stock_alert", "Alerte Stock")}
              </p>
              <p className="text-[10px] font-sans font-bold text-zinc-900 uppercase">
                {outOfStockCount} {t("seller.overview.item", "Article")}
                {outOfStockCount > 1 ? "s " : " "}
                {t("seller.overview.out_of_stock", "en rupture")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
