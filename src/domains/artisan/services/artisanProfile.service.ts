import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import {
  ArtisanProfile,
  ArtisanStatus,
  ArtisanService,
  ArtisanPortfolioItem,
  ArtisanApplicationPayload,
} from "../../../types/artisan";

const ARTISANS_COLLECTION = "artisan_profiles";

export class ArtisanProfileService {
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
      safeLogger.error("[ArtisanProfileService] applyArtisan error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Échec lors de la création de la demande",
      };
    }
  }

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
      safeLogger.error("[ArtisanProfileService] getMyArtisanProfile error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

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
      safeLogger.error("[ArtisanProfileService] updateMyProfile error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Échec de la mise à jour du profil" };
    }
  }

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
      safeLogger.error("[ArtisanProfileService] addService error", {
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
      safeLogger.error("[ArtisanProfileService] updateService error", {
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
      safeLogger.error("[ArtisanProfileService] deleteService error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de supprimer le service" };
    }
  }

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
      safeLogger.error("[ArtisanProfileService] addPortfolioItem error", {
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
      safeLogger.error("[ArtisanProfileService] deletePortfolioItem error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de supprimer la réalisation" };
    }
  }
}
