import React from "react";
import { FileText, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Order, OrderItem } from "../../../domains/order/order.types";
import { formatPrice } from "../../../utils/format";

export const OrderClientProfileCard: React.FC<{ selectedOrder: Order }> = ({ selectedOrder }) => {
  const { t } = useTranslation();
  return (
    <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-[2rem] space-y-3">
      <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
        <FileText className="w-4 h-4 text-orange-500" />
        {t("Dossier & Profil Client")}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="block text-[10px] uppercase font-sans font-bold text-zinc-400">
            {t("Nom Complet")}
          </span>
          <strong className="block text-sm text-zinc-900 font-extrabold">
            {selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.name}
          </strong>
        </div>
        <div className="space-y-1">
          <span className="block text-[10px] uppercase font-sans font-bold text-zinc-400">
            {t("Téléphone de Contact")}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-sans font-bold text-zinc-900 bg-zinc-100 px-3.5 py-1.5 rounded-2xl border border-zinc-200">
            <Phone className="w-3.5 h-3.5 text-zinc-400" />
            {selectedOrder.shippingAddress?.phone}
          </span>
        </div>
        <div className="col-span-2 space-y-1 pt-1 border-t border-zinc-200">
          <span className="block text-[10px] uppercase font-sans font-bold text-zinc-400">
            {t("Adresse d'expédition")}
          </span>
          <p className="text-xs font-semibold text-zinc-700">
            {selectedOrder.shippingAddress?.street || t("Non renseignée")}
          </p>
          <strong className="text-xs font-sans font-bold text-zinc-900 block mt-1">
            🎯 {selectedOrder.shippingAddress?.wilaya} • {selectedOrder.shippingAddress?.commune}
          </strong>
        </div>
      </div>
    </div>
  );
};

export const OrderItemsTable: React.FC<{ items: OrderItem[] }> = ({ items }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
        {t("Détail des Articles commandés")}
      </h4>
      <div className="border border-zinc-200 rounded-2xl overflow-hidden">
        <table className="w-full text-start text-xs">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="p-3 font-sans font-bold text-zinc-600">{t("Produit")}</th>
              <th className="p-3 font-sans font-bold text-zinc-600 w-20 text-center">{t("Quantité")}</th>
              <th className="p-3 font-sans font-bold text-zinc-600 w-32 text-end">{t("Prix Unitaire")}</th>
              <th className="p-3 font-sans font-bold text-zinc-600 w-32 text-end">{t("Total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-150">
            {items?.map((it, idx) => (
              <tr key={idx}>
                <td className="p-3 text-xs">
                  <span className="font-semibold text-zinc-900 block leading-tight">
                    {it.productName || "Produit"}
                  </span>
                  {it.selectedVariant && (
                    <span className="font-bold text-[9px] uppercase tracking-widest text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded inline-block mt-1">
                      {it.selectedVariant}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center font-bold text-zinc-700 font-mono">{it.quantity}</td>
                <td className="p-3 text-end font-bold text-zinc-800 font-mono">{formatPrice(it.price)}</td>
                <td className="p-3 text-end font-sans font-bold text-zinc-900 font-mono">
                  {formatPrice((it.price || 0) * (it.quantity || 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const OrderCommissionCard: React.FC<{
  selectedOrder: Order;
  calculatedOrdersMap: Record<string, { commissionAmount: number; netRevenue: number }>;
}> = ({ selectedOrder, calculatedOrdersMap }) => {
  const { t } = useTranslation();
  return (
    <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-[2rem] space-y-3">
      <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-purple-700 block">
        ⚙️ {t("Comptabilité & Commission Olmart")}
      </span>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-white border border-purple-100 rounded-2xl">
          <span className="block text-[8px] font-sans font-bold text-zinc-400 uppercase">{t("Articles")}</span>
          <strong className="text-xs font-sans font-bold text-zinc-800">
            {formatPrice(selectedOrder.subtotal || selectedOrder.total)}
          </strong>
        </div>
        <div className="p-3 bg-white border border-purple-100 rounded-2xl">
          <span className="block text-[8px] font-sans font-bold text-zinc-400 uppercase">{t("Livraison")}</span>
          <strong className="text-xs font-sans font-bold text-zinc-800">
            {formatPrice(selectedOrder.shippingCost || 0)}
          </strong>
        </div>
        <div className="p-3 bg-white border border-purple-100 rounded-2xl">
          <span className="block text-[8px] font-sans font-bold text-zinc-400 uppercase">
            {t("Encaissement (COD)")}
          </span>
          <strong className="text-sm font-sans font-bold text-[#ea580c]">{formatPrice(selectedOrder.total)}</strong>
        </div>
        <div className="p-3 bg-white border border-purple-100 rounded-2xl">
          <span className="block text-[8px] font-sans font-bold text-purple-600 uppercase">
            {t("Commission (5%)")}
          </span>
          <strong className="text-sm font-sans font-bold text-purple-700">
            -{formatPrice(calculatedOrdersMap[selectedOrder.id]?.commissionAmount || 0)}
          </strong>
        </div>
      </div>

      <div className="p-3 bg-purple-900/10 rounded-2xl text-center text-xs font-sans font-bold text-purple-800">
        {t("Net Vendeur à reverser :")} {formatPrice(calculatedOrdersMap[selectedOrder.id]?.netRevenue || 0)}
      </div>
    </div>
  );
};
