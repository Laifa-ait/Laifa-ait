import React from 'react';
import { MapPin, Phone, User, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Address } from '../../domains/order/order.types';

interface OrderShippingCardProps {
  shippingAddress?: Address;
}

export const OrderShippingCard: React.FC<OrderShippingCardProps> = ({ shippingAddress }) => {
  const { t } = useTranslation();

  if (!shippingAddress) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
        <p className="text-xs text-stone-500">{t("Aucune adresse de livraison renseignée.")}</p>
      </div>
    );
  }

  const recipientName = shippingAddress.name || shippingAddress.fullName || t("Client Olmart");
  const phone = shippingAddress.phone || '';
  const street = shippingAddress.street || shippingAddress.address || '';
  const commune = shippingAddress.commune || '';
  const wilaya = shippingAddress.wilaya || '';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {t("Adresse de livraison") || "Adresse de livraison"}
        </h3>
        <div className="flex items-center gap-1 text-xs font-medium text-stone-500">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>{wilaya || "Algérie"}</span>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {/* Recipient */}
        <div className="flex items-start gap-2.5">
          <User className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-stone-900">{recipientName}</p>
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 text-stone-600 hover:text-orange-600 font-mono text-xs mt-0.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3 h-3 text-stone-400" />
                <span>{phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Address Location */}
        <div className="flex items-start gap-2.5 pt-2 border-t border-stone-100">
          <Navigation className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-stone-600">
            {street && <p className="font-medium text-stone-800">{street}</p>}
            <p>
              {commune && <span className="font-semibold text-stone-800">{commune}, </span>}
              <span className="font-semibold text-stone-800">{wilaya}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Courier call notice */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 leading-snug">
        <strong className="font-semibold">{t("Important :")} </strong>
        {t("Le livreur vous contactera par appel téléphonique avant la livraison. Merci de rester joignable.")}
      </div>
    </div>
  );
};
