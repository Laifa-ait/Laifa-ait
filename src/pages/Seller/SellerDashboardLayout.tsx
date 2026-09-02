import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Store, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { getSellerNavItems } from "./components/layout/SellerNavConfig";
import { SellerDashboardAlerts } from "./components/layout/SellerDashboardAlerts";
import { SellerMobileBottomNav } from "./components/layout/SellerMobileBottomNav";
import { SellerMobileDrawer } from "./components/layout/SellerMobileDrawer";
import { SellerDesktopSidebar } from "./components/layout/SellerDesktopSidebar";
import { SellerOnboardingTour } from "./components/SellerOnboardingTour";

export const SellerDashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [forceTour, setForceTour] = useState(false);

  const navItems = getSellerNavItems(t);

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden" id="seller-dashboard-root">
      {/* Interactive Seller Tour */}
      <SellerOnboardingTour
        forceRun={forceTour}
        onTourEnd={() => setForceTour(false)}
      />

      {/* Mobile Top Header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between"
        id="seller-mobile-header"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shadow-md">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950 leading-none">
              {t("OLMA")}
            </h1>
            <p className="text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-0.5">
              {t("Seller Space")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              type="button"
              id="seller-mobile-header-store-btn"
              onClick={() => navigate(`/store/${currentUser.uid}`)}
              className="p-2 rounded-xl text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors border-none cursor-pointer"
            >
              <Store className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            id="seller-mobile-menu-toggle-btn"
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border-none cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <SellerMobileBottomNav />

      {/* Mobile Drawer Navigation */}
      <SellerMobileDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navItems={navItems}
        currentUser={currentUser}
      />

      {/* Desktop Persistent Sidebar */}
      <SellerDesktopSidebar
        navItems={navItems}
        currentUser={currentUser}
        onStartTour={() => setForceTour(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-transparent pt-14 lg:pt-0" id="seller-main-content">
        <div className="p-4 sm:p-8 lg:p-12 space-y-6">
          <SellerDashboardAlerts userProfile={userProfile} />
          <Outlet />
        </div>
      </main>
    </div>
  );
};
