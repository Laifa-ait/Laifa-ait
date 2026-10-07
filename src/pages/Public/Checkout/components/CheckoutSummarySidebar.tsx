import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { CheckoutSummaryItems } from "./CheckoutSummaryItems";
import { CheckoutPromoCode } from "./CheckoutPromoCode";
import { CartItem } from "../../../../domains/product/product.types";
import { Coupon } from "../../../../components/Admin/CouponCard";
import { UserProfile } from "../../../../domains/user/user.types";

interface CheckoutSummarySidebarProps {
  groupedCart: Record<
    string,
    { items: CartItem[]; total: number; sellerName: string }
  >;
  activeAccordion: number;
  appliedCoupon: Coupon | null;
  couponInput: string;
  setCouponInput: (val: string) => void;
  handleApplyCoupon: () => Promise<void>;
  handleRemoveCoupon: () => void;
  isValidatingCoupon: boolean;
  subtotal: number;
  couponDiscount: number;
  totalShipping: number;
  userProfile: UserProfile | null;
  grandTotal: number;
  handlePlaceOrder: () => Promise<void>;
  isSubmittingOrder: boolean;
  isDeliveryInfoConfirmed: boolean;
  getCartItemPrice: (item: CartItem) => number;
}

export const CheckoutSummarySidebar: React.FC<CheckoutSummarySidebarProps> = ({
  groupedCart,
  activeAccordion,
  appliedCoupon,
  couponInput,
  setCouponInput,
  handleApplyCoupon,
  handleRemoveCoupon,
  isValidatingCoupon,
  subtotal,
  couponDiscount,
  totalShipping,
  userProfile: _userProfile,
  grandTotal,
  handlePlaceOrder,
  isSubmittingOrder,
  isDeliveryInfoConfirmed,
  getCartItemPrice,
}) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-1 lg:col-span-5 space-y-6" id="checkout-summary-sidebar-container">
      <div className="surface-card p-6 sm:p-8 sticky top-28">
        <h3 className="text-sm font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-widest rtl:tracking-normal mb-6 border-b border-stone-100 pb-4">
          {t("order_summary", "Résumé des articles")}
        </h3>

        <CheckoutSummaryItems
          groupedCart={groupedCart}
          getCartItemPrice={getCartItemPrice}
        />

        <CheckoutPromoCode
          appliedCoupon={appliedCoupon}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          handleApplyCoupon={handleApplyCoupon}
          handleRemoveCoupon={handleRemoveCoupon}
          isValidatingCoupon={isValidatingCoupon}
        />

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-sm font-semibold text-zinc-500">
            <span>{t("Sous-total")}</span>
            <span className="text-zinc-900 font-bold tabular-nums">
              {formatPrice(subtotal)}
            </span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-sm font-bold text-emerald-600 animate-fade-in py-1">
              <span className="flex items-center gap-1.5 font-sans font-bold uppercase text-xs">
                {t("checkout.discount", "Remise coupon")} ({appliedCoupon?.code})
              </span>
              <span className="font-black text-xs tabular-nums">
                - {formatPrice(couponDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm font-semibold text-zinc-500">
            <span>{t("Livraison estimée")}</span>
            <span className="text-zinc-900 font-bold tabular-nums">
              {formatPrice(totalShipping)}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-4 mt-4 border-t border-zinc-200/80">
            <div>
              <span className="text-xs font-sans font-bold text-zinc-900 uppercase tracking-wider block">
                {t("checkout.total", "Total à payer")}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                {t("Paiement à la livraison")}
              </span>
            </div>
            <div className="text-end">
              <span className="text-2xl font-sans font-black text-zinc-950 block tabular-nums tracking-tight">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {activeAccordion === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 border-t border-zinc-100 pt-6"
            >
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder}
                className={`w-full h-14 flex items-center justify-center gap-3 px-6 rounded-2xl font-sans font-black text-base transition-all duration-200 cursor-pointer border-none ${
                  isDeliveryInfoConfirmed
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-md shadow-orange-500/25 active:scale-[0.98]"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
                }`}
                type="button"
                id="btn-place-order"
              >
                {isSubmittingOrder ? (
                  <>
                    <span className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                    <span>{t("checkout.placing_order", "Finalisation de la commande...")}</span>
                  </>
                ) : (
                  <span>
                    {t(
                      "checkout.finalize_purchase_button",
                      "Confirmer la commande (COD)"
                    )}
                  </span>
                )}
              </button>
              {!isDeliveryInfoConfirmed && (
                <p className="text-[11px] text-center text-amber-700 font-semibold mt-2.5">
                  {t(
                    "checkout.prompt_confirm_info",
                    "⚠️ Veuillez valider vos informations de livraison à l'étape 3"
                  )}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
