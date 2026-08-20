import React from "react";
import { Plus, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CouponFormData, CouponDiscountType } from "../../../domains/marketing/coupon.types";

export interface CouponCreateFormProps {
  couponForm: CouponFormData;
  setCouponForm: React.Dispatch<React.SetStateAction<CouponFormData>>;
  handleCreateCoupon: (e: React.FormEvent) => void;
  isCreatingCoupon: boolean;
  setShowAddForm: (show: boolean) => void;
}

export const CouponCreateForm: React.FC<CouponCreateFormProps> = ({
  couponForm,
  setCouponForm,
  handleCreateCoupon,
  isCreatingCoupon,
  setShowAddForm,
}) => {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={handleCreateCoupon}
      className="mb-10 p-8 bg-zinc-50 border border-zinc-200/80 rounded-[2.5rem] space-y-6 overflow-hidden"
    >
      <h5 className="text-sm font-black uppercase tracking-wider rtl:tracking-normal text-zinc-900 mb-2">
        {t("Créer un Nouveau Code Promo")}
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest rtl:tracking-normal text-zinc-400 mb-2">
            {t("Code Promo (ex: RAMADAN2025)")}
          </label>
          <input
            type="text"
            required
            placeholder="CODE2025"
            className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl font-mono text-sm uppercase font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
            value={couponForm.code || ""}
            onChange={(e) =>
              setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
            }
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest rtl:tracking-normal text-zinc-400 mb-2">
            {t("Type de Remise")}
          </label>
          <select
            className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
            value={couponForm.discountType || "percentage"}
            onChange={(e) =>
              setCouponForm({
                ...couponForm,
                discountType: e.target.value as CouponDiscountType,
              })
            }
          >
            <option value="percentage">{t("Pourcentage (%)")}</option>
            <option value="percent">{t("Pourcentage (%)")}</option>
            <option value="fixed">{t("Montant Fixe (DZD)")}</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest rtl:tracking-normal text-zinc-400 mb-2">
            {couponForm.discountType === "percent" || couponForm.discountType === "percentage"
              ? t("Valeur (%)")
              : t("Valeur (DZD)")}
          </label>
          <input
            type="number"
            required
            min="1"
            placeholder={couponForm.discountType === "percent" || couponForm.discountType === "percentage" ? "15" : "1000"}
            className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
            value={couponForm.discountValue ?? ""}
            onChange={(e) =>
              setCouponForm({ ...couponForm, discountValue: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest rtl:tracking-normal text-zinc-400 mb-2">
            {t("Montant Min. de Commande (DZD)")}
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
            value={couponForm.minOrderValue ?? couponForm.minOrderAmount ?? ""}
            onChange={(e) =>
              setCouponForm({ ...couponForm, minOrderValue: e.target.value, minOrderAmount: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest rtl:tracking-normal text-zinc-400 mb-2">
            {t("Date d'Expiration")}
          </label>
          <input
            type="date"
            required
            className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
            value={couponForm.expiryDate || couponForm.expiresAt || ""}
            onChange={(e) =>
              setCouponForm({ ...couponForm, expiryDate: e.target.value, expiresAt: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest rtl:tracking-normal text-zinc-400 mb-2">
            {t("Limite d'Utilisation (Optionnel)")}
          </label>
          <input
            type="number"
            min="1"
            placeholder="Ex: 100"
            className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
            value={couponForm.usageLimit ?? ""}
            onChange={(e) =>
              setCouponForm({ ...couponForm, usageLimit: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowAddForm(false)}
          className="px-6 py-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          {t("Annuler")}
        </button>
        <button
          type="submit"
          disabled={isCreatingCoupon}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white text-xs font-black uppercase tracking-wider hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer border-none"
        >
          {isCreatingCoupon ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {t("Créer le Coupon")}
        </button>
      </div>
    </form>
  );
};
