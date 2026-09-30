import React from "react";
import { Route } from "react-router-dom";
import { AppGuard } from "../components/AppGuard";
import { ROLES } from "../constants/roles";

const SellerDashboardLayout = React.lazy(() =>
  import("../pages/Seller/SellerDashboardLayout").then((m) => ({ default: m.SellerDashboardLayout }))
);
const SellerOverview = React.lazy(() =>
  import("../pages/Seller/Overview").then((m) => ({ default: m.Overview }))
);
const SellerAnalytics = React.lazy(() =>
  import("../pages/Seller/SellerAnalytics").then((m) => ({ default: m.SellerAnalytics }))
);
const Catalog = React.lazy(() =>
  import("../pages/Seller/Catalog").then((m) => ({ default: m.Catalog }))
);
const SellerOrders = React.lazy(() =>
  import("../pages/Seller/Orders").then((m) => ({ default: m.Orders }))
);
const SellerShipping = React.lazy(() =>
  import("../pages/Seller/SellerShipping").then((m) => ({ default: m.SellerShipping }))
);
const ReturnManagement = React.lazy(() =>
  import("../pages/Seller/ReturnManagement").then((m) => ({ default: m.ReturnManagement }))
);
const Verification = React.lazy(() =>
  import("../pages/Seller/Verification").then((m) => ({ default: m.Verification }))
);
const ShopSettings = React.lazy(() =>
  import("../pages/Seller/ShopSettings").then((m) => ({ default: m.ShopSettings }))
);
const SellerDisputes = React.lazy(() =>
  import("../pages/Seller/Disputes").then((m) => ({ default: m.SellerDisputes }))
);
const SellerSupport = React.lazy(() =>
  import("../pages/Seller/Support").then((m) => ({ default: m.Support }))
);
const SellerReviews = React.lazy(() =>
  import("../pages/Seller/Reviews").then((m) => ({ default: m.SellerReviews }))
);
const SellerSponsorships = React.lazy(() =>
  import("../pages/Seller/Sponsorships").then((m) => ({ default: m.SellerSponsorships }))
);
const SellerCoupons = React.lazy(() =>
  import("../pages/Seller/SellerCoupons").then((m) => ({ default: m.SellerCoupons }))
);

export const renderSellerRoutes = () => (
  <Route
    path="/dashboard/seller"
    element={
      <AppGuard allowedRoles={[ROLES.SELLER, ROLES.ADMIN]}>
        <SellerDashboardLayout />
      </AppGuard>
    }
  >
    <Route index element={<SellerOverview />} />
    <Route path="analytics" element={<SellerAnalytics />} />
    <Route path="catalog" element={<Catalog />} />
    <Route path="orders" element={<SellerOrders />} />
    <Route path="shipping" element={<SellerShipping />} />
    <Route path="returns" element={<ReturnManagement />} />
    <Route path="disputes" element={<SellerDisputes />} />
    <Route path="verification" element={<Verification />} />
    <Route path="settings" element={<ShopSettings />} />
    <Route path="support" element={<SellerSupport />} />
    <Route path="reviews" element={<SellerReviews />} />
    <Route path="sponsorships" element={<SellerSponsorships />} />
    <Route path="coupons" element={<SellerCoupons />} />
  </Route>
);
