export interface AdminAlert {
  id: string;
  type: string;
  title?: string;
  message?: string;
  createdAt?: unknown;
  resolved?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  details?: string;
  sellerId?: string;
}

export interface DashboardData {
  metric?: string;
  value?: number;
  change?: number;
  period?: string;
}

export interface RecentActivity {
  id: string;
  action?: string;
  userEmail?: string;
  timestamp?: string | number;
  details?: string;
  createdAt?: unknown;
  color?: string;
  label?: string;
  time?: string;
  [key: string]: unknown;
}

export interface GlobalOrder {
  id: string;
  customerName?: string;
  city?: string;
  totalAmount?: number;
  status?: string;
  date?: string;
  shippingAddress?: { name?: string };
  userId?: string;
  sellerIds?: string[];
  trackingId?: string;
  labelUrl?: string;
  createdAt?: unknown;
  [key: string]: unknown;
}

export interface TopProduct {
  id: string;
  name?: string;
  title?: string;
  salesCount?: number;
  images?: string[];
  price?: number;
  [key: string]: unknown;
}

export interface TopSeller {
  id: string;
  shopName?: string;
  name?: string;
  displayName?: string;
  email?: string;
  wilaya?: string;
  totalRevenue?: number;
  [key: string]: unknown;
}

export interface WilayaStat {
  wilaya?: string;
  name?: string;
  count?: number;
  value?: number;
  revenue?: number;
}

export interface ProductViewInsight {
  name: string;
  count: number;
}

export interface SearchQueryInsight {
  query: string;
  count: number;
}

export interface CategoryHitInsight {
  name: string;
  value: number;
}

export interface AnalyticsInsights {
  totalViews: number;
  totalCarts: number;
  totalPurchases: number;
  totalRevenue: number;
  conversionRate: string;
  addToCartRate: string;
  categoryHits: CategoryHitInsight[];
  productViews: ProductViewInsight[];
  searchQueries: SearchQueryInsight[];
}

export interface OverviewStats {
  totalSales: number;
  activeVendors: number;
  totalOrders: number;
  netRevenue: number;
  pendingVendors: number;
  revenueChange: number;
  ordersChange: number;
}
