import React from 'react';
import { CreditCard, Banknote, Tag, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../domains/order/order.types';
import { formatPrice } from '../../utils/format';

interface OrderPaymentCardProps {
  order: Order;
}

export const OrderPaymentCard: React.FC<OrderPaymentCardProps> = ({ order }) => {
  const { t } = useTranslation();

  const subtotal = order.subtotal || 0;
  const shippingCost = order.shippingCost ?? order.shippingTotal ?? 0;
  const discountAmount = order.discountAmount || 0;
  const total = order.total || Math.max(0, subtotal + shippingCost - discountAmount);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {t("Récapitulatif du paiement") || "Récapitulatif du paiement"}
        </h3>
        <div className="flex items-center gap-1 text-xs font-medium text-stone-500">
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t("Facturation") || "Facturation"}</span>
        </div>
      </div>

      <div className="space-y-2.5 text-xs text-stone-600">
        <div className="flex items-center justify-between">
          <span>{t("Sous-total articles") || "Sous-total articles"}</span>
          <span className="font-semibold text-stone-900 tabular-nums">{formatPrice(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-700">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{t("Remise promotionnelle") || "Remise"}</span>
            </span>
            <span className="font-semibold tabular-nums">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>{t("Frais de livraison") || "Frais de livraison"}</span>
          <span className="font-semibold text-stone-900 tabular-nums">
            {shippingCost > 0 ? formatPrice(shippingCost) : t("Gratuit")}
          </span>
        </div>

        <div className="pt-3 border-t border-stone-200/80 flex items-baseline justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-stone-900 block">
              {t("Montant total") || "Montant total"}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              {t("Toutes taxes comprises (TTC)") || "TTC"}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-stone-900 tabular-nums tracking-tight">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Payment method banner */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 flex items-start gap-2.5">
        <Banknote className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-stone-900">
            {t("Paiement à la livraison (Cash on Delivery)") || "Paiement à la livraison"}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
            {t("Règlement direct en espèces au livreur lors de la réception du colis.") || "Règlement en espèces au livreur lors de la réception."}
          </p>
        </div>
      </div>

      {/* Buyer Protection Trust Seal */}
      <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t("Transaction protégée par la garantie Olmart Algérie")}</span>
      </div>
    </div>
  );
};
