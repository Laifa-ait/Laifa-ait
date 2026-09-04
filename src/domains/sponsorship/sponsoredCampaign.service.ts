import {
  SponsoredCampaign,
  SponsoredPlacement,
  PublicSponsoredProductDTO,
  SubmitPaymentProofInput,
} from "../../types/sponsoredCampaign";
import { SellerCampaignService } from "./services/sellerCampaign.service";
import { AdminCampaignService } from "./services/adminCampaign.service";
import { PublicCampaignService } from "./services/publicCampaign.service";

/**
 * SponsoredCampaignService facade uniting seller, admin, and public sponsorship capabilities.
 */
export class SponsoredCampaignService {
  public static isTimeActive(startAt: string, endAt: string, nowMs = Date.now()): boolean {
    return PublicCampaignService.isTimeActive(startAt, endAt, nowMs);
  }

  // --- Seller operations ---
  public static async createCampaign(
    sellerId: string,
    payload: {
      productId: string;
      placement: SponsoredPlacement;
      startAt: string;
      endAt: string;
      paymentProofReference?: string;
      paymentProofUrl?: string;
      paymentProofNotes?: string;
    }
  ): Promise<SponsoredCampaign> {
    return SellerCampaignService.createCampaign(sellerId, payload);
  }

  public static async submitPaymentProof(
    sellerId: string,
    campaignId: string,
    proof: SubmitPaymentProofInput
  ): Promise<SponsoredCampaign> {
    return SellerCampaignService.submitPaymentProof(sellerId, campaignId, proof);
  }

  public static async listSellerCampaigns(sellerId: string): Promise<SponsoredCampaign[]> {
    return SellerCampaignService.listSellerCampaigns(sellerId);
  }

  public static async getSellerCampaign(sellerId: string, campaignId: string): Promise<SponsoredCampaign> {
    return SellerCampaignService.getSellerCampaign(sellerId, campaignId);
  }

  public static async cancelSellerCampaign(sellerId: string, campaignId: string): Promise<SponsoredCampaign> {
    return SellerCampaignService.cancelSellerCampaign(sellerId, campaignId);
  }

  // --- Admin operations ---
  public static async adminListCampaigns(filter?: {
    status?: string;
    moderationStatus?: string;
    paymentStatus?: string;
  }): Promise<SponsoredCampaign[]> {
    return AdminCampaignService.adminListCampaigns(filter);
  }

  public static async adminConfirmPayment(
    adminId: string,
    campaignId: string,
    notes?: string
  ): Promise<SponsoredCampaign> {
    return AdminCampaignService.adminConfirmPayment(adminId, campaignId, notes);
  }

  public static async adminApproveCampaign(adminId: string, campaignId: string): Promise<SponsoredCampaign> {
    return AdminCampaignService.adminApproveCampaign(adminId, campaignId);
  }

  public static async adminRejectCampaign(
    adminId: string,
    campaignId: string,
    reason: string
  ): Promise<SponsoredCampaign> {
    return AdminCampaignService.adminRejectCampaign(adminId, campaignId, reason);
  }

  public static async adminSuspendCampaign(
    adminId: string,
    campaignId: string,
    reason?: string
  ): Promise<SponsoredCampaign> {
    return AdminCampaignService.adminSuspendCampaign(adminId, campaignId, reason);
  }

  // --- Public operations ---
  public static async getPublicSponsoredProducts(params: {
    placement: SponsoredPlacement;
    category?: string;
    searchQuery?: string;
    limit?: number;
  }): Promise<PublicSponsoredProductDTO[]> {
    return PublicCampaignService.getPublicSponsoredProducts(params);
  }

  public static async recordAnalyticsEvent(params: {
    campaignId: string;
    eventType: "impression" | "click";
    placement: SponsoredPlacement;
    productId: string;
    clientIdentifier: string;
  }): Promise<{ success: boolean; deduplicated?: boolean }> {
    return PublicCampaignService.recordAnalyticsEvent(params);
  }
}
