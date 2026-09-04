import { AppTimestamp } from "../utils/date";
import { Product } from "../domains/product/product.types";

export type SponsoredPlacement = "home" | "category" | "search";

export type SponsoredCampaignStatus =
  | "draft"
  | "pending"
  | "approved"
  | "active"
  | "paused"
  | "rejected"
  | "completed"
  | "cancelled";

export type SponsoredPaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "refunded"
  | "failed";

export type SponsoredModerationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export interface SponsoredCampaign {
  id: string;
  sellerId: string;
  productId: string;
  productName?: string;
  productImage?: string;
  productCategory?: string;
  placement: SponsoredPlacement;
  status: SponsoredCampaignStatus;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  durationDays: number;
  priceAmount: number;
  currency: "DZD";
  paymentStatus: SponsoredPaymentStatus;
  moderationStatus: SponsoredModerationStatus;
  rejectionReason?: string;
  createdAt: AppTimestamp | string;
  updatedAt: AppTimestamp | string;
  approvedAt?: AppTimestamp | string;
  approvedBy?: string;
  cancelledAt?: AppTimestamp | string;
  completedAt?: AppTimestamp | string;
  impressions: number;
  clicks: number;
}

export interface PublicSponsoredProductDTO {
  campaignId: string;
  placement: SponsoredPlacement;
  product: Product;
}

export interface CreateSponsoredCampaignInput {
  productId: string;
  placement: SponsoredPlacement;
  startAt: string;
  endAt: string;
}
