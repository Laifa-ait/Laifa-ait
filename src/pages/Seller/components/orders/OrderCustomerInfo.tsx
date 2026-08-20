import React from "react";
import { Truck, User, MapPin, Phone, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Order } from "../../../../domains/order/order.types";

interface OrderCustomerInfoProps {
  order: Order;
}

export const OrderCustomerInfo: React.FC<OrderCustomerInfoProps> = ({ order }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-zinc-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-zinc-100">
      <h4 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Truck className="w-4 h-4 shrink-0" /> {t("Client & Destination")}
        </span>
        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
          Contact Direct
        </span>
      </h4>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <User className="w-5 h-5 text-zinc-400 shrink-0" />
          <div>
            <p className="text-sm font-sans font-bold text-zinc-950">
              {order.shippingAddress?.name || "Acheteur Olmart"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <MapPin className="w-5 h-5 text-zinc-300 shrink-0" />
          <div>
            <p className="text-sm font-sans font-bold text-zinc-950">
              {order.shippingAddress?.street ||
                order.shippingAddress?.address ||
                "N/A"}
            </p>
            <p className="text-sm font-medium text-zinc-500">
              {order.shippingAddress?.commune}, {order.shippingAddress?.wilaya}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200/60">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
            <a
              href={`tel:${order.shippingAddress?.phone}`}
              className="text-sm font-sans font-bold text-zinc-950 hover:text-emerald-600 transition-colors"
            >
              {order.shippingAddress?.phone || "N/A"}
            </a>
          </div>
          {order.shippingAddress?.phone && (
            <a
              href={`https://wa.me/213${order.shippingAddress.phone.replace(/^0/, "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${order.shippingAddress?.name || ""}, je suis le vendeur Olmart concernant votre commande #${order.id.substring(0, 8).toUpperCase()}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
