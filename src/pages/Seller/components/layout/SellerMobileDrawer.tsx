import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Store, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerNavItem } from "./SellerNavConfig";
import { User } from "firebase/auth";

interface SellerMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: SellerNavItem[];
  currentUser: User | null;
}

export const SellerMobileDrawer: React.FC<SellerMobileDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  currentUser,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 lg:hidden"
            id="seller-mobile-drawer-backdrop"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 start-0 w-[85%] max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            id="seller-mobile-drawer-panel"
          >
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-lg">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">
                    {t("OLMA")}
                  </h1>
                  <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-none">
                    {t("Seller Space")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="seller-mobile-drawer-close-btn"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all ${
                      isActive
                        ? "bg-[#ea580c] text-white shadow-lg shadow-orange-500/15"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    }`
                  }
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </NavLink>
              ))}

              <button
                type="button"
                id="seller-mobile-view-store-btn"
                onClick={() => {
                  onClose();
                  if (currentUser) navigate(`/store/${currentUser.uid}`);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 mt-2 rounded-xl text-xs font-sans font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-all cursor-pointer border-none text-start"
              >
                <Store className="w-4.5 h-4.5" />
                {t("Voir ma vitrine")}
              </button>
            </nav>

            <div className="p-6 border-t border-zinc-50">
              <div className="bg-zinc-50 rounded-2xl p-4">
                <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 text-center">
                  {t("Support Vendeur")}
                </p>
                <button
                  type="button"
                  id="seller-mobile-open-ticket-btn"
                  onClick={() => {
                    onClose();
                    navigate("/dashboard/seller/support");
                  }}
                  className="w-full bg-white text-zinc-950 py-2.5 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal shadow-sm hover:bg-zinc-100 transition-colors border-none cursor-pointer"
                >
                  {t("Ouvrir un Ticket")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
