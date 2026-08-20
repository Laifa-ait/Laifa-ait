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
  Settings,
  ShieldCheck,
  LifeBuoy,
  LucideIcon,
} from "lucide-react";
import { TFunction } from "i18next";

export interface SellerNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

export function getSellerNavItems(t: TFunction): SellerNavItem[] {
  return [
    { to: "/dashboard/seller", icon: LayoutDashboard, label: t("seller.menu.overview", "Vue d'ensemble"), end: true },
    { to: "/dashboard/seller/catalog", icon: Package, label: t("seller.menu.catalog", "Catalogue Produits") },
    { to: "/dashboard/seller/orders", icon: ShoppingBag, label: t("seller.menu.orders", "Commandes") },
    { to: "/dashboard/seller/shipping", icon: Truck, label: t("seller.menu.shipping", "Expéditions & Tarifs") },
    { to: "/dashboard/seller/returns", icon: RotateCcw, label: t("seller.menu.returns", "Gestion des Retours") },
    { to: "/dashboard/seller/sponsorships", icon: Sparkles, label: t("seller.menu.sponsorships", "Sponsoring & Visibilité") },
    { to: "/dashboard/seller/disputes", icon: AlertTriangle, label: t("seller.menu.disputes", "Litiges & Réclamations") },
    { to: "/dashboard/seller/reviews", icon: Star, label: t("seller.menu.reviews", "Avis & Évaluations") },
    { to: "/dashboard/seller/analytics", icon: Award, label: t("seller.menu.analytics", "Statistiques & Ventes") },
    { to: "/dashboard/seller/verification", icon: ShieldCheck, label: t("seller.menu.verification", "Vérification Boutique") },
    { to: "/dashboard/seller/support", icon: LifeBuoy, label: t("seller.menu.support", "Support & Assistance") },
    { to: "/dashboard/seller/settings", icon: Settings, label: t("seller.menu.settings", "Paramètres Boutique") },
  ];
}
