import React from "react";
import { Product } from "../../../domains/product/product.types";
import { Shop } from "../../../domains/seller/shop.types";
import { ProductAccordionDescription } from "./ProductAccordionDescription";
import { ProductAccordionSpecs } from "./ProductAccordionSpecs";
import { ProductAccordionShipping } from "./ProductAccordionShipping";
import { Ruler, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ProductAccordionsBentoProps {
  product: Product;
  shop: Shop | null;
  currentLang: string;
  bilingualMode: boolean;
  openAccordion: string | null;
  onToggleAccordion: (section: string) => void;
  onOpenSizeGuide: () => void;
  isClothing: boolean;
  getTranslatedMaterials: () => string | null;
  getTranslatedSeason: () => string | null;
  detailedAttributes: Array<{ label: string; value: string; unit?: string }>;
}

export const ProductAccordionsBento: React.FC<ProductAccordionsBentoProps> = ({
  product,
  shop,
  bilingualMode,
  openAccordion,
  onToggleAccordion,
  onOpenSizeGuide,
  isClothing,
  getTranslatedMaterials,
  getTranslatedSeason,
  detailedAttributes,
}) => {
  const { t } = useTranslation();

  return (
    <div className="divide-y divide-zinc-100 pt-2">
      <ProductAccordionDescription
        product={product}
        bilingualMode={bilingualMode}
        isOpen={openAccordion === "description"}
        onToggle={() => onToggleAccordion("description")}
        isClothing={isClothing}
        onOpenSizeGuide={onOpenSizeGuide}
      />

      <ProductAccordionSpecs
        product={product}
        isOpen={openAccordion === "composition"}
        onToggle={() => onToggleAccordion("composition")}
        isClothing={isClothing}
        getTranslatedMaterials={getTranslatedMaterials}
        getTranslatedSeason={getTranslatedSeason}
        detailedAttributes={detailedAttributes}
      />

      <ProductAccordionShipping
        product={product}
        shop={shop}
        isOpen={openAccordion === "shipping"}
        onToggle={() => onToggleAccordion("shipping")}
      />

      {/* Guide des tailles entry */}
      <button
        type="button"
        onClick={onOpenSizeGuide}
        className="w-full flex items-center justify-between py-4 text-start font-bold text-xs uppercase tracking-wider text-zinc-900 hover:text-emerald-700 transition-colors cursor-pointer border-none bg-transparent"
      >
        <span className="flex items-center gap-2.5">
          <Ruler className="w-4 h-4 text-emerald-600" />
          <span>{t("product.details.size_guide") || "Guide des tailles"}</span>
        </span>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
      </button>
    </div>
  );
};
