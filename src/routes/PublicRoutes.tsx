import React from "react";
import { Route, Navigate } from "react-router-dom";
import { PageWrapper } from "../components/common/PageWrapper";
import { lazyWithRetry } from "../utils/lazyWithRetry";

// Core Public Pages (Lazy Loaded)
const Home = lazyWithRetry(() => import("../pages/Public/Home").then((m) => m.Home), "Home");
const Shop = lazyWithRetry(() => import("../pages/Public/Shop").then((m) => m.Shop), "Shop");
const ProductDetails = lazyWithRetry(() => import("../pages/Public/ProductDetails").then((m) => m.ProductDetails), "ProductDetails");
const Auth = lazyWithRetry(() => import("../pages/Public/Auth").then((m) => m.Auth), "Auth");
const Cart = lazyWithRetry(() => import("../pages/Public/Cart").then((m) => m.Cart), "Cart");
const Checkout = lazyWithRetry(() => import("../pages/Public/Checkout").then((m) => m.Checkout), "Checkout");
const PrivacyPolicy = lazyWithRetry(() => import("../pages/Public/PrivacyPolicy").then((m) => m.PrivacyPolicy), "PrivacyPolicy");
const RefundPolicy = lazyWithRetry(() => import("../pages/Public/RefundPolicy").then((m) => m.RefundPolicy), "RefundPolicy");
const Support = lazyWithRetry(() => import("../pages/Public/Support").then((m) => m.Support), "Support");
const MobileCategories = lazyWithRetry(() => import("../components/MobileCategories"), "MobileCategories");

const StoreProfile = React.lazy(() => import("../pages/Public/StoreProfile").then((m) => ({ default: m.StoreProfile })));
const ProductFilterPage = React.lazy(() => import("../pages/Public/ProductFilterPage").then((m) => ({ default: m.ProductFilterPage })));
const CampaignCollection = React.lazy(() => import("../pages/Public/CampaignCollection").then((m) => ({ default: m.CampaignCollection })));
const CampaignPage = React.lazy(() => import("../pages/Public/CampaignPage").then((m) => ({ default: m.CampaignPage })));
const TagCollectionPage = React.lazy(() => import("../pages/Public/TagCollectionPage").then((m) => ({ default: m.TagCollectionPage })));
const PremiumCollection = React.lazy(() => import("../pages/Public/PremiumCollection").then((m) => ({ default: m.PremiumCollection })));
const DynamicCollectionPage = React.lazy(() => import("../pages/Public/DynamicCollectionPage").then((m) => ({ default: m.DynamicCollectionPage })));
const FeaturedProducts = React.lazy(() => import("../pages/Public/FeaturedProducts").then((m) => ({ default: m.FeaturedProducts })));
const ShippingCalculatorPage = React.lazy(() => import("../pages/Public/ShippingCalculatorPage").then((m) => ({ default: m.ShippingCalculatorPage })));
const ShopsDirectory = React.lazy(() => import("../pages/Public/ShopsDirectory").then((m) => ({ default: m.ShopsDirectory })));
const ComparatorPage = React.lazy(() => import("../pages/Public/ComparatorPage").then((m) => ({ default: m.ComparatorPage })));
const VerifyEmail = React.lazy(() => import("../pages/Public/VerifyEmail").then((m) => ({ default: m.VerifyEmail })));
const Onboarding = React.lazy(() => import("../pages/Public/Onboarding").then((m) => ({ default: m.Onboarding })));
const SellerOnboarding = React.lazy(() => import("../pages/Public/SellerOnboarding").then((m) => ({ default: m.SellerOnboarding })));
const ForgotPassword = React.lazy(() => import("../pages/Public/ForgotPassword").then((m) => ({ default: m.ForgotPassword })));

export const renderPublicRoutes = () => (
  <>
    <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
    <Route path="/univers/:categorySlug" element={<Navigate to="/shop" replace />} />
    <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
    <Route path="/store/:sellerId" element={<PageWrapper><StoreProfile /></PageWrapper>} />
    <Route path="/boutique/:sellerId" element={<PageWrapper><StoreProfile /></PageWrapper>} />
    <Route path="/catalogue/:tagSlug" element={<PageWrapper><ProductFilterPage /></PageWrapper>} />
    <Route path="/premium-collection" element={<PageWrapper><PremiumCollection /></PageWrapper>} />
    <Route path="/collection/:collectionName" element={<PageWrapper><DynamicCollectionPage /></PageWrapper>} />
    <Route path="/featured" element={<PageWrapper><FeaturedProducts /></PageWrapper>} />
    <Route path="/campaign-collection/:bannerId" element={<PageWrapper><CampaignCollection /></PageWrapper>} />
    <Route path="/campaign/:bannerId" element={<PageWrapper><CampaignPage /></PageWrapper>} />
    <Route path="/tags/:tagId" element={<PageWrapper><TagCollectionPage /></PageWrapper>} />
    <Route path="/compare" element={<PageWrapper><ComparatorPage /></PageWrapper>} />
    <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
    <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
    <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
    <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
    <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
    <Route path="/refund-policy" element={<PageWrapper><RefundPolicy /></PageWrapper>} />
    <Route path="/support" element={<PageWrapper><Support /></PageWrapper>} />
    <Route path="/categories" element={<PageWrapper><MobileCategories /></PageWrapper>} />
    <Route path="/shipping-calculator" element={<PageWrapper><ShippingCalculatorPage /></PageWrapper>} />
    <Route path="/shops" element={<PageWrapper><ShopsDirectory /></PageWrapper>} />
    <Route path="/search" element={<Navigate to="/shop" replace />} />
    <Route path="/verify-email" element={<PageWrapper><VerifyEmail /></PageWrapper>} />
    <Route path="/onboarding" element={<PageWrapper><Onboarding /></PageWrapper>} />
    <Route path="/seller-onboarding" element={<PageWrapper><SellerOnboarding /></PageWrapper>} />
    <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
  </>
);
