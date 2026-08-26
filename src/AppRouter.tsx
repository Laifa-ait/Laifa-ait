import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import { PageLoader } from "./components/ui/PageLoader";
import { lazyWithRetry } from "./utils/lazyWithRetry";

// Public Pages (Lazy Loaded)
const Home = lazyWithRetry(() => import("./pages/Public/Home").then((m) => m.Home), "Home");
const Shop = lazyWithRetry(() => import("./pages/Public/Shop").then((m) => m.Shop), "Shop");
const ProductDetails = lazyWithRetry(
  () => import("./pages/Public/ProductDetails").then((m) => m.ProductDetails),
  "ProductDetails"
);
const Auth = lazyWithRetry(() => import("./pages/Public/Auth").then((m) => m.Auth), "Auth");
const Cart = lazyWithRetry(() => import("./pages/Public/Cart").then((m) => m.Cart), "Cart");
const Checkout = lazyWithRetry(() => import("./pages/Public/Checkout").then((m) => m.Checkout), "Checkout");
const BuyerDashboard = lazyWithRetry(
  () => import("./pages/BuyerDashboard").then((m) => m.BuyerDashboard),
  "BuyerDashboard"
);
const PrivacyPolicy = lazyWithRetry(
  () => import("./pages/Public/PrivacyPolicy").then((m) => m.PrivacyPolicy),
  "PrivacyPolicy"
);
const RefundPolicy = lazyWithRetry(
  () => import("./pages/Public/RefundPolicy").then((m) => m.RefundPolicy),
  "RefundPolicy"
);
const Support = lazyWithRetry(() => import("./pages/Public/Support").then((m) => m.Support), "Support");
const MobileCategories = lazyWithRetry(() => import("./components/MobileCategories"), "MobileCategories");

// Modular Dashboards
const SellerDashboardLayout = React.lazy(() =>
  import("./pages/Seller/SellerDashboardLayout").then((module) => ({
    default: module.SellerDashboardLayout,
  }))
);
const SellerOverview = React.lazy(() =>
  import("./pages/Seller/Overview").then((module) => ({
    default: module.Overview,
  }))
);
const SellerAnalytics = React.lazy(() =>
  import("./pages/Seller/SellerAnalytics").then((module) => ({
    default: module.SellerAnalytics,
  }))
);
const Catalog = React.lazy(() =>
  import("./pages/Seller/Catalog").then((module) => ({
    default: module.Catalog,
  }))
);
const SellerOrders = React.lazy(() =>
  import("./pages/Seller/Orders").then((module) => ({
    default: module.Orders,
  }))
);
const SellerShipping = React.lazy(() =>
  import("./pages/Seller/SellerShipping").then((module) => ({
    default: module.SellerShipping,
  }))
);
const ReturnManagement = React.lazy(() =>
  import("./pages/Seller/ReturnManagement").then((module) => ({
    default: module.ReturnManagement,
  }))
);
const Verification = React.lazy(() =>
  import("./pages/Seller/Verification").then((module) => ({
    default: module.Verification,
  }))
);
const ShopSettings = React.lazy(() =>
  import("./pages/Seller/ShopSettings").then((module) => ({
    default: module.ShopSettings,
  }))
);
const SellerDisputes = React.lazy(() =>
  import("./pages/Seller/Disputes").then((module) => ({
    default: module.SellerDisputes,
  }))
);

const SellerSupport = React.lazy(() =>
  import("./pages/Seller/Support").then((module) => ({
    default: module.Support,
  }))
);
const SellerReviews = React.lazy(() =>
  import("./pages/Seller/Reviews").then((module) => ({
    default: module.SellerReviews,
  }))
);
const SellerSponsorships = React.lazy(() =>
  import("./pages/Seller/Sponsorships").then((module) => ({
    default: module.SellerSponsorships,
  }))
);

const AdminDashboardLayout = React.lazy(() =>
  import("./pages/Admin/AdminDashboardLayout").then((module) => ({
    default: module.AdminDashboardLayout,
  }))
);
const AdminOverview = React.lazy(() =>
  import("./pages/Admin/Overview").then((module) => ({
    default: module.Overview,
  }))
);
const SystemHealth = React.lazy(() =>
  import("./pages/Admin/SystemHealth").then((module) => ({
    default: module.SystemHealth,
  }))
);
const SellerModeration = React.lazy(() =>
  import("./pages/Admin/SellerModeration").then((module) => ({
    default: module.SellerModeration,
  }))
);
const ProductModeration = React.lazy(() =>
  import("./pages/Admin/ProductModeration").then((module) => ({
    default: module.ProductModeration,
  }))
);
const Curation = React.lazy(() =>
  import("./pages/Admin/Curation").then((module) => ({
    default: module.Curation,
  }))
);
const SponsorshipsAdmin = React.lazy(() =>
  import("./pages/Admin/SponsorshipsAdmin").then((module) => ({
    default: module.SponsorshipsAdmin,
  }))
);
const DBSeedAdmin = React.lazy(() =>
  import("./pages/Admin/DBSeedAdmin").then((module) => ({
    default: module.DBSeedAdmin,
  }))
);
const Marketing = React.lazy(() =>
  import("./pages/Admin/Marketing").then((module) => ({
    default: module.Marketing,
  }))
);
const Newsletter = React.lazy(() =>
  import("./pages/Admin/Newsletter").then((module) => ({
    default: module.Newsletter,
  }))
);
const MegaMenuSettings = React.lazy(() =>
  import("./pages/Admin/MegaMenuSettings").then((module) => ({
    default: module.MegaMenuSettings,
  }))
);
const BannerAdmin = React.lazy(() =>
  import("./pages/Admin/BannerAdmin").then((module) => ({
    default: module.BannerAdmin,
  }))
);
const HomepageBuilder = React.lazy(() =>
  import("./pages/Admin/HomepageBuilder").then((module) => ({
    default: module.HomepageBuilder,
  }))
);
const ShopsAdmin = React.lazy(() =>
  import("./pages/Admin/ShopsAdmin").then((module) => ({
    default: module.ShopsAdmin,
  }))
);
const SupportAdmin = React.lazy(() =>
  import("./pages/Admin/Support").then((module) => ({
    default: module.SupportAdmin,
  }))
);
const DisputeManagement = React.lazy(() =>
  import("./pages/Admin/DisputeManagement").then((module) => ({
    default: module.DisputeManagement,
  }))
);
const LaunchChecklistAdmin = React.lazy(() =>
  import("./pages/Admin/LaunchChecklistAdmin").then((module) => ({
    default: module.LaunchChecklistAdmin,
  }))
);
const CheckoutAuditAdmin = React.lazy(() =>
  import("./pages/Admin/CheckoutAuditAdmin").then((module) => ({
    default: module.CheckoutAuditAdmin,
  }))
);
const SearchIndexAdmin = React.lazy(() =>
  import("./pages/Admin/SearchIndexAdmin").then((module) => ({
    default: module.SearchIndexAdmin,
  }))
);
const CategoriesAdmin = React.lazy(() =>
  import("./pages/Admin/Categories").then((module) => ({
    default: module.CategoriesAdmin,
  }))
);
const SettingsAdmin = React.lazy(() =>
  import("./pages/Admin/SettingsAdmin").then((module) => ({
    default: module.SettingsAdmin,
  }))
);
const UsersAdmin = React.lazy(() =>
  import("./pages/Admin/UsersAdmin").then((module) => ({
    default: module.UsersAdmin,
  }))
);
const AuditLogsAdmin = React.lazy(() =>
  import("./pages/Admin/AuditLogsAdmin").then((module) => ({
    default: module.AuditLogsAdmin,
  }))
);
const TranslationAdmin = React.lazy(() =>
  import("./pages/Admin/TranslationAdmin").then((module) => ({
    default: module.TranslationAdmin,
  }))
);
const AgentsAdmin = React.lazy(() =>
  import("./pages/Admin/AgentsAdmin").then((module) => ({
    default: module.AgentsAdmin,
  }))
);
const SiteLogsAdmin = React.lazy(() =>
  import("./pages/Admin/SiteLogsAdmin").then((module) => ({
    default: module.SiteLogsAdmin,
  }))
);
const OrdersAdmin = React.lazy(() =>
  import("./pages/Admin/OrdersAdmin").then((module) => ({
    default: module.OrdersAdmin,
  }))
);
const PromotionsAdmin = React.lazy(() =>
  import("./pages/Admin/PromotionsAdmin").then((module) => ({ default: module.PromotionsAdmin }))
);
const ReviewsAdmin = React.lazy(() =>
  import("./pages/Admin/ReviewsAdmin").then((module) => ({ default: module.ReviewsAdmin }))
);
const PushNotificationsAdmin = React.lazy(() =>
  import("./pages/Admin/PushNotificationsAdmin").then((module) => ({ default: module.PushNotificationsAdmin }))
);
const ReportsAdmin = React.lazy(() =>
  import("./pages/Admin/ReportsAdmin").then((module) => ({ default: module.ReportsAdmin }))
);
const UniversAdmin = React.lazy(() =>
  import("./pages/Admin/UniversAdmin").then((module) => ({ default: module.UniversAdmin }))
);

const StoreProfile = React.lazy(() =>
  import("./pages/Public/StoreProfile").then((module) => ({
    default: module.StoreProfile,
  }))
);

const OlmaBricolage = React.lazy(() =>
  import("./pages/Public/OlmaBricolage").then((module) => ({
    default: module.OlmaBricolage,
  }))
);

// Olma Immo & Location Module
const OlmaImmoHome = React.lazy(() =>
  import("./pages/OlmaImmo/OlmaImmoHome").then((m) => ({ default: m.OlmaImmoHome }))
);
const PropertyDetail = React.lazy(() =>
  import("./pages/OlmaImmo/PropertyDetail").then((m) => ({ default: m.PropertyDetail }))
);
const PropertyOwnerDashboard = React.lazy(() =>
  import("./pages/OlmaImmo/PropertyOwnerDashboard").then((m) => ({ default: m.PropertyOwnerDashboard }))
);
const PropertyEditor = React.lazy(() =>
  import("./pages/OlmaImmo/PropertyEditor").then((m) => ({ default: m.PropertyEditor }))
);
const MyBookings = React.lazy(() =>
  import("./pages/OlmaImmo/MyBookings").then((m) => ({ default: m.MyBookings }))
);
const OlmaImmoProfile = React.lazy(() =>
  import("./pages/OlmaImmo/OlmaImmoProfile").then((m) => ({ default: m.OlmaImmoProfile }))
);
const BricolageProfile = React.lazy(() =>
  import("./pages/Public/BricolageProfile").then((m) => ({ default: m.BricolageProfile }))
);

const ProductFilterPage = React.lazy(() =>
  import("./pages/Public/ProductFilterPage").then((m) => ({
    default: m.ProductFilterPage,
  }))
);
const CampaignCollection = React.lazy(() =>
  import("./pages/Public/CampaignCollection").then((m) => ({
    default: m.CampaignCollection,
  }))
);
const CampaignPage = React.lazy(() =>
  import("./pages/Public/CampaignPage").then((m) => ({
    default: m.CampaignPage,
  }))
);
const TagCollectionPage = React.lazy(() =>
  import("./pages/Public/TagCollectionPage").then((m) => ({
    default: m.TagCollectionPage,
  }))
);
const PremiumCollection = React.lazy(() =>
  import("./pages/Public/PremiumCollection").then((m) => ({
    default: m.PremiumCollection,
  }))
);
const DynamicCollectionPage = React.lazy(() =>
  import("./pages/Public/DynamicCollectionPage").then((m) => ({
    default: m.DynamicCollectionPage,
  }))
);
const FeaturedProducts = React.lazy(() =>
  import("./pages/Public/FeaturedProducts").then((m) => ({
    default: m.FeaturedProducts,
  }))
);
const ShippingCalculatorPage = React.lazy(() =>
  import("./pages/Public/ShippingCalculatorPage").then((m) => ({
    default: m.ShippingCalculatorPage,
  }))
);
const ShopsDirectory = React.lazy(() =>
  import("./pages/Public/ShopsDirectory").then((m) => ({
    default: m.ShopsDirectory,
  }))
);

const ComparatorPage = React.lazy(() =>
  import("./pages/Public/ComparatorPage").then((m) => ({
    default: m.ComparatorPage,
  }))
);

const OrderDetails = React.lazy(() =>
  import("./pages/Public/OrderDetails").then((m) => ({
    default: m.OrderDetails,
  }))
);
const VerifyEmail = React.lazy(() =>
  import("./pages/Public/VerifyEmail").then((m) => ({
    default: m.VerifyEmail,
  }))
);
const Onboarding = React.lazy(() => import("./pages/Public/Onboarding").then((m) => ({ default: m.Onboarding })));
const SellerOnboarding = React.lazy(() => import("./pages/Public/SellerOnboarding").then((m) => ({ default: m.SellerOnboarding })));
const ForgotPassword = React.lazy(() =>
  import("./pages/Public/ForgotPassword").then((m) => ({
    default: m.ForgotPassword,
  }))
);
const NotFound = React.lazy(() =>
  import("./pages/Public/NotFound").then((m) => ({
    default: m.NotFound,
  }))
);

import { Layout } from "./components/Layout/Layout";
import { AppGuard } from "./components/AppGuard";
import { ROLES } from "./constants/roles";

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  if (isDashboard) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

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
            {/* PUBLIC ROUTES BUT SUBJECT TO GLOBAL GUARD IF LOGGED IN */}
            <Route element={<AppGuard requireAuth={false} />}>
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <Home />
                  </PageWrapper>
                }
              />
              <Route
                path="/univers/:categorySlug"
                element={<Navigate to="/shop" replace />}
              />
              <Route
                path="/shop"
                element={
                  <PageWrapper>
                    <Shop />
                  </PageWrapper>
                }
              />
              <Route
                path="/store/:sellerId"
                element={
                  <PageWrapper>
                    <StoreProfile />
                  </PageWrapper>
                }
              />
              <Route
                path="/catalogue/:tagSlug"
                element={
                  <PageWrapper>
                    <ProductFilterPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/premium-collection"
                element={
                  <PageWrapper>
                    <PremiumCollection />
                  </PageWrapper>
                }
              />
              <Route
                path="/collection/:collectionName"
                element={
                  <PageWrapper>
                    <DynamicCollectionPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/featured"
                element={
                  <PageWrapper>
                    <FeaturedProducts />
                  </PageWrapper>
                }
              />
              <Route
                path="/campaign-collection/:bannerId"
                element={
                  <PageWrapper>
                    <CampaignCollection />
                  </PageWrapper>
                }
              />
              <Route
                path="/campaign/:bannerId"
                element={
                  <PageWrapper>
                    <CampaignPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/tags/:tagId"
                element={
                  <PageWrapper>
                    <TagCollectionPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/compare"
                element={
                  <PageWrapper>
                    <ComparatorPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <PageWrapper>
                    <ProductDetails />
                  </PageWrapper>
                }
              />
              <Route
                path="/auth"
                element={
                  <PageWrapper>
                    <Auth />
                  </PageWrapper>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PageWrapper>
                    <ForgotPassword />
                  </PageWrapper>
                }
              />
              <Route
                path="/cart"
                element={
                  <PageWrapper>
                    <Cart />
                  </PageWrapper>
                }
              />
              <Route
                path="/privacy-policy"
                element={
                  <PageWrapper>
                    <PrivacyPolicy />
                  </PageWrapper>
                }
              />
              <Route
                path="/refund-policy"
                element={
                  <PageWrapper>
                    <RefundPolicy />
                  </PageWrapper>
                }
              />
              <Route
                path="/support"
                element={
                  <PageWrapper>
                    <Support />
                  </PageWrapper>
                }
              />
              <Route
                path="/categories"
                element={
                  <PageWrapper>
                    <MobileCategories />
                  </PageWrapper>
                }
              />
              <Route
                path="/bricolage"
                element={
                  <PageWrapper>
                    <OlmaBricolage />
                  </PageWrapper>
                }
              />
              <Route path="/services/bricolage" element={<Navigate to="/bricolage" replace />} />

              {/* Olma Immo & Location Routes */}
              <Route
                path="/immo"
                element={
                  <PageWrapper>
                    <OlmaImmoHome />
                  </PageWrapper>
                }
              />
              <Route
                path="/immo/property/:id"
                element={
                  <PageWrapper>
                    <PropertyDetail />
                  </PageWrapper>
                }
              />
              <Route
                path="/immo/owner"
                element={
                  <PageWrapper>
                    <PropertyOwnerDashboard />
                  </PageWrapper>
                }
              />
              <Route
                path="/immo/publish"
                element={
                  <PageWrapper>
                    <PropertyEditor />
                  </PageWrapper>
                }
              />
              <Route
                path="/immo/edit/:id"
                element={
                  <PageWrapper>
                    <PropertyEditor />
                  </PageWrapper>
                }
              />
              <Route
                path="/immo/my-bookings"
                element={
                  <PageWrapper>
                    <MyBookings />
                  </PageWrapper>
                }
              />
              <Route
                path="/immo/profile"
                element={
                  <PageWrapper>
                    <OlmaImmoProfile />
                  </PageWrapper>
                }
              />
              <Route
                path="/bricolage/profile"
                element={
                  <PageWrapper>
                    <BricolageProfile />
                  </PageWrapper>
                }
              />
              <Route
                path="/shipping-calculator"
                element={
                  <PageWrapper>
                    <ShippingCalculatorPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/shops"
                element={
                  <PageWrapper>
                    <ShopsDirectory />
                  </PageWrapper>
                }
              />
              <Route path="/search" element={<Navigate to="/shop" replace />} />

              <Route
                path="/verify-email"
                element={
                  <PageWrapper>
                    <VerifyEmail />
                  </PageWrapper>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <PageWrapper>
                    <Onboarding />
                  </PageWrapper>
                }
              />
              <Route
                path="/seller-onboarding"
                element={
                  <PageWrapper>
                    <SellerOnboarding />
                  </PageWrapper>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PageWrapper>
                    <Checkout />
                  </PageWrapper>
                }
              />
            </Route>

            {/* PROTECTED ROUTES */}
            <Route element={<AppGuard requireAuth={true} />}>
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

              {/* Seller Dashboard (Modular) */}
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
              </Route>

              {/* Admin Dashboard (Modular) */}
              <Route
                path="/dashboard/admin"
                element={
                  <AppGuard allowedRoles={[ROLES.ADMIN]}>
                    <AdminDashboardLayout />
                  </AppGuard>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="health" element={<SystemHealth />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="promotions" element={<PromotionsAdmin />} />
                <Route path="reviews" element={<ReviewsAdmin />} />
                <Route path="push-notifications" element={<PushNotificationsAdmin />} />
                <Route path="reports" element={<ReportsAdmin />} />
                <Route path="sellers" element={<SellerModeration />} />
                <Route path="products-moderation" element={<ProductModeration />} />
                <Route path="curation" element={<Curation />} />
                <Route path="sponsorships" element={<SponsorshipsAdmin />} />
                <Route path="seed" element={<DBSeedAdmin />} />
                <Route path="disputes" element={<DisputeManagement />} />
                <Route path="marketing" element={<Marketing />} />
                <Route path="newsletter" element={<Newsletter />} />
                <Route path="megamenu" element={<MegaMenuSettings />} />
                <Route path="banners" element={<BannerAdmin />} />
                <Route path="homepage" element={<HomepageBuilder />} />
                <Route path="univers" element={<UniversAdmin />} />
                <Route path="shops" element={<ShopsAdmin />} />
                <Route path="support" element={<SupportAdmin />} />
                <Route path="launch-checklist" element={<LaunchChecklistAdmin />} />
                <Route path="checkout-audit" element={<CheckoutAuditAdmin />} />
                <Route path="search-index" element={<SearchIndexAdmin />} />
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
                <Route path="users" element={<UsersAdmin />} />
                <Route path="audit-logs" element={<AuditLogsAdmin />} />
                <Route path="translations" element={<TranslationAdmin />} />
                <Route path="site-logs" element={<SiteLogsAdmin />} />
                <Route path="agents" element={<AgentsAdmin />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </Layout>
  );
};
