import React from "react";
import { Route } from "react-router-dom";
import { AppGuard } from "../components/AppGuard";
import { ROLES } from "../constants/roles";
import { lazyWithRetry } from "../utils/lazyWithRetry";

const BuyerDashboard = lazyWithRetry(
  () => import("../pages/BuyerDashboard").then((m) => m.BuyerDashboard),
  "BuyerDashboard"
);
const OrderDetails = React.lazy(() =>
  import("../pages/Public/OrderDetails").then((m) => ({ default: m.OrderDetails }))
);

export const renderBuyerRoutes = () => (
  <>
    <Route
      path="/dashboard/buyer"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <BuyerDashboard />
        </AppGuard>
      }
    />
    <Route
      path="/dashboard/buyer/order/:id"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <OrderDetails />
        </AppGuard>
      }
    />
    <Route
      path="/orders/:id"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <OrderDetails />
        </AppGuard>
      }
    />
    <Route
      path="/order/:id"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <OrderDetails />
        </AppGuard>
      }
    />
  </>
);
