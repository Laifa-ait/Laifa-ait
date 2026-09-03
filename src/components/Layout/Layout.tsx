import React, { ReactNode, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import { MobileBottomNav } from "../MobileBottomNav";
import { ArtisanMobileBottomNav } from "../artisans/ArtisanMobileBottomNav";
import { CartDrawer } from "../Cart/CartDrawer";
import { WishlistDrawer } from "../Wishlist/WishlistDrawer";
import { ComparatorDrawer } from "../Comparator/ComparatorDrawer";
import { MobileMenu } from "./MobileMenu";
import { useUI } from "../../context/UIContext";
import { SearchOverlay } from "../Search/SearchOverlay";
import { RecentlyViewedDrawer } from "../RecentlyViewed/RecentlyViewedDrawer";
import { useAuth } from "../../context/AuthContext";
import { WifiOff } from "lucide-react";
import { VerificationModal } from "../Auth/VerificationModal";
import { AuthModal } from "../Auth/AuthModal";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const { isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen } = useUI();
  const { currentUser } = useAuth();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"email" | "sms">("email");

  const openVerification = useCallback(async () => {
    try {
      const idToken = await currentUser?.getIdToken();
      const res = await fetch("/api/v1/auth/2fa/send-code", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      setVerificationMethod(data.method || "email");
      setIsVerificationModalOpen(true);
    } catch (e) {
      console.error("Failed to start verification", e);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleOpen2FA = () => {
      openVerification();
    };
    window.addEventListener("open-2fa-modal", handleOpen2FA);
    return () => window.removeEventListener("open-2fa-modal", handleOpen2FA);
  }, [openVerification]);

  const isDashboard =
    location.pathname.startsWith("/dashboard/admin") || location.pathname.startsWith("/dashboard/seller");
  const isAuthPage =
    location.pathname === "/auth" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/verify-email" ||
    location.pathname === "/onboarding";
  const isHomepage = location.pathname === "/";
  const isPremiumCollection = location.pathname.includes("/collection/");

  const isCheckoutPage = location.pathname === "/checkout";
  const isBricolagePage =
    location.pathname.startsWith("/bricolage") ||
    location.pathname.startsWith("/artisans") ||
    location.pathname.startsWith("/services/bricolage");
  const isImmoPage =
    location.pathname.startsWith("/immo") ||
    location.pathname.startsWith("/olma-immo");

  const hideNavigation = isDashboard || isAuthPage;

  if (hideNavigation) {
    return (
      <div
        className={`min-h-screen w-full font-sans selection:bg-rose-200 text-zinc-900 ${i18n.language === "ar" ? "rtl" : "ltr"}`}
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen overflow-x-clip w-full max-w-full text-zinc-900 font-sans selection:bg-rose-200 pb-0 sm:pb-0 ${i18n.language === "ar" ? "rtl" : "ltr"}`}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-white text-zinc-900 px-4 py-2 font-medium rounded-lg shadow-lg border border-zinc-200 outline-none focus:ring-2 focus:ring-teal-500">
        Aller au contenu principal
      </a>

      {!isPremiumCollection && !isCheckoutPage && !isBricolagePage && !isImmoPage && <Navbar />}

      <main id="main-content" className={`min-h-[calc(100vh-200px)] relative ${isBricolagePage ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>

      {isBricolagePage && <ArtisanMobileBottomNav />}

      {!isPremiumCollection && !isCheckoutPage && !isBricolagePage && !isImmoPage && (
        <Footer isHomepage={isHomepage} />
      )}

      {!isPremiumCollection && !isCheckoutPage && !isBricolagePage && !isImmoPage && (
        <MobileBottomNav
          hideOnRoutes={[
            "/checkout",
            "/auth",
            "/onboarding",
            "/verify-email",
            "/forgot-password",
            "/bricolage",
            "/artisans",
            "/services/bricolage",
            "/immo",
            "/olma-immo",
          ]}
        />
      )}

      {!isOnline && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full z-50 flex items-center gap-2 shadow-lg">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Mode hors ligne</span>
        </div>
      )}

      <SearchOverlay />
      <RecentlyViewedDrawer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <ComparatorDrawer />
      <MobileMenu />
      <AuthModal />
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        method={verificationMethod}
      />
    </div>
  );
};
