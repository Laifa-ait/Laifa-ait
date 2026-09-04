import React, { useState } from "react";
import { X, Tag, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiPost } from "../../../../lib/api";
import { Coupon } from "../../../../domains/marketing/coupon.types";
import { SellerCouponFormFields } from "./SellerCouponFormFields";

interface SellerCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (coupon: Coupon) => void;
}

export const SellerCouponModal: React.FC<SellerCouponModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [expiryDate, setExpiryDate] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">("");
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    setCode(val);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const upperCode = code.trim().toUpperCase();
    if (upperCode.length < 4 || upperCode.length > 20) {
      setFormError(t("seller.coupons.error_code_length", "Le code promo doit contenir entre 4 et 20 caractères alphanumériques."));
      return;
    }

    const numValue = Number(discountValue);
    if (!numValue || isNaN(numValue) || numValue <= 0) {
      setFormError(t("seller.coupons.error_value_invalid", "Veuillez saisir un montant de réduction valide."));
      return;
    }

    if (discountType === "percentage" && (numValue < 1 || numValue > 70)) {
      setFormError(t("seller.coupons.error_percentage_range", "Le pourcentage de réduction doit être compris entre 1 % et 70 %."));
      return;
    }

    if (discountType === "fixed" && (numValue < 100 || numValue > 50000)) {
      setFormError(t("seller.coupons.error_fixed_range", "La réduction fixe doit être comprise entre 100 DZD et 50 000 DZD."));
      return;
    }

    if (!expiryDate) {
      setFormError(t("seller.coupons.error_expiry_required", "Veuillez sélectionner une date d'expiration valide."));
      return;
    }

    const parsedExpiry = new Date(expiryDate);
    if (isNaN(parsedExpiry.getTime()) || parsedExpiry.getTime() <= Date.now()) {
      setFormError(t("seller.coupons.error_expiry_future", "La date d'expiration doit être ultérieure à la date actuelle."));
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: upperCode,
        discountType,
        discountValue: numValue,
        expiryDate: new Date(`${expiryDate}T23:59:59`).toISOString(),
        minOrderAmount: minOrderAmount !== "" ? Number(minOrderAmount) : undefined,
        maxUses: maxUses !== "" ? Number(maxUses) : undefined,
      };

      const res = await apiPost<{ success: boolean; coupon: Coupon; message?: string }>(
        "/api/v1/seller/coupons",
        payload
      );

      if (res && res.success && res.coupon) {
        toast.success(res.message || t("seller.coupons.created_success", "Code promo créé avec succès !"));
        onCreated(res.coupon);
        onClose();
      } else {
        throw new Error("Réponse inattendue du serveur.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("seller.coupons.error_create", "Erreur lors de la création du coupon.");
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-950">{t("seller.coupons.create_title", "Créer un code promo")}</h3>
              <p className="text-xs text-zinc-500 font-medium">{t("seller.coupons.create_subtitle", "Valable exclusivement sur votre boutique")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 flex items-center gap-2.5 text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <SellerCouponFormFields
            code={code}
            onCodeChange={handleCodeChange}
            discountType={discountType}
            onDiscountTypeChange={(type) => { setDiscountType(type); setDiscountValue(""); }}
            discountValue={discountValue}
            onDiscountValueChange={setDiscountValue}
            expiryDate={expiryDate}
            onExpiryDateChange={setExpiryDate}
            minOrderAmount={minOrderAmount}
            onMinOrderAmountChange={setMinOrderAmount}
            maxUses={maxUses}
            onMaxUsesChange={setMaxUses}
            minDate={getMinDate()}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-all cursor-pointer"
            >
              {t("common.cancel", "Annuler")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t("common.submitting", "Création...") : t("seller.coupons.btn_create", "Créer le coupon")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
