import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { FileText } from "lucide-react";
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
    <div className="border-b border-[#EAE3D5]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-start font-sans font-bold text-xs uppercase tracking-wider text-[#2C2C28] cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#008BB5]" />
          {t("Description / taillant")}
        </span>
        <span
          className={`text-stone-400 font-light text-base transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-4 text-stone-600 bg-[#FAF6F0]/25">
              {bilingualMode ? (
                <div className="space-y-4 text-start">
                  {(product.translations?.["ar"]?.description || product.description) && (
                    <div className="space-y-1 text-right" dir="rtl">
                      <span className="text-[8px] font-bold text-[#D81159] bg-[#FFEAEF] px-2 py-0.5 rounded uppercase tracking-wider">
                        العربية
                      </span>
                      <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
                        {product.translations?.["ar"]?.description || product.description}
                      </p>
                    </div>
                  )}
                  {(product.translations?.["fr"]?.description || product.description) && (
                    <div className="space-y-1 text-left border-t border-[#EAE3D5] pt-3" dir="ltr">
                      <span className="text-[8px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        Français
                      </span>
                      <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
                        {product.translations?.["fr"]?.description || product.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
                  {product.description}
                </p>
              )}
              {isClothing && (
                <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D5]">
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                    {t("Coupe standard / Regular Fit")}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="text-[9px] font-bold text-[#008BB5] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
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
