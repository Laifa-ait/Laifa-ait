import React from "react";
import { Store, MapPin, ShieldCheck, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShopsStatsProps {
  totalShops: number;
  wilayaCount: number;
}

export const ShopsStats: React.FC<ShopsStatsProps> = ({ totalShops, wilayaCount }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const stats = [
    {
      icon: Store,
      title: totalShops > 0 ? `${totalShops}+` : "500+",
      subtitle: isArabic ? "متجر نشط ومرخص" : "Boutiques Actives",
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      icon: MapPin,
      title: wilayaCount > 0 ? `${wilayaCount} Wilayas` : "58 Wilayas",
      subtitle: isArabic ? "تغطية كامل التراب الوطني" : "Couverture Nationale",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      icon: ShieldCheck,
      title: "100% Verified",
      subtitle: isArabic ? "متاجر موثوقة ومفعلة" : "Vendeurs Certifiés",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      icon: MessageSquare,
      title: isArabic ? "تواصل مباشر" : "Vente Directe",
      subtitle: isArabic ? "تواصل وتأكيد مباشر مع البائع" : "Contact Direct Vendeur",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3 hover:border-teal-200 transition-colors"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {item.title}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1">
                {item.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
