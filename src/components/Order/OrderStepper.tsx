import React, { useState } from 'react';
import { 
  Clock, Package, Truck, CheckCircle2, XCircle, 
  RotateCcw, AlertTriangle, ExternalLink, Copy, Check 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Order, OrderStatus } from '../../domains/order/order.types';

interface OrderStepperProps {
  order: Order;
}

export const OrderStepper: React.FC<OrderStepperProps> = ({ order }) => {
  const { t } = useTranslation();
  const [copiedTracking, setCopiedTracking] = useState(false);

  const normStatus = (order.status || '').toLowerCase() as OrderStatus;
  const isCanceled = ['canceled', 'cancelled', 'cancelled_by_client'].includes(normStatus);
  const isReturn = ['return_requested', 'return_approved', 'returning', 'returned'].includes(normStatus) || Boolean(order.returnRequest);
  const isDispute = ['dispute_open', 'dispute_resolved'].includes(normStatus) || Boolean(order.disputeRequest);

  const steps = [
    { id: 0, key: 'processing', label: t("Confirmée") || "Confirmée", desc: t("En préparation") || "En préparation", icon: Clock },
    { id: 1, key: 'picked_up', label: t("Préparée") || "Préparée", desc: t("Prise en charge") || "Prise en charge", icon: Package },
    { id: 2, key: 'in_transit', label: t("En cours") || "En cours", desc: t("En transit") || "En transit", icon: Truck },
    { id: 3, key: 'delivered', label: t("Livrée") || "Livrée", desc: t("Remise en main propre") || "Remise en main propre", icon: CheckCircle2 },
  ];

  const currentStep = normStatus === 'delivered' || normStatus === 'refunded' ? 3 
    : normStatus === 'in_transit' || normStatus === 'shipped' ? 2 
    : normStatus === 'picked_up' ? 1 : 0;

  const handleCopyTracking = async () => {
    const num = order.trackingNumber || order.trackingId;
    if (!num) return;
    try {
      await navigator.clipboard.writeText(num);
      setCopiedTracking(true);
      toast.success(t("Numéro de suivi copié !"));
      setTimeout(() => setCopiedTracking(false), 2000);
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const badge = isCanceled 
    ? { label: t("Commande Annulée"), bg: "bg-rose-50 border-rose-200 text-rose-700", icon: XCircle }
    : isDispute 
    ? { label: t("Litige en cours"), bg: "bg-amber-50 border-amber-200 text-amber-800", icon: AlertTriangle }
    : isReturn 
    ? { label: t("Demande de retour"), bg: "bg-purple-50 border-purple-200 text-purple-700", icon: RotateCcw }
    : normStatus === 'delivered' 
    ? { label: t("Livrée & Réceptionnée"), bg: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: CheckCircle2 }
    : normStatus === 'in_transit' || normStatus === 'shipped' 
    ? { label: t("En cours de livraison"), bg: "bg-sky-50 border-sky-200 text-sky-800", icon: Truck }
    : normStatus === 'picked_up' 
    ? { label: t("Prise en charge livreur"), bg: "bg-indigo-50 border-indigo-200 text-indigo-800", icon: Package }
    : { label: t("En attente de traitement"), bg: "bg-amber-50 border-amber-200 text-amber-800", icon: Clock };

  const BadgeIcon = badge.icon;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/80 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
            <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{badge.label}</span>
          </span>
          {order.deliveryProvider && (
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              via <strong className="text-stone-700 font-semibold">{order.deliveryProvider}</strong>
            </span>
          )}
        </div>

        <div className="text-xs text-stone-500 font-medium">
          {normStatus === 'delivered' ? (
            <span className="text-emerald-700 font-semibold">{t("Paiement réglé (Cash)")}</span>
          ) : isCanceled ? (
            <span className="text-rose-600 font-medium">{t("Commande annulée")}</span>
          ) : (
            <span>{t("Délai estimé :")} <strong className="text-stone-800 font-semibold">{t("24h à 72h")}</strong></span>
          )}
        </div>
      </div>

      {!isCanceled && (
        <div className="pt-2 relative">
          <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-100 -translate-y-1/2 rounded-full z-0" />
          <div
            className="hidden sm:block absolute top-5 left-8 h-1 bg-orange-600 -translate-y-1/2 rounded-full z-0 transition-all duration-700"
            style={{ width: currentStep === 0 ? '0%' : currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : 'calc(100% - 4rem)' }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 relative z-10">
            {steps.map((step) => {
              const isPassed = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              const IconComp = step.icon;
              return (
                <div key={step.key} className={`flex flex-col items-center text-center p-2 rounded-xl ${isCurrent ? 'bg-orange-50/60 sm:bg-transparent' : ''}`}>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                    isPassed ? 'bg-orange-600 text-white shadow-xs' : 'bg-stone-100 text-stone-400 border border-stone-200/80'
                  } ${isCurrent ? 'ring-4 ring-orange-100 scale-105' : ''}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <p className={`text-xs font-semibold ${isPassed ? 'text-stone-900' : 'text-stone-400'}`}>{step.label}</p>
                    <p className="text-[10px] text-stone-500 hidden sm:block leading-tight">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(order.trackingNumber || order.trackingId) && !isCanceled && (
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-stone-500 font-medium">{t("Numéro de suivi")}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">
                  {order.trackingNumber || order.trackingId}
                </span>
                <button onClick={handleCopyTracking} className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer" title="Copier">
                  {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {order.trackingLink && (
            <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0">
              <span>{t("Suivre le colis")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
