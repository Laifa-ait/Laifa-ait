# Olmart Firestore Indexes Configuration

This document specifies the required composite indexes deployed in `firestore.indexes.json` across all domains (Marketplace, Logistics/Orders, Authentication/Security, Real Estate Olma Immo, and Unified Messaging).

---

## 📋 Comprehensive Composite Indexes Directory

### 1. 🔐 Security & Identity (`login_history`, `users`)
- `login_history`: `userId` (ASC), `timestamp` (DESC) — Fast paginated user connection log lookups.
- `users`: `role` (ASC), `createdAt` (DESC) — Filter users by role with chronological sort.
- `users`: `status` (ASC), `createdAt` (DESC) — Filter pending/active accounts chronologically.
- `users`: `role` (ASC), `status` (ASC), `createdAt` (DESC) — Targeted admin seller onboarding queues.
- `users`: `role` (ASC), `totalRevenue` (DESC) — Top seller and artisan leaderboards.

### 2. 🛍️ Marketplace Catalog (`products`)
- `products`: `sellerId` (ASC), `createdAt` (DESC) — Seller store product inventory view.
- `products`: `status` (ASC), `createdAt` (DESC) — Moderation queue and published product feeds.

### 3. 📦 Orders & Transactions (`orders`)
- `orders`: `status` (ASC), `createdAt` (DESC) — Order fulfillment pipeline by status.
- `orders`: `userId` (ASC), `createdAt` (DESC) — Buyer order history.
- `orders`: `sellerId` (ASC), `createdAt` (DESC) — Single-seller direct order lookups.
- `orders`: `userId` (ASC), `status` (ASC), `createdAt` (DESC) — Buyer filtered order history.
- `orders`: `sellerId` (ASC), `status` (ASC), `createdAt` (DESC) — Seller filtered orders.
- `orders`: `sellerIds` (CONTAINS / Array), `createdAt` (DESC) — Multi-seller split order routing and velocity checks.

### 4. 🏢 Real Estate (`real_estate_properties`, `real_estate_bookings`, `real_estate_visits`)
- `real_estate_properties`: `status` (ASC), `location.geohash` (ASC) — Geospatial bounding box searches.
- `real_estate_properties`: `status` (ASC), `location.wilaya` (ASC), `createdAt` (DESC) — Regional listing searches.
- `real_estate_properties`: `status` (ASC), `propertyType` (ASC), `createdAt` (DESC) — Type filtering (villa, appartement, etc.).
- `real_estate_properties`: `status` (ASC), `listingType` (ASC), `createdAt` (DESC) — Listing mode (vente, location, etc.).
- `real_estate_properties`: `ownerId` (ASC), `createdAt` (DESC) — Owner properties dashboard.
- `real_estate_properties`: `ownerId` (ASC), `status` (ASC), `createdAt` (DESC) — Owner status-filtered properties.
- `real_estate_bookings`: `propertyId` (ASC), `status` (ASC) — Booking availability checks.
- `real_estate_bookings`: `tenantId` (ASC), `createdAt` (DESC) — Tenant booking history.
- `real_estate_bookings`: `ownerId` (ASC), `createdAt` (DESC) — Owner booking requests.
- `real_estate_visits`: `ownerId` (ASC), `createdAt` (DESC) — Owner property visit schedules.
- `real_estate_visits`: `visitorId` (ASC), `createdAt` (DESC) — Visitor schedule history.

### 5. 💬 Unified Messaging (`conversations`)
- `conversations`: `participants` (CONTAINS / Array), `updatedAt` (DESC) — User inbox message threads.
- `conversations`: `type` (ASC), `updatedAt` (DESC) — Channel filtering (order, support, direct).

---

## 🛠️ How to deploy the indexes

### Method A: Firebase CLI
Deploy the local configuration defined in `firestore.indexes.json`:

```bash
firebase deploy --only firestore:indexes
```

### Method B: Firebase Console Auto-Link
If a complex query fails during runtime, Firestore outputs a direct provisioning URL in the server or browser logs. Clicking this link pre-fills the configuration directly in the Google Cloud / Firebase console.

