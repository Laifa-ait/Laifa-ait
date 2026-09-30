import React from "react";
import { Route, Navigate } from "react-router-dom";
import { PageWrapper } from "../components/common/PageWrapper";

// Artisans & Bricolage Pages
const ArtisansHome = React.lazy(() => import("../pages/Artisans/ArtisansHome").then((m) => ({ default: m.ArtisansHome })));
const ArtisanDetailPage = React.lazy(() => import("../pages/Artisans/ArtisanDetailPage").then((m) => ({ default: m.ArtisanDetailPage })));
const ArtisanApplyPage = React.lazy(() => import("../pages/Artisans/ArtisanApplyPage").then((m) => ({ default: m.ArtisanApplyPage })));
const ArtisanDashboardPage = React.lazy(() => import("../pages/Artisans/ArtisanDashboardPage").then((m) => ({ default: m.ArtisanDashboardPage })));
const ClientArtisanQuotesPage = React.lazy(() => import("../pages/Artisans/ClientArtisanQuotesPage").then((m) => ({ default: m.ClientArtisanQuotesPage })));
const ArtisanBroadcastsPage = React.lazy(() => import("../pages/Artisans/ArtisanBroadcastsPage").then((m) => ({ default: m.ArtisanBroadcastsPage })));

// Olma Immo Pages
const OlmaImmoHome = React.lazy(() => import("../pages/OlmaImmo/OlmaImmoHome").then((m) => ({ default: m.OlmaImmoHome })));
const PropertyDetail = React.lazy(() => import("../pages/OlmaImmo/PropertyDetail").then((m) => ({ default: m.PropertyDetail })));
const PropertyOwnerDashboard = React.lazy(() => import("../pages/OlmaImmo/PropertyOwnerDashboard").then((m) => ({ default: m.PropertyOwnerDashboard })));
const PropertyEditor = React.lazy(() => import("../pages/OlmaImmo/PropertyEditor").then((m) => ({ default: m.PropertyEditor })));
const MyBookings = React.lazy(() => import("../pages/OlmaImmo/MyBookings").then((m) => ({ default: m.MyBookings })));
const OlmaImmoProfile = React.lazy(() => import("../pages/OlmaImmo/OlmaImmoProfile").then((m) => ({ default: m.OlmaImmoProfile })));

export const renderEcosystemRoutes = () => (
  <>
    {/* Artisans Ecosystem Routes */}
    <Route path="/bricolage" element={<PageWrapper><ArtisansHome /></PageWrapper>} />
    <Route path="/artisans" element={<PageWrapper><ArtisansHome /></PageWrapper>} />
    <Route path="/artisans/profile/:id" element={<PageWrapper><ArtisanDetailPage /></PageWrapper>} />
    <Route path="/artisans/devenir-artisan" element={<PageWrapper><ArtisanApplyPage /></PageWrapper>} />
    <Route path="/artisans/dashboard" element={<PageWrapper><ArtisanDashboardPage /></PageWrapper>} />
    <Route path="/artisans/mes-demandes" element={<PageWrapper><ClientArtisanQuotesPage /></PageWrapper>} />
    <Route path="/artisans/annonces" element={<PageWrapper><ArtisanBroadcastsPage /></PageWrapper>} />
    <Route path="/bricolage/profile" element={<Navigate to="/artisans/dashboard" replace />} />
    <Route path="/services/bricolage" element={<Navigate to="/artisans" replace />} />

    {/* Olma Immo & Location Routes */}
    <Route path="/immo" element={<PageWrapper><OlmaImmoHome /></PageWrapper>} />
    <Route path="/immo/property/:id" element={<PageWrapper><PropertyDetail /></PageWrapper>} />
    <Route path="/immo/owner" element={<PageWrapper><PropertyOwnerDashboard /></PageWrapper>} />
    <Route path="/immo/publish" element={<PageWrapper><PropertyEditor /></PageWrapper>} />
    <Route path="/immo/edit/:id" element={<PageWrapper><PropertyEditor /></PageWrapper>} />
    <Route path="/immo/my-bookings" element={<PageWrapper><MyBookings /></PageWrapper>} />
    <Route path="/immo/profile" element={<PageWrapper><OlmaImmoProfile /></PageWrapper>} />
  </>
);
