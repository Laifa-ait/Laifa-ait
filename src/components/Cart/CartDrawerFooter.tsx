import React from "react";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/format";

interface CartDrawerFooterProps {
  totalPrice: number;
  onClose: () => void;
}

export const CartDrawerFooter: React.FC<CartDrawerFooterProps> = ({
  totalPrice,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div className="p-4 sm:p-5 border-t border-zinc-200/90 bg-white space-y-3.5 shadow-[0_-10px_25px_rgba(0,0,0,0.06)] shrink-0 z-30">
      {/* Summary Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            {t("Total du panier")}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
            <Truck className="w-3.5 h-3.5" />
            <span>{t("Livraison 58 Wilayas")}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-sans font-black text-zinc-950 tracking-tight block">
            {formatPrice(totalPrice)}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium block">
            {t("TVA & frais calculés à l'étape suivante")}
          </span>
        </div>
      </div>

      {/* Big Action Checkout Button */}
      <button
        type="button"
        onClick={handleCheckout}
        className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 text-zinc-950 font-black text-base sm:text-lg shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-950/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-zinc-950" />
          </div>
          <span className="tracking-tight text-zinc-950 font-black">
            {t("Commander maintenant")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs">
          <span>{formatPrice(totalPrice)}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
        </div>
      </button>

      {/* Reassurance and Continue Shopping */}
      <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-zinc-500 font-medium">
        <span className="flex items-center gap-1 text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t("Paiement sécurisé à la livraison")}</span>
        </span>

        <button
          type="button"
          onClick={onClose}
          className="text-zinc-600 hover:text-zinc-950 font-semibold underline underline-offset-2 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          {t("Continuer mes achats")}
        </button>
      </div>
    </div>
  );
};
