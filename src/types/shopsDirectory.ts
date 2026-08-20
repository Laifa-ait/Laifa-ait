export interface ShopDirectoryItem {
  id: string;
  sellerId: string;
  shopName: string;
  slogan?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  wilaya: string;
  commune?: string;
  category?: string;
  categories?: string[];
  rating?: number;
  sellerTrustScore?: number;
  reviewsCount?: number;
  productsCount?: number;
  isVerified?: boolean;
  status?: string;
  avgPreparationTime?: string;
  badge?: string;
  createdAt?: string | number;
}

export type ShopSortOption = "popular" | "rating" | "products" | "name" | "newest";

export interface ShopsFilterState {
  searchQuery: string;
  selectedWilaya: string;
  selectedCategory: string;
  sortBy: ShopSortOption;
  onlyVerified: boolean;
}
