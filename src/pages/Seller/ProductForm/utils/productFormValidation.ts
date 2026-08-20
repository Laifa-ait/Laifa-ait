import { ProductFormData } from "../../../../types/seller";
import { safeParseFloat } from "../hooks/useProductVariantsAndAttributes";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateProductForm(formData: ProductFormData, isDraft: boolean): ValidationResult {
  if (isDraft) {
    if (!formData.name?.trim()) {
      return { isValid: false, error: "Un nom de produit est requis même pour un brouillon." };
    }
    return { isValid: true };
  }

  if (!formData.name?.trim()) {
    return { isValid: false, error: "Le nom du produit est obligatoire." };
  }

  if (!formData.category?.trim()) {
    return { isValid: false, error: "Veuillez sélectionner une catégorie." };
  }

  const priceNum = safeParseFloat(formData.price);
  if (priceNum === null || priceNum <= 0) {
    return { isValid: false, error: "Veuillez entrer un prix de vente valide supérieur à 0 DZD." };
  }

  if (formData.promoPrice) {
    const promoNum = safeParseFloat(formData.promoPrice);
    if (promoNum !== null && promoNum >= priceNum) {
      return { isValid: false, error: "Le prix promotionnel doit être inférieur au prix normal." };
    }
  }

  const hasImages = formData.images && formData.images.some((img) => img?.trim().length > 0);
  if (!hasImages) {
    return { isValid: false, error: "Au moins une image du produit est obligatoire." };
  }

  if (!formData.wilaya?.trim()) {
    return { isValid: false, error: "Veuillez sélectionner la wilaya d'expédition." };
  }

  // Check forbidden contact patterns in description or name
  const contactRegex = /(\+?213|0[567]\d{8}|viber|whatsapp|t\.me|instagram\.com|facebook\.com)/i;
  if (contactRegex.test(formData.description || "") || contactRegex.test(formData.name || "")) {
    return {
      isValid: false,
      error: "Les coordonnées directes (téléphone, liens externes) sont interdites dans les fiches produits.",
    };
  }

  // If variants exist, validate variant stocks
  if (formData.variants && formData.variants.length > 0) {
    const hasActiveVariant = formData.variants.some((v) => v.isActive !== false);
    if (!hasActiveVariant) {
      return { isValid: false, error: "Au moins une variante doit être active." };
    }
  }

  return { isValid: true };
}
