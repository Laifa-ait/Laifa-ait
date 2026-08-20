import { Timestamp } from "firebase/firestore";

export type CouponDiscountType = "percentage" | "percent" | "fixed";

export type CouponDateType =
  | Timestamp
  | Date
  | string
  | number
  | { seconds: number; nanoseconds?: number; _seconds?: number; _nanoseconds?: number }
  | null
  | undefined;

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  expiresAt?: CouponDateType;
  expiryDate?: CouponDateType;
  isActive: boolean;
  usageLimit?: number | null;
  maxUses?: number | null;
  usageCount?: number;
  usedCount?: number;
  limitedToCategories?: string[];
  limitedToSellers?: string[];
  singleUsePerClient?: boolean;
  clickCount?: number;
  createdBy?: string;
  createdAt?: CouponDateType;
  updatedAt?: CouponDateType;
}

export interface CouponFormData {
  code: string;
  discountType: CouponDiscountType;
  discountValue: string | number;
  minOrderValue?: string | number;
  minOrderAmount?: string | number;
  maxDiscountAmount?: string | number;
  expiryDate?: string;
  expiresAt?: string;
  startAt?: string;
  startsAt?: string;
  usageLimit?: string | number;
  maxUses?: string | number;
  maxUsesPerUser?: string | number;
  limitedToCategories?: string[];
  limitedToSellers?: string[];
  singleUsePerClient?: boolean;
}

export interface PublicCouponDTO {
  id: string;
  code: string;
  discountType: "percentage" | "percent" | "fixed";
  discountValue: number;
  minOrderValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  maxUses?: number | null;
  expiresAt: string | null;
  startsAt?: string | null;
  startAt?: string | null;
  limitedToCategories: string[];
  limitedToSellers: string[];
  singleUsePerClient: boolean;
  isActive: boolean;
}

export interface ProductItemForCoupon {
  productId: string;
  sellerId: string;
  category?: string;
  categoryId?: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
}

export interface ReconstructedCartResult {
  valid: boolean;
  error?: string;
  verifiedItems: ProductItemForCoupon[];
  serverSubtotal: number;
}
