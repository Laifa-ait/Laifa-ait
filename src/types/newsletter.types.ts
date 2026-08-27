export interface NewsletterBlock {
  id: string;
  type: string;
  width?: string;
  content?: string;
  linkUrl?: string;
  align?: string;
  aspectRatio?: string;
  rounded?: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  productCategory?: string;
}

export interface StockBanner {
  id: string;
  title: string;
  url: string;
  category: string;
}

export const ALGERIA_STOCK_BANNERS: StockBanner[] = [
  {
    id: "ramadan-sale",
    title: "Solde du Ramadan (Épices & Dates)",
    url: "/images/placeholders/product.svg",
    category: "Campagne",
  },
  {
    id: "supermarche-alg",
    title: "Supermarché & Quotidien",
    url: "/images/placeholders/product.svg",
    category: "Supermarché",
  },
  {
    id: "livraison-58",
    title: "Livraison 58 Wilayas Express",
    url: "/images/placeholders/product.svg",
    category: "Logistique",
  },
  {
    id: "fashion-chic",
    title: "Mode & Élégance Traditionnelle",
    url: "/images/placeholders/product.svg",
    category: "Mode",
  },
  {
    id: "electro-alg",
    title: "Électronique & High-Tech",
    url: "/images/placeholders/product.svg",
    category: "Technologie",
  },
  {
    id: "beauty-bio",
    title: "Cosmétiques & Beauté Naturelle",
    url: "/images/placeholders/product.svg",
    category: "Bien-être",
  },
  {
    id: "souk-colors",
    title: "Épices & Saveurs du Sud d'Algérie",
    url: "/images/placeholders/product.svg",
    category: "Gastronomie",
  },
  {
    id: "jewels-silver",
    title: "Bijoux & Ornements Artisans",
    url: "/images/placeholders/product.svg",
    category: "Accessoires",
  },
];
