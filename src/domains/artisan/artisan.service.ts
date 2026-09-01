import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import {
  ArtisanProfile,
  ArtisanStatus,
  ArtisanTrade,
  ArtisanService,
  ArtisanPortfolioItem,
  ArtisanQuoteRequest,
  ArtisanReview,
  ArtisanAdminAuditLog,
  ArtisanStatsSummary,
  ArtisanApplicationPayload,
} from "../../types/artisan";
import { DEFAULT_ARTISAN_TRADES } from "../../data/artisanTrades";

const ARTISANS_COLLECTION = "artisan_profiles";
const ARTISAN_TRADES_COLLECTION = "artisan_trades";
const QUOTE_REQUESTS_COLLECTION = "artisan_quote_requests";
const REVIEWS_COLLECTION = "artisan_reviews";
const AUDIT_LOGS_COLLECTION = "artisan_audit_logs";

export class ArtisanServiceLayer {
  // ==========================================
  // PUBLIC QUERIES
  // ==========================================

  /**
   * List approved artisans with optional filtering
   */
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

      // In-memory search filter if search term provided
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

      return results;
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] listApprovedArtisans error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get single artisan public profile by ID and increment view count
   */
  static async getArtisanById(id: string, incrementView = true): Promise<ArtisanProfile | null> {
    if (!db) return null;

    try {
      const docRef = db.collection(ARTISANS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) return null;

      const profile = { id: doc.id, ...(doc.data() as Omit<ArtisanProfile, "id">) };

      if (incrementView && profile.status === "approved") {
        docRef.update({ viewsCount: (profile.viewsCount || 0) + 1 }).catch(() => {});
      }

      return profile;
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] getArtisanById error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Get all active Trades / Categories
   */
  static async getTrades(): Promise<ArtisanTrade[]> {
    if (!db) return DEFAULT_ARTISAN_TRADES;

    try {
      const snapshot = await db.collection(ARTISAN_TRADES_COLLECTION).get();
      if (snapshot.empty) {
        // Return default configured trades
        return DEFAULT_ARTISAN_TRADES;
      }

      const trades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanTrade, "id">),
      }));

      return trades.filter((t) => t.active !== false);
    } catch (error) {
      safeLogger.warn("[ArtisanServiceLayer] getTrades error, falling back to defaults", {
        error: error instanceof Error ? error.message : String(error),
      });
      return DEFAULT_ARTISAN_TRADES;
    }
  }

  /**
   * Get reviews for an artisan
   */
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
      safeLogger.error("[ArtisanServiceLayer] getArtisanReviews error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  // ==========================================
  // AUTHENTICATED ARTISAN OPERATIONS
  // ==========================================

  /**
   * Submit or update an Artisan Application ("Devenir artisan")
   */
  static async applyArtisan(
    userId: string,
    userEmail: string,
    payload: ArtisanApplicationPayload
  ): Promise<{ success: boolean; profile?: ArtisanProfile; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const existingQuery = await db
        .collection(ARTISANS_COLLECTION)
        .where("userId", "==", userId)
        .limit(1)
        .get();

      const now = new Date().toISOString();

      if (!existingQuery.empty) {
        const existingDoc = existingQuery.docs[0];
        const existingData = existingDoc.data() as ArtisanProfile;

        // If previously rejected or pending, allow re-submitting for review
        const updatedStatus: ArtisanStatus =
          existingData.status === "approved" ? "approved" : "under_review";

        const updateData: Partial<ArtisanProfile> = {
          fullName: payload.fullName.trim(),
          professionalName: payload.professionalName?.trim() || "",
          phone: payload.phone.trim(),
          whatsapp: payload.whatsapp?.trim() || "",
          bio: payload.bio.trim(),
          tradeId: payload.tradeId,
          tradeName: payload.tradeName,
          specialties: payload.specialties || [],
          yearsOfExperience: Number(payload.yearsOfExperience) || 1,
          wilaya: payload.wilaya,
          wilayaCode: payload.wilayaCode,
          commune: payload.commune,
          serviceArea: payload.serviceArea || [],
          address: payload.address || "",
          documents: payload.documents?.map((d) => ({
            name: d.name,
            type: d.type,
            url: d.url,
            uploadedAt: now,
            verified: false,
          })) || existingData.documents || [],
          status: updatedStatus,
          statusReason: "",
          updatedAt: now,
        };

        await existingDoc.ref.update(updateData);

        const updatedProfile: ArtisanProfile = {
          ...existingData,
          ...updateData,
          id: existingDoc.id,
        };

        return { success: true, profile: updatedProfile };
      }

      // Create new application
      const newProfile: Omit<ArtisanProfile, "id"> = {
        userId,
        email: userEmail,
        fullName: payload.fullName.trim(),
        professionalName: payload.professionalName?.trim() || "",
        phone: payload.phone.trim(),
        whatsapp: payload.whatsapp?.trim() || "",
        bio: payload.bio.trim(),
        tradeId: payload.tradeId,
        tradeName: payload.tradeName,
        specialties: payload.specialties || [],
        services: [],
        portfolio: [],
        yearsOfExperience: Number(payload.yearsOfExperience) || 1,
        wilaya: payload.wilaya,
        wilayaCode: payload.wilayaCode,
        commune: payload.commune,
        serviceArea: payload.serviceArea || [payload.commune],
        address: payload.address || "",
        isAvailable: true,
        status: "pending",
        rating: 5.0,
        reviewCount: 0,
        viewsCount: 0,
        quoteRequestsCount: 0,
        documents: payload.documents?.map((d) => ({
          name: d.name,
          type: d.type,
          url: d.url,
          uploadedAt: now,
          verified: false,
        })) || [],
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection(ARTISANS_COLLECTION).add(newProfile);
      return { success: true, profile: { id: docRef.id, ...newProfile } };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] applyArtisan error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Échec lors de la création de la demande",
      };
    }
  }

  /**
   * Fetch artisan profile for the connected user
   */
  static async getMyArtisanProfile(userId: string): Promise<ArtisanProfile | null> {
    if (!db) return null;

    try {
      const snapshot = await db
        .collection(ARTISANS_COLLECTION)
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...(doc.data() as Omit<ArtisanProfile, "id">) };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] getMyArtisanProfile error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Alias for getMyArtisanProfile
   */
  static async getArtisanByUserId(userId: string): Promise<ArtisanProfile | null> {
    return this.getMyArtisanProfile(userId);
  }

  /**
   * Alias for updating artisan profile by profile ID & userId
   */
  static async updateArtisanProfile(
    _profileId: string,
    userId: string,
    updates: Partial<ArtisanProfile>
  ): Promise<{ success: boolean; profile?: ArtisanProfile; error?: string }> {
    return this.updateMyProfile(userId, updates);
  }

  /**
   * Update own artisan profile
   */
  static async updateMyProfile(
    userId: string,
    updates: Partial<ArtisanProfile>
  ): Promise<{ success: boolean; profile?: ArtisanProfile; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const snapshot = await db
        .collection(ARTISANS_COLLECTION)
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { success: false, error: "Profil artisan introuvable" };
      }

      const doc = snapshot.docs[0];
      const existing = doc.data() as ArtisanProfile;

      // Prevent unauthorized status or metric modifications by the artisan
      const sanitizedUpdates: Partial<ArtisanProfile> = {
        fullName: updates.fullName !== undefined ? updates.fullName.trim() : existing.fullName,
        professionalName: updates.professionalName !== undefined ? updates.professionalName.trim() : existing.professionalName,
        phone: updates.phone !== undefined ? updates.phone.trim() : existing.phone,
        whatsapp: updates.whatsapp !== undefined ? updates.whatsapp.trim() : existing.whatsapp,
        avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : existing.avatarUrl,
        companyLogoUrl: updates.companyLogoUrl !== undefined ? updates.companyLogoUrl : existing.companyLogoUrl,
        bio: updates.bio !== undefined ? updates.bio.trim() : existing.bio,
        specialties: Array.isArray(updates.specialties) ? updates.specialties : existing.specialties,
        yearsOfExperience: updates.yearsOfExperience !== undefined ? Number(updates.yearsOfExperience) : existing.yearsOfExperience,
        wilaya: updates.wilaya || existing.wilaya,
        wilayaCode: updates.wilayaCode || existing.wilayaCode,
        commune: updates.commune || existing.commune,
        serviceArea: Array.isArray(updates.serviceArea) ? updates.serviceArea : existing.serviceArea,
        address: updates.address !== undefined ? updates.address : existing.address,
        isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : existing.isAvailable,
        updatedAt: new Date().toISOString(),
      };

      await doc.ref.update(sanitizedUpdates);

      return {
        success: true,
        profile: { ...existing, ...sanitizedUpdates, id: doc.id },
      };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] updateMyProfile error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Échec de la mise à jour du profil" };
    }
  }

  // ==========================================
  // SERVICES CRUD (ARTISAN)
  // ==========================================

  static async addService(
    userId: string,
    serviceData: Omit<ArtisanService, "id" | "artisanId" | "createdAt">
  ): Promise<{ success: boolean; service?: ArtisanService; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const profile = await this.getMyArtisanProfile(userId);
      if (!profile) return { success: false, error: "Profil artisan introuvable" };

      const newService: ArtisanService = {
        id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        artisanId: profile.id,
        title: serviceData.title.trim(),
        categoryId: serviceData.categoryId || profile.tradeId,
        description: serviceData.description.trim(),
        priceStartingFrom: serviceData.priceStartingFrom ? Number(serviceData.priceStartingFrom) : undefined,
        priceUnit: serviceData.priceUnit || "prestation",
        estimatedDuration: serviceData.estimatedDuration || "",
        isActive: serviceData.isActive !== false,
        createdAt: new Date().toISOString(),
      };

      const updatedServices = [...(profile.services || []), newService];
      await db.collection(ARTISANS_COLLECTION).doc(profile.id).update({
        services: updatedServices,
        updatedAt: new Date().toISOString(),
      });

      return { success: true, service: newService };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] addService error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible d'ajouter le service" };
    }
  }

  static async updateService(
    userId: string,
    serviceId: string,
    serviceData: Partial<ArtisanService>
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const profile = await this.getMyArtisanProfile(userId);
      if (!profile) return { success: false, error: "Profil artisan introuvable" };

      const services = profile.services || [];
      const index = services.findIndex((s) => s.id === serviceId);
      if (index === -1) return { success: false, error: "Service introuvable" };

      services[index] = {
        ...services[index],
        ...serviceData,
        id: serviceId,
        artisanId: profile.id,
      };

      await db.collection(ARTISANS_COLLECTION).doc(profile.id).update({
        services,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] updateService error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de modifier le service" };
    }
  }

  static async deleteService(
    userId: string,
    serviceId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const profile = await this.getMyArtisanProfile(userId);
      if (!profile) return { success: false, error: "Profil artisan introuvable" };

      const updatedServices = (profile.services || []).filter((s) => s.id !== serviceId);
      await db.collection(ARTISANS_COLLECTION).doc(profile.id).update({
        services: updatedServices,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] deleteService error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de supprimer le service" };
    }
  }

  // ==========================================
  // PORTFOLIO CRUD (ARTISAN)
  // ==========================================

  static async addPortfolioItem(
    userId: string,
    itemData: Omit<ArtisanPortfolioItem, "id">
  ): Promise<{ success: boolean; item?: ArtisanPortfolioItem; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const profile = await this.getMyArtisanProfile(userId);
      if (!profile) return { success: false, error: "Profil artisan introuvable" };

      const newItem: ArtisanPortfolioItem = {
        id: `port_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: itemData.title.trim(),
        description: itemData.description?.trim() || "",
        imageUrl: itemData.imageUrl.trim(),
        category: itemData.category || profile.tradeName,
        date: itemData.date || new Date().toISOString().split("T")[0],
      };

      const updatedPortfolio = [...(profile.portfolio || []), newItem];
      await db.collection(ARTISANS_COLLECTION).doc(profile.id).update({
        portfolio: updatedPortfolio,
        updatedAt: new Date().toISOString(),
      });

      return { success: true, item: newItem };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] addPortfolioItem error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible d'ajouter la réalisation" };
    }
  }

  static async deletePortfolioItem(
    userId: string,
    itemId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const profile = await this.getMyArtisanProfile(userId);
      if (!profile) return { success: false, error: "Profil artisan introuvable" };

      const updatedPortfolio = (profile.portfolio || []).filter((item) => item.id !== itemId);
      await db.collection(ARTISANS_COLLECTION).doc(profile.id).update({
        portfolio: updatedPortfolio,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] deletePortfolioItem error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de supprimer la réalisation" };
    }
  }

  // ==========================================
  // QUOTE & SERVICE REQUESTS
  // ==========================================

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
      const artisan = await this.getArtisanById(payload.artisanId, false);
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

      // Increment artisan quote requests count
      db.collection(ARTISANS_COLLECTION)
        .doc(payload.artisanId)
        .update({ quoteRequestsCount: (artisan.quoteRequestsCount || 0) + 1 })
        .catch(() => {});

      return { success: true, request: { id: docRef.id, ...newRequest } };
    } catch (error) {
      safeLogger.error("[ArtisanServiceLayer] submitQuoteRequest error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible d'envoyer la demande" };
    }
  }

  static async getArtisanQuoteRequests(userId: string): Promise<ArtisanQuoteRequest[]> {
    if (!db) return [];

    try {
      const profile = await this.getMyArtisanProfile(userId);
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
      safeLogger.error("[ArtisanServiceLayer] getArtisanQuoteRequests error", {
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
      safeLogger.error("[ArtisanServiceLayer] getClientQuoteRequests error", {
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
      const profile = await this.getMyArtisanProfile(userId);
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
      safeLogger.error("[ArtisanServiceLayer] updateQuoteRequestStatus error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de mettre à jour le statut" };
    }
  }

  // ==========================================
  // REVIEWS
  // ==========================================

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

      const artisan = await this.getArtisanById(artisanId, false);
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

      // Recalculate average rating
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
      safeLogger.error("[ArtisanServiceLayer] addReview error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible d'ajouter l'avis" };
    }
  }

  // ==========================================
  // ADMIN OPERATIONS
  // ==========================================

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
      safeLogger.error("[ArtisanServiceLayer] adminListArtisans error", {
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

      // Create Admin Audit Log
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
      safeLogger.error("[ArtisanServiceLayer] adminUpdateStatus error", {
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

      // Audit log
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
      safeLogger.error("[ArtisanServiceLayer] adminUpsertTrade error", {
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
      safeLogger.error("[ArtisanServiceLayer] adminDeleteTrade error", {
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
      safeLogger.error("[ArtisanServiceLayer] adminGetAuditLogs error", {
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
      safeLogger.error("[ArtisanServiceLayer] adminGetStats error", {
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

  /**
   * Helper aliases for admin router
   */
  static async listAllArtisansForAdmin(filters: {
    status?: ArtisanStatus | "all";
    tradeId?: string;
    wilaya?: string;
    search?: string;
    limit?: number;
  }): Promise<ArtisanProfile[]> {
    const res = await this.adminListArtisans(filters);
    return res.artisans;
  }

  static async updateArtisanStatus(
    artisanId: string,
    status: ArtisanStatus,
    adminUid: string,
    adminEmail: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.adminUpdateStatus(adminUid, adminEmail, artisanId, status, reason);
  }

  static async getAdminStats(): Promise<ArtisanStatsSummary> {
    return this.adminGetStats();
  }

  static async saveTrade(
    trade: ArtisanTrade
  ): Promise<{ success: boolean; trade?: ArtisanTrade; error?: string }> {
    return this.adminUpsertTrade("admin", "admin@olmart.dz", trade);
  }

  static async deleteTrade(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.adminDeleteTrade("admin", "admin@olmart.dz", id);
  }

  static async getAuditLogs(): Promise<ArtisanAdminAuditLog[]> {
    return this.adminGetAuditLogs();
  }
}
