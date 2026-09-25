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
    <>
      {/* Mobile Top Stepper Strip (Ultra Compact) */}
      <div className="md:hidden w-full bg-white border-b border-[#E5DED4] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-10">
        {STEPS.map((step, idx) => {
          const isActive = activeStep === idx;
          const isPast = activeStep > idx;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-[#C75C1A] text-white shadow-xs"
                  : isPast
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-[#FFFBF5] text-slate-600 border border-[#E5DED4] hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isActive
                    ? "bg-white/20 text-white font-extrabold"
                    : isPast
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isPast ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
              </span>
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-[#FFFBF5] border-r border-[#E5DED4] flex-col overflow-y-auto shrink-0">
        <div className="p-8 pb-6 flex items-center justify-between pointer-events-auto">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C75C1A]">
              Olmart Vendeur
            </span>
            <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
              {editingProduct ? t("Modifier Produit") : t("Ajouter un Produit")}
            </h3>
          </div>
        </div>

        <div className="px-4 pb-6 flex-1 flex flex-col gap-2 overflow-y-auto">
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            const isPast = activeStep > idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all border cursor-pointer text-left ${
                  isActive
                    ? "bg-white border-[#C75C1A] shadow-sm"
                    : isPast
                    ? "bg-white/80 border-[#E5DED4] hover:bg-white"
                    : "bg-transparent border-transparent hover:bg-white/50 text-slate-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#C75C1A] text-white border-[#C75C1A] shadow-xs"
                      : isPast
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-[#E5DED4]"
                  }`}
                >
                  {isPast ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${isActive ? "text-[#C75C1A]" : isPast ? "text-slate-900" : "text-slate-600"}`}>
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {idx === 0 && t("Nom, catégorie & trad.")}
                    {idx === 1 && t("Tailles & couleurs")}
                    {idx === 2 && t("Combinaisons & stock")}
                    {idx === 3 && t("Photos & vidéos")}
                    {idx === 4 && t("Prix & marge DA")}
                    {idx === 5 && t("69 Wilayas & livraison")}
                    {idx === 6 && t("Validation finale")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#E5DED4]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white border border-[#E5DED4] text-slate-600 rounded-xl text-sm font-semibold hover:bg-[#FFFBF5] hover:text-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <X className="w-4 h-4" /> {t("Quitter")}
          </button>
        </div>
      </div>
    </>
  );
};

