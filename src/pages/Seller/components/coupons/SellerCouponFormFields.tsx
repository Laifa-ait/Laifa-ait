import React from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellerCouponFormFieldsProps {
  code: string;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  discountType: "percentage" | "fixed";
  onDiscountTypeChange: (type: "percentage" | "fixed") => void;
  discountValue: number | "";
  onDiscountValueChange: (val: number | "") => void;
  expiryDate: string;
  onExpiryDateChange: (val: string) => void;
  minOrderAmount: number | "";
  onMinOrderAmountChange: (val: number | "") => void;
  maxUses: number | "";
  onMaxUsesChange: (val: number | "") => void;
  minDate: string;
}

export const SellerCouponFormFields: React.FC<SellerCouponFormFieldsProps> = ({
  code,
  onCodeChange,
  discountType,
  onDiscountTypeChange,
  discountValue,
  onDiscountValueChange,
  expiryDate,
  onExpiryDateChange,
  minOrderAmount,
  onMinOrderAmountChange,
  maxUses,
  onMaxUsesChange,
  minDate,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Coupon Code */}
      <div>
        <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wider">
          {t("seller.coupons.field_code", "Code promotionnel")} *
        </label>
        <div className="relative">
          <input
            type="text"
            required
            maxLength={20}
            placeholder="Ex: PROMO10, SUMMER20, AID2026"
            value={code}
            onChange={onCodeChange}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-bold text-sm tracking-wider uppercase text-zinc-900 placeholder:text-zinc-400 placeholder:font-sans placeholder:normal-case"
          />
          <span className="absolute right-3 top-2.5 text-[11px] font-bold text-zinc-400">
            {code.length}/20
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">
          {t("seller.coupons.code_help", "4 à 20 caractères alphanumériques majuscules sans espaces.")}
        </p>
      </div>

      {/* Type & Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wider">
            {t("seller.coupons.field_type", "Type de réduction")} *
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => onDiscountTypeChange("percentage")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                discountType === "percentage"
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t("seller.coupons.type_percent", "Pourcentage (%)")}
            </button>
            <button
              type="button"
              onClick={() => onDiscountTypeChange("fixed")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                discountType === "fixed"
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t("seller.coupons.type_fixed", "Fixe (DZD)")}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wider">
            {t("seller.coupons.field_value", "Valeur")} *
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min={discountType === "percentage" ? 1 : 100}
              max={discountType === "percentage" ? 70 : 50000}
              placeholder={discountType === "percentage" ? "Ex: 10" : "Ex: 500"}
              value={discountValue}
              onChange={(e) => onDiscountValueChange(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-sm text-zinc-900"
            />
            <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-400">
              {discountType === "percentage" ? "%" : "DZD"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {discountType === "percentage"
              ? t("seller.coupons.limit_percent", "De 1% à 70% maximum")
              : t("seller.coupons.limit_fixed", "De 100 à 50 000 DZD maximum")}
          </p>
        </div>
      </div>

      {/* Expiry Date */}
      <div>
        <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wider">
          {t("seller.coupons.field_expiry", "Date d'expiration")} *
        </label>
        <input
          type="date"
          required
          min={minDate}
          value={expiryDate}
          onChange={(e) => onExpiryDateChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-zinc-900"
        />
      </div>

      {/* Optional constraints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
            {t("seller.coupons.field_min_order", "Achat minimum (DZD)")}
          </label>
          <input
            type="number"
            min={0}
            placeholder="Ex: 2000 (Optionnel)"
            value={minOrderAmount}
            onChange={(e) => onMinOrderAmountChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
            {t("seller.coupons.field_max_uses", "Utilisations max")}
          </label>
          <input
            type="number"
            min={1}
            placeholder="Ex: 50 (Optionnel)"
            value={maxUses}
            onChange={(e) => onMaxUsesChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-zinc-900"
          />
        </div>
      </div>

      {/* Live Preview */}
      {code && discountValue && (
        <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/60 flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="text-xs text-zinc-700 font-medium">
              {t("seller.coupons.preview_label", "Aperçu client :")}
              <strong className="text-zinc-950 font-bold ml-1">
                Code {code} : {discountType === "percentage" ? `-${discountValue}%` : `-${discountValue} DZD`}{" "}
                {t("seller.coupons.at_this_seller", "chez ce vendeur")}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
