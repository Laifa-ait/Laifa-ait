import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { Layers } from "lucide-react";
import { Product } from "../../../domains/product/product.types";

export interface ProductAccordionSpecsProps {
  product: Product;
  isOpen: boolean;
  onToggle: () => void;
  isClothing: boolean;
  getTranslatedMaterials: () => string | null;
  getTranslatedSeason: () => string | null;
  detailedAttributes: Array<{ label: string; value: string; unit?: string }>;
}

export const ProductAccordionSpecs: React.FC<ProductAccordionSpecsProps> = ({
  product,
  isOpen,
  onToggle,
  isClothing,
  getTranslatedMaterials,
  getTranslatedSeason,
  detailedAttributes,
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-b border-[#EAE3D5]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-start font-sans font-bold text-xs uppercase tracking-wider text-[#2C2C28] cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#008BB5]" />
          {t("Caractéristiques & Détails")}
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
            <div className="px-5 pb-5 pt-1 space-y-3 text-xs text-stone-600 bg-[#FAF6F0]/25">
              {product.sku && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("Référence / SKU")}
                  </span>
                  <span className="font-mono text-xs text-[#2C2C28] font-bold select-all">
                    {product.sku}
                  </span>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("Marque")}
                  </span>
                  <span className="text-[#2C2C28] font-bold">{product.brand}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("État")}
                  </span>
                  <span className="text-[#2C2C28] font-bold">{product.condition}</span>
                </div>
              )}
              {product.gender && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("Public cible / Genre")}
                  </span>
                  <span className="text-[#2C2C28] font-bold">{product.gender}</span>
                </div>
              )}
              {product.warranty && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("Garantie")}
                  </span>
                  <span className="text-emerald-700 font-bold">{product.warranty}</span>
                </div>
              )}
              {product.materials && product.materials.length > 0 && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("Matière principale")}
                  </span>
                  <span className="text-[#2C2C28] font-bold">
                    {getTranslatedMaterials()}
                    {product.otherMaterial ? ` (${product.otherMaterial})` : ""}
                  </span>
                </div>
              )}
              {(product.weight || product.dimensions) && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("Dimensions & Poids")}
                  </span>
                  <span className="text-[#2C2C28] font-bold">
                    {product.weight ? `${product.weight} kg` : ""}
                    {product.weight && product.dimensions ? " | " : ""}
                    {product.dimensions ? `${product.dimensions}` : ""}
                  </span>
                </div>
              )}
              {product.season && (
                <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {t("Saison")}
                  </span>
                  <span className="text-[#2C2C28] font-bold">{getTranslatedSeason()}</span>
                </div>
              )}
              {detailedAttributes.map((attr, idx) => (
                <div key={idx} className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
                    {attr.label}
                  </span>
                  <span className="text-[#2C2C28] font-bold">
                    {attr.value}
                    {attr.unit ? ` ${attr.unit}` : ""}
                  </span>
                </div>
              ))}
              {isClothing && (
                <div className="pt-2 text-[10px] text-stone-500 italic">
                  {t(
                    "Conseil d'entretien : Laver sur l'envers à 30°C avec des coloris similaires. Repassage doux recommandé."
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
