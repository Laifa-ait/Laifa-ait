import {
  ArtisanProfile,
  ArtisanStatus,
  ArtisanTrade,
} from "../../types/artisan";
import { ArtisanPublicService } from "./services/artisanPublic.service";
import { ArtisanProfileService } from "./services/artisanProfile.service";
import { ArtisanQuotesService } from "./services/artisanQuotes.service";
import { ArtisanReviewsService } from "./services/artisanReviews.service";
import { ArtisanAdminService } from "./services/artisanAdmin.service";

export class ArtisanServiceLayer {
  // Public
  static listApprovedArtisans = ArtisanPublicService.listApprovedArtisans.bind(ArtisanPublicService);
  static getArtisanById = ArtisanPublicService.getArtisanById.bind(ArtisanPublicService);
  static getTrades = ArtisanPublicService.getTrades.bind(ArtisanPublicService);

  // Profile & Services
  static applyArtisan = ArtisanProfileService.applyArtisan.bind(ArtisanProfileService);
  static getMyArtisanProfile = ArtisanProfileService.getMyArtisanProfile.bind(ArtisanProfileService);
  static getArtisanByUserId = ArtisanProfileService.getMyArtisanProfile.bind(ArtisanProfileService);
  static updateMyProfile = ArtisanProfileService.updateMyProfile.bind(ArtisanProfileService);
  static updateArtisanProfile = (
    _profileId: string,
    userId: string,
    updates: Partial<ArtisanProfile>
  ) => ArtisanProfileService.updateMyProfile(userId, updates);

  static addService = ArtisanProfileService.addService.bind(ArtisanProfileService);
  static updateService = ArtisanProfileService.updateService.bind(ArtisanProfileService);
  static deleteService = ArtisanProfileService.deleteService.bind(ArtisanProfileService);
  static addPortfolioItem = ArtisanProfileService.addPortfolioItem.bind(ArtisanProfileService);
  static deletePortfolioItem = ArtisanProfileService.deletePortfolioItem.bind(ArtisanProfileService);

  // Quotes
  static submitQuoteRequest = ArtisanQuotesService.submitQuoteRequest.bind(ArtisanQuotesService);
  static getArtisanQuoteRequests = ArtisanQuotesService.getArtisanQuoteRequests.bind(ArtisanQuotesService);
  static getClientQuoteRequests = ArtisanQuotesService.getClientQuoteRequests.bind(ArtisanQuotesService);
  static updateQuoteRequestStatus = ArtisanQuotesService.updateQuoteRequestStatus.bind(ArtisanQuotesService);

  // Reviews
  static getArtisanReviews = ArtisanReviewsService.getArtisanReviews.bind(ArtisanReviewsService);
  static addReview = ArtisanReviewsService.addReview.bind(ArtisanReviewsService);

  // Admin
  static adminListArtisans = ArtisanAdminService.adminListArtisans.bind(ArtisanAdminService);
  static adminUpdateStatus = ArtisanAdminService.adminUpdateStatus.bind(ArtisanAdminService);
  static adminUpsertTrade = ArtisanAdminService.adminUpsertTrade.bind(ArtisanAdminService);
  static adminDeleteTrade = ArtisanAdminService.adminDeleteTrade.bind(ArtisanAdminService);
  static adminGetAuditLogs = ArtisanAdminService.adminGetAuditLogs.bind(ArtisanAdminService);
  static adminGetStats = ArtisanAdminService.adminGetStats.bind(ArtisanAdminService);

  // Aliases for admin
  static listAllArtisansForAdmin = async (filters: {
    status?: ArtisanStatus | "all";
    tradeId?: string;
    wilaya?: string;
    search?: string;
    limit?: number;
  }): Promise<ArtisanProfile[]> => {
    const res = await ArtisanAdminService.adminListArtisans(filters);
    return res.artisans;
  };

  static updateArtisanStatus = (
    artisanId: string,
    status: ArtisanStatus,
    adminUid: string,
    adminEmail: string,
    reason?: string
  ) => ArtisanAdminService.adminUpdateStatus(adminUid, adminEmail, artisanId, status, reason);

  static getAdminStats = ArtisanAdminService.adminGetStats.bind(ArtisanAdminService);
  static saveTrade = (trade: ArtisanTrade) =>
    ArtisanAdminService.adminUpsertTrade("admin", "admin@olmart.dz", trade);
  static deleteTrade = (id: string) =>
    ArtisanAdminService.adminDeleteTrade("admin", "admin@olmart.dz", id);
  static getAuditLogs = ArtisanAdminService.adminGetAuditLogs.bind(ArtisanAdminService);
}
