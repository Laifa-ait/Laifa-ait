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
    <div className="absolute bottom-0 left-0 right-0 p-4 md:px-10 md:py-6 bg-white border-t border-[#E5DED4] flex flex-wrap md:flex-nowrap items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20 gap-3">
      <div className="w-full md:w-auto flex items-center gap-3">
        {activeStep > 0 && (
          <button
            onClick={() => setActiveStep(activeStep - 1)}
            className="w-full md:w-auto px-5 py-4 md:px-6 md:py-4 border border-[#E5DED4] text-slate-700 bg-white hover:bg-[#FFFBF5] rounded-xl font-bold text-sm uppercase tracking-widest rtl:tracking-normal transition-colors flex items-center justify-center md:justify-start gap-2 min-h-[50px] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" /> {t("Précédent")}
          </button>
        )}

        <div className="tour-step-templates relative">
          <button
            type="button"
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            className="w-full md:w-auto px-5 py-4 border border-[#E5DED4] text-slate-600 bg-white hover:bg-transparent rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[50px] cursor-pointer"
          >
            <FileText className="w-5 h-5" /> {t("Templates")}
          </button>
          {showTemplateMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-[#E5DED4] rounded-2xl shadow-xl overflow-hidden">
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="w-full text-left px-4 py-3 text-sm font-bold text-[#C75C1A] hover:bg-[#FFFBF5] border-b border-[#E5DED4] cursor-pointer"
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
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-transparent cursor-pointer"
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

      <div className="flex gap-3 w-full md:w-auto justify-end">
        {activeStep === 6 ? (
          <>
            <button
              type="button"
              onClick={(e) => Object.keys(formData).length && handleSubmitProduct(e, "draft")}
              disabled={loading || Object.values(uploading).some(Boolean)}
              className="flex-1 md:flex-none px-4 py-4 md:px-6 border border-slate-300 text-slate-700 bg-white hover:bg-[#FFFBF5] hover:text-slate-900 rounded-xl font-bold text-xs md:text-sm uppercase tracking-widest rtl:tracking-normal transition-colors disabled:opacity-50 min-h-[50px] cursor-pointer"
            >
              {t("Brouillon")}
            </button>
            <button
              onClick={(e) => handleSubmitProduct(e)}
              disabled={loading || Object.values(uploading).some(Boolean)}
              className="tour-step-next flex-[2] md:flex-none px-6 py-4 md:px-8 bg-[#C75C1A] text-white hover:bg-[#A64D16] rounded-xl font-bold text-xs md:text-sm uppercase tracking-widest rtl:tracking-normal shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[50px] cursor-pointer"
            >
              {loading || Object.values(uploading).some(Boolean) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {editingProduct ? "Mettre à jour" : "Confirmer & Publier"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveStep(activeStep + 1)}
            className="tour-step-next w-full md:w-auto px-8 py-4 md:px-10 bg-[#C75C1A] text-white hover:bg-[#A64D16] rounded-xl font-bold text-sm uppercase tracking-widest rtl:tracking-normal shadow-md transition-colors flex items-center justify-center gap-2 min-h-[50px] cursor-pointer"
          >
            {t("Suivant")}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

