import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { ProductFormData } from "../../../../types/seller";

interface StepIdentityTranslationProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  translating?: boolean;
  activeLangTab?: "fr" | "ar" | "en";
  setActiveLangTab?: (tab: "fr" | "ar" | "en") => void;
  handleFreeTranslateProduct?: () => Promise<void>;
}

export const StepIdentityTranslation: React.FC<StepIdentityTranslationProps> = ({
  formData,
  setFormData,
  translating = false,
  activeLangTab = "fr",
  setActiveLangTab,
  handleFreeTranslateProduct,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFFBF5] p-4 sm:p-5 rounded-2xl border border-orange-200/90 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C75C1A]/10 text-[#C75C1A] flex items-center justify-center font-bold text-sm shrink-0">
            🌍
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                {t("Traduction Multilingue Gratuite (Mabrouk)")}
              </h5>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                {t("100% Gratuit • 0 DA")}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {t("Générez instantanément et gratuitement les versions Arabe et Anglais.")}
            </p>
          </div>
        </div>

        {handleFreeTranslateProduct && (
          <button
            type="button"
            onClick={handleFreeTranslateProduct}
            disabled={translating || !formData.name?.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C75C1A] hover:bg-[#A64D16] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${translating ? "animate-spin" : ""}`} />
            {translating ? t("Traduction gratuite...") : t("Traduire gratuitement (AR & EN)")}
          </button>
        )}
      </div>

      {/* Language selector tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E5DED4] pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveLangTab && setActiveLangTab("fr")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeLangTab === "fr"
              ? "bg-white text-slate-900 shadow-xs border border-orange-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🇫🇷</span>
          <span>Français (Saisie)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLangTab && setActiveLangTab("ar")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeLangTab === "ar"
              ? "bg-white text-emerald-800 shadow-xs border border-emerald-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🇩🇿</span>
          <span>العربية {formData.translations?.ar?.name ? "✓" : ""}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLangTab && setActiveLangTab("en")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeLangTab === "en"
              ? "bg-white text-blue-800 shadow-xs border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🇬🇧</span>
          <span>English {formData.translations?.en?.name ? "✓" : ""}</span>
        </button>
      </div>

      {/* Arabic version preview & edit */}
      {activeLangTab === "ar" && (
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-orange-100" dir="rtl">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 text-right">
              اسم المنتج بالعربية (Titre en Arabe) :
            </label>
            <input
              type="text"
              dir="rtl"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-[#C75C1A] outline-none"
              placeholder="اسم المنتج بالعربية (اضغط على ترجمة مجانية)..."
              value={formData.translations?.ar?.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    ar: {
                      name: e.target.value,
                      description: prev.translations?.ar?.description || "",
                    },
                  },
                }))
              }
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 text-right">
              وصف المنتج بالعربية (Description en Arabe) :
            </label>
            <textarea
              rows={3}
              dir="rtl"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-[#C75C1A] outline-none resize-none"
              placeholder="وصف المنتج بالعربية..."
              value={formData.translations?.ar?.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    ar: {
                      name: prev.translations?.ar?.name || "",
                      description: e.target.value,
                    },
                  },
                }))
              }
            />
          </div>
        </div>
      )}

      {/* English version preview & edit */}
      {activeLangTab === "en" && (
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-orange-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Product Name (English translation):
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-[#C75C1A] outline-none"
              placeholder="Product name in English (Click Free Translate)..."
              value={formData.translations?.en?.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: {
                      name: e.target.value,
                      description: prev.translations?.en?.description || "",
                    },
                  },
                }))
              }
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Product Description (English):
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-[#C75C1A] outline-none resize-none"
              placeholder="Product description in English..."
              value={formData.translations?.en?.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: {
                      name: prev.translations?.en?.name || "",
                      description: e.target.value,
                    },
                  },
                }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
