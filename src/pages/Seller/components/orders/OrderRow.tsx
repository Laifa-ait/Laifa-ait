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
    <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-zinc-50/60 transition-colors group">
      <div className="flex gap-4 items-start sm:items-center">
        <button
          type="button"
          onClick={() => onToggleSelect(order.id)}
          aria-label="Sélectionner la commande"
          className="text-zinc-300 hover:text-amber-600 transition-colors cursor-pointer border-none bg-transparent pt-1 sm:pt-0"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-amber-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-black bg-zinc-900 text-white px-2.5 py-0.5 rounded-md tracking-wider">
              #{order.id.substring(0, 8).toUpperCase()}
            </span>
            <span
              className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getStatusColor(order.status || "NEW")}`}
            >
              {getStatusLabel(order.status || "NEW")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans font-bold text-sm text-zinc-950 truncate">
                {order.shippingAddress?.name || "Acheteur Olmart"}
              </p>
              <p className="text-[11px] font-semibold text-zinc-500 truncate">
                {order.shippingAddress?.wilaya} • {order.shippingAddress?.commune}
              </p>
            </div>
          </div>

          {order.shippingAddress?.phone && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a
                href={`tel:${order.shippingAddress.phone}`}
                className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="tabular-nums">{order.shippingAddress.phone}</span>
              </a>
              <a
                href={`https://wa.me/213${order.shippingAddress.phone.replace(/^0/, "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${order.shippingAddress?.name || ""}, je suis le vendeur concernant votre commande #${order.id.substring(0, 8).toUpperCase()}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] font-bold text-emerald-700 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 hover:bg-emerald-50 transition-all shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-8 pt-2 sm:pt-0 border-t border-zinc-100 lg:border-none">
        <div className="lg:text-end">
          <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
            {t("Montant Total")}
          </p>
          <p className="text-xl sm:text-2xl font-sans font-black text-zinc-950 tabular-nums tracking-tight">
            {formatPrice(order.total)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectOrder(order)}
          className="h-11 px-5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none active:scale-95 shrink-0"
        >
          <span>{t("Gérer")}</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
