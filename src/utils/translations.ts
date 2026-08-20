import { Product, CartItem } from "../domains/product/product.types";

export function getTranslatedField(product: Product | CartItem, field: 'name' | 'description', lang: string): string {
  if (product.translations && product.translations[lang] && product.translations[lang][field]) {
    return product.translations[lang][field];
  }
  if (field === 'description') {
    return ('description' in product && typeof product.description === 'string') ? product.description : "";
  }
  return product.name || "";
}

export const getCategoryTranslation = (text: string, t: (key: string) => string) => {
  if (!text) return "";
  
  // Handle special cases for the "All Categories" filter
  if (text === "Tous" || text === "all" || text === "Toutes" || text === "Toutes les catégories") {
    return t("all_categories") || "Toutes les catégories";
  }

  // Use the raw text as the key. i18next will return the translation if it exists,
  // or the raw text (the key) if it doesn't, which is exactly what we want for French.
  return t(text);
};
