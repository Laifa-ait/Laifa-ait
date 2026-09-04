import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Star,
  Tag,
  Settings,
  ShieldCheck,
  LifeBuoy,
  LucideIcon,
} from "lucide-react";
import { TFunction } from "i18next";

export interface SellerNavItem {
  id?: string;
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

export function getSellerNavItems(t: TFunction): SellerNavItem[] {
  return [
    { id: "seller-nav-overview", to: "/dashboard/seller", icon: LayoutDashboard, label: t("seller.menu.overview", "Vue d'ensemble"), end: true },
    { id: "seller-nav-catalog", to: "/dashboard/seller/catalog", icon: Package, label: t("seller.menu.catalog", "Catalogue Produits") },
    { id: "seller-nav-coupons", to: "/dashboard/seller/coupons", icon: Tag, label: t("seller.menu.coupons", "Mes coupons") },
    { id: "seller-nav-orders", to: "/dashboard/seller/orders", icon: ShoppingBag, label: t("seller.menu.orders", "Commandes") },
    { id: "seller-nav-shipping", to: "/dashboard/seller/shipping", icon: Truck, label: t("seller.menu.shipping", "Expéditions & Tarifs") },
    { id: "seller-nav-returns", to: "/dashboard/seller/returns", icon: RotateCcw, label: t("seller.menu.returns", "Gestion des Retours") },
    { id: "seller-nav-sponsorships", to: "/dashboard/seller/sponsorships", icon: Sparkles, label: t("seller.menu.sponsorships", "Sponsoring & Visibilité") },
    { id: "seller-nav-disputes", to: "/dashboard/seller/disputes", icon: AlertTriangle, label: t("seller.menu.disputes", "Litiges & Réclamations") },
    { id: "seller-nav-reviews", to: "/dashboard/seller/reviews", icon: Star, label: t("seller.menu.reviews", "Avis & Évaluations") },
    { id: "seller-nav-analytics", to: "/dashboard/seller/analytics", icon: Award, label: t("seller.menu.analytics", "Statistiques & Ventes") },
    { id: "seller-nav-verification", to: "/dashboard/seller/verification", icon: ShieldCheck, label: t("seller.menu.verification", "Vérification Boutique") },
    { id: "seller-nav-support", to: "/dashboard/seller/support", icon: LifeBuoy, label: t("seller.menu.support", "Support & Assistance") },
    { id: "seller-nav-settings", to: "/dashboard/seller/settings", icon: Settings, label: t("seller.menu.settings", "Paramètres Boutique") },
  ];
}
