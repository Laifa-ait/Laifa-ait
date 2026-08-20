import { describe, it, expect } from "vitest";
import { validateProductForm } from "../pages/Seller/ProductForm/utils/productFormValidation";
import { buildProductPayload } from "../pages/Seller/ProductForm/utils/productPayloadBuilder";
import { ProductFormData } from "../types/seller";

describe("ProductForm Validation and Payload Builder", () => {
  const baseFormData: ProductFormData = {
    name: "T-Shirt 100% Coton",
    brand: "Olmart Basics",
    price: "2500",
    promoPrice: "1900",
    costPrice: "1200",
    sku: "OLM-TSHIRT-001",
    category: "Mode Homme",
    subcategory: "Vêtements",
    subSubCategory: "T-shirts",
    gender: "Homme",
    condition: "Neuf",
    warranty: "1 mois",
    materials: ["Coton"],
    otherMaterial: "",
    season: "Été",
    attributes: { fit: "Regular" },
    description: "T-shirt en coton respirant et durable fabriqué en Algérie.",
    image: "https://example.com/img1.jpg",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg", "", "", "", "", "", ""],
    video: "",
    colors: ["Noir", "Blanc"],
    sizes: ["M", "L"],
    sizeType: "clothing",
    weight: "0.25",
    dimensions: "30x20x2",
    deliveryPrice: "400",
    preparationTime: "24h",
    returnPolicy: true,
    autoTranslate: false,
    tags: ["Été", "Nouveau"],
    isBannerFeatured: false,
    isStoreFeatured: true,
    variants: [
      { name: "NOIR - M", stock: 15, sku: "OLM-NOIR-M", isActive: true },
      { name: "BLANC - L", stock: 10, sku: "OLM-BLANC-L", isActive: true },
    ],
    wilaya: "16 Alger",
    stock: "25",
    status: "pending",
    metaTitle: "T-shirt en Coton Algérien",
    metaDescription: "Achetez ce t-shirt en coton de qualité.",
    slug: "t-shirt-100-coton",
    lowStockAlert: "5",
    publishAt: "",
    internalNotes: "Stock initial boutique",
    translations: {
      en: { name: "100% Cotton T-Shirt", description: "Breathable cotton t-shirt." },
      ar: { name: "قميص قطني 100%", description: "قميص قطني مريح وعالي الجودة." },
    },
  };

  describe("validateProductForm", () => {
    it("should validate a valid full product form", () => {
      const result = validateProductForm(baseFormData, false);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject an empty product name", () => {
      const invalid = { ...baseFormData, name: "   " };
      const result = validateProductForm(invalid, false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("nom du produit est obligatoire");
    });

    it("should reject an empty category", () => {
      const invalid = { ...baseFormData, category: "" };
      const result = validateProductForm(invalid, false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("sélectionner une catégorie");
    });

    it("should reject an invalid or non-positive price", () => {
      const invalidZero = { ...baseFormData, price: "0" };
      expect(validateProductForm(invalidZero, false).isValid).toBe(false);

      const invalidNegative = { ...baseFormData, price: "-100" };
      expect(validateProductForm(invalidNegative, false).isValid).toBe(false);

      const invalidNaN = { ...baseFormData, price: "abc" };
      expect(validateProductForm(invalidNaN, false).isValid).toBe(false);
    });

    it("should reject a promo price higher or equal to regular price", () => {
      const invalid = { ...baseFormData, price: "2000", promoPrice: "2500" };
      const result = validateProductForm(invalid, false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("inférieur au prix normal");
    });

    it("should reject product with no images", () => {
      const invalid = { ...baseFormData, images: ["", "", "", "", "", "", "", ""] };
      const result = validateProductForm(invalid, false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Au moins une image");
    });

    it("should reject direct contact details (anti-disintermediation)", () => {
      const invalidPhone = {
        ...baseFormData,
        description: "Appelez moi au 0555123456 pour commander directement !",
      };
      const resultPhone = validateProductForm(invalidPhone, false);
      expect(resultPhone.isValid).toBe(false);
      expect(resultPhone.error).toContain("coordonnées directes");

      const invalidViber = {
        ...baseFormData,
        name: "Produit dispo sur Viber / WhatsApp",
      };
      const resultViber = validateProductForm(invalidViber, false);
      expect(resultViber.isValid).toBe(false);
    });

    it("should allow drafts with just a name", () => {
      const draftData: ProductFormData = {
        ...baseFormData,
        price: "",
        category: "",
        images: [],
        wilaya: "",
      };
      const result = validateProductForm(draftData, true);
      expect(result.isValid).toBe(true);
    });
  });

  describe("buildProductPayload", () => {
    it("should build a clean payload with sanitized fields and correct numeric conversions", () => {
      const payload = buildProductPayload(baseFormData, {
        status: "pending",
        sellerId: "seller_123",
        sellerName: "Boutique El Mouradia",
        sellerStoreName: "El Mouradia Shop",
      });

      expect(payload.name).toBe("T-Shirt 100% Coton");
      expect(payload.price).toBe(2500);
      expect(payload.promoPrice).toBe(1900);
      expect(payload.costPrice).toBe(1200);
      expect(payload.weight).toBe(0.25);
      expect(payload.deliveryPrice).toBe(400);
      expect(payload.stock).toBe(25); // sum of 15 + 10 variants
      expect(payload.variants).toHaveLength(2);
      expect(payload.variants?.[0].stock).toBe(15);
      expect(payload.variants?.[1].stock).toBe(10);
      expect(payload.sellerId).toBe("seller_123");
      expect(payload.sellerName).toBe("Boutique El Mouradia");
      expect(payload.status).toBe("pending");
      expect(payload.translations?.ar?.name).toBe("قميص قطني 100%");
    });
  });
});
