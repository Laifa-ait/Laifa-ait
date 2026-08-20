import React from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

export const OrdersEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-24 text-center">
      <ShoppingBag className="w-20 h-20 text-zinc-100 mx-auto mb-6" />
      <p className="text-zinc-400 font-bold uppercase tracking-widest rtl:tracking-normal text-xs">
        {t("Aucune commande pour le moment.")}
      </p>
    </div>
  );
};
