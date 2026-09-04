import admin from "firebase-admin";
import { db } from "../../../config/firebase-admin";
import {
  SponsoredCampaign,
  SponsoredPlacement,
  PublicSponsoredProductDTO,
  PublicSponsoredProductSummary,
} from "../../../types/sponsoredCampaign";
import { Product } from "../../product/product.types";

const deduplicationCache = new Map<string, number>();

function cleanOldDeduplicationEntries() {
  const now = Date.now();
  for (const [key, timestamp] of deduplicationCache.entries()) {
    if (now - timestamp > 60_000) {
      deduplicationCache.delete(key);
    }
  }
}

export class PublicCampaignService {
  public static isTimeActive(startAt: string, endAt: string, nowMs = Date.now()): boolean {
    const s = new Date(startAt).getTime();
    const e = new Date(endAt).getTime();
    return s <= nowMs && e > nowMs;
  }

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

    // Firestore Compound Index Required:
    // Collection: "sponsored_campaigns", Fields: placement ASC, moderationStatus ASC
    // Bound candidate campaigns before product reads to prevent unbounded memory usage
    const candidateLimit = Math.max(limit * 5, 25);

    const snap = await db
      .collection("sponsored_campaigns")
      .where("placement", "==", placement)
      .where("moderationStatus", "==", "approved")
      .limit(candidateLimit)
      .get();

    if (snap.empty) {
      return [];
    }

    const eligibleCampaigns: SponsoredCampaign[] = [];

    snap.forEach((doc) => {
      const c = doc.data() as SponsoredCampaign;

      // Strict requirement: must be paid
      if (c.paymentStatus !== "paid") {
        return;
      }

      // Time window check
      if (!this.isTimeActive(c.startAt, c.endAt, nowMs)) {
        return;
      }

      // Operational status check: only active campaigns are publicly diffusable
      if (c.status !== "active") {
        return;
      }

      eligibleCampaigns.push(c);
    });

    if (eligibleCampaigns.length === 0) {
      return [];
    }

    // Fair hourly rotation to prevent unfair bias while maintaining stability
    const hourBucket = Math.floor(nowMs / (1000 * 60 * 60));
    eligibleCampaigns.sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) + hourBucket) % 100;
      const hashB = (b.id.charCodeAt(0) + hourBucket) % 100;
      return hashA - hashB || a.id.localeCompare(b.id);
    });

    const results: PublicSponsoredProductDTO[] = [];
    const sellerCountMap = new Map<string, number>();

    for (const campaign of eligibleCampaigns) {
      // Prevent seller monopoly: max 2 items per seller
      const count = sellerCountMap.get(campaign.sellerId) || 0;
      if (count >= 2) {
        continue;
      }

      const productDoc = await db.collection("products").doc(campaign.productId).get();
      if (!productDoc.exists) {
        continue;
      }

      const product = productDoc.data() as Product;

      if (product.sellerId !== campaign.sellerId) {
        continue;
      }

      if (product.status !== "active") {
        continue;
      }

      // Category matching
      if (placement === "category" && category) {
        const catA = (product.category || "").trim().toLowerCase();
        const catB = category.trim().toLowerCase();
        if (catA !== catB) {
          continue;
        }
      }

      // Search matching with mandatory relevance
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

      // Strictly safe public DTO without private fields
      const safeProduct: PublicSponsoredProductSummary = {
        id: product.id,
        name: product.name,
        price: product.price,
        promoPrice: product.promoPrice,
        image: product.image,
        category: product.category,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        rating: product.rating,
        reviewCount: product.stats?.reviewCount ?? 0,
        isSponsored: true,
      };

      results.push({
        campaignId: campaign.id,
        placement: campaign.placement,
        product: safeProduct,
      });

      sellerCountMap.set(campaign.sellerId, count + 1);

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

  public static async recordAnalyticsEvent(params: {
    campaignId: string;
    eventType: "impression" | "click";
    placement: SponsoredPlacement;
    productId: string;
    clientIdentifier: string;
  }): Promise<{ success: boolean; deduplicated?: boolean }> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const { campaignId, eventType, placement, productId, clientIdentifier } = params;

    if (!campaignId || !eventType || !placement) {
      throw new Error("Paramètres d'événement incomplets.");
    }

    if (eventType !== "impression" && eventType !== "click") {
      throw new Error("Type d'événement invalide.");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      throw new Error("Campagne introuvable.");
    }

    const campaign = campaignDoc.data() as SponsoredCampaign;

    // Falsification protection: Product ID must match campaign
    if (campaign.productId !== productId) {
      throw new Error("Incohérence entre le produit spécifié et la campagne.");
    }

    // Operational status check: only active campaigns accept analytics
    if (campaign.status !== "active") {
      throw new Error(`Campagne non active (statut: ${campaign.status}).`);
    }

    // Validation: Campaign must be approved, paid, and within time window
    if (campaign.paymentStatus !== "paid") {
      throw new Error("Campagne non payée : événements non comptabilisés.");
    }

    if (campaign.moderationStatus !== "approved") {
      throw new Error("Campagne non approuvée : événements non comptabilisés.");
    }

    if (!this.isTimeActive(campaign.startAt, campaign.endAt)) {
      throw new Error("Campagne hors de sa fenêtre de diffusion.");
    }

    if (campaign.placement !== placement) {
      throw new Error("Emplacement incohérent avec la campagne.");
    }

    // Verify product is still active and owned by campaign seller
    const productRef = db.collection("products").doc(campaign.productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
      throw new Error("Produit sponsorisé introuvable.");
    }

    const product = productDoc.data() as Product;
    if (product.sellerId !== campaign.sellerId) {
      throw new Error("Incohérence du vendeur associé au produit.");
    }

    if (product.status !== "active") {
      throw new Error("Le produit associé à la campagne n'est plus actif.");
    }

    // Deduplication using distinct client fingerprint in a 30-second window
    cleanOldDeduplicationEntries();
    const timeBucket = Math.floor(Date.now() / 30_000);
    const dedupKey = `${campaignId}:${eventType}:${clientIdentifier}:${timeBucket}`;

    if (deduplicationCache.has(dedupKey)) {
      return { success: true, deduplicated: true };
    }

    deduplicationCache.set(dedupKey, Date.now());

    // Atomic increment
    const updatePayload: Record<string, admin.firestore.FieldValue | string> = {
      updatedAt: new Date().toISOString(),
    };

    if (eventType === "impression") {
      updatePayload.impressions = admin.firestore.FieldValue.increment(1);
    } else {
      updatePayload.clicks = admin.firestore.FieldValue.increment(1);
    }

    await campaignRef.update(updatePayload);

    await db.collection("sponsored_analytics_events").add({
      campaignId,
      eventType,
      placement,
      productId: campaign.productId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, deduplicated: false };
  }
}
