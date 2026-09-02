import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import {
  ArtisanProfile,
  ArtisanStatus,
  ArtisanTrade,
  ArtisanAdminAuditLog,
  ArtisanStatsSummary,
} from "../../../types/artisan";
import { DEFAULT_ARTISAN_TRADES } from "../../../data/artisanTrades";

const ARTISANS_COLLECTION = "artisan_profiles";
const ARTISAN_TRADES_COLLECTION = "artisan_trades";
const QUOTE_REQUESTS_COLLECTION = "artisan_quote_requests";
const AUDIT_LOGS_COLLECTION = "artisan_audit_logs";

export class ArtisanAdminService {
  static async adminListArtisans(filters: {
    status?: ArtisanStatus | "all";
    search?: string;
    tradeId?: string;
    wilaya?: string;
    page?: number;
    limit?: number;
  }): Promise<{ artisans: ArtisanProfile[]; total: number }> {
    if (!db) return { artisans: [], total: 0 };

    try {
      let query: FirebaseFirestore.Query = db.collection(ARTISANS_COLLECTION);

      if (filters.status && filters.status !== "all") {
        query = query.where("status", "==", filters.status);
      }

      if (filters.tradeId) {
        query = query.where("tradeId", "==", filters.tradeId);
      }

      if (filters.wilaya) {
        query = query.where("wilaya", "==", filters.wilaya);
      }

      query = query.orderBy("createdAt", "desc");

      const snapshot = await query.get();
      let all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanProfile, "id">),
      }));

      if (filters.search && filters.search.trim().length > 0) {
        const term = filters.search.toLowerCase().trim();
        all = all.filter(
          (a) =>
            a.fullName.toLowerCase().includes(term) ||
            (a.professionalName && a.professionalName.toLowerCase().includes(term)) ||
            a.email.toLowerCase().includes(term) ||
            a.phone.includes(term) ||
            a.tradeName.toLowerCase().includes(term) ||
            a.wilaya.toLowerCase().includes(term) ||
            a.commune.toLowerCase().includes(term)
        );
      }

      const total = all.length;
      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(filters.limit || 50, 100);
      const start = (page - 1) * limit;
      const paginated = all.slice(start, start + limit);

      return { artisans: paginated, total };
    } catch (error) {
      safeLogger.error("[ArtisanAdminService] adminListArtisans error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { artisans: [], total: 0 };
    }
  }

  static async adminUpdateStatus(
    adminUid: string,
    adminEmail: string,
    artisanId: string,
    status: ArtisanStatus,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const docRef = db.collection(ARTISANS_COLLECTION).doc(artisanId);
      const doc = await docRef.get();
      if (!doc.exists) return { success: false, error: "Artisan introuvable" };

      const artisan = doc.data() as ArtisanProfile;
      const now = new Date().toISOString();

      const updateData: Partial<ArtisanProfile> = {
        status,
        statusReason: reason || "",
        updatedAt: now,
        ...(status === "approved" ? { verifiedAt: now } : {}),
      };

      await docRef.update(updateData);

      const auditLog: Omit<ArtisanAdminAuditLog, "id"> = {
        adminUid,
        adminEmail,
        action:
          status === "approved"
            ? "approve"
            : status === "rejected"
            ? "reject"
            : status === "suspended"
            ? "suspend"
            : status === "blocked"
            ? "block"
            : "reactivate",
        targetId: artisanId,
        targetType: "artisan",
        targetName: artisan.fullName || artisan.professionalName || artisan.email,
        details: `Statut changé de "${artisan.status}" à "${status}". ${reason ? `Motif: ${reason}` : ""}`,
        timestamp: now,
      };

      await db.collection(AUDIT_LOGS_COLLECTION).add(auditLog);

      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanAdminService] adminUpdateStatus error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de modifier le statut" };
    }
  }

  static async adminUpsertTrade(
    adminUid: string,
    adminEmail: string,
    tradeData: ArtisanTrade
  ): Promise<{ success: boolean; trade?: ArtisanTrade; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const tradeId = tradeData.id || `trade_${Date.now()}`;
      const docRef = db.collection(ARTISAN_TRADES_COLLECTION).doc(tradeId);

      const trade: ArtisanTrade = {
        ...tradeData,
        id: tradeId,
        active: tradeData.active !== false,
      };

      await docRef.set(trade, { merge: true });

      await db.collection(AUDIT_LOGS_COLLECTION).add({
        adminUid,
        adminEmail,
        action: tradeData.id ? "update_trade" : "create_trade",
        targetId: tradeId,
        targetType: "trade",
        targetName: trade.name,
        details: `Catégorie de métier enregistrée: ${trade.name}`,
        timestamp: new Date().toISOString(),
      });

      return { success: true, trade };
    } catch (error) {
      safeLogger.error("[ArtisanAdminService] adminUpsertTrade error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de sauvegarder le métier" };
    }
  }

  static async adminDeleteTrade(
    adminUid: string,
    adminEmail: string,
    tradeId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const docRef = db.collection(ARTISAN_TRADES_COLLECTION).doc(tradeId);
      const doc = await docRef.get();
      const tradeName = doc.exists ? (doc.data() as ArtisanTrade).name : tradeId;

      await docRef.delete();

      await db.collection(AUDIT_LOGS_COLLECTION).add({
        adminUid,
        adminEmail,
        action: "delete_trade",
        targetId: tradeId,
        targetType: "trade",
        targetName,
        details: `Catégorie de métier supprimée: ${tradeName}`,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanAdminService] adminDeleteTrade error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de supprimer la catégorie" };
    }
  }

  static async adminGetAuditLogs(limitCount = 50): Promise<ArtisanAdminAuditLog[]> {
    if (!db) return [];

    try {
      const snapshot = await db
        .collection(AUDIT_LOGS_COLLECTION)
        .orderBy("timestamp", "desc")
        .limit(limitCount)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanAdminAuditLog, "id">),
      }));
    } catch (error) {
      safeLogger.error("[ArtisanAdminService] adminGetAuditLogs error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async adminGetStats(): Promise<ArtisanStatsSummary> {
    if (!db) {
      return {
        totalArtisans: 0,
        approvedCount: 0,
        pendingCount: 0,
        underReviewCount: 0,
        rejectedCount: 0,
        suspendedCount: 0,
        totalQuoteRequests: 0,
        totalTrades: DEFAULT_ARTISAN_TRADES.length,
      };
    }

    try {
      const artisansSnapshot = await db.collection(ARTISANS_COLLECTION).get();
      const quotesSnapshot = await db.collection(QUOTE_REQUESTS_COLLECTION).get();
      const tradesSnapshot = await db.collection(ARTISAN_TRADES_COLLECTION).get();

      let approvedCount = 0;
      let pendingCount = 0;
      let underReviewCount = 0;
      let rejectedCount = 0;
      let suspendedCount = 0;

      artisansSnapshot.docs.forEach((doc) => {
        const status = doc.data().status as ArtisanStatus;
        if (status === "approved") approvedCount++;
        else if (status === "pending") pendingCount++;
        else if (status === "under_review") underReviewCount++;
        else if (status === "rejected") rejectedCount++;
        else if (status === "suspended" || status === "blocked") suspendedCount++;
      });

      return {
        totalArtisans: artisansSnapshot.size,
        approvedCount,
        pendingCount,
        underReviewCount,
        rejectedCount,
        suspendedCount,
        totalQuoteRequests: quotesSnapshot.size,
        totalTrades: tradesSnapshot.size > 0 ? tradesSnapshot.size : DEFAULT_ARTISAN_TRADES.length,
      };
    } catch (error) {
      safeLogger.error("[ArtisanAdminService] adminGetStats error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        totalArtisans: 0,
        approvedCount: 0,
        pendingCount: 0,
        underReviewCount: 0,
        rejectedCount: 0,
        suspendedCount: 0,
        totalQuoteRequests: 0,
        totalTrades: DEFAULT_ARTISAN_TRADES.length,
      };
    }
  }
}
