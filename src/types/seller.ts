import { AppTimestamp } from "../utils/date";

export type ProductStatus =
  | "active"
  | "pending"
  | "rejected"
  | "pending_deletion"
  | "draft"
  | "deleted";

export interface ProductVariant {
  id?: string;
  name: string;
  sku?: string;
  stock: number | string;
  price?: number | string;
  priceOverride?: number | string;
  priceDiff?: string | number;
  promoPrice?: number | string;
  color?: string;
  size?: string;
  material?: string;
  image?: string;
  imageIndex?: number | null;
  isActive?: boolean;
}

export interface ProductTranslationFields {
  name: string;
  description: string;
}

export interface ProductTranslationsMap {
  en?: ProductTranslationFields;
  ar?: ProductTranslationFields;
  fr?: ProductTranslationFields;
}

export interface SellerProduct {
  id: string;
  name: string;
  slug?: string;
  stock: number;
  price: number;
  promoPrice?: number;
  flashPrice?: number;
  flashSaleActive?: boolean;
  costPrice?: number;
  category: string;
  subcategory?: string;
  subSubCategory?: string;
  gender?: string;
  condition?: string;
  warranty?: string;
  materials?: string[];
  otherMaterial?: string;
  season?: string;
  brand?: string;
  brandName?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  shortDescription?: string;
  status: ProductStatus;
  sellerId: string;
  sellerName?: string;
  storeName?: string;
  sellerLogo?: string;
  wilaya?: string;
  image: string;
  images?: string[];
  video?: string;
  colors?: string[];
  sizes?: string[];
  sizeType?: string;
  weight?: number;
  dimensions?: string;
  deliveryPrice?: number;
  preparationTime?: string;
  returnPolicy?: boolean;
  autoTranslate?: boolean;
  isSponsored?: boolean;
  isBannerFeatured?: boolean;
  isStoreFeatured?: boolean;
  rejectionReason?: string;
  variants?: ProductVariant[];
  hasOutOfStockVariants?: boolean;
  attributes?: Record<string, string | number | boolean | string[]>;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  lowStockAlert?: number | string;
  publishAt?: string | null;
  internalNotes?: string;
  translations?: ProductTranslationsMap;
  energyClass?: string;
  createdAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
}

export interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  subSubCategory: string;
  gender: string;
  condition: string;
  warranty: string;
  materials: string[];
  otherMaterial: string;
  season: string;
  description: string;
  tags: string[];
  price: string | number;
  promoPrice: string | number;
  flashPrice?: string | number;
  flashSaleActive?: boolean;
  costPrice: string | number;
  stock: string | number;
  sku: string;
  barcode?: string;
  image?: string;
  images: string[];
  video: string;
  weight: string | number;
  dimensions: string;
  deliveryPrice: string | number;
  preparationTime: string;
  wilaya: string;
  returnPolicy: boolean;
  autoTranslate: boolean;
  isBannerFeatured?: boolean;
  isStoreFeatured?: boolean;
  isDraft?: boolean;
  status?: string;
  variants: ProductVariant[];
  attributes: Record<string, string | number | boolean | string[]>;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoSlug?: string;
  sizeType?: string;
  sizes: string[];
  colors: string[];
  lowStockAlert?: string | number;
  publishAt?: string | null;
  internalNotes?: string;
  translations?: ProductTranslationsMap;
  energyClass?: string;
}

export interface AdminTag {
  id: string;
  name: string;
  category?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
  border?: boolean;
}

export interface SizeTypeOption {
  id: string;
  label: string;
  items: string[];
}

export interface ProductFormTemplate {
  name: string;
  data: ProductFormData;
}

export interface ProductFormStep {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }> | null;
}

export interface SellerUserProfile {
  uid?: string;
  email?: string;
  displayName?: string;
  name?: string;
  shopName?: string;
  role?: string;
  isVerified?: boolean;
  wilaya?: string;
  rating?: number;
  sellerTrustScore?: number;
  phone?: string;
  address?: string;
}

export interface AnalyticsChartPoint {
  name: string;
  value: number;
  orders?: number;
}

export interface TopProductStat {
  id: string;
  name: string;
  image?: string;
  salesCount: number;
  revenue: number;
}

export interface SellerAnalyticsData {
  revenue: number;
  orders: number;
  aov: number;
  conversionRate: number;
  chartData: AnalyticsChartPoint[];
  topProducts: TopProductStat[];
}

export type SellerAnalyticsPeriod = "7d" | "30d" | "12m";

export interface SellerOverviewStatsData {
  totalSales: number;
  orderCount: number;
  productCount: number;
  growth: string;
  pendingReturns: number;
}

export interface SellerOverviewPayoutStats {
  available: number;
  nextPaymentDate: string;
}

export interface SellerOverviewWilayaStat {
  name: string;
  count: number;
}

export interface SellerOverviewChartPoint {
  name: string;
  sales: number;
}

export interface SellerOverviewTopProduct {
  id: string;
  name: string;
  count: number;
  total: number;
  image?: string;
}

export interface SellerOverviewRecentOrder {
  id: string;
  total: number;
  createdAt?: AppTimestamp;
  status: string;
  shippingAddress?: { wilaya: string };
  items?: Array<{
    sellerId: string;
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    productImage?: string;
    productName?: string;
  }>;
}

export interface SellerOverviewApiResponse {
  stats?: SellerOverviewStatsData;
  recentOrders?: SellerOverviewRecentOrder[];
  topProducts?: SellerOverviewTopProduct[];
  payoutStats?: SellerOverviewPayoutStats;
  outOfStockCount?: number;
  wilayaStats?: SellerOverviewWilayaStat[];
  chartData?: SellerOverviewChartPoint[];
}

export interface SellerOverviewStats {
  revenue: number;
  ordersCount: number;
  productsCount: number;
  rating: number;
  outOfStockCount: number;
  pendingReturns: number;
  weeklyGrowth?: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt?: AppTimestamp;
    customerName?: string;
  }>;
}

export interface ShippingTariffEntry {
  desk?: number;
  home?: number;
  enabled?: boolean;
  estimatedDays?: number;
}

export type ShippingTariffsMap = Record<string, ShippingTariffEntry | number>;

export interface SellerReview {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName?: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  reply?: string;
  repliedAt?: AppTimestamp;
  createdAt: AppTimestamp;
}

export interface SponsorshipPackConfig {
  id: string;
  name: string;
  tier: "bronze" | "silver" | "gold";
  badgeText: string;
  pricing: Record<number, number>;
  features: string[];
  color: string;
  glowColor: string;
}

export interface SponsorshipRequest {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  sellerId: string;
  sellerName?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  tier: "bronze" | "silver" | "gold";
  durationDays: number;
  price: number;
  paymentStatus: "pending" | "paid" | "failed";
  impressionsCount: number;
  clicksCount: number;
  salesCount: number;
  revenueGenerated: number;
  ctr?: number;
  requestDate: AppTimestamp;
  startDate?: AppTimestamp;
  endDate?: AppTimestamp;
}

export interface SponsorshipAnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  totalSales: number;
  totalRevenue: number;
  activeSponsorshipsCount: number;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "seller" | "admin" | "support";
  message: string;
  attachments?: string[];
  createdAt: AppTimestamp;
}

export interface SupportTicket {
  id: string;
  sellerId: string;
  sellerName?: string;
  subject: string;
  category: "order" | "product" | "payment" | "technical" | "account" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  lastMessage?: string;
  unreadAdmin?: boolean;
  unreadSeller?: boolean;
  createdAt: AppTimestamp;
  updatedAt: AppTimestamp;
}

// API Response Contracts
export interface SellerOverviewStatsResponse {
  revenue: number;
  ordersCount: number;
  productsCount: number;
  rating: number;
  outOfStockCount: number;
  pendingReturns: number;
  weeklyGrowth?: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt?: AppTimestamp;
    customerName?: string;
  }>;
}

export interface SellerAnalyticsResponse {
  revenue: number;
  orders: number;
  aov: number;
  conversionRate: number;
  chartData: AnalyticsChartPoint[];
  topProducts: TopProductStat[];
}

export interface SellerProductsResponse {
  products: SellerProduct[];
}

export interface SellerProductCreateResponse {
  id: string;
  success: boolean;
}

export interface SellerProductUpdateResponse {
  success: boolean;
  message?: string;
}

export interface SellerOrdersResponse {
  orders: Array<Record<string, unknown>>;
}

export interface SellerOrderDetailResponse {
  order: Record<string, unknown>;
}

export interface SellerReviewsResponse {
  reviews: SellerReview[];
  averageRating: number;
}

export interface SellerSponsorshipsResponse {
  products: SellerProduct[];
  sponsorshipRequests: SponsorshipRequest[];
  packs: Record<string, SponsorshipPackConfig>;
  analyticsSummary: SponsorshipAnalyticsSummary;
}

export interface SellerProfileSettingsResponse {
  success: boolean;
  message?: string;
}

export interface SellerProfileShippingResponse {
  success: boolean;
  message?: string;
}
