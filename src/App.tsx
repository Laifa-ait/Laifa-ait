/**
 * OLMART — Design System Reference
 * @see DESIGN_SYSTEM.md at the root of the project
 * Colors: primary=#f97316, bg=#f9f4e8, surface=#ffffff
 * Icons: lucide-react only
 */

import React, { useEffect } from "react";
import { Toaster } from "sonner";
import { AppRouter } from "./AppRouter";
import { InstallPrompt } from "./components/InstallPrompt";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MetaTags } from "./components/MetaTags";
import { GlobalSearchModal } from "./components/common/GlobalSearchModal";

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      if (!lng) return;
      const cleanLng = lng.split("-")[0];
      document.documentElement.dir = cleanLng === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = cleanLng;
    };

    i18n.on("languageChanged", handleLangChange);
    handleLangChange(i18n.language || "fr");

    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, [i18n]);

  return (
    <ErrorBoundary>
      <MetaTags 
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Olma Marketplace",
          "url": "https://olma-dz.com",
          "logo": "https://olma-dz.com/assets/icon.png",
          "sameAs": [
            "https://facebook.com/olmadz",
            "https://instagram.com/olmadz"
          ]
        }}
      />
      <AppRouter />
      <GlobalSearchModal />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        theme="system"
        toastOptions={{
          style: {
            fontFamily: "inherit",
            borderRadius: "0.75rem",
          }
        }}
      />
      <InstallPrompt />
    </ErrorBoundary>
  );
};

export default App;
