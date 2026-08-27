import { AppTimestamp } from "../../utils/date";

export interface CartItem {
  id: string; // usually same as productId
  sellerId: string;
  name: string;
  description?: string;
  price: number;
  promoPrice?: number;
  image: string;
  images?: string[];
  category?: string;
  quantity: number;
  selectedVariant?: string;
  variants?: ProductVariant[]; // optional details
  sellerName?: string;
  shopName?: string;
  addedAt?: AppTimestamp;
  createdAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
  translations?: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
}

export interface Recommendation {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  image: string;
  category: string;
  sellerName: string;
}

export interface RecommendationDocument {
  userId?: string;
  products: Recommendation[];
  updatedAt?: AppTimestamp;
}

export interface PremiumProduct {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  image: string;
  category: string;
  sellerName: string;
  premiumTier: "gold" | "silver" | "platinum";
}

export interface SelectionExceptionDocument {
  products: PremiumProduct[];
  updatedAt?: AppTimestamp;
}

export interface ProductVariant {
  name: string; // e.g., "Rouge - S"
  stock: number;
  sku: string;
  priceDiff: number; // +/- from base price
  priceOverride?: number | string; // Absolute price overriding base price
}

export interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  originalPrice?: number;
  flashPrice?: number;
  flashSaleActive?: boolean;
  flashEndDate?: string | number | Date;
  freeShipping?: boolean;
  salesCount?: number;
  viewsCount?: number;
  sellerRating?: number;
  rtoRate?: number;
  qualityScore?: number;
  condition?: string;
  onSale?: boolean;
  warranty?: string;
  preparationTime?: string;
  returnPolicy?: string | boolean;
  category: string;
  subcategory?: string;
  subSubCategory?: string;
  subsubcategory?: string; // legacy lowercase compatibility
  image: string;
  images?: string[];
  video?: string;
  rating: number;
  description: string;
  stock: number;

  // E-commerce logic
  sku?: string;
  tags?: string[];
  gender?: string;
  materials?: string[];
  otherMaterial?: string;
  season?: string;
  isBannerFeatured?: boolean;
  isSponsored?: boolean;
  sponsoredSince?: AppTimestamp;
  energyClass?: "A" | "B" | "C" | "D" | "E" | "F" | "G";

  // Legacy fields (restoring to fix build errors)
  colors?: string[];
  sizes?: string[];
  brand?: string;
  type?: string;
  material?: string;
  attributes?: Record<string, string | string[]>;

  // Variants (Dynamic Table)
  variants?: ProductVariant[];

  // Logistics
  weight?: string | number; // kg
  dimensions?: string; // L x l x h

  sellerName?: string;
  sellerNameAr?: string;
  sellerShopName?: string;
  sellerPhone?: string;
  sellerWilaya?: string;
  sellerId: string;
  wilaya: string;

  status: "pending" | "approved" | "rejected" | "active" | "pending_deletion" | "deleted";
  rejectReason?: string;
  rejectionReason?: string;
  moderationType?: "new" | "update";

  stats?: {
    reviewCount: number;
    averageRating: number;
    totalRatingSum: number;
  };

  translations?: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
  specs?: Record<string, string>;
  createdAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
}

export interface HomepageSection {
  id: string;
  title?: string;
  name?: string;
  themeImage?: string;
  theme?: string;
  imageUrl?: string;
  bannerImage?: string;
  tag?: string;
  category?: string;
  manualProducts?: string[];
  [key: string]: unknown;
}

export interface Banner {
  id: string;
  title?: string;
  name?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  [key: string]: unknown;
}
