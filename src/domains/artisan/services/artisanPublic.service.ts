import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { ArtisanProfile, ArtisanTrade } from "../../../types/artisan";
import { DEFAULT_ARTISAN_TRADES } from "../../../data/artisanTrades";

const ARTISANS_COLLECTION = "artisan_profiles";
const ARTISAN_TRADES_COLLECTION = "artisan_trades";

function sanitizePublicProfile(profile: ArtisanProfile): ArtisanProfile {
  // Strip sensitive PII, internal verification info and KYC documents
  const {
    nationalIdCard: _a,
    identityDocuments: _b,
    documents: _c,
    rejectionReason: _d,
    email: _e,
    phone: _f,
    address: _g,
    ...publicProfile
  } = profile as ArtisanProfile & {
    nationalIdCard?: unknown;
    identityDocuments?: unknown;
    documents?: unknown;
    rejectionReason?: unknown;
    email?: unknown;
    phone?: unknown;
    address?: unknown;
  };
  void _a; void _b; void _c; void _d; void _e; void _f; void _g;
  return publicProfile as ArtisanProfile;
}

export class ArtisanPublicService {
  static async listApprovedArtisans(filters: {
    tradeId?: string;
    wilaya?: string;
    commune?: string;
    search?: string;
    isAvailable?: boolean;
    limit?: number;
  }): Promise<ArtisanProfile[]> {
    if (!db) return [];

    try {
      let query: FirebaseFirestore.Query = db
        .collection(ARTISANS_COLLECTION)
        .where("status", "==", "approved");

      if (filters.tradeId) {
        query = query.where("tradeId", "==", filters.tradeId);
      }

      if (filters.wilaya) {
        query = query.where("wilaya", "==", filters.wilaya);
      }

      if (filters.commune) {
        query = query.where("commune", "==", filters.commune);
      }

      if (filters.isAvailable !== undefined) {
        query = query.where("isAvailable", "==", filters.isAvailable);
      }

      const limit = Math.min(filters.limit || 50, 100);
      query = query.limit(limit);

      const snapshot = await query.get();
      let results: ArtisanProfile[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanProfile, "id">),
      }));

      if (filters.search && filters.search.trim().length > 0) {
        const term = filters.search.toLowerCase().trim();
        results = results.filter(
          (a) =>
            a.fullName.toLowerCase().includes(term) ||
            (a.professionalName && a.professionalName.toLowerCase().includes(term)) ||
            a.tradeName.toLowerCase().includes(term) ||
            a.bio.toLowerCase().includes(term) ||
            a.specialties.some((s) => s.toLowerCase().includes(term)) ||
            a.commune.toLowerCase().includes(term) ||
            a.wilaya.toLowerCase().includes(term)
        );
      }

      return results.map(sanitizePublicProfile);
    } catch (error) {
      safeLogger.error("[ArtisanPublicService] listApprovedArtisans error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async getArtisanById(id: string, incrementView = true): Promise<ArtisanProfile | null> {
    if (!db) return null;

    try {
      const docRef = db.collection(ARTISANS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) return null;

      const profile = { id: doc.id, ...(doc.data() as Omit<ArtisanProfile, "id">) };

      if (profile.status !== "approved") {
        return null;
      }

      if (incrementView) {
        docRef.update({ viewsCount: (profile.viewsCount || 0) + 1 }).catch((err) => {
          safeLogger.warn("[ArtisanPublicService] Failed to increment viewsCount asynchronously", {
            artisanId: id,
            error: err instanceof Error ? err.message : String(err)
          });
        });
      }

      return sanitizePublicProfile(profile);
    } catch (error) {
      safeLogger.error("[ArtisanPublicService] getArtisanById error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  static async getTrades(): Promise<ArtisanTrade[]> {
    if (!db) return DEFAULT_ARTISAN_TRADES;

    try {
      const snapshot = await db.collection(ARTISAN_TRADES_COLLECTION).get();
      if (snapshot.empty) {
        return DEFAULT_ARTISAN_TRADES;
      }

      const trades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanTrade, "id">),
      }));

      return trades.filter((t) => t.active !== false);
    } catch (error) {
      safeLogger.warn("[ArtisanPublicService] getTrades error, falling back to defaults", {
        error: error instanceof Error ? error.message : String(error),
      });
      return DEFAULT_ARTISAN_TRADES;
    }
  }
}
