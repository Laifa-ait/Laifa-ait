import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { ArtisanReview } from "../../../types/artisan";
import { ArtisanPublicService } from "./artisanPublic.service";

const ARTISANS_COLLECTION = "artisan_profiles";
const REVIEWS_COLLECTION = "artisan_reviews";

export class ArtisanReviewsService {
  static async getArtisanReviews(artisanId: string): Promise<ArtisanReview[]> {
    if (!db) return [];

    try {
      const snapshot = await db
        .collection(REVIEWS_COLLECTION)
        .where("artisanId", "==", artisanId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanReview, "id">),
      }));
    } catch (error) {
      safeLogger.error("[ArtisanReviewsService] getArtisanReviews error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async addReview(
    reviewOrClientId:
      | string
      | {
          artisanId: string;
          userId: string;
          userName: string;
          rating: number;
          comment: string;
          serviceTitle?: string;
          wilaya?: string;
        },
    clientNameParam?: string,
    artisanIdParam?: string,
    ratingParam?: number,
    commentParam?: string,
    serviceTitleParam?: string,
    wilayaParam?: string
  ): Promise<{ success: boolean; review?: ArtisanReview; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      let clientId = "";
      let clientName = "Client Olmart";
      let artisanId = "";
      let rating = 5;
      let comment = "";
      let serviceTitle = "";
      let wilaya = "";

      if (typeof reviewOrClientId === "object" && reviewOrClientId !== null) {
        clientId = reviewOrClientId.userId;
        clientName = reviewOrClientId.userName || "Client Olmart";
        artisanId = reviewOrClientId.artisanId;
        rating = reviewOrClientId.rating;
        comment = reviewOrClientId.comment || "";
        serviceTitle = reviewOrClientId.serviceTitle || "";
        wilaya = reviewOrClientId.wilaya || "";
      } else {
        clientId = reviewOrClientId;
        clientName = clientNameParam || "Client Olmart";
        artisanId = artisanIdParam || "";
        rating = ratingParam || 5;
        comment = commentParam || "";
        serviceTitle = serviceTitleParam || "";
        wilaya = wilayaParam || "";
      }

      const artisan = await ArtisanPublicService.getArtisanById(artisanId, false);
      if (!artisan) return { success: false, error: "Artisan introuvable" };

      const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));
      const now = new Date().toISOString();
      const newReview: Omit<ArtisanReview, "id"> = {
        artisanId,
        clientId,
        clientName: clientName.trim() || "Client Olmart",
        rating: clampedRating,
        comment: comment.trim(),
        serviceTitle: serviceTitle || "",
        wilaya: wilaya || "",
        createdAt: now,
      };

      const docRef = await db.collection(REVIEWS_COLLECTION).add(newReview);

      const existingReviews = await this.getArtisanReviews(artisanId);
      const totalReviews = existingReviews.length + 1;
      const totalScore = existingReviews.reduce((sum, r) => sum + r.rating, 0) + clampedRating;
      const newAverage = Number((totalScore / totalReviews).toFixed(1));

      await db.collection(ARTISANS_COLLECTION).doc(artisanId).update({
        rating: newAverage,
        reviewCount: totalReviews,
        updatedAt: now,
      });

      return { success: true, review: { id: docRef.id, ...newReview } };
    } catch (error) {
      safeLogger.error("[ArtisanReviewsService] addReview error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible d'ajouter l'avis" };
    }
  }
}
