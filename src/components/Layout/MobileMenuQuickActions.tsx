import React from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Heart, Package, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

interface MobileMenuQuickActionsProps {
  onNavigate: (path: string) => void;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const MobileMenuQuickActions: React.FC<MobileMenuQuickActionsProps> = ({
  onNavigate,
  onClose,
  onOpenCart,
}) => {
  const { t } = useTranslation();
  const { cart = [] } = useCart();
  const cartCount = cart.reduce((acc: number, it: { quantity?: number }) => acc + (it.quantity || 1), 0);

  const actions = [
    {
      id: "catalog",
      label: t("Catalogue"),
      icon: ShoppingBag,
      color: "text-[#0088A8]",
      bg: "bg-[#0088A8]/10",
      border: "border-[#0088A8]/20",
      onClick: () => {
        onNavigate("/shop");
        onClose();
      },
    },
    {
      id: "wishlist",
      label: t("Favoris"),
      icon: Heart,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200/60",
      onClick: () => {
        onNavigate("/shop#wishlist");
        onClose();
      },
    },
    {
      id: "orders",
      label: t("Commandes"),
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200/60",
      onClick: () => {
        onNavigate("/dashboard/buyer?tab=orders");
        onClose();
      },
    },
    {
      id: "cart",
      label: t("Panier"),
      icon: ShoppingCart,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200/60",
      badge: cartCount > 0 ? String(cartCount) : undefined,
      onClick: () => {
        onClose();
        if (onOpenCart) onOpenCart();
      },
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            type="button"
            onClick={act.onClick}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white hover:bg-zinc-50 active:scale-95 transition-all border border-zinc-200/80 shadow-2xs group cursor-pointer text-center relative"
          >
            <div
              className={`w-9 h-9 rounded-xl ${act.bg} ${act.color} flex items-center justify-center transition-transform group-hover:scale-105 border ${act.border}`}
            >
              <Icon className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-800 mt-1.5 truncate max-w-full">
              {act.label}
            </span>
            {act.badge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#0088A8] text-white shadow-xs">
                {act.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
