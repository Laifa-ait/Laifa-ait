import React from "react";
import { Ticket, Trash2, Percent, Sparkles, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../utils/format";
import { Coupon, CouponDateType } from "../../../domains/marketing/coupon.types";

export interface CouponItemCardProps {
  coupon: Coupon;
  handleToggleCouponActive: (id: string, active: boolean, code: string) => void;
  handleDeleteCoupon: (id: string, code: string) => void;
}

const parseDate = (raw?: CouponDateType): Date | null => {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  if (typeof raw === "string" || typeof raw === "number") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === "object") {
    if ("toDate" in raw && typeof raw.toDate === "function") return raw.toDate();
    if ("seconds" in raw && typeof raw.seconds === "number") return new Date(raw.seconds * 1000);
    if ("_seconds" in raw && typeof raw._seconds === "number") return new Date(raw._seconds * 1000);
  }
  return null;
};

export const CouponItemCard: React.FC<CouponItemCardProps> = ({
  coupon,
  handleToggleCouponActive,
  handleDeleteCoupon,
}) => {
  const { t } = useTranslation();
  const expiry = parseDate(coupon.expiryDate || coupon.expiresAt);
  const isExpired = expiry ? expiry <= new Date() : false;
  const count = coupon.usageCount ?? coupon.usedCount ?? 0;
  const percentageUsed = coupon.usageLimit
    ? Math.round((count / coupon.usageLimit) * 100)
    : null;
  const minOrder = coupon.minOrderValue ?? coupon.minOrderAmount ?? 0;
  const isPercent = coupon.discountType === "percent" || coupon.discountType === "percentage";

  return (
    <div
      className={`p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-zinc-200/20 ${
        !coupon.isActive
          ? "bg-zinc-50/50 border-zinc-100 opacity-60"
          : isExpired
            ? "bg-red-50/20 border-red-100"
            : "bg-white border-zinc-100 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
            isExpired
              ? "bg-red-50 text-red-500 border-red-100"
              : !coupon.isActive
                ? "bg-zinc-100 text-zinc-400 border-zinc-200"
                : "bg-orange-50 text-orange-600 border-orange-100"
          }`}
        >
          {isPercent ? (
            <Percent className="w-6 h-6" />
          ) : (
            <Ticket className="w-6 h-6" />
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h5 className="text-xl font-sans font-bold text-zinc-950 uppercase tracking-widest rtl:tracking-normal leading-none mt-1 font-mono">
              {coupon.code}
            </h5>
            <span
              className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest rtl:tracking-normal ${
                isExpired
                  ? "bg-red-100 text-red-700"
                  : !coupon.isActive
                    ? "bg-zinc-200 text-zinc-600"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isExpired ? "Expiré" : !coupon.isActive ? "Désactivé" : "Actif"}
            </span>
            {minOrder > 0 && (
              <span className="bg-zinc-100 text-zinc-600 border border-zinc-200/60 px-2.5 py-1 rounded-full text-[8px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal font-mono">
                {t("Min:")}
                {formatPrice(minOrder)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal flex-wrap pt-1 font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3" /> {t("Remise de -")}
              {isPercent
                ? `${coupon.discountValue}%`
                : formatPrice(coupon.discountValue)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3" /> {t("Expiration:")}
              {expiry ? expiry.toLocaleDateString("fr-FR") : "Illimitée"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3" /> {t("Utilisé")}
              {count} {t("fois")}
              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (ILIMITÉ)"}
            </span>
          </div>

          {percentageUsed !== null && (
            <div className="w-48 pt-2">
              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, percentageUsed)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
        <button
          onClick={() => handleToggleCouponActive(coupon.id, coupon.isActive, coupon.code)}
          className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest rtl:tracking-normal transition-colors cursor-pointer border-none ${
            coupon.isActive
              ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
              : "bg-emerald-100 hover:bg-emerald-200 text-emerald-850"
          }`}
        >
          {coupon.isActive ? "Désactiver" : "Activer"}
        </button>
        <button
          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
          className="p-3 bg-red-50 text-red-500 hover:bg-[#ffe4e6] rounded-xl transition-colors cursor-pointer border-none"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};
