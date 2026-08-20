import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { ProductFormData } from "../../../../../types/seller";

interface SpecsSeoProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export const SpecsSeo: React.FC<SpecsSeoProps> = ({
  formData,
  setFormData,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 bg-[#FFFBF5]/50 p-6 rounded-2xl border border-[#E5DED4]">
      <div className="flex items-center gap-2 border-b border-[#E5DED4]/60 pb-3 mb-4">
        <Globe className="w-4 h-4 text-[#C75C1A]" />
        <div>
          <h4 className="text-sm font-bold text-slate-900">{t("SEO & Visibilité")}</h4>
          <p className="text-xs text-slate-500">{t("Optimisez votre produit pour les moteurs de recherche (Google) et les réseaux sociaux.")}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">{t("Meta Title (Titre SEO)")}</label>
          <input
            type="text"
            placeholder={t("Titre optimisé pour Google... (Max 60 caractères)") || "Titre optimisé pour Google..."}
            className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm"
            value={formData.metaTitle || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
            maxLength={60}
          />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("Laissez vide pour utiliser le nom du produit.")}</p>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">{t("Meta Description")}</label>
          <textarea
            placeholder={t("Description courte et accrocheuse... (Max 160 caractères)") || "Description courte et accrocheuse..."}
            className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm resize-none h-20"
            value={formData.metaDescription || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
            maxLength={160}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">{t("Slug (URL personnalisée)")}</label>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 rounded-xl border border-[#E5DED4] bg-transparent text-slate-500 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-[200px]">
              olmart.dz/p/
            </span>
            <input
              type="text"
              placeholder={t("mon-produit-incroyable") || "mon-produit-incroyable"}
              className="flex-1 px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm"
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, ""),
                }))
              }
            />
            <button
              type="button"
              onClick={() => {
                if (formData.name) {
                  setFormData((prev) => ({
                    ...prev,
                    slug: prev.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, ""),
                  }));
                }
              }}
              className="px-4 py-2.5 bg-[#FFFBF5] text-[#C75C1A] border border-[#E5DED4] hover:bg-[#C75C1A] hover:text-white rounded-xl transition-all font-bold text-xs shrink-0 cursor-pointer"
            >
              {t("Générer")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

