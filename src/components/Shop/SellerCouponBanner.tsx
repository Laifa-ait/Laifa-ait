import React, { useEffect, useState } from "react";
import { Tag, Copy, Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiGet } from "../../lib/api";

interface PublicSellerCoupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed" | "percent";
  discountValue: number;
  minOrderAmount?: number;
  expiresAt?: string;
  sellerId: string;
}

interface SellerCouponBannerProps {
  sellerId?: string | null;
  className?: string;
  variant?: "compact" | "full";
}

export const SellerCouponBanner: React.FC<SellerCouponBannerProps> = ({
  sellerId,
  className = "",
  variant = "full",
}) => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<PublicSellerCoupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;
    let isMounted = true;

    apiGet<{ success: boolean; coupons: PublicSellerCoupon[] }>(
      `/api/v1/public/shops/${sellerId}/coupons`
    )
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.coupons)) {
          setCoupons(res.coupons);
        }
      })
      .catch(() => {
        // Silently fail if public coupons cannot be fetched
      });

    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  if (!sellerId || coupons.length === 0) {
    return null;
  }

  // Display the first active coupon (or best offer)
  const primaryCoupon = coupons[0];
  const isPercentage = primaryCoupon.discountType === "percentage" || primaryCoupon.discountType === "percent";
  const discountDisplay = isPercentage ? `-${primaryCoupon.discountValue}%` : `-${primaryCoupon.discountValue.toLocaleString()} DZD`;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t("shop.coupon_copied", "Code promo copié !"));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50/90 border border-orange-200/80 text-orange-950 text-xs font-medium ${className}`}>
        <Tag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
        <span>
          {t("shop.code_label", "Code")} <strong className="font-mono font-bold tracking-wider">{primaryCoupon.code}</strong> : <strong className="text-orange-700">{discountDisplay}</strong> {t("shop.at_this_seller", "chez ce vendeur")}
        </span>
        <button
          type="button"
          onClick={() => handleCopy(primaryCoupon.code)}
          className="ml-1 p-1 hover:bg-orange-200/60 rounded-md transition-colors text-orange-700 cursor-pointer"
          title={t("common.copy", "Copier")}
        >
          {copiedCode === primaryCoupon.code ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/60 border border-orange-200/80 p-3.5 sm:p-4 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-zinc-800">
            <span>{t("shop.promo_offer", "Offre exclusive :")} </span>
            <span className="font-medium">
              {t("shop.code_label", "Code")} <span className="font-mono font-bold text-zinc-950 bg-white/80 px-2 py-0.5 rounded-md border border-orange-200">{primaryCoupon.code}</span>
            </span>
            <span className="mx-1.5 font-bold text-orange-700 text-sm">{discountDisplay}</span>
            <span className="text-zinc-600">{t("shop.at_this_seller", "chez ce vendeur")}</span>
            {primaryCoupon.minOrderAmount && primaryCoupon.minOrderAmount > 0 ? (
              <span className="text-[11px] text-zinc-500 ml-1">
                ({t("shop.from_min_order", "dès")} {primaryCoupon.minOrderAmount.toLocaleString()} DZD)
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCopy(primaryCoupon.code)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200/80 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
        >
          {copiedCode === primaryCoupon.code ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("common.copied", "Copié !")}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{t("shop.copy_code", "Copier le code")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
