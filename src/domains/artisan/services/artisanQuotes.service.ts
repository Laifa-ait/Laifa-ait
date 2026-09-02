import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { ArtisanQuoteRequest } from "../../../types/artisan";
import { ArtisanPublicService } from "./artisanPublic.service";
import { ArtisanProfileService } from "./artisanProfile.service";

const ARTISANS_COLLECTION = "artisan_profiles";
const QUOTE_REQUESTS_COLLECTION = "artisan_quote_requests";

export class ArtisanQuotesService {
  static async submitQuoteRequest(
    clientId: string,
    clientEmail: string,
    payload: {
      artisanId: string;
      clientName: string;
      clientPhone: string;
      tradeId: string;
      serviceTitle?: string;
      title: string;
      description: string;
      wilaya: string;
      commune: string;
      address?: string;
      urgency: "urgent" | "standard" | "flexible";
      preferredDate?: string;
      estimatedBudget?: number;
    }
  ): Promise<{ success: boolean; request?: ArtisanQuoteRequest; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const artisan = await ArtisanPublicService.getArtisanById(payload.artisanId, false);
      if (!artisan) {
        return { success: false, error: "Artisan introuvable" };
      }

      const now = new Date().toISOString();
      const newRequest: Omit<ArtisanQuoteRequest, "id"> = {
        artisanId: payload.artisanId,
        artisanName: artisan.fullName || artisan.professionalName || "Artisan Olmart",
        clientId,
        clientName: payload.clientName.trim(),
        clientPhone: payload.clientPhone.trim(),
        clientEmail: clientEmail || "",
        tradeId: payload.tradeId || artisan.tradeId,
        tradeName: artisan.tradeName,
        serviceTitle: payload.serviceTitle || "",
        title: payload.title.trim(),
        description: payload.description.trim(),
        wilaya: payload.wilaya,
        commune: payload.commune,
        address: payload.address || "",
        urgency: payload.urgency || "standard",
        preferredDate: payload.preferredDate || "",
        status: "pending",
        estimatedBudget: payload.estimatedBudget ? Number(payload.estimatedBudget) : undefined,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection(QUOTE_REQUESTS_COLLECTION).add(newRequest);

      db.collection(ARTISANS_COLLECTION)
        .doc(payload.artisanId)
        .update({ quoteRequestsCount: (artisan.quoteRequestsCount || 0) + 1 })
        .catch((err) => {
          safeLogger.warn("[ArtisanQuotesService] Failed to increment quoteRequestsCount asynchronously", {
            artisanId: payload.artisanId,
            error: err instanceof Error ? err.message : String(err)
          });
        });

      return { success: true, request: { id: docRef.id, ...newRequest } };
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] submitQuoteRequest error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible d'envoyer la demande" };
    }
  }

  static async getArtisanQuoteRequests(userId: string): Promise<ArtisanQuoteRequest[]> {
    if (!db) return [];

    try {
      const profile = await ArtisanProfileService.getMyArtisanProfile(userId);
      if (!profile) return [];

      const snapshot = await db
        .collection(QUOTE_REQUESTS_COLLECTION)
        .where("artisanId", "==", profile.id)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanQuoteRequest, "id">),
      }));
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] getArtisanQuoteRequests error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async getClientQuoteRequests(clientId: string): Promise<ArtisanQuoteRequest[]> {
    if (!db) return [];

    try {
      const snapshot = await db
        .collection(QUOTE_REQUESTS_COLLECTION)
        .where("clientId", "==", clientId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanQuoteRequest, "id">),
      }));
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] getClientQuoteRequests error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async updateQuoteRequestStatus(
    userId: string,
    requestId: string,
    status: ArtisanQuoteRequest["status"],
    artisanResponse?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const profile = await ArtisanProfileService.getMyArtisanProfile(userId);
      if (!profile) return { success: false, error: "Profil artisan introuvable" };

      const docRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(requestId);
      const doc = await docRef.get();
      if (!doc.exists) return { success: false, error: "Demande introuvable" };

      const request = doc.data() as ArtisanQuoteRequest;
      if (request.artisanId !== profile.id) {
        return { success: false, error: "Accès refusé. Vous n'êtes pas le destinataire de cette demande." };
      }

      await docRef.update({
        status,
        ...(artisanResponse !== undefined ? { artisanResponse } : {}),
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] updateQuoteRequestStatus error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de mettre à jour le statut" };
    }
  }
}
