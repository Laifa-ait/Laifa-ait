import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Users, AlertTriangle, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

export const OverviewQuickActions: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Link
        to="/dashboard/admin/products-moderation"
        className="flex flex-col items-center justify-center p-6 bg-[#ea580c] hover:bg-orange-600 text-white rounded-[2rem] transition-all shadow-md shadow-orange-500/20 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Modération")}
          <br />
          {t("Produits")}
        </span>
      </Link>
      <Link
        to="/dashboard/admin/sellers"
        className="flex flex-col items-center justify-center p-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[2rem] transition-all shadow-md shadow-zinc-900/20 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Users className="w-6 h-6" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Modération")}
          <br />
          {t("Vendeurs")}
        </span>
      </Link>
      <Link
        to="/dashboard/admin/disputes"
        className="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-[2rem] transition-all group"
      >
        <div className="w-12 h-12 rounded-full bg-red-100/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Gérer")}
          <br />
          {t("Litiges")}
        </span>
      </Link>
      <Link
        to="/dashboard/admin/orders"
        className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-[2rem] transition-all group"
      >
        <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <ShoppingCart className="w-6 h-6 text-blue-500" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Toutes")}
          <br />
          {t("Commandes")}
        </span>
      </Link>
    </div>
  );
};
