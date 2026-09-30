import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";

import { PageLoader } from "./components/ui/PageLoader";
import { Layout } from "./components/Layout/Layout";
import { AppGuard } from "./components/AppGuard";

import { renderPublicRoutes } from "./routes/PublicRoutes";
import { renderEcosystemRoutes } from "./routes/EcosystemRoutes";
import { renderBuyerRoutes } from "./routes/BuyerRoutes";
import { renderSellerRoutes } from "./routes/SellerRoutes";
import { renderAdminRoutes } from "./routes/AdminRoutes";

const NotFound = React.lazy(() =>
  import("./pages/Public/NotFound").then((m) => ({ default: m.NotFound }))
);

export const AppRouter: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* PUBLIC STOREFRONT & ECOSYSTEM ROUTES */}
            <Route element={<AppGuard requireAuth={false} />}>
              {renderPublicRoutes()}
              {renderEcosystemRoutes()}
            </Route>

            {/* PROTECTED AUTHENTICATED DASHBOARDS */}
            <Route element={<AppGuard requireAuth={true} />}>
              {renderBuyerRoutes()}
              {renderSellerRoutes()}
              {renderAdminRoutes()}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </Layout>
  );
};
