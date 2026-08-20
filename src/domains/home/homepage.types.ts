import { AppTimestamp } from "../../utils/date";

export type View =
  | "shop"
  | "checkout"
  | "thank-you"
  | "product-detail"
  | "profile"
  | "orders"
  | "seller-dashboard"
  | "seller-shop"
  | "auth"
  | "admin-dashboard"
  | "complete-profile"
  | "search";

export type Language = "fr" | "ar" | "en";

export interface HomepageSection {
  id: string;
  name: string;
  type:
    | "top_picks"
    | "flash_sale"
    | "new_arrivals"
    | "trending"
    | "recommended"
    | "brands"
    | "sellers"
    | "collections";
  orderIndex: number;
  isActive: boolean;
  startDate?: AppTimestamp;
  endDate?: AppTimestamp;
  targetAudience?: "all" | "new" | "logged_in" | "vip";
  targetRegions?: string[];
  title?: string;
  subtitle?: string;
  icon?: string;
  layout?: "compact" | "standard" | "large" | "minimal" | "small";
  backgroundColor?: string;
  theme?: string;
  themeName?: string;
  themeImage?: string;
  margin?: string;
  columns?: number;
  limit?: number;
  tag?: string;
  category?: string;
  manualProducts?: string[]; // IDs or URLs of the products to display manually
  style?: string;
  rules?: {
    type: "manual" | "auto";
    category?: string;
    brand?: string;
    seller?: string;
    minRating?: number;
    minDiscount?: number;
    daysSinceAdded?: number;
    maxItems?: number;
  };
  createdAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
  adminId?: string;
}

export interface Banner {
  id: string;
  name?: string;
  type?: "carousel" | "static" | "video";
  position?:
    | "hero"
    | "intermediate"
    | "sidebar"
    | "footer"
    | "top_bar"
    | "popup";
  zone?: "carousel_main" | "grid_top" | "grid_bottom" | "sidebar";
  layout?: string;
  imageUrl?: string;
  desktop_image?: string;
  desktopImage?: string;
  mobileImageUrl?: string;
  mobile_image?: string | null;
  videoUrl?: string;
  title?: string;
  title_color?: string;
  subtitle?: string;
  subtitle_color?: string;
  button_text?: string;
  buttonText?: string;
  btn_bg_color?: string;
  btn_text_color?: string;
  ctaText?: string;
  ctaLink?: string;
  tag_id?: string;
  linkedProductIds?: string[];
  backgroundColor?: string;
  textColor?: string;
  orderIndex?: number;
  sort_order?: number;
  isActive?: boolean;
  is_active?: boolean;
  startDate?: AppTimestamp;
  start_date?: string | null;
  endDate?: AppTimestamp;
  end_date?: string | null;
  targetUserType?: "all" | "new" | "logged_in";
  target_user_type?: "all" | "new" | "logged_in";
  targetRegions?: string[];
  target_regions?: string[];
  clickCount?: number;
  impressionCount?: number;
  views?: number;
  clicks?: number;
  ab_group?: "all" | "A" | "B";
  featured_products?: string[];
  translations?: Record<string, Record<string, string>>;
  createdAt?: AppTimestamp;
  created_at?: AppTimestamp;
}
