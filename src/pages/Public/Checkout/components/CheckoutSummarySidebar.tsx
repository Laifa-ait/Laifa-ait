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
          <div className="flex justify-between items-center text-sm font-bold text-stone-500">
            <span>{t("Sous-total")}</span>
            <span className="text-[var(--color-slate-900, #0f172a)]">
              {formatPrice(subtotal)}
            </span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-sm font-bold text-emerald-600 animate-fade-in py-1">
              <span className="flex items-center gap-1.5 font-sans font-bold uppercase text-xs">
                {t("checkout.discount", "🎟️ Remise :")} {appliedCoupon?.code}
              </span>
              <span className="font-extrabold text-xs">
                - {formatPrice(couponDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm font-bold text-stone-500">
            <span>{t("Livraison estimée")}</span>
            <span className="text-[var(--color-slate-900, #0f172a)]">
              {formatPrice(totalShipping)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 mt-4 border-t border-stone-100">
            <div>
              <span className="text-xs font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-widest rtl:tracking-normal block">
                {t("checkout.total", "Total à payer")}
              </span>
            </div>
            <div className="text-end">
              <span className="text-xl font-sans font-bold text-[var(--color-orange-600, #ea580c)] block">
                {formatPrice(grandTotal)}
              </span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-orange-600 block mt-0.5 animate-pulse">
                {t("checkout.remaining_cod", "Reste à payer en COD")}
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {activeAccordion === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 border-t border-stone-100 pt-6"
            >
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                  isDeliveryInfoConfirmed
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 active:scale-95"
                    : "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                }`}
                type="button"
                id="btn-place-order"
              >
                {isSubmittingOrder ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("checkout.placing_order", "Traitement de la commande...")}</span>
                  </>
                ) : (
                  <span>
                    {t(
                      "checkout.finalize_purchase_button",
                      "Confirmer la commande & Finaliser l'achat"
                    )}
                  </span>
                )}
              </button>
              {!isDeliveryInfoConfirmed && (
                <p className="text-[10px] text-center text-stone-500 font-semibold mt-2.5 animate-pulse">
                  {t(
                    "checkout.prompt_confirm_info",
                    "⚠️ Veuillez d'abord valider vos coordonnées personnelles à l'étape 3"
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
