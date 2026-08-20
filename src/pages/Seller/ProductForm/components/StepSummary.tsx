import React from "react";
import { useTranslation } from "react-i18next";
import { Eye, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ProductFormData, ProductVariant, SellerProduct, SellerUserProfile } from "../../../../types/seller";

interface StepSummaryProps {
  formData: ProductFormData;
  editingProduct: SellerProduct | null;
  userProfile: SellerUserProfile | null;
  setShowPreview: (val: boolean) => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  formData,
  editingProduct,
  userProfile,
  setShowPreview,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-10">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-slate-900">{t("Récapitulatif")}</h4>
          <p className="text-sm text-slate-500">{t("Vérifiez les détails avant la publication.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 text-[#8B7355] hover:text-[#C75C1A] font-bold text-sm transition-colors border border-[#E5DED4] rounded-lg px-4 py-2 hover:bg-[#FFFBF5] cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          {t("product.preview", "Aperçu acheteur")}
        </button>
      </div>

      <div className="bg-[#FFFBF5] rounded-3xl border border-[#E5DED4] overflow-hidden divide-y divide-[#E5DED4]">
        {editingProduct && (
          <div className="p-6 bg-transparent">
            <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              {t("Modifications détectées (Diff)")}
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {formData.name !== editingProduct.name && (
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">{t("Nom")}</span>
                  <div className="text-red-500 line-through text-xs mb-1">{editingProduct.name}</div>
                  <div className="text-emerald-600 font-bold">{formData.name}</div>
                </div>
              )}
              {formData.price !== editingProduct.price?.toString() && (
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">{t("Prix")}</span>
                  <div className="text-red-500 line-through text-xs mb-1">{editingProduct.price} DA</div>
                  <div className="text-emerald-600 font-bold">{formData.price} DA</div>
                </div>
              )}
              {formData.stock !== editingProduct.stock?.toString() && (
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">{t("Stock")}</span>
                  <div className="text-red-500 line-through text-xs mb-1">{editingProduct.stock}</div>
                  <div className="text-emerald-600 font-bold">{formData.stock}</div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="p-6 flex gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-white border border-[#E5DED4] overflow-hidden shrink-0 shadow-sm relative">
            {formData.images && formData.images.find((i) => i) ? (
              <img loading="lazy" src={formData.images.find((i) => i)} className="w-full h-full object-cover" alt={t("Preview") || "Preview"} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-extrabold text-slate-900 text-lg truncate">{formData.name || "Sans nom"}</h5>
            <p className="text-sm font-bold text-[#C75C1A] mt-1">
              {formData.category} {formData.subcategory ? `> ${formData.subcategory}` : ""}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="px-3 py-1 bg-white border border-[#E5DED4] rounded-lg text-lg font-sans font-bold text-slate-900">
                {formData.price} <span className="text-xs">{t("DA")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest rtl:tracking-normal mb-1">{t("Statut")}</p>
            {userProfile?.isVerified === true || userProfile?.role === "admin" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t("Approuvé & En Ligne")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal border border-amber-100 shadow-sm backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {t("En cours d'examen par la Curation")}
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest rtl:tracking-normal mb-1">{t("Stock Total")}</p>
            <p className="text-sm font-extrabold text-slate-900">
              {formData.variants && formData.variants.length > 0
                ? formData.variants.reduce((acc: number, curr: ProductVariant) => acc + (typeof curr.stock === "number" ? curr.stock : parseInt(curr.stock, 10) || 0), 0)
                : formData.stock || 0}{" "}
              {t("unités")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest rtl:tracking-normal mb-1">{t("SKU")}</p>
            <p className="text-sm font-mono font-bold text-slate-700">{formData.sku || "-"}</p>
          </div>
          <div>
            <p className="text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest rtl:tracking-normal mb-1">{t("Expédition")}</p>
            <p className="text-sm font-bold text-slate-900">
              {formData.wilaya} ({formData.deliveryPrice || "Défaut"} {t("DA)")}
            </p>
          </div>
          <div className="col-span-full">
            <p className="text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest rtl:tracking-normal mb-1">{t("Description")}</p>
            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">{formData.description || "Aucune description fournie."}</p>
          </div>
        </div>

        <div className="p-6 bg-[#C75C1A]/5">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C75C1A]/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#C75C1A]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#C75C1A]">{t("Intelligence de Traduction Adaptative")}</p>
              <p className="text-xs font-medium text-[#A64D16]/80 mt-1">
                {t(
                  'Notre système va détecter automatiquement la langue de votre saisie (FR, AR ou EN) et traduire les fiches produits vers les deux autres langues dès que vous cliquerez sur "Confirmer & Publier".'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

