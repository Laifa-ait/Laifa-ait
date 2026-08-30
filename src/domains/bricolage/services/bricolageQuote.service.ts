import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { BRICOLAGE_CATEGORIES } from "../../../data/bricolageData";
import { QuoteRequestPayload } from "../../../types/bricolage";

export class BricolageQuoteService {
  static async createQuoteRequest(payload: QuoteRequestPayload, customerId: string | null): Promise<{ requestId: string; estimatedPriceDZD: { min: number; max: number }; message: string }> {
    const categoryDoc = BRICOLAGE_CATEGORIES.find(c => c.id === payload.serviceCategoryId) || BRICOLAGE_CATEGORIES[0];
    const requestId = `QUOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const cleanPayload: QuoteRequestPayload = {
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      serviceCategoryId: payload.serviceCategoryId,
      serviceName: payload.serviceName || (categoryDoc?.name?.fr || ""),
      wilaya: payload.wilaya,
      commune: payload.commune,
      description: payload.description,
      urgency: payload.urgency || "normal",
      projectPhotos: payload.projectPhotos,
    };

    if (db) {
      const quoteRef = db.collection("bricolage_quote_requests").doc(requestId);
      const categoryRef = db.collection("bricolage_categories").doc(payload.serviceCategoryId);

      await db.runTransaction(async (transaction) => {
        const catSnap = await transaction.get(categoryRef);
        if (catSnap.exists) {
          const count = catSnap.data()?.requestCount || 0;
          transaction.update(categoryRef, { requestCount: count + 1 });
        }

        const docData: Record<string, unknown> = {
          id: requestId,
          ...cleanPayload,
          status: "pending",
          estimatedPriceDZD: categoryDoc.avgPriceRangeDZD,
          createdAt: new Date().toISOString()
        };

        if (customerId) {
          docData.customerId = customerId;
        }

        transaction.set(quoteRef, docData);
      });
    }

    safeLogger.info("Created Bricolage Quote Request", { requestId, customerId: customerId || "guest" });

    return {
      requestId,
      estimatedPriceDZD: categoryDoc.avgPriceRangeDZD,
      message: "Votre demande de devis a été transmise aux artisans certifiés Olma dans votre Wilaya !"
    };
  }

  static async submitOffer(
    artisanUid: string,
    requestId: string,
    priceDZD: number,
    estimatedDuration?: string,
    notes?: string,
    userRole?: string,
    userEmail?: string
  ): Promise<string> {
    if (!db) {
      throw new Error("Base de données indisponible");
    }

    const artisanDoc = await db.collection("bricolage_artisans").doc(artisanUid).get();
    const userDoc = await db.collection("users").doc(artisanUid).get();

    const artisanData = artisanDoc.exists ? artisanDoc.data() : null;
    const userData = userDoc.exists ? userDoc.data() : null;

    const role = userRole || userData?.role;
    const artisanProfile = artisanData || userData?.artisanProfile;

    if (role !== "artisan" && role !== "admin" && !artisanProfile) {
      throw { status: 403, message: "Accès refusé. Vous devez être inscrit en tant qu'Artisan Professionnel pour soumettre des devis." };
    }

    const vStatus = artisanProfile?.verificationStatus;
    if (vStatus === "rejected" || vStatus === "suspended") {
      throw { status: 403, message: "Votre compte artisan est suspendu ou rejeté. Impossible d'envoyer des devis." };
    }

    const verifiedArtisanName = artisanProfile?.fullName || userData?.displayName || userEmail?.split("@")[0] || "Artisan Certifié";
    const verifiedArtisanPhone = artisanProfile?.phone || userData?.phone || "";
    const verifiedArtisanRating = artisanProfile?.rating !== undefined ? Number(artisanProfile.rating) : null;

    const offerId = `OFFER-${Date.now()}`;
    const requestRef = db.collection("bricolage_quote_requests").doc(requestId);

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists) {
        throw { status: 404, message: "Demande de devis introuvable." };
      }

      const currentOffers = snap.data()?.offers || [];
      const newOffer = {
        id: offerId,
        artisanId: artisanUid,
        artisanName: verifiedArtisanName,
        artisanPhone: verifiedArtisanPhone,
        artisanRating: verifiedArtisanRating,
        priceDZD: Number(priceDZD),
        estimatedDuration: typeof estimatedDuration === "string" && estimatedDuration.trim() ? estimatedDuration.trim() : "2 Heures",
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : "Prestation professionnelle",
        createdAt: new Date().toISOString(),
        status: "pending"
      };

      transaction.update(requestRef, {
        status: "quoted",
        offers: [...currentOffers, newOffer]
      });
    });

    safeLogger.info("Artisan submitted offer", { artisanId: artisanUid, offerId, requestId });
    return offerId;
  }

  static async acceptOffer(requestId: string, offerId: string, customerUid: string): Promise<Record<string, unknown>> {
    if (!db) {
      throw { status: 500, message: "Service de base de données indisponible." };
    }

    const requestRef = db.collection("bricolage_quote_requests").doc(requestId);
    let acceptedOfferResult: Record<string, unknown> | null = null;

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists) {
        throw { status: 404, message: "Demande de devis introuvable." };
      }

      const requestData = snap.data();
      if (!requestData) {
        throw { status: 404, message: "Données de la demande introuvables." };
      }

      if (requestData.customerId !== customerUid) {
        throw { status: 403, message: "Accès refusé. Vous n'êtes pas le propriétaire de cette demande de devis." };
      }

      const currentStatus = requestData.status || "pending";
      if (["accepted", "in_progress", "completed", "cancelled"].includes(currentStatus)) {
        throw { status: 409, message: "Un devis a déjà été accepté pour cette demande." };
      }

      if (!["pending", "quoted", "matched"].includes(currentStatus)) {
        throw { status: 409, message: "La demande ne peut plus être modifiée dans son statut actuel." };
      }

      const existingOffers: Array<Record<string, unknown>> = Array.isArray(requestData.offers)
        ? requestData.offers
        : [];

      const targetOffer = existingOffers.find((o) => o && typeof o === "object" && o.id === offerId);

      if (!targetOffer) {
        throw { status: 404, message: "Le devis spécifié est introuvable pour cette demande." };
      }

      const updatedOffers = existingOffers.map((o) => {
        if (o && typeof o === "object" && o.id === offerId) {
          return { ...o, status: "accepted" };
        }
        return { ...o, status: "declined" };
      });

      const acceptedOfferData = {
        ...targetOffer,
        status: "accepted"
      };

      acceptedOfferResult = acceptedOfferData;

      transaction.update(requestRef, {
        status: "accepted",
        acceptedOffer: acceptedOfferData,
        offers: updatedOffers,
        updatedAt: new Date().toISOString()
      });
    });

    safeLogger.info("Customer accepted offer", { customerId: customerUid, offerId, requestId });
    return acceptedOfferResult || {};
  }
}
