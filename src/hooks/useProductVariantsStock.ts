import React from "react";
import { Product, ProductVariant } from "../domains/product/product.types";

export function useProductVariantsStock(
  product: Product | null,
  selectedColor: string | null,
  selectedSize: string | null,
  currentPrice?: number | null
) {
  const calculatedVariantKey = React.useMemo(() => {
    return [selectedColor, selectedSize].filter(Boolean).join(" - ").toUpperCase();
  }, [selectedColor, selectedSize]);

  const selectedVariantObj = React.useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return null;
    return product.variants.find((v: ProductVariant) => v.name === calculatedVariantKey) || null;
  }, [product, calculatedVariantKey]);

  const isCurrentSelectionOutOfStock = React.useMemo(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      if (!selectedVariantObj) return false;
      return (Number(selectedVariantObj.stock) || 0) <= 0;
    }
    return (product?.stock || 0) <= 0;
  }, [product, selectedVariantObj]);

  const displayedPrice = React.useMemo(() => {
    const basePrice = currentPrice || 0;
    if (selectedVariantObj) {
      if (
        selectedVariantObj.priceOverride !== undefined &&
        selectedVariantObj.priceOverride !== null &&
        selectedVariantObj.priceOverride !== ""
      ) {
        return Number(selectedVariantObj.priceOverride);
      } else if (selectedVariantObj.priceDiff) {
        return basePrice + Number(selectedVariantObj.priceDiff);
      }
    }
    return basePrice;
  }, [currentPrice, selectedVariantObj]);

  const isColorOutOfStock = React.useCallback(
    (c: string) => {
      if (!product?.variants) return false;
      const variantsWithColor = product.variants.filter((v: ProductVariant) =>
        v.name?.toUpperCase().includes(c.toUpperCase())
      );
      return (
        variantsWithColor.length > 0 &&
        variantsWithColor.every((v: ProductVariant) => (Number(v.stock) || 0) <= 0)
      );
    },
    [product]
  );

  const isSizeOutOfStock = React.useCallback(
    (s: string) => {
      if (!product?.variants) return false;
      const variantsWithSize = product.variants.filter((v: ProductVariant) =>
        v.name?.toUpperCase().includes(s.toUpperCase())
      );
      return (
        variantsWithSize.length > 0 &&
        variantsWithSize.every((v: ProductVariant) => (Number(v.stock) || 0) <= 0)
      );
    },
    [product]
  );

  return {
    selectedVariantObj,
    isCurrentSelectionOutOfStock,
    displayedPrice,
    isColorOutOfStock,
    isSizeOutOfStock,
  };
}
