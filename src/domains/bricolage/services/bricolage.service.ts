import { BricolageCatalogService } from "./bricolageCatalog.service";
import { BricolageQuoteService } from "./bricolageQuote.service";
import { BricolageArtisanService } from "./bricolageArtisan.service";
import { QuoteRequestPayload, ArtisanUpgradePayload, ArtisanVerificationActionPayload } from "../../../types/bricolage";

export class BricolageService {
  static getCategories(): Promise<Array<Record<string, unknown>>> {
    return BricolageCatalogService.getCategories();
  }

  static getArtisans(wilaya?: string, specialty?: string): Promise<Array<Record<string, unknown>>> {
    return BricolageCatalogService.getArtisans(wilaya, specialty);
  }

  static createQuoteRequest(payload: QuoteRequestPayload, customerId: string | null) {
    return BricolageQuoteService.createQuoteRequest(payload, customerId);
  }

  static submitOffer(
    artisanUid: string,
    requestId: string,
    priceDZD: number,
    estimatedDuration?: string,
    notes?: string,
    userRole?: string,
    userEmail?: string
  ): Promise<string> {
    return BricolageQuoteService.submitOffer(artisanUid, requestId, priceDZD, estimatedDuration, notes, userRole, userEmail);
  }

  static acceptOffer(requestId: string, offerId: string, customerUid: string): Promise<Record<string, unknown>> {
    return BricolageQuoteService.acceptOffer(requestId, offerId, customerUid);
  }

  static getOpportunities(
    artisanUid?: string,
    userRole?: string,
    artisanWilaya?: string,
    category?: string
  ): Promise<Array<Record<string, unknown>>> {
    return BricolageArtisanService.getOpportunities(artisanUid, userRole, artisanWilaya, category);
  }

  static upgradeToArtisan(uid: string, userEmail: string, payload: ArtisanUpgradePayload): Promise<Record<string, unknown>> {
    return BricolageArtisanService.upgradeToArtisan(uid, userEmail, payload);
  }

  static getPendingArtisans(): Promise<Array<Record<string, unknown>>> {
    return BricolageArtisanService.getPendingArtisans();
  }

  static verifyArtisan(payload: ArtisanVerificationActionPayload): Promise<{ success: boolean; message: string }> {
    return BricolageArtisanService.verifyArtisan(payload);
  }

  static getReviews(): Promise<Array<Record<string, unknown>>> {
    return BricolageCatalogService.getReviews();
  }
}
