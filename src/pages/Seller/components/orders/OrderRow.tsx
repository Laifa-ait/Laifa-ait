import React from "react";
import { CheckSquare, Square, User, Phone, MessageSquare, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Order } from "../../../../domains/order/order.types";
import { formatPrice } from "../../../../utils/format";
import { getStatusColor, getStatusLabel } from "./orderTypes";

interface OrderRowProps {
  order: Order;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  isSelected,
  onToggleSelect,
  onSelectOrder,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:bg-zinc-50/50 transition-colors group">
      <div className="flex gap-6 items-center">
        <button
          onClick={() => onToggleSelect(order.id)}
          className="text-zinc-300 hover:text-orange-500 transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-6 h-6 text-orange-500" />
          ) : (
            <Square className="w-6 h-6" />
          )}
        </button>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-sans font-bold bg-zinc-950 text-white px-4 py-1.5 rounded-full tracking-widest rtl:tracking-normal">
              #{order.id.substring(0, 8).toUpperCase()}
            </span>
            <span
              className={`text-[9px] font-black uppercase tracking-widest rtl:tracking-normal px-4 py-1.5 rounded-full border ${getStatusColor(order.status || "NEW")}`}
            >
              {getStatusLabel(order.status || "NEW")}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-sans font-bold text-zinc-950">
                {order.shippingAddress?.name || "Acheteur Olmart"}
              </p>
              <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-none mt-1">
                {order.shippingAddress?.wilaya} • {order.shippingAddress?.commune}
              </p>
              {order.shippingAddress?.phone && (
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={`tel:${order.shippingAddress.phone}`}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100 hover:bg-emerald-100"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {order.shippingAddress.phone}
                  </a>
                  <a
                    href={`https://wa.me/213${order.shippingAddress.phone.replace(/^0/, "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${order.shippingAddress?.name || ""}, je suis le vendeur concernant votre commande #${order.id.substring(0, 8).toUpperCase()}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 hover:bg-emerald-50 transition-all shadow-2xs"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-10 lg:text-end">
        <div>
          <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1.5">
            {t("Montant Total")}
          </p>
          <p className="text-2xl font-sans font-bold text-zinc-950 tracking-tighter rtl:tracking-normal">
            {formatPrice(order.total)}
          </p>
        </div>
        <div className="h-10 w-[1px] bg-zinc-100 hidden lg:block" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectOrder(order)}
            className="px-6 py-3.5 bg-zinc-950 text-white rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal shadow-xl hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            {t("Détails")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
