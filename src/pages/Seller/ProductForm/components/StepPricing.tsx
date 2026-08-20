import React from "react";
import { useTranslation } from "react-i18next";
import { Tag, Bell } from "lucide-react";
import { motion } from "motion/react";
import { ProductFormData } from "../../../../types/seller";

interface StepPricingProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  mg: { val: string; perc: string } | null;
}

export const StepPricing: React.FC<StepPricingProps> = ({
  formData,
  setFormData,
  mg,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="space-y-1">
        <h4 className="text-xl font-bold text-slate-900">{t("Tarification & Commercial")}</h4>
        <p className="text-sm text-slate-500">{t("Fixez votre prix de vente et gérez vos marges (en Dinar Algérien - DA).")}</p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 bg-[#FFFBF5] p-6 rounded-2xl border border-[#E5DED4]">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">{t("Prix de vente base (DA) *")}</label>
            <input
              required
              type="number"
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none text-xl font-sans font-bold focus:border-[#C75C1A] text-slate-900 transition-colors"
              placeholder="0.00"
              value={formData.price || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex justify-between items-center">
              {t("Prix comparé / Promo (DA)")}
              <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">{t("Optionnel")}</span>
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl outline-none text-xl font-sans font-bold text-orange-600 focus:border-orange-500 placeholder:text-orange-200 transition-colors"
              placeholder="0.00"
              value={formData.promoPrice || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, promoPrice: e.target.value }))}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[#E5DED4]">
          <h5 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" /> {t("Analyse de rentabilité")}
          </h5>
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 flex justify-between items-center">
                {t("Coût d'achat ou revient (DA)")}
                <span className="text-[9px] font-bold text-slate-500 italic">{t("Privé")}</span>
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-bold text-slate-900 focus:border-[#C75C1A] transition-colors"
                placeholder={t("Coût interne...") || "Coût interne..."}
                value={formData.costPrice || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, costPrice: e.target.value }))}
              />
            </div>
            <div className={`p-4 rounded-xl border ${mg ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-[#FFFBF5] border-[#E5DED4] text-slate-500"}`}>
              {mg ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">{t("Marge Estimée")}</span>
                  <div className="text-end">
                    <span className="block text-lg font-sans font-bold">
                      {mg.val} {t("DA")}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest rtl:tracking-normal">{mg.perc}{t("% de marge nette")}</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-medium">{t("Entrez un prix de vente et un coût pour estimer votre marge.")}</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[#E5DED4]">
          <h5 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C75C1A]" /> {t("Alerte de Stock Bas (Critique)")}
          </h5>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-2">
                {t("Recevez un email et une notification push lorsque le stock de ce produit ou de l'une de ses variantes descend en dessous de ce seuil.")}
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Seuil d'alerte (Unités)")}</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-bold text-slate-900 focus:border-[#C75C1A] transition-colors"
                placeholder="5"
                value={formData.lowStockAlert || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, lowStockAlert: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

