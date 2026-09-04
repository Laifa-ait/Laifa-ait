import admin from "firebase-admin";
import { db } from "../../../config/firebase-admin";
import { SponsoredCampaign } from "../../../types/sponsoredCampaign";
import { safeLogger } from "../../../utils/logger";

function isTimeActive(startAt: string, endAt: string, nowMs = Date.now()): boolean {
  const s = new Date(startAt).getTime();
  const e = new Date(endAt).getTime();
  return s <= nowMs && e > nowMs;
}

export class AdminCampaignService {
  public static async adminListCampaigns(filter?: {
    status?: string;
    moderationStatus?: string;
    paymentStatus?: string;
  }): Promise<SponsoredCampaign[]> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    let query: admin.firestore.Query = db.collection("sponsored_campaigns");

    if (filter?.paymentStatus) {
      query = query.where("paymentStatus", "==", filter.paymentStatus);
    } else if (filter?.moderationStatus) {
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

  public static async adminConfirmPayment(
    adminId: string,
    campaignId: string,
    notes?: string
  ): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const auditRef = db.collection("audit_logs").doc();
    const now = new Date().toISOString();
    let updatedCampaign: SponsoredCampaign | null = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);
      if (!doc.exists) {
        throw new Error("Campagne introuvable.");
      }

      const campaign = doc.data() as SponsoredCampaign;
      if (campaign.status === "cancelled" || campaign.status === "completed") {
        throw new Error(`Impossible de valider le paiement d'une campagne terminée ou annulée (statut actuel : ${campaign.status}).`);
      }
      if (campaign.moderationStatus === "rejected") {
        throw new Error("Impossible de valider le paiement d'une campagne rejetée.");
      }

      if (campaign.paymentStatus === "paid") {
        updatedCampaign = campaign;
        return;
      }

      const isApproved = campaign.moderationStatus === "approved";
      const isCurrent = isTimeActive(campaign.startAt, campaign.endAt);
      const newStatus = isApproved ? (isCurrent ? "active" : "approved") : campaign.status;

      const updates: Partial<SponsoredCampaign> = {
        paymentStatus: "paid",
        status: newStatus,
        paymentConfirmedAt: now,
        paymentConfirmedBy: adminId,
        updatedAt: now,
      };

      transaction.update(campaignRef, updates);

      // Atomic Audit Log inside the exact same transaction
      transaction.set(auditRef, {
        type: "SPONSORED_CAMPAIGN_PAYMENT",
        action: "CONFIRM_PAYMENT",
        adminId,
        targetId: campaignId,
        campaignId,
        priceAmount: campaign.priceAmount,
        notes: notes ? notes.trim() : "Paiement manuel confirmé par l'administrateur",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      updatedCampaign = { ...campaign, ...updates };
    });

    if (!updatedCampaign) {
      throw new Error("Échec de la confirmation du paiement.");
    }

    safeLogger.info("Sponsored campaign payment confirmed by admin", { campaignId, adminId });
    return updatedCampaign;
  }

  public static async adminApproveCampaign(adminId: string, campaignId: string): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const auditRef = db.collection("audit_logs").doc();
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

      // Campaign only becomes active if payment is already confirmed AND time window is active
      const isPaid = campaign.paymentStatus === "paid";
      const isTimeCurrent = isTimeActive(campaign.startAt, campaign.endAt);
      const newStatus = isPaid ? (isTimeCurrent ? "active" : "approved") : "pending";

      const updates: Partial<SponsoredCampaign> = {
        moderationStatus: "approved",
        status: newStatus,
        approvedAt: now,
        approvedBy: adminId,
        updatedAt: now,
      };

      transaction.update(campaignRef, updates);

      // Atomic Audit Log inside the exact same transaction
      transaction.set(auditRef, {
        type: "SPONSORED_CAMPAIGN_MODERATION",
        action: "APPROVE_CAMPAIGN",
        adminId,
        targetId: campaignId,
        campaignId,
        details: `Campagne #${campaignId} approuvée par ${adminId}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      updatedCampaign = { ...campaign, ...updates };
    });

    if (!updatedCampaign) {
      throw new Error("Échec de l'approbation de la campagne.");
    }

    safeLogger.info("Sponsored campaign approved by admin", { campaignId, adminId });
    return updatedCampaign;
  }

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
    const auditRef = db.collection("audit_logs").doc();
    const now = new Date().toISOString();
    let updatedCampaign: SponsoredCampaign | null = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);
      if (!doc.exists) {
        throw new Error("Campagne introuvable.");
      }

      const campaign = doc.data() as SponsoredCampaign;

      if (campaign.paymentStatus === "paid" || campaign.moderationStatus === "approved") {
        throw new Error("Impossible de rejeter une campagne déjà payée ou approuvée.");
      }

      const updates: Partial<SponsoredCampaign> = {
        moderationStatus: "rejected",
        status: "rejected",
        rejectionReason: reason.trim(),
        updatedAt: now,
      };

      transaction.update(campaignRef, updates);

      // Atomic Audit Log inside the transaction
      transaction.set(auditRef, {
        type: "SPONSORED_CAMPAIGN_MODERATION",
        action: "REJECT_CAMPAIGN",
        adminId,
        targetId: campaignId,
        campaignId,
        details: `Campagne #${campaignId} rejetée par ${adminId}. Motif: ${reason}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      updatedCampaign = { ...campaign, ...updates };
    });

    if (!updatedCampaign) {
      throw new Error("Échec du rejet de la campagne.");
    }

    safeLogger.info("Sponsored campaign rejected by admin", { campaignId, adminId, reason });
    return updatedCampaign;
  }

  public static async adminSuspendCampaign(
    adminId: string,
    campaignId: string,
    reason?: string
  ): Promise<SponsoredCampaign> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const campaignRef = db.collection("sponsored_campaigns").doc(campaignId);
    const auditRef = db.collection("audit_logs").doc();
    const now = new Date().toISOString();
    let updatedCampaign: SponsoredCampaign | null = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(campaignRef);
      if (!doc.exists) {
        throw new Error("Campagne introuvable.");
      }

      const campaign = doc.data() as SponsoredCampaign;

      if (campaign.moderationStatus !== "approved" && campaign.status !== "active") {
        throw new Error("Seules les campagnes approuvées ou actives peuvent être suspendues.");
      }

      const updates: Partial<SponsoredCampaign> = {
        moderationStatus: "suspended",
        status: "paused",
        rejectionReason: reason ? reason.trim() : "Suspendue par l'administration",
        updatedAt: now,
      };

      transaction.update(campaignRef, updates);

      // Atomic Audit Log inside the transaction
      transaction.set(auditRef, {
        type: "SPONSORED_CAMPAIGN_MODERATION",
        action: "SUSPEND_CAMPAIGN",
        adminId,
        targetId: campaignId,
        campaignId,
        details: `Campagne #${campaignId} suspendue par ${adminId}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      updatedCampaign = { ...campaign, ...updates };
    });

    if (!updatedCampaign) {
      throw new Error("Échec de la suspension de la campagne.");
    }

    safeLogger.info("Sponsored campaign suspended by admin", { campaignId, adminId });
    return updatedCampaign;
  }
}
