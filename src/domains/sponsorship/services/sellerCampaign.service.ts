import { db } from "../../../config/firebase-admin";
import {
  SponsoredCampaign,
  SponsoredPlacement,
  SubmitPaymentProofInput,
} from "../../../types/sponsoredCampaign";
import { calculateCampaignPrice } from "../../../config/sponsoredPricing";
import { Product } from "../../product/product.types";
import { safeLogger } from "../../../utils/logger";

export class SellerCampaignService {
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
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    if (!sellerId || typeof sellerId !== "string") {
      throw new Error("Identifiant vendeur invalide.");
    }

    const { productId, placement, startAt, endAt, paymentProofReference, paymentProofUrl, paymentProofNotes } = payload;

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

    // Campaign is strictly decoupled from wallet. Created with paymentStatus: "pending".
    const hasProof = Boolean(paymentProofReference?.trim() || paymentProofUrl?.trim());

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
      paymentStatus: "pending",
      moderationStatus: "pending",
      ...(hasProof && {
        paymentProofReference: paymentProofReference?.trim(),
        paymentProofUrl: paymentProofUrl?.trim(),
        paymentProofNotes: paymentProofNotes?.trim(),
        paymentProofSubmittedAt: now,
      }),
      createdAt: now,
      updatedAt: now,
      impressions: 0,
      clicks: 0,
    };

    await campaignRef.set(campaign);

    safeLogger.info("Sponsored campaign created (pending manual payment)", {
      campaignId,
      sellerId,
      productId,
      placement,
      priceAmount,
    });

    return campaign;
  }

  public static async submitPaymentProof(
    sellerId: string,
    campaignId: string,
    proof: SubmitPaymentProofInput
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
      if (campaign.sellerId !== sellerId) {
        throw new Error("Accès refusé : vous n'êtes pas le propriétaire de cette campagne.");
      }

      if (campaign.status === "cancelled" || campaign.status === "completed") {
        throw new Error("Impossible de soumettre un paiement pour une campagne terminée ou annulée.");
      }

      if (campaign.paymentStatus === "paid") {
        throw new Error("Le paiement de cette campagne a déjà été confirmé.");
      }

      const updates: Partial<SponsoredCampaign> = {
        paymentProofReference: proof.paymentProofReference?.trim() || campaign.paymentProofReference,
        paymentProofUrl: proof.paymentProofUrl?.trim() || campaign.paymentProofUrl,
        paymentProofNotes: proof.paymentProofNotes?.trim() || campaign.paymentProofNotes,
        paymentProofSubmittedAt: now,
        updatedAt: now,
      };

      transaction.update(campaignRef, updates);
      updatedCampaign = { ...campaign, ...updates };
    });

    if (!updatedCampaign) {
      throw new Error("Échec de l'enregistrement du justificatif.");
    }

    safeLogger.info("Payment proof submitted by seller", { campaignId, sellerId });
    return updatedCampaign;
  }

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

    return campaigns.sort((a, b) => {
      const ta = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const tb = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }

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
}
