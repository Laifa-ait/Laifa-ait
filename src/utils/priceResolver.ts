export function resolveProductPrice(
  productData: Record<string, unknown>,
  selectedVariant?: unknown
): number {
  const rawPrice = productData.price;
  const basePrice = Number(rawPrice);

  if (
    rawPrice === undefined ||
    rawPrice === null ||
    rawPrice === "" ||
    !Number.isFinite(basePrice) ||
    basePrice < 0
  ) {
    throw new Error(`Prix invalide pour le produit ${productData.name || productData.id || ""}`);
  }

  let price = basePrice;

  // 1. Promo Price check
  const promoPrice = productData.promoPrice;
  if (promoPrice !== undefined && promoPrice !== null && promoPrice !== "") {
    const promo = Number(promoPrice);
    if (!Number.isFinite(promo) || promo < 0) {
      throw new Error(`Prix promo invalide pour le produit ${productData.name || productData.id || ""}`);
    }
    price = promo;
  }

  // 2. Variant check
  if (selectedVariant !== undefined) {
    if (typeof selectedVariant !== "string") {
      throw new Error(`Format de variante invalide pour le produit ${productData.name || productData.id || ""}`);
    }

    if (selectedVariant !== "") {
      const rawVariants = productData.variants;
      if (!Array.isArray(rawVariants) || rawVariants.length === 0) {
        throw new Error(`Variante "${selectedVariant}" non trouvée pour le produit ${productData.name || productData.id || ""}`);
      }

      const matchedVariant = rawVariants.find((v) => {
        if (typeof v !== "object" || v === null) return false;
        const vObj = v as Record<string, unknown>;
        return typeof vObj.name === "string" && vObj.name !== "" && vObj.name === selectedVariant;
      }) as Record<string, unknown> | undefined;

      if (!matchedVariant) {
        throw new Error(`Variante "${selectedVariant}" non trouvée pour le produit ${productData.name || productData.id || ""}`);
      }

      const rawOverride = matchedVariant.priceOverride;
      const rawDiff = matchedVariant.priceDiff;

      if (rawOverride !== undefined && rawOverride !== null && rawOverride !== "") {
        const override = Number(rawOverride);
        if (!Number.isFinite(override) || override < 0) {
          throw new Error(`Prix invalide pour la variante "${selectedVariant}" du produit ${productData.name || productData.id || ""}`);
        }
        price = override;
      } else if (rawDiff !== undefined && rawDiff !== null && rawDiff !== "") {
        const diff = Number(rawDiff);
        if (!Number.isFinite(diff)) {
          throw new Error(`priceDiff invalide pour la variante "${selectedVariant}" du produit ${productData.name || productData.id || ""}`);
        }
        price = price + diff;
      }
    }
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Prix final invalide pour la variante "${selectedVariant || ""}" du produit ${productData.name || productData.id || ""}`);
  }

  return price;
}
