import { AppTimestamp } from "../utils/date";

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
  // Private payment proof fields (strictly excluded from public API)
  paymentProofUrl?: string;
  paymentProofReference?: string;
  paymentProofNotes?: string;
  paymentProofSubmittedAt?: string;
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  createdAt: AppTimestamp | string;
  updatedAt: AppTimestamp | string;
  approvedAt?: AppTimestamp | string;
  approvedBy?: string;
  cancelledAt?: AppTimestamp | string;
  completedAt?: AppTimestamp | string;
  impressions: number;
  clicks: number;
}

export interface PublicSponsoredProductSummary {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  image?: string;
  category: string;
  sellerId: string;
  sellerName?: string;
  rating?: number;
  reviewCount?: number;
  isSponsored: true;
}

export interface PublicSponsoredProductDTO {
  campaignId: string;
  placement: SponsoredPlacement;
  product: PublicSponsoredProductSummary;
}

export interface CreateSponsoredCampaignInput {
  productId: string;
  placement: SponsoredPlacement;
  startAt: string;
  endAt: string;
  paymentProofReference?: string;
  paymentProofUrl?: string;
  paymentProofNotes?: string;
}

export interface SubmitPaymentProofInput {
  paymentProofReference?: string;
  paymentProofUrl?: string;
  paymentProofNotes?: string;
}
