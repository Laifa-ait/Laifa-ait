import admin from "firebase-admin";
import { db } from "../../config/firebase-admin";
import {
  SponsoredCampaign,
  SponsoredPlacement,
  PublicSponsoredProductDTO,
} from "../../types/sponsoredCampaign";
import { calculateCampaignPrice } from "../../config/sponsoredPricing";
import { Product } from "../product/product.types";
import { WalletAccount, WalletTransaction } from "../payment/payment.types";
import { safeLogger } from "../../utils/logger";

// In-memory deduplication set for analytics events (cleaned up periodically)
const deduplicationCache = new Map<string, number>();

function cleanOldDeduplicationEntries() {
  const now = Date.now();
  for (const [key, timestamp] of deduplicationCache.entries()) {
    if (now - timestamp > 60_000) {
      deduplicationCache.delete(key);
    }
  }
}

export class SponsoredCampaignService {
  /**
   * Helper to check if campaign is currently in its active time window
   */
  public static isTimeActive(startAt: string, endAt: string, nowMs = Date.now()): boolean {
    const s = new Date(startAt).getTime();
    const e = new Date(endAt).getTime();
    return s <= nowMs && e > nowMs;
  }

  /**
   * Create a new sponsored campaign by a seller
   */
  public static async createCampaign(
    sellerId: string,
    payload: {
      productId: string;
      placement: SponsoredPlacement;
      startAt: string;
      endAt: string;
      payFromWallet?: boolean;
    }
  ): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    if (!sellerId || typeof sellerId !== "string") {
      throw new Error("Identifiant vendeur invalide.");
    }

    const { productId, placement, startAt, endAt, payFromWallet } = payload;

    if (!productId || typeof productId !== "string") {
      throw new Error("Identifiant produit obligatoire.");
    }

    // 1. Verify product eligibility
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new Error("Le produit sélectionné n'existe pas.");
    }

    const product = productDoc.data() as Product;

    // Strict ownership validation
    if (product.sellerId !== sellerId) {
      throw new Error("Vous ne pouvez pas sponsoriser un produit appartenant à un autre vendeur.");
    }

    // Active & published validation
    const isProductActive =
      (product.status === "active" || product.status === "approved") &&
      product.status !== "deleted" &&
      product.status !== "pending_deletion";

    if (!isProductActive) {
      throw new Error("Seuls les produits actifs et publiés peuvent être sponsorisés.");
    }

    if (!product.name || product.name.trim().length === 0) {
      throw new Error("Le produit doit posséder un titre valide.");
    }

    if (!product.image || product.image.trim().length === 0) {
      throw new Error("Le produit doit posséder une image principale valide.");
    }

    if (typeof product.price !== "number" || product.price <= 0) {
      throw new Error("Le produit doit posséder un prix valide strictement positif.");
    }

    if (!product.category || product.category.trim().length === 0) {
      throw new Error("Le produit doit être associé à une catégorie valide.");
    }

    // 2. Pricing & duration validation
    const pricingResult = calculateCampaignPrice(placement, startAt, endAt);
    if (!pricingResult.valid) {
      throw new Error(pricingResult.error);
    }

    const { durationDays, priceAmount, currency } = pricingResult.data;
    const now = new Date().toISOString();

    const campaignRef = db.collection("sponsored_campaigns").doc();
    const campaignId = campaignRef.id;

    let paymentStatus: SponsoredCampaign["paymentStatus"] = "unpaid";

    // 3. Optional wallet payment with ACID transaction
    if (payFromWallet) {
      const walletRef = db.collection("seller_wallets").doc(sellerId);

      await db.runTransaction(async (transaction) => {
        const walletDoc = await transaction.get(walletRef);
        if (!walletDoc.exists) {
          throw new Error("INSUFFICIENT_WALLET_BALANCE");
        }

        const wallet = walletDoc.data() as WalletAccount;
        if ((wallet.availableBalanceDZD || 0) < priceAmount) {
          throw new Error("INSUFFICIENT_WALLET_BALANCE");
        }

        const newAvailable = wallet.availableBalanceDZD - priceAmount;
        transaction.update(walletRef, {
          availableBalanceDZD: newAvailable,
          updatedAt: now,
        });

        const txRef = db.collection("seller_wallet_transactions").doc();
        const txData: WalletTransaction = {
          id: txRef.id,
          sellerId,
          type: "SPONSORSHIP_PAYMENT",
          amountDZD: -priceAmount,
          balanceAfterDZD: newAvailable,
          description: `Paiement campagne sponsorisée #${campaignId} (${placement} - ${durationDays}j)`,
          createdAt: now,
        };
        transaction.set(txRef, txData);

        paymentStatus = "paid";
      });
    }

    const campaign: SponsoredCampaign = {
      id: campaignId,
      sellerId,
      productId,
      productName: product.name,
      productImage: product.image,
      productCategory: product.category,
      placement,
      status: "pending",
      startAt,
      endAt,
      durationDays,
      priceAmount,
      currency,
      paymentStatus,
      moderationStatus: "pending",
      createdAt: now,
      updatedAt: now,
      impressions: 0,
      clicks: 0,
    };

    await campaignRef.set(campaign);

    safeLogger.info("Sponsored campaign created", {
      campaignId,
      sellerId,
      productId,
      placement,
      priceAmount,
      paymentStatus,
    });

    return campaign;
  }

  /**
   * List all campaigns for a specific authenticated seller
   */
  public static async listSellerCampaigns(sellerId: string): Promise<SponsoredCampaign[]> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const snap = await db
      .collection("sponsored_campaigns")
      .where("sellerId", "==", sellerId)
      .get();

    const campaigns: SponsoredCampaign[] = [];
    snap.forEach((doc) => {
      campaigns.push(doc.data() as SponsoredCampaign);
    });

    // Sort descending by creation date
    return campaigns.sort((a, b) => {
      const ta = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const tb = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }

  /**
   * Get a single campaign by seller ID with IDOR protection
   */
  public static async getSellerCampaign(sellerId: string, campaignId: string): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const doc = await db.collection("sponsored_campaigns").doc(campaignId).get();
    if (!doc.exists) {
      throw new Error("Campagne introuvable.");
    }

    const campaign = doc.data() as SponsoredCampaign;
    if (campaign.sellerId !== sellerId) {
      throw new Error("Accès refusé : vous n'êtes pas le propriétaire de cette campagne.");
    }

    return campaign;
  }

  /**
   * Cancel a campaign by seller ID with IDOR protection
   */
  public static async cancelSellerCampaign(sellerId: string, campaignId: string): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const now = new Date().toISOString();
    let updatedCampaign: SponsoredCampaign | null = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);
      if (!doc.exists) {
        throw new Error("Campagne introuvable.");
      }

      const campaign = doc.data() as SponsoredCampaign;
      if (campaign.sellerId !== sellerId) {
        throw new Error("Accès refusé : vous n'êtes pas le propriétaire de cette campagne.");
      }

      if (campaign.status === "cancelled" || campaign.status === "completed") {
        throw new Error("Cette campagne ne peut plus être annulée.");
      }

      transaction.update(campaignRef, {
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      });

      updatedCampaign = {
        ...campaign,
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      };
    });

    if (!updatedCampaign) {
      throw new Error("Échec de l'annulation de la campagne.");
    }

    safeLogger.info("Sponsored campaign cancelled by seller", { campaignId, sellerId });
    return updatedCampaign;
  }

  /**
   * Admin: List campaigns with optional status filter
   */
  public static async adminListCampaigns(filter?: {
    status?: string;
    moderationStatus?: string;
  }): Promise<SponsoredCampaign[]> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    let query: admin.firestore.Query = db.collection("sponsored_campaigns");

    if (filter?.moderationStatus) {
      query = query.where("moderationStatus", "==", filter.moderationStatus);
    } else if (filter?.status) {
      query = query.where("status", "==", filter.status);
    }

    const snap = await query.get();
    const list: SponsoredCampaign[] = [];
    snap.forEach((doc) => list.push(doc.data() as SponsoredCampaign));

    return list.sort((a, b) => {
      const ta = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const tb = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }

  /**
   * Admin: Approve a campaign
   */
  public static async adminApproveCampaign(adminId: string, campaignId: string): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const now = new Date().toISOString();
    let updatedCampaign: SponsoredCampaign | null = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);
      if (!doc.exists) {
        throw new Error("Campagne introuvable.");
      }

      const campaign = doc.data() as SponsoredCampaign;
      if (campaign.status === "cancelled") {
        throw new Error("Impossible d'approuver une campagne annulée.");
      }
      if (campaign.moderationStatus === "rejected") {
        throw new Error("Impossible d'approuver une campagne déjà rejetée.");
      }

      // If already paid and within valid time window, set active; otherwise approved
      const isPaid = campaign.paymentStatus === "paid";
      const isTimeCurrent = this.isTimeActive(campaign.startAt, campaign.endAt);
      const newStatus = isPaid && isTimeCurrent ? "active" : "approved";

      transaction.update(campaignRef, {
        moderationStatus: "approved",
        status: newStatus,
        approvedAt: now,
        approvedBy: adminId,
        updatedAt: now,
      });

      updatedCampaign = {
        ...campaign,
        moderationStatus: "approved",
        status: newStatus,
        approvedAt: now,
        approvedBy: adminId,
        updatedAt: now,
      };
    });

    if (!updatedCampaign) {
      throw new Error("Échec de l'approbation de la campagne.");
    }

    // Audit log
    await db.collection("audit_logs").add({
      type: "SPONSORED_CAMPAIGN_MODERATION",
      action: "APPROVE_CAMPAIGN",
      adminId,
      campaignId,
      details: `Campagne #${campaignId} approuvée par ${adminId}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    safeLogger.info("Sponsored campaign approved by admin", { campaignId, adminId });
    return updatedCampaign;
  }

  /**
   * Admin: Reject a campaign with reason
   */
  public static async adminRejectCampaign(
    adminId: string,
    campaignId: string,
    reason: string
  ): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error("Le motif du refus est obligatoire.");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const now = new Date().toISOString();
    let updatedCampaign: SponsoredCampaign | null = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);
      if (!doc.exists) {
        throw new Error("Campagne introuvable.");
      }

      const campaign = doc.data() as SponsoredCampaign;

      transaction.update(campaignRef, {
        moderationStatus: "rejected",
        status: "rejected",
        rejectionReason: reason.trim(),
        updatedAt: now,
      });

      updatedCampaign = {
        ...campaign,
        moderationStatus: "rejected",
        status: "rejected",
        rejectionReason: reason.trim(),
        updatedAt: now,
      };
    });

    if (!updatedCampaign) {
      throw new Error("Échec du rejet de la campagne.");
    }

    // Audit log
    await db.collection("audit_logs").add({
      type: "SPONSORED_CAMPAIGN_MODERATION",
      action: "REJECT_CAMPAIGN",
      adminId,
      campaignId,
      details: `Campagne #${campaignId} rejetée par ${adminId}. Motif: ${reason}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    safeLogger.info("Sponsored campaign rejected by admin", { campaignId, adminId, reason });
    return updatedCampaign;
  }

  /**
   * Admin: Suspend an active or approved campaign
   */
  public static async adminSuspendCampaign(
    adminId: string,
    campaignId: string,
    reason?: string
  ): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const now = new Date().toISOString();
    let updatedCampaign: SponsoredCampaign | null = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);
      if (!doc.exists) {
        throw new Error("Campagne introuvable.");
      }

      const campaign = doc.data() as SponsoredCampaign;

      transaction.update(campaignRef, {
        moderationStatus: "suspended",
        status: "paused",
        rejectionReason: reason ? reason.trim() : "Suspendue par l'administration",
        updatedAt: now,
      });

      updatedCampaign = {
        ...campaign,
        moderationStatus: "suspended",
        status: "paused",
        rejectionReason: reason ? reason.trim() : "Suspendue par l'administration",
        updatedAt: now,
      };
    });

    if (!updatedCampaign) {
      throw new Error("Échec de la suspension de la campagne.");
    }

    // Audit log
    await db.collection("audit_logs").add({
      type: "SPONSORED_CAMPAIGN_MODERATION",
      action: "SUSPEND_CAMPAIGN",
      adminId,
      campaignId,
      details: `Campagne #${campaignId} suspendue par ${adminId}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    safeLogger.info("Sponsored campaign suspended by admin", { campaignId, adminId });
    return updatedCampaign;
  }

  /**
   * Public: Query currently eligible sponsored products for a placement
   * Does NOT return any private admin or internal campaign data.
   */
  public static async getPublicSponsoredProducts(params: {
    placement: SponsoredPlacement;
    category?: string;
    searchQuery?: string;
    limit?: number;
  }): Promise<PublicSponsoredProductDTO[]> {
    if (!db) {
      return [];
    }

    const { placement, category, searchQuery, limit = 8 } = params;
    const nowMs = Date.now();

    // 1. Fetch campaigns for this placement with approved moderation
    const snap = await db
      .collection("sponsored_campaigns")
      .where("placement", "==", placement)
      .where("moderationStatus", "==", "approved")
      .get();

    if (snap.empty) {
      return [];
    }

    const eligibleCampaigns: SponsoredCampaign[] = [];

    snap.forEach((doc) => {
      const c = doc.data() as SponsoredCampaign;

      // Rule: paymentStatus must be paid (or non-failing)
      if (c.paymentStatus !== "paid") {
        return;
      }

      // Rule: Status must be active or approved
      if (c.status !== "active" && c.status !== "approved") {
        return;
      }

      // Rule: Time window check
      if (!this.isTimeActive(c.startAt, c.endAt, nowMs)) {
        return;
      }

      eligibleCampaigns.push(c);
    });

    if (eligibleCampaigns.length === 0) {
      return [];
    }

    // 2. Fetch corresponding products to verify existence, publication and category/search matching
    const results: PublicSponsoredProductDTO[] = [];
    const sellerCountMap = new Map<string, number>();

    // Sort campaigns deterministically using stable time-based offset (e.g., current hour)
    // To ensure fair rotation that does not change every single request
    const hourBucket = Math.floor(nowMs / (1000 * 60 * 60));
    eligibleCampaigns.sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) + hourBucket) % 100;
      const hashB = (b.id.charCodeAt(0) + hourBucket) % 100;
      return hashA - hashB || a.id.localeCompare(b.id);
    });

    for (const campaign of eligibleCampaigns) {
      // Limit to max 2 items per seller to avoid monopoly
      const sellerCount = sellerCountMap.get(campaign.sellerId) || 0;
      if (sellerCount >= 2) {
        continue;
      }

      const productDoc = await db.collection("products").doc(campaign.productId).get();
      if (!productDoc.exists) {
        continue;
      }

      const product = productDoc.data() as Product;

      // Product must still belong to the same seller
      if (product.sellerId !== campaign.sellerId) {
        continue;
      }

      // Product must be active and not deleted
      const isProductActive =
        (product.status === "active" || product.status === "approved") &&
        product.status !== "deleted" &&
        product.status !== "pending_deletion";

      if (!isProductActive) {
        continue;
      }

      // Category matching for 'category' placement
      if (placement === "category" && category) {
        const catA = (product.category || "").trim().toLowerCase();
        const catB = category.trim().toLowerCase();
        if (catA !== catB) {
          continue;
        }
      }

      // Search matching for 'search' placement: product must be relevant to search query
      if (placement === "search" && searchQuery) {
        const qTerms = searchQuery
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 1);

        const targetText = [
          product.name,
          product.description,
          product.category,
          product.subcategory,
          ...(product.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matches = qTerms.some((term) => targetText.includes(term));
        if (!matches) {
          continue;
        }
      }

      // Build safe public product DTO
      const safeProduct: Product = {
        ...product,
        isSponsored: true,
      };

      results.push({
        campaignId: campaign.id,
        placement: campaign.placement,
        product: safeProduct,
      });

      sellerCountMap.set(campaign.sellerId, sellerCount + 1);

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

  /**
   * Analytics: Record an impression or click event unitarily
   * Deduplicates rapid events within a 30s window without storing raw IP.
   */
  public static async recordAnalyticsEvent(params: {
    campaignId: string;
    eventType: "impression" | "click";
    placement: SponsoredPlacement;
    productId: string;
    sessionId?: string;
  }): Promise<{ success: boolean; deduplicated?: boolean }> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const { campaignId, eventType, placement, productId, sessionId } = params;

    if (!campaignId || !eventType || !placement) {
      throw new Error("Paramètres d'événement incomplets.");
    }

    if (eventType !== "impression" && eventType !== "click") {
      throw new Error("Type d'événement invalide.");
    }

    // Check campaign
    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      throw new Error("Campagne introuvable.");
    }

    const campaign = campaignDoc.data() as SponsoredCampaign;

    // Check active status
    const isApproved = campaign.moderationStatus === "approved";
    const isPaid = campaign.paymentStatus === "paid";
    const isCurrent = this.isTimeActive(campaign.startAt, campaign.endAt);
    const isCampaignEligible =
      campaign.status === "active" || (isApproved && isPaid && isCurrent);

    if (!isCampaignEligible) {
      throw new Error("Cette campagne n'est pas active.");
    }

    if (campaign.placement !== placement) {
      throw new Error("Emplacement incohérent avec la campagne.");
    }

    // Deduplication check: key = campaignId:eventType:sessionIdOrAnon:minuteWindow
    cleanOldDeduplicationEntries();
    const timeBucket = Math.floor(Date.now() / 30_000); // 30-second deduplication slice
    const dedupKey = `${campaignId}:${eventType}:${sessionId || "anon"}:${timeBucket}`;

    if (deduplicationCache.has(dedupKey)) {
      return { success: true, deduplicated: true };
    }

    deduplicationCache.set(dedupKey, Date.now());

    // Atomic increment of impressions or clicks
    const updatePayload: Record<string, admin.firestore.FieldValue | string> = {
      updatedAt: new Date().toISOString(),
    };

    if (eventType === "impression") {
      updatePayload.impressions = admin.firestore.FieldValue.increment(1);
    } else {
      updatePayload.clicks = admin.firestore.FieldValue.increment(1);
    }

    await campaignRef.update(updatePayload);

    // Optional event record
    await db.collection("sponsored_analytics_events").add({
      campaignId,
      eventType,
      placement,
      productId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, deduplicated: false };
  }
}
