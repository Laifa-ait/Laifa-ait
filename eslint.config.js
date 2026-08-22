import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        "paths": [{
          "name": "firebase-admin",
          "message": "Importing firebase-admin in the frontend (React components) is strictly forbidden."
        }]
      }],
      "max-lines": ["error", { "max": 250, "skipBlankLines": true, "skipComments": true }]
    }
  },
  {
    files: [
        "src/AppRouter.tsx",
        "src/components/Admin/CouponModal.tsx",
        "src/components/Admin/WorkspaceActions.tsx",
        "src/components/Admin/BannerAdmin/BannerListTable.tsx",
        "src/components/Admin/BannerAdmin/BannerFormModal.tsx",
        "src/components/Admin/BannerAdmin/BannerPreviewModal.tsx",
        "src/components/Admin/BannerAdmin/ElectroConfigForm.tsx",
        "src/components/Admin/HomepageBuilder/CataloguesMarketplace.tsx",
        "src/components/Admin/HomepageBuilder/ItemFormModal.tsx",
        "src/components/Buyer/AddressManager.tsx",
        "src/components/Buyer/CustomerPreferences.tsx",
        "src/components/Buyer/FollowedStores.tsx",
        "src/components/Chat/LiveChatDrawer.tsx",
        "src/components/Home/BentoHero.tsx",
        "src/components/Home/DynamicSection.tsx",
        "src/components/Layout/MobileMenu.tsx",
        "src/components/MegaMenu.tsx",
        "src/components/MobileCategories.tsx",
        "src/components/Navbar.tsx",
        "src/components/NotificationCenter.tsx",
        "src/components/OrderChatBox.tsx",
        "src/components/Product/Details/ProductInfo.tsx",
        "src/components/Search/AdvancedSearchbar.tsx",
        "src/components/Search/SearchOverlay.tsx",
        "src/components/Seller/ShippingLabelPrinter.tsx",
        "src/components/Shop/DynamicFilterPanel.tsx",
        "src/components/ui/BannerCarousel.tsx",
        "src/components/ui/ImageAdjusterModal.tsx",
        "src/constants.tsx",
        "src/context/CartContext.tsx",
        "src/pages/Admin/AgentsAdmin.tsx",
        "src/pages/Admin/BannerAdmin.tsx",
        "src/pages/Admin/CheckoutAuditAdmin.tsx",
        "src/pages/Admin/Curation.tsx",
        "src/pages/Admin/Finances.tsx",
        "src/pages/Admin/HomepageBuilder.tsx",
        "src/pages/Admin/Marketing.tsx",
        "src/pages/Admin/MegaMenuSettings.tsx",
        "src/pages/Admin/Newsletter.tsx",
        "src/pages/Admin/OrdersAdmin.tsx",
        "src/pages/Admin/Overview.tsx",
        "src/pages/Admin/ProductModeration.tsx",
        "src/pages/Admin/SearchAnalytics.tsx",
        "src/pages/Admin/SearchIndexAdmin.tsx",
        "src/pages/Admin/SearchSynonyms.tsx",
        "src/pages/Admin/SellerModeration.tsx",
        "src/pages/Admin/ShippingAdmin.tsx",
        "src/pages/Admin/Support.tsx",
        "src/pages/Admin/TranslationAdmin.tsx",
        "src/pages/Admin/UsersAdmin.tsx",
        "src/pages/BuyerDashboard.tsx",
        "src/pages/BuyerSupport.tsx",
        "src/pages/Public/Auth.tsx",
        "src/pages/Public/Cart.tsx",
        "src/pages/Public/Checkout.tsx",
        "src/pages/Public/DeliveryTracking.tsx",
        "src/pages/Public/DynamicCollectionPage.tsx",
        "src/pages/Public/FlashSalesPage.tsx",
        "src/pages/Public/Home.tsx",
        "src/pages/Public/OrderDetails.tsx",
        "src/pages/Public/PremiumCollection.tsx",
        "src/pages/Public/ProductDetails.tsx",
        "src/pages/Public/ShippingCalculatorPage.tsx",
        "src/pages/Public/Shop.tsx",
        "src/pages/Public/StoreProfile.tsx",
        "src/pages/Public/ThemeShop.tsx",
        "src/pages/Seller/Catalog.tsx",
        "src/pages/Seller/Orders.tsx",
        "src/pages/Seller/Overview.tsx",
        "src/pages/Seller/ProductFormModal.tsx",
        "src/pages/Seller/SellerDashboardLayout.tsx",
        "src/pages/Seller/ShopSettings.tsx",
        "src/pages/Seller/Sponsorships.tsx",
        "src/pages/Seller/Support.tsx",
        "src/pages/Seller/Verification.tsx",
        "src/pages/Seller/Wallet.tsx",
        "src/components/bricolage/**",
        "src/pages/Public/OlmaBricolage.tsx",
        "src/components/OlmaImmo/SearchFilters.tsx",
        "src/pages/OlmaImmo/**"
    ],
    rules: {
      "max-lines": "off"
    }
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "archived_scripts/**",
      "public/**",
      "*.config.cjs",
      "*.config.js"
    ]
  }
);
