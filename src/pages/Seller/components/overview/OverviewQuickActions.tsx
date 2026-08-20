import React from "react";
import { Plus, List, BarChart3, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const OverviewQuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      label: t("seller.overview.new_product", "Nouveau Produit"),
      icon: Plus,
      color: "text-blue-600",
      bg: "bg-blue-50",
      onClick: () => navigate("/dashboard/seller/catalog?action=new"),
      id: "seller-quick-action-new-product",
    },
    {
      label: t("seller.overview.manage_orders", "Gérer Commandes"),
      icon: List,
      color: "text-orange-600",
      bg: "bg-orange-50",
      onClick: () => navigate("/dashboard/seller/orders"),
      id: "seller-quick-action-orders",
    },
    {
      label: t("seller.menu.analytics", "Analytiques"),
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      onClick: () => navigate("/dashboard/seller/analytics"),
      id: "seller-quick-action-analytics",
    },
    {
      label: t("seller.overview.help_center", "Centre d'aide"),
      icon: HelpCircle,
      color: "text-zinc-600",
      bg: "bg-zinc-50",
      onClick: () => navigate("/dashboard/seller/support"),
      id: "seller-quick-action-help",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="seller-overview-quick-actions">
      {actions.map((action, i) => (
        <button
          key={i}
          id={action.id}
          type="button"
          onClick={action.onClick}
          className="flex flex-col items-center justify-center p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
        >
          <div
            className={`w-12 h-12 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
          >
            <action.icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-sans font-bold text-zinc-950 text-center">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};
