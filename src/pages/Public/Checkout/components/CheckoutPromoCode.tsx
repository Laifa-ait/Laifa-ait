import React from "react";
import { Ticket, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { Coupon } from "../../../../components/Admin/CouponCard";

interface CheckoutPromoCodeProps {
  appliedCoupon: Coupon | null;
  couponInput: string;
  setCouponInput: (val: string) => void;
  handleApplyCoupon: () => Promise<void>;
  handleRemoveCoupon: () => void;
  isValidatingCoupon: boolean;
}

export const CheckoutPromoCode: React.FC<CheckoutPromoCodeProps> = ({
  appliedCoupon,
  couponInput,
  setCouponInput,
  handleApplyCoupon,
  handleRemoveCoupon,
  isValidatingCoupon,
}) => {
  const { t } = useTranslation();

  return (
    <div className="py-4 border-t border-b border-stone-100/80 my-4 space-y-3 animate-fade-in text-start">
      <div className="flex items-center gap-2 mb-1">
        <Ticket className="w-4 h-4 text-orange-600" />
        <span className="text-[10px] font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-widest rtl:tracking-normal">
          {t("Code Promotionnel")}
        </span>
      </div>
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold uppercase text-emerald-800 tracking-wider rtl:tracking-normal font-mono">
                {appliedCoupon.code}
              </p>
              <p className="text-[9px] font-semibold text-emerald-600">
                {t(
                  "checkout.discount_applied",
                  "Coupon appliqué : -{{amount}}",
                  {
                    amount:
                      appliedCoupon.discountType === "percentage"
                        ? `${appliedCoupon.discountValue}%`
                        : formatPrice(appliedCoupon.discountValue),
                  }
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-red-500 hover:text-red-700 transition-colors p-1 bg-transparent border-none cursor-pointer"
            type="button"
            id="btn-remove-coupon"
          >
            {t("remove") || "Retirer"}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            id="couponInput"
            aria-label={t("coupon_code") || "Code promo"}
            placeholder={t("EX : TARIK2026, OLMA10") || "EX : TARIK2026, OLMA10"}
            className="flex-1 px-4 py-2.5 bg-transparent border border-stone-200 rounded-xl font-mono text-xs uppercase focus:border-stone-400 focus:bg-white outline-none transition-all"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isValidatingCoupon || !couponInput.trim()}
            className="px-4 py-2.5 bg-[var(--color-slate-900, #0f172a)] hover:bg-[#0a0b0c] text-white rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal transition-colors disabled:opacity-50 cursor-pointer"
            type="button"
            id="btn-apply-coupon"
          >
            {isValidatingCoupon
              ? t("checking") || "Vérif..."
              : t("apply") || "Valider"}
          </button>
        </div>
      )}
    </div>
  );
};
