import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import {
  ArtisanJobBroadcast,
  ArtisanJobBroadcastPayload,
} from "../../../types/artisan";

const BROADCASTS_COLLECTION = "artisan_job_broadcasts";

export class ArtisanBroadcastsService {
  /**
   * Client creates a public job broadcast / recherche d'artisan
   */
  static async createBroadcast(
    clientId: string,
    payload: ArtisanJobBroadcastPayload
  ): Promise<{ success: boolean; broadcast?: ArtisanJobBroadcast; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const now = new Date().toISOString();
      const newBroadcast: Omit<ArtisanJobBroadcast, "id"> = {
        clientId: clientId || "guest",
        clientName: payload.clientName.trim(),
        clientPhone: payload.clientPhone.trim(),
        clientEmail: payload.clientEmail?.trim() || "",
        tradeId: payload.tradeId.trim(),
        tradeName: payload.tradeName.trim(),
        categoryPreset: payload.categoryPreset?.trim() || "",
        title: payload.title.trim(),
        description: payload.description.trim(),
        wilaya: payload.wilaya.trim(),
        wilayaCode: payload.wilayaCode?.trim() || "",
        commune: payload.commune.trim(),
        address: payload.address?.trim() || "",
        urgency: payload.urgency || "standard",
        estimatedBudget: payload.estimatedBudget ? Number(payload.estimatedBudget) : undefined,
        status: "open",
        repliesCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection(BROADCASTS_COLLECTION).add(newBroadcast);

      safeLogger.info("[ArtisanBroadcastsService] Job broadcast published successfully", {
        broadcastId: docRef.id,
        tradeId: payload.tradeId,
        wilaya: payload.wilaya,
      });

      return {
        success: true,
        broadcast: { id: docRef.id, ...newBroadcast },
      };
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] createBroadcast error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de publier l'annonce de recherche d'artisan" };
    }
  }

  /**
   * List open job broadcasts for artisans or public
   */
  static async listBroadcasts(filters: {
    tradeId?: string;
    wilaya?: string;
    urgency?: string;
    limit?: number;
  }): Promise<ArtisanJobBroadcast[]> {
    if (!db) return [];

    try {
      let query = db.collection(BROADCASTS_COLLECTION).where("status", "==", "open");

      if (filters.tradeId && filters.tradeId !== "all") {
        query = query.where("tradeId", "==", filters.tradeId);
      }

      if (filters.wilaya) {
        query = query.where("wilaya", "==", filters.wilaya);
      }

      if (filters.urgency) {
        query = query.where("urgency", "==", filters.urgency);
      }

      const snapshot = await query
        .orderBy("createdAt", "desc")
        .limit(filters.limit || 50)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanJobBroadcast, "id">),
      }));
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] listBroadcasts error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get client's own broadcasts
   */
  static async getClientBroadcasts(clientId: string): Promise<ArtisanJobBroadcast[]> {
    if (!db || !clientId) return [];

    try {
      const snapshot = await db
        .collection(BROADCASTS_COLLECTION)
        .where("clientId", "==", clientId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanJobBroadcast, "id">),
      }));
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] getClientBroadcasts error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Update broadcast status (e.g. mark fulfilled, contacted, or increment replies)
   */
  static async updateStatus(
    broadcastId: string,
    status: ArtisanJobBroadcast["status"]
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      await db.collection(BROADCASTS_COLLECTION).doc(broadcastId).update({
        status,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] updateStatus error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de modifier le statut de l'annonce" };
    }
  }
}
