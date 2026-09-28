import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Printer, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Order } from '../../domains/order/order.types';
import { normalizeTimestamp } from '../../utils/date';
import { OlmartLogo } from '../common/OlmartLogo';

interface OrderHeaderProps {
  order: Order;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ order }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const formattedDate = order.createdAt
    ? normalizeTimestamp(order.createdAt).toDate().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date inconnue';

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast.success(t("Numéro de commande copié !") || "Numéro de commande copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Commande Olmart #${order.id.slice(0, 8)}`,
          text: `Suivi de ma commande Olmart #${order.id.slice(0, 8)}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyOrderId();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action & branding navigation row */}
      <div className="flex items-center justify-between gap-3 bg-white/80 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Direct Olmart Homepage Return Logo */}
          <OlmartLogo
            to="/"
            iconClassName="w-6 h-6 text-stone-900"
            textClassName="text-base font-black tracking-tight text-stone-900 uppercase"
          />

          <span className="h-4 w-px bg-stone-200" aria-hidden="true" />

          <button
            type="button"
            onClick={() => navigate('/dashboard/buyer')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors py-1 px-2 rounded-lg hover:bg-stone-100 cursor-pointer"
            title="Retour à mes commandes"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span className="hidden sm:inline">{t("Mes commandes") || "Mes commandes"}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 print:hidden">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Partager la commande"
            title="Partager la commande"
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            aria-label="Imprimer le récapitulatif"
            title="Imprimer le récapitulatif"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("Imprimer") || "Imprimer"}</span>
          </button>
        </div>
      </div>

      {/* Main title & Order ID lockup */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 border-b border-stone-200/70">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {t("Commande") || "Commande"}
            </h1>
            <span className="font-mono text-sm sm:text-base font-semibold text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded-md border border-stone-200/80">
              #{order.id.slice(0, 10).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              aria-label="Copier le numéro de commande"
              title="Copier le numéro"
              className="p-1 text-stone-400 hover:text-stone-700 transition-colors rounded cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1">
            {t("Effectuée le") || "Effectuée le"} {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};
