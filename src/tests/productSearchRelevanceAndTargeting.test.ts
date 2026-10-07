import { describe, it, expect } from "vitest";
import { filterAndRankProducts, normalizeSearchTerm } from "../utils/productSearchRelevance";
import { Product } from "../domains/product/product.types";

const mockCatalog: Product[] = [
  {
    id: "prod-1",
    name: "Smartphone Samsung Galaxy S24 Ultra",
    category: "Électronique",
    subCategory: "Téléphonie",
    brand: "Samsung",
    price: 185000,
    rating: 4.9,
    stock: 5,
    tags: ["smartphone", "samsung", "5g", "android"],
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "prod-2",
    name: "Téléphone Apple iPhone 15 Pro Max",
    category: "Électronique",
    subCategory: "Téléphonie",
    brand: "Apple",
    price: 210000,
    rating: 4.8,
    stock: 3,
    tags: ["apple", "iphone", "ios"],
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "prod-3",
    name: "Robe de Soirée Brodée Karakou Algérois",
    category: "Mode & Beauté",
    subCategory: "Traditionnel",
    brand: "Artisanat d'Or",
    price: 45000,
    rating: 5.0,
    stock: 0, // Rupture
    tags: ["karakou", "mariage", "algerois"],
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "prod-4",
    name: "Cafetière Expresso Italienne Inox",
    category: "Maison & Électroménager",
    subCategory: "Cuisine",
    brand: "Bialetti",
    price: 8500,
    rating: 4.6,
    stock: 12,
    tags: ["cafe", "expresso", "cuisine"],
    createdAt: "2026-01-20T10:00:00Z",
  },
];

describe("Product Search Relevance Engine", () => {
  it("normalise correctement les accents et la casse", () => {
    expect(normalizeSearchTerm("Téléphone")).toBe("telephone");
    expect(normalizeSearchTerm("Électroménager")).toBe("electromenager");
    expect(normalizeSearchTerm("Café Crème")).toBe("cafe creme");
  });

  it("retrouve les produits même avec des requêtes sans accent ou avec faute mineure", () => {
    const results = filterAndRankProducts(mockCatalog, { query: "telephone" });
    expect(results.length).toBeGreaterThanOrEqual(1);
    const names = results.map((r) => r.name);
    expect(names.some((n) => n.includes("Samsung") || n.includes("iPhone"))).toBe(true);
  });

  it("classe en tête les correspondances de marque exactes", () => {
    const results = filterAndRankProducts(mockCatalog, { query: "Samsung" });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].brand).toBe("Samsung");
  });

  it("filtre strictement par catégorie principale", () => {
    const results = filterAndRankProducts(mockCatalog, { category: "Mode & Beauté" });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("prod-3");
  });

  it("gère le filtre 'En stock uniquement'", () => {
    const results = filterAndRankProducts(mockCatalog, {
      category: "Mode & Beauté",
      onlyInStock: true,
    });
    // prod-3 has stock: 0, so it should be filtered out
    expect(results.length).toBe(0);
  });

  it("trie par prix croissant et décroissant", () => {
    const asc = filterAndRankProducts(mockCatalog, { sortBy: "price_asc" });
    expect(asc[0].price).toBe(8500);

    const desc = filterAndRankProducts(mockCatalog, { sortBy: "price_desc" });
    expect(desc[0].price).toBe(210000);
  });

  it("trie par note client décroissante", () => {
    const topRated = filterAndRankProducts(mockCatalog, { sortBy: "rating" });
    expect(topRated[0].rating).toBe(5.0);
  });
});
