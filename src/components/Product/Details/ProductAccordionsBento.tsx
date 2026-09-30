import React from "react";
import { Product } from "../../../domains/product/product.types";
import { Shop } from "../../../domains/seller/shop.types";
import { ProductAccordionDescription } from "./ProductAccordionDescription";
import { ProductAccordionSpecs } from "./ProductAccordionSpecs";
import { ProductAccordionShipping } from "./ProductAccordionShipping";

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
  return (
    <div className="bg-white rounded-[2rem] border border-[#EAE3D5] overflow-hidden shadow-sm">
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
    </div>
  );
};
