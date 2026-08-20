import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Store, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerNavItem } from "./SellerNavConfig";
import { User } from "firebase/auth";

interface SellerDesktopSidebarProps {
  navItems: SellerNavItem[];
  currentUser: User | null;
}

export const SellerDesktopSidebar: React.FC<SellerDesktopSidebarProps> = ({
  navItems,
  currentUser,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <aside
      className="w-72 bg-white/70 backdrop-blur-md border-e border-zinc-100/50 sticky top-0 h-screen hidden lg:flex flex-col shrink-0"
      id="seller-desktop-sidebar"
    >
      <div className="p-8 border-b border-zinc-100/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-lg">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">
              {t("OLMA")}
            </h1>
            <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-none">
              {t("Seller Space")}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                isActive
                  ? "bg-[#ea580c] text-white shadow-lg shadow-orange-500/20"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          id="seller-desktop-view-store-btn"
          onClick={() => (currentUser ? navigate(`/store/${currentUser.uid}`) : null)}
          className="w-full flex items-center gap-3 px-5 py-4 mt-2 rounded-2xl text-sm font-sans font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 transition-all cursor-pointer border-none text-start"
        >
          <Store className="w-5 h-5" />
          {t("Voir ma vitrine")}
        </button>

        <button
          type="button"
          id="seller-desktop-home-btn"
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-sans font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all bg-transparent border-none cursor-pointer text-start focus:outline-none"
        >
          <Home className="w-5 h-5" />
          {t("Accueil Olma")}
        </button>
      </nav>

      <div className="p-6 border-t border-zinc-100/50">
        <div className="bg-zinc-100/50 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 text-center">
            {t("Support Vendeur")}
          </p>
          <button
            type="button"
            id="seller-desktop-open-ticket-btn"
            onClick={() => navigate("/dashboard/seller/support")}
            className="w-full bg-white text-zinc-950 py-3 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal shadow-sm hover:bg-zinc-100 transition-colors cursor-pointer border-none"
          >
            {t("Ouvrir un Ticket")}
          </button>
        </div>
      </div>
    </aside>
  );
};
