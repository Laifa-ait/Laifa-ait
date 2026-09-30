import React from "react";
import { useTranslation } from "react-i18next";
import { Wrench, Building2, Store, Scale, Truck, Headphones } from "lucide-react";

interface MobileMenuServicesProps {
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export const MobileMenuServices: React.FC<MobileMenuServicesProps> = ({
  onNavigate,
  onClose,
}) => {
  const { t } = useTranslation();

  const services = [
    {
      id: "brico",
      title: "Olma Brico",
      subtitle: "Artisans & Travaux",
      icon: Wrench,
      path: "/bricolage",
      badge: "Artisans",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-500/10",
      borderColor: "hover:border-amber-200",
    },
    {
      id: "immo",
      title: "Olma Immo",
      subtitle: "Location & Vente",
      icon: Building2,
      path: "/immo",
      badge: "Immobilier",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-500/10",
      borderColor: "hover:border-emerald-200",
    },
    {
      id: "shops",
      title: "Boutiques",
      subtitle: "Marques & Stores",
      icon: Store,
      path: "/shops",
      badge: "Officiel",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-500/10",
      borderColor: "hover:border-blue-200",
    },
    {
      id: "comparator",
      title: "Comparateur",
      subtitle: "Prix & Produits",
      icon: Scale,
      path: "/comparator",
      badge: "Top Prix",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-500/10",
      borderColor: "hover:border-purple-200",
    },
  ];

  return (
    <div className="bg-zinc-50/70 p-3 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          {t("Univers & Services Olmart")}
        </span>
        <span className="text-[10px] font-semibold text-zinc-500">
          58 Wilayas
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.path);
                onClose();
              }}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 ${item.borderColor} transition-all text-left rtl:text-right cursor-pointer shadow-2xs group active:scale-98`}
            >
              <div
                className={`w-7.5 h-7.5 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 leading-tight group-hover:text-[#0088A8] transition-colors">
                  {item.title}
                </p>
                <p className="text-[10px] text-zinc-500 font-normal leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200/60">
        <button
          type="button"
          onClick={() => {
            onNavigate("/shipping-calculator");
            onClose();
          }}
          className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-all border border-zinc-200/60 cursor-pointer active:scale-98"
        >
          <Truck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="truncate">{t("Tarifs Livraison")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigate("/support");
            onClose();
          }}
          className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-all border border-zinc-200/60 cursor-pointer active:scale-98"
        >
          <Headphones className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="truncate">{t("Support & Aide")}</span>
        </button>
      </div>
    </div>
  );
};
