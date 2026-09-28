import React from 'react';
import { MessageSquare, RotateCcw, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../domains/order/order.types';

interface OrderActionsCardProps {
  order: Order;
  cancelling: boolean;
  onCancelOrder: () => void;
  onOpenChat: () => void;
  onOpenReturn: () => void;
  onOpenDispute: () => void;
  onOpenDisputeChat: () => void;
}

export const OrderActionsCard: React.FC<OrderActionsCardProps> = ({
  order,
  cancelling,
  onCancelOrder,
  onOpenChat,
  onOpenReturn,
  onOpenDispute,
  onOpenDisputeChat,
}) => {
  const { t } = useTranslation();
  const status = (order.status || '').toLowerCase();
  const isPending = ['pending', 'new'].includes(status);
  const isDelivered = status === 'delivered';
  const isShipped = status === 'shipped' || status === 'in_transit';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
        {t("Assistance & Actions") || "Assistance & Actions"}
      </h3>

      <div className="space-y-2">
        {/* Contact seller chat button */}
        <button
          onClick={onOpenChat}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-orange-600" />
            <span>{t("Discuter avec le vendeur") || "Discuter avec le vendeur"}</span>
          </div>
          {order.unreadBuyerMessages && order.unreadBuyerMessages > 0 && (
            <span className="px-1.5 py-0.5 bg-orange-600 text-white rounded-full text-[10px] font-bold">
              {order.unreadBuyerMessages}
            </span>
          )}
        </button>

        {/* Dispute Chat button if active dispute */}
        {order.disputeId && (
          <button
            onClick={onOpenDisputeChat}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100/70 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t("Accéder au salon du litige")}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-700">{t("En médiation")}</span>
          </button>
        )}

        {/* Return Request Button */}
        {isDelivered && !order.returnRequest && (
          <button
            onClick={onOpenReturn}
            className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 hover:bg-purple-50 hover:border-purple-200 text-stone-700 hover:text-purple-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-purple-600" />
            <span>{t("Demander un retour d'article") || "Demander un retour"}</span>
          </button>
        )}

        {/* Dispute Button */}
        {(isShipped || isDelivered) && !order.disputeRequest && (
          <button
            onClick={onOpenDispute}
            className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-stone-400" />
            <span>{t("Signaler un problème ou litige")}</span>
          </button>
        )}

        {/* Cancel Order Button */}
        {isPending && (
          <button
            onClick={onCancelOrder}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer mt-2"
          >
            <XCircle className="w-4 h-4" />
            <span>{cancelling ? t("Annulation en cours...") : t("Annuler la commande")}</span>
          </button>
        )}
      </div>

      {/* Return or Dispute ongoing status display */}
      {order.returnRequest && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-purple-800">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("Demande de retour enregistrée")}</span>
          </div>
          <p className="text-[11px] text-purple-700">
            {t("Statut :")} <strong>{order.returnRequest.status === 'pending' ? t("En attente de validation") : order.returnRequest.status}</strong>
          </p>
        </div>
      )}

      {/* Help footer */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
          <span>Support Olmart 7j/7</span>
        </span>
      </div>
    </div>
  );
};
