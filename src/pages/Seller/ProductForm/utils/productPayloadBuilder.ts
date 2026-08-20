import { ProductFormData, ProductVariant, SellerProduct } from "../../../../types/seller";
import { safeParseFloat } from "../hooks/useProductVariantsAndAttributes";

export interface BuildPayloadOptions {
  status: string;
  sellerId?: string;
  sellerName?: string;
  sellerStoreName?: string;
  sellerLogo?: string;
}

export function buildProductPayload(
  formData: ProductFormData,
  options: BuildPayloadOptions
): Partial<SellerProduct> & Record<string, unknown> {
  const filteredImages = (formData.images || []).filter((img) => img && img.trim().length > 0);
  const mainImage = filteredImages[0] || formData.image || "/placeholder.png";

  const sanitizedVariants: ProductVariant[] = (formData.variants || []).map((v) => {
    const vStock = typeof v.stock === "number" ? v.stock : parseInt(String(v.stock || "0"), 10) || 0;
    const vPrice = v.price ? safeParseFloat(v.price) ?? undefined : undefined;
    const vPromo = v.promoPrice ? safeParseFloat(v.promoPrice) ?? undefined : undefined;
    const vOverride = v.priceOverride ? safeParseFloat(v.priceOverride) ?? undefined : undefined;

    return {
      id: v.id,
      name: v.name.trim(),
      sku: v.sku?.trim() || undefined,
      stock: vStock,
      price: vPrice,
      priceOverride: vOverride,
      priceDiff: v.priceDiff !== undefined ? v.priceDiff : undefined,
      promoPrice: vPromo,
      color: v.color?.trim() || undefined,
      size: v.size?.trim() || undefined,
      material: v.material?.trim() || undefined,
      image: v.image || undefined,
      imageIndex: v.imageIndex !== undefined ? v.imageIndex : null,
      isActive: v.isActive !== false,
    };
  });

  const totalStock =
    sanitizedVariants.length > 0
      ? sanitizedVariants.reduce((sum, v) => sum + (typeof v.stock === "number" ? v.stock : 0), 0)
      : parseInt(String(formData.stock || "0"), 10) || 0;

  const hasOutOfStock = sanitizedVariants.some((v) => v.stock === 0);

  const parsedPrice = safeParseFloat(formData.price) || 0;
  const parsedPromoPrice = formData.promoPrice ? safeParseFloat(formData.promoPrice) ?? undefined : undefined;
  const parsedFlashPrice = formData.flashPrice ? safeParseFloat(formData.flashPrice) ?? undefined : undefined;
  const parsedCostPrice = formData.costPrice ? safeParseFloat(formData.costPrice) ?? undefined : undefined;
  const parsedWeight = formData.weight ? safeParseFloat(formData.weight) ?? undefined : undefined;
  const parsedDeliveryPrice = safeParseFloat(formData.deliveryPrice) || 0;

  const payload: Partial<SellerProduct> & Record<string, unknown> = {
    name: formData.name.trim(),
    brand: formData.brand?.trim() || "",
    brandName: formData.brand?.trim() || "",
    category: formData.category,
    subcategory: formData.subcategory || "",
    subSubCategory: formData.subSubCategory || "",
    gender: formData.gender || "",
    condition: formData.condition || "new",
    warranty: formData.warranty || "",
    materials: formData.materials || [],
    otherMaterial: formData.otherMaterial || "",
    season: formData.season || "",
    description: formData.description?.trim() || "",
    tags: formData.tags || [],
    price: parsedPrice,
    promoPrice: parsedPromoPrice,
    flashPrice: parsedFlashPrice,
    flashSaleActive: Boolean(formData.flashSaleActive),
    costPrice: parsedCostPrice,
    stock: totalStock,
    sku: formData.sku?.trim() || "",
    barcode: formData.barcode?.trim() || "",
    image: mainImage,
    images: filteredImages,
    video: formData.video?.trim() || "",
    weight: parsedWeight,
    dimensions: formData.dimensions?.trim() || "",
    deliveryPrice: parsedDeliveryPrice,
    preparationTime: formData.preparationTime || "24h",
    wilaya: formData.wilaya || "",
    returnPolicy: Boolean(formData.returnPolicy),
    variants: sanitizedVariants,
    hasOutOfStockVariants: hasOutOfStock,
    attributes: formData.attributes || {},
    seoTitle: formData.metaTitle || formData.seoTitle || "",
    seoDescription: formData.metaDescription || formData.seoDescription || "",
    slug: formData.slug || formData.seoSlug || "",
    status: options.status as SellerProduct["status"],
    energyClass: formData.energyClass || undefined,
  };

  if (formData.translations) {
    payload.translations = formData.translations;
  }

  if (options.sellerId) {
    payload.sellerId = options.sellerId;
  }
  if (options.sellerName) {
    payload.sellerName = options.sellerName;
  }
  if (options.sellerStoreName) {
    payload.storeName = options.sellerStoreName;
  }
  if (options.sellerLogo) {
    payload.sellerLogo = options.sellerLogo;
  }

  return payload;
}
