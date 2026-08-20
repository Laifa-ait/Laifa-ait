import React from "react";
import { useTranslation } from "react-i18next";
import { X, Check, LucideIcon } from "lucide-react";
import { SellerProduct } from "../../../../types/seller";

export interface StepItem {
  id: number;
  title: string;
  icon?: LucideIcon | null;
}

interface StepSidebarProps {
  editingProduct: SellerProduct | null;
  onClose: () => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  STEPS: StepItem[];
}

export const StepSidebar: React.FC<StepSidebarProps> = ({
  editingProduct,
  onClose,
  activeStep,
  setActiveStep,
  STEPS,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full md:w-64 bg-[#FFFBF5] border-r border-[#E5DED4] flex flex-col overflow-y-auto">
      <div className="p-4 md:p-8 flex items-center justify-between pointer-events-auto border-b md:border-b-0 border-[#E5DED4] md:border-transparent mb-2 md:mb-0">
        <h3 className="text-xl font-bold text-slate-900 line-clamp-1 p-2 md:p-0">
          {editingProduct ? "Modifier" : "Ajouter"} {t("Produit")}
        </h3>
        <button
          onClick={onClose}
          className="md:hidden w-12 h-12 rounded-xl bg-[#E5DED4]/50 flex items-center justify-center text-slate-700 active:scale-95 transition-transform shrink-0 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="px-4 pb-6 flex-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide">
        {STEPS.map((step, idx) => {
          const isActive = activeStep === idx;
          const isPast = activeStep > idx;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex flex-col md:flex-row items-center md:items-start md:gap-3 p-4 md:p-4 rounded-xl transition-all whitespace-nowrap min-w-[90px] md:min-w-0 border cursor-pointer ${
                isActive ? "bg-white border-[#C75C1A] shadow-sm" : isPast ? "bg-white border-[#E5DED4]" : "bg-transparent border-transparent hover:bg-slate-100/50"
              }`}
            >
              <div
                className={`w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isActive ? "bg-[#C75C1A] text-white border-[#C75C1A]" : isPast ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-[#E5DED4]"
                }`}
              >
                {isPast ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
              </div>
              <div className="md:flex flex-col text-center md:text-start mt-2 md:mt-0 items-center justify-center pt-1 md:pt-0">
                <span className={`text-xs md:text-sm font-semibold ${isActive ? "text-[#C75C1A]" : "text-slate-600"}`}>{step.title}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-4 border-t border-[#E5DED4] hidden md:block">
        <button
          onClick={onClose}
          className="w-full py-3 bg-white border border-[#E5DED4] text-slate-600 rounded-xl text-sm font-semibold hover:bg-[#FFFBF5] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <X className="w-4 h-4" /> {t("Quitter")}
        </button>
      </div>
    </div>
  );
};

