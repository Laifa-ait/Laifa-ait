import React from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShippingLabelHeaderProps } from "./shippingLabel.types";

export const ShippingLabelHeader: React.FC<ShippingLabelHeaderProps> = ({ onClose, onPrint }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-zinc-500 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-tight rtl:tracking-normal">
            {t("Bordereaux de Transport National")}
          </h2>
          <p className="text-xs rtl:text-sm text-zinc-400 font-bold">
            {t("Configurez et imprimez des tickets de vente compatibles Mayestro ou Standard Olmart.")}
          </p>
        </div>
      </div>

      <button
        onClick={onPrint}
        className="px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-sans font-bold text-xs rtl:text-sm uppercase tracking-widest rtl:tracking-normal rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md hover:shadow-lg"
      >
        <Printer className="w-4 h-4" />
        {t("Lancer l'impression")}
      </button>
    </div>
  );
};
