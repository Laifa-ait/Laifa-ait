import "./utils/suppressWarnings";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./config/sentry";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ShopProvider } from "./context/ShopContext";
import { UIProvider } from "./context/UIContext";
import { MegaMenuProvider } from "./context/MegaMenuContext";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes (garbage collection time)
      refetchOnWindowFocus: false, // Prevent redundant background network calls on window/tab focus
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

if ("serviceWorker" in navigator) {
  const isDevOrPreview =
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1") ||
    window.location.hostname.includes("-dev-") ||
    window.location.hostname.includes("-pre-") ||
    window.location.hostname.includes(".run.app") ||
    import.meta.env.DEV;

  if (!isDevOrPreview) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          if (registration.active?.scriptURL.includes('sw.js') && !registration.active?.scriptURL.includes('firebase')) {
            registration.unregister();
          }
        }
      });
    });
  } else {
    // Clean up active service workers in development/preview to prevent stale bundle load / white screen blocks
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          if ("caches" in window) {
            caches.keys().then((keys) => {
              keys.forEach((key) => caches.delete(key));
            });
          }
        });
      }
    });
  }
}

import { setupErrorAgent, logReactErrorBoundary } from "./utils/errorAgent";
import { trackPerformance } from "./utils/performance";
import { useTranslation } from "react-i18next";

// Initialize the global error agent
setupErrorAgent();

// Track RUM performance metrics
trackPerformance();

const I18nLoader = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        color: "#0f172a",
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500">Chargement...</span>
      </div>
    </div>
  );
};

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const errorMessage = error instanceof Error ? error.message : String(error || "Erreur inattendue");
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        color: "#0f172a",
        fontWeight: 600,
        padding: "20px",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Erreur inattendue</h2>
      <p style={{ marginBottom: "24px", opacity: 0.8, color: "#ef4444" }}>{errorMessage}</p>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: "10px 24px",
          backgroundColor: "#0f172a",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Rafraîchir
      </button>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={logReactErrorBoundary}
    >
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<I18nLoader />}>
          <HelmetProvider>
            <BrowserRouter>
              <AuthProvider>
                <ShopProvider>
                  <CartProvider>
                    <UIProvider>
                      <MegaMenuProvider>
                        <App />
                        <Toaster
                          position="top-center"
                          toastOptions={{
                            duration: 4000,
                            style: {
                              background: "#18181b",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: 700,
                              borderRadius: "16px",
                              letterSpacing: "0.025em",
                              textTransform: "uppercase",
                              border: "1px solid rgba(255,255,255,0.1)",
                            },
                          }}
                        />
                      </MegaMenuProvider>
                    </UIProvider>
                  </CartProvider>
                </ShopProvider>
              </AuthProvider>
            </BrowserRouter>
          </HelmetProvider>
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
