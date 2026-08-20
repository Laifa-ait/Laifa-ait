import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

export const SellerMobileBottomNav: React.FC = () => {
  const { t } = useTranslation();

  const bottomItems = [
    { to: "/dashboard/seller", icon: LayoutDashboard, label: t("Vue", "Vue"), end: true },
    { to: "/dashboard/seller/orders", icon: ShoppingBag, label: t("Commandes", "Commandes") },
    { to: "/dashboard/seller/catalog", icon: Package, label: t("Catalogue", "Catalogue") },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-zinc-200/80 px-4 py-2 flex items-center justify-around lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      id="seller-mobile-bottom-nav"
    >
      {bottomItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? "text-[#ea580c]" : "text-zinc-400 hover:text-zinc-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? "bg-orange-50" : ""}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-sans font-bold">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};
