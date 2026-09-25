import { describe, it, expect } from "vitest";
import { buildProductPayload } from "../pages/Seller/ProductForm/utils/productPayloadBuilder";
import { ProductFormData } from "../types/seller";

describe("Seller Product Mobile Addition & Free Multilingual Synchronization", () => {
  const baseFormData: ProductFormData = {
    name: "Caftan Moderne Karakou",
    brand: "Artisanat d'Alger",
    price: "15000",
    promoPrice: "12500",
    costPrice: "8000",
    sku: "KARA-ALG-01",
    category: "Mode & Vêtements",
    subcategory: "Traditionnel",
    subSubCategory: "Karakou",
    gender: "Femme",
    condition: "Neuf",
    warranty: "12 mois",
    materials: ["Velours", "Fil d'Or"],
    otherMaterial: "Fetla",
    season: "Toutes Saisons",
    attributes: {},
    description: "Karakou traditionnel haut de gamme brodé au fil d'or par nos artisans.",
    image: "https://example.com/karakou-main.jpg",
    images: [
      "https://example.com/karakou-main.jpg",
      "https://example.com/karakou-back.jpg",
    ],
    video: "",
    colors: ["Noir", "Bordeaux"],
    sizes: ["M", "L"],
    sizeType: "clothing",
    weight: "1.2",
    dimensions: "40x30x10",
    deliveryPrice: "600",
    preparationTime: "2",
    returnPolicy: true,
    autoTranslate: true,
    tags: ["karakou", "artisanat", "alger"],
    isBannerFeatured: false,
    isStoreFeatured: true,
    variants: [],
    wilaya: "16 - Alger",
    stock: "15",
    status: "active",
    metaTitle: "",
    metaDescription: "",
    slug: "",
    lowStockAlert: "3",
    publishAt: "",
    internalNotes: "",
    translations: {
      ar: {
        name: "قفطان كاراكو عصري",
        description: "كاراكو تقليدي فاخر مطرز بخيوط الذهب من طرف حرفيينا.",
      },
      en: {
        name: "Modern Karakou Caftan",
        description: "Luxury traditional Karakou embroidered with gold thread by our artisans.",
      },
    },
  };

  it("1. builds sanitized product payload without hardcoded fields", () => {
    const payload = buildProductPayload(baseFormData, {
      status: "active",
      sellerId: "seller_test_456",
      sellerName: "Maison du Caftan",
      sellerStoreName: "Boutique Karakou Alger",
      sellerLogo: "https://example.com/logo.jpg",
    });

    expect(payload.name).toBe("Caftan Moderne Karakou");
    expect(payload.price).toBe(15000);
    expect(payload.promoPrice).toBe(12500);
    expect(payload.costPrice).toBe(8000);
    expect(payload.stock).toBe(15);
    expect(payload.sellerId).toBe("seller_test_456");
    expect(payload.sellerName).toBe("Maison du Caftan");
    expect(payload.storeName).toBe("Boutique Karakou Alger");
    expect(payload.wilaya).toBe("16 - Alger");
    expect(payload.deliveryPrice).toBe(600);
    expect(payload.returnPolicy).toBe(true);
  });

  it("2. synchronizes multilingual translations for Algerian market (AR & EN)", () => {
    const payload = buildProductPayload(baseFormData, {
      status: "active",
      sellerId: "seller_test_456",
    });

    expect(payload.translations).toBeDefined();
    expect(payload.translations?.ar?.name).toBe("قفطان كاراكو عصري");
    expect(payload.translations?.en?.name).toBe("Modern Karakou Caftan");
    expect(payload.translations?.ar?.description).toContain("كاراكو تقليدي فاخر");
  });

  it("3. respects custom non-Algiers wilayas from 69 wilayas without forcing default Algiers", () => {
    const oranData: ProductFormData = {
      ...baseFormData,
      wilaya: "31 - Oran",
    };
    const payload = buildProductPayload(oranData, {
      status: "active",
      sellerId: "seller_oran_789",
      sellerName: "Artisan Oranais",
      sellerStoreName: "Wahran Chic",
    });

    expect(payload.wilaya).toBe("31 - Oran");
    expect(payload.storeName).toBe("Wahran Chic");
  });

  it("4. computes total stock accurately from variants if variants are present", () => {
    const variantData: ProductFormData = {
      ...baseFormData,
      variants: [
        { id: "v1", name: "Noir - M", sku: "K-N-M", stock: 5, price: 15000, isActive: true },
        { id: "v2", name: "Noir - L", sku: "K-N-L", stock: 8, price: 15000, isActive: true },
        { id: "v3", name: "Bordeaux - M", sku: "K-B-M", stock: 4, price: 16000, isActive: true },
      ],
    };
    const payload = buildProductPayload(variantData, {
      status: "active",
      sellerId: "seller_variants_101",
    });

    expect(payload.stock).toBe(17);
    expect(payload.variants).toHaveLength(3);
  });

  it("5. assigns sellerPhone and sellerWilaya into product payload", () => {
    const payload = buildProductPayload(baseFormData, {
      status: "active",
      sellerId: "seller_oran_789",
      sellerName: "Artisan Oranais",
      sellerStoreName: "Wahran Chic",
      sellerPhone: "0550123456",
      sellerWilaya: "31 - Oran",
    });

    expect(payload.sellerPhone).toBe("0550123456");
    expect(payload.sellerWilaya).toBe("31 - Oran");
    expect(payload.sellerShopName).toBe("Wahran Chic");
  });

  it("6. resolves translations with regional language codes via getTranslatedField", async () => {
    const { getTranslatedField } = await import("../utils/translations");
    const sampleProduct: Product = {
      id: "prod_trans_test",
      name: "Titre Français",
      price: 1000,
      sellerId: "seller_1",
      translations: {
        ar: { name: "عنوان عربي", description: "وصف عربي" },
        en: { name: "English Title", description: "English Description" },
        fr: { name: "Titre Français", description: "Description Française" },
      },
    };

    expect(getTranslatedField(sampleProduct, "name", "ar")).toBe("عنوان عربي");
    expect(getTranslatedField(sampleProduct, "name", "ar-DZ")).toBe("عنوان عربي");
    expect(getTranslatedField(sampleProduct, "name", "en-US")).toBe("English Title");
    expect(getTranslatedField(sampleProduct, "name", "fr-FR")).toBe("Titre Français");
  });

  it("7. enforces strict 5MB video size limit constant (MAX_VIDEO_FILE_SIZE)", async () => {
    const { MAX_VIDEO_FILE_SIZE } = await import("../pages/Seller/ProductForm/hooks/useProductMediaUpload");
    expect(MAX_VIDEO_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it("8. validates Arabic video badge translations and eliminates awkward syntax", async () => {
    const fs = await import("fs");
    const path = await import("path");
    
    const arLocaleRaw = fs.readFileSync(path.resolve(process.cwd(), "public/locales/ar.json"), "utf-8");
    const arLocale = JSON.parse(arLocaleRaw);

    expect(arLocale["MP4 • Max 5Mo"]).toBe("الحد الأقصى 5 ميغابايت • MP4");
    expect(arLocale["MP4 • Max 10Mo"]).toBe("الحد الأقصى 5 ميغابايت • MP4");
    expect(arLocale["Vidéo trop lourde (Max 5Mo)"]).toBe("حجم الفيديو كبير جداً (الحد الأقصى 5 ميغابايت)");
    expect(arLocaleRaw.includes("10 ميغابايت كحد أقصى")).toBe(false);

    const frLocale = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "public/locales/fr.json"), "utf-8"));
    expect(frLocale["MP4 • Max 5Mo"]).toBe("MP4 • Max 5Mo");

    const enLocale = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "public/locales/en.json"), "utf-8"));
    expect(enLocale["MP4 • Max 5Mo"]).toBe("MP4 • Max 5MB");
  });
});
