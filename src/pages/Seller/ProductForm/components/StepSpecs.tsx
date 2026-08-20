import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ProductColor, ProductFormData, SizeTypeOption } from "../../../../types/seller";
import { CategoryStructure } from "../../../../config/dynamicFilters";

import { SpecsFilters } from "./specs/SpecsFilters";
import { SpecsTechnicalSheet } from "./specs/SpecsTechnicalSheet";
import { SpecsSeo } from "./specs/SpecsSeo";
import { SpecsVariants } from "./specs/SpecsVariants";

interface StepSpecsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  DYNAMIC_CATEGORIES: Record<string, CategoryStructure>;
  SIZE_TYPES: SizeTypeOption[];
  activeSizeList: string[];
  toggleSize: (size: string) => void;
  PRODUCT_COLORS: ProductColor[];
  handleGenerateSku: () => void;
  handleGenerateVariants: () => void;
}

export const StepSpecs: React.FC<StepSpecsProps> = ({
  formData,
  setFormData,
  DYNAMIC_CATEGORIES,
  SIZE_TYPES,
  activeSizeList,
  toggleSize,
  PRODUCT_COLORS,
  handleGenerateSku,
  handleGenerateVariants,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="space-y-1">
        <h4 className="text-xl font-bold text-slate-900">{t("Caractéristiques & Variantes")}</h4>
        <p className="text-sm text-slate-500">{t("Définissez les attributs spécifiques et générez les variantes.")}</p>
      </div>

      <SpecsFilters
        formData={formData}
        setFormData={setFormData}
        DYNAMIC_CATEGORIES={DYNAMIC_CATEGORIES}
      />

      <SpecsTechnicalSheet
        formData={formData}
        setFormData={setFormData}
        handleGenerateSku={handleGenerateSku}
      />

      <SpecsSeo
        formData={formData}
        setFormData={setFormData}
      />

      <SpecsVariants
        formData={formData}
        setFormData={setFormData}
        DYNAMIC_CATEGORIES={DYNAMIC_CATEGORIES}
        SIZE_TYPES={SIZE_TYPES}
        activeSizeList={activeSizeList}
        toggleSize={toggleSize}
        PRODUCT_COLORS={PRODUCT_COLORS}
        handleGenerateVariants={handleGenerateVariants}
      />
    </motion.div>
  );
};

