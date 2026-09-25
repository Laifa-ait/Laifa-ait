import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, ChevronLeft, Loader2, Check, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { ProductFormData, ProductFormTemplate, SellerProduct } from "../../../../types/seller";

interface BottomActionBarProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  showTemplateMenu: boolean;
  setShowTemplateMenu: (show: boolean) => void;
  savedTemplates: ProductFormTemplate[];
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  handleSaveTemplate: () => void;
  handleSubmitProduct: (e?: React.FormEvent | React.MouseEvent, status?: string) => Promise<void>;
  loading: boolean;
  uploading: Record<string, boolean>;
  formData: ProductFormData;
  editingProduct: SellerProduct | null;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  activeStep,
  setActiveStep,
  showTemplateMenu,
  setShowTemplateMenu,
  savedTemplates,
  setFormData,
  handleSaveTemplate,
  handleSubmitProduct,
  loading,
  uploading,
  formData,
  editingProduct,
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 md:px-10 md:py-4 bg-white/95 backdrop-blur-md border-t border-[#E5DED4] flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-30 gap-2 pb-safe">
      <div className="flex items-center gap-2 shrink-0">
        {activeStep > 0 && (
          <button
            type="button"
            onClick={() => setActiveStep(activeStep - 1)}
            className="px-3.5 py-3 md:px-5 md:py-3 border border-[#E5DED4] text-slate-700 bg-white hover:bg-[#FFFBF5] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("Précédent")}</span>
          </button>
        )}

        <div className="tour-step-templates relative">
          <button
            type="button"
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            className="p-3 md:px-4 md:py-3 border border-[#E5DED4] text-slate-600 bg-white hover:bg-[#FFFBF5] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            title={t("Modèles")}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">{t("Templates")}</span>
          </button>
          {showTemplateMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-[#E5DED4] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="w-full text-left px-4 py-3 text-xs font-bold text-[#C75C1A] hover:bg-[#FFFBF5] border-b border-[#E5DED4] cursor-pointer"
              >
                + {t("Sauvegarder la config actuelle")}
              </button>
              <div className="max-h-48 overflow-y-auto">
                {savedTemplates.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-500">{t("Aucun template.")}</p>
                ) : (
                  savedTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setFormData(tpl.data);
                        setShowTemplateMenu(false);
                        toast.success(t("Template chargé !"));
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {tpl.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
        {activeStep === 6 ? (
          <>
            <button
              type="button"
              onClick={(e) => Object.keys(formData).length && handleSubmitProduct(e, "draft")}
              disabled={loading || Object.values(uploading).some(Boolean)}
              className="px-3 py-3 md:px-5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shrink-0 active:scale-95"
            >
              {t("Brouillon")}
            </button>
            <button
              onClick={(e) => handleSubmitProduct(e)}
              disabled={loading || Object.values(uploading).some(Boolean)}
              className="tour-step-next flex-1 sm:flex-none px-4 py-3 md:px-8 bg-[#C75C1A] text-white hover:bg-[#A64D16] rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading || Object.values(uploading).some(Boolean) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span className="truncate">{editingProduct ? t("Mettre à jour") : t("Confirmer & Publier")}</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveStep(activeStep + 1)}
            className="tour-step-next flex-1 sm:flex-none px-5 py-3 md:px-9 bg-[#C75C1A] text-white hover:bg-[#A64D16] rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>{t("Suivant")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

