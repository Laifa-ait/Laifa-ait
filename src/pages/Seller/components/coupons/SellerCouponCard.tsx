import React from "react";
import { Tag, Calendar, Copy, Check, Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Coupon } from "../../../../domains/marketing/coupon.types";

interface SellerCouponCardProps {
  coupon: Coupon;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
  isUpdatingStatus: boolean;
}

export const SellerCouponCard: React.FC<SellerCouponCardProps> = ({
  coupon,
  onToggleStatus,
  onDelete,
  isUpdatingStatus,
}) => {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success(t("seller.coupons.copied", "Code copié dans le presse-papier !"));
    setTimeout(() => setCopied(false), 2000);
  };

  const parseExpiryDate = (d: unknown): Date | null => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d === "object" && d !== null && "toDate" in d && typeof (d as { toDate: () => Date }).toDate === "function") {
      return (d as { toDate: () => Date }).toDate();
    }
    if (typeof d === "string" || typeof d === "number") {
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const expiryDate = parseExpiryDate(coupon.expiresAt || coupon.expiryDate);
  const isExpired = expiryDate ? expiryDate.getTime() <= Date.now() : false;
  const isPercentage = coupon.discountType === "percentage" || coupon.discountType === "percent";
  const discountDisplay = isPercentage ? `-${coupon.discountValue}%` : `-${coupon.discountValue.toLocaleString()} DZD`;
  const usedCount = Number(coupon.usedCount ?? coupon.usageCount ?? 0);
  const maxUses = coupon.maxUses ?? coupon.usageLimit;

  const formatDate = (date: Date | null) => {
    if (!date) return t("seller.coupons.no_expiry", "Sans expiration");
    return date.toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : i18n.language === "en" ? "en-US" : "fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs ${
      !coupon.isActive || isExpired
        ? "border-zinc-200 opacity-75 bg-zinc-50/50"
        : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-700 font-mono font-bold text-sm tracking-wider">
              <Tag className="w-4 h-4 text-orange-600" />
              <span>{coupon.code}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-orange-600 hover:text-orange-800 transition-colors rounded-md hover:bg-orange-100/50 cursor-pointer"
                title={t("common.copy", "Copier")}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-white">
              {discountDisplay}
            </span>

            {isExpired ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                {t("seller.coupons.status_expired", "Expiré")}
              </span>
            ) : coupon.isActive ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t("seller.coupons.status_active", "Actif")}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                {t("seller.coupons.status_inactive", "Inactif")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium flex-wrap pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                {t("seller.coupons.expires_on", "Expire le")} {formatDate(expiryDate)}
              </span>
            </div>

            {coupon.minOrderAmount && coupon.minOrderAmount > 0 ? (
              <div className="flex items-center gap-1">
                <span>{t("seller.coupons.min_order", "Dès")} {coupon.minOrderAmount.toLocaleString()} DZD</span>
              </div>
            ) : null}

            <div className="flex items-center gap-1.5 text-zinc-600">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                {usedCount} {maxUses ? `/ ${maxUses}` : ""} {t("seller.coupons.uses", "utilisations")}
              </span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <label className="relative inline-flex items-center cursor-pointer" title={coupon.isActive ? t("seller.coupons.deactivate", "Désactiver") : t("seller.coupons.activate", "Activer")}>
            <input
              type="checkbox"
              checked={Boolean(coupon.isActive) && !isExpired}
              disabled={isUpdatingStatus || isExpired}
              onChange={() => onToggleStatus(coupon)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>

          <button
            type="button"
            onClick={() => onDelete(coupon.id)}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            title={t("common.delete", "Supprimer")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
