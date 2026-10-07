import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { FileText, ChevronDown } from "lucide-react";
import { Product } from "../../../domains/product/product.types";

export interface ProductAccordionDescriptionProps {
  product: Product;
  bilingualMode: boolean;
  isOpen: boolean;
  onToggle: () => void;
  isClothing: boolean;
  onOpenSizeGuide: () => void;
}

export const ProductAccordionDescription: React.FC<ProductAccordionDescriptionProps> = ({
  product,
  bilingualMode,
  isOpen,
  onToggle,
  isClothing,
  onOpenSizeGuide,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-start font-bold text-xs uppercase tracking-wider text-zinc-900 hover:text-emerald-700 transition-colors cursor-pointer border-none bg-transparent"
      >
        <span className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>{t("Description")}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-zinc-700" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1 space-y-3 text-zinc-600 text-xs sm:text-sm">
              {bilingualMode ? (
                <div className="space-y-3 text-start">
                  {(product.translations?.["ar"]?.description || product.description) && (
                    <div className="space-y-1 text-right" dir="rtl">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        العربية
                      </span>
                      <p className="text-zinc-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-medium mt-1">
                        {product.translations?.["ar"]?.description || product.description}
                      </p>
                    </div>
                  )}
                  {(product.translations?.["fr"]?.description || product.description) && (
                    <div className="space-y-1 text-left border-t border-zinc-100 pt-3" dir="ltr">
                      <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        Français
                      </span>
                      <p className="text-zinc-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-medium mt-1">
                        {product.translations?.["fr"]?.description || product.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-medium">
                  {product.description}
                </p>
              )}
              {isClothing && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {t("Coupe standard / Regular Fit")}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="text-xs font-semibold text-emerald-700 hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer border-none bg-transparent"
                  >
                    {t("Guide des tailles")}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
