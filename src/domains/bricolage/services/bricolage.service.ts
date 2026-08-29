import { db, admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { BRICOLAGE_CATEGORIES, TOP_VERIFIED_ARTISANS } from "../../../data/bricolageData";
import { QuoteRequestPayload, ArtisanOpportunityDTO } from "../../../types/bricolage";

export interface ArtisanUpgradePayload {
  specialty?: string;
  wilaya?: string;
  commune?: string;
  phone?: string;
  fullName?: string;
  registryNumber?: string;
  yearsOfExperience?: number;
  isAvailable24_7?: boolean;
  identityDoc?: {
    type?: string;
    number?: string;
    fileName?: string;
    fileUrl?: string;
  };
  diplomaDoc?: {
    title?: string;
    institution?: string;
    fileName?: string;
    fileUrl?: string;
  };
  registryDoc?: {
    number?: string;
    camWilaya?: string;
    fileName?: string;
    fileUrl?: string;
  };
}

export interface ArtisanVerificationActionPayload {
  artisanId: string;
  action: "approve" | "reject";
  rejectionReason?: string;
  docType?: "identity" | "diploma" | "registry";
}

export class BricolageService {
  static async getCategories(): Promise<Array<Record<string, unknown>>> {
    if (!db) {
      return BRICOLAGE_CATEGORIES as unknown as Array<Record<string, unknown>>;
    }
    const snapshot = await db.collection("bricolage_categories").get();
    if (snapshot.empty) {
      return BRICOLAGE_CATEGORIES as unknown as Array<Record<string, unknown>>;
    }
    const categories: Array<Record<string, unknown>> = [];
    snapshot.forEach((doc) => categories.push(doc.data()));
    return categories;
  }

  static async getArtisans(wilaya?: string, specialty?: string): Promise<Array<Record<string, unknown>>> {
    if (!db) {
      let filtered = TOP_VERIFIED_ARTISANS;
      if (wilaya) {
        filtered = filtered.filter(a => a.wilaya.toLowerCase().includes(String(wilaya).toLowerCase()));
      }
      if (specialty && specialty !== "all") {
        filtered = filtered.filter(a => a.specialty.toLowerCase().includes(String(specialty).toLowerCase()));
      }
      return filtered as unknown as Array<Record<string, unknown>>;
    }
    let query: FirebaseFirestore.Query = db.collection("bricolage_artisans");
    if (wilaya) {
      query = query.where("wilaya", "==", wilaya);
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return TOP_VERIFIED_ARTISANS as unknown as Array<Record<string, unknown>>;
    }
    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach((doc) => list.push(doc.data()));
    return list;
  }

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

  static async getOpportunities(artisanUid: string, userRole?: string, wilaya?: string, category?: string): Promise<ArtisanOpportunityDTO[]> {
    let isAuthorizedArtisan = false;

    if (userRole === "admin") {
      isAuthorizedArtisan = true;
    } else if (db) {
      const artisanDoc = await db.collection("bricolage_artisans").doc(artisanUid).get();
      if (artisanDoc.exists) {
        const data = artisanDoc.data() || {};
        if (data.verificationStatus === "verified") {
          isAuthorizedArtisan = true;
        }
      }
    }

    if (!isAuthorizedArtisan) {
      throw { status: 403, message: "Accès refusé. Privilèges Artisan requis pour consulter les opportunités." };
    }

    if (!db) return [];

    let query: FirebaseFirestore.Query = db.collection("bricolage_quote_requests")
      .where("status", "in", ["pending", "quoted", "matched"]);

    if (wilaya && typeof wilaya === "string" && wilaya.trim() !== "") {
      query = query.where("wilaya", "==", wilaya.trim());
    }

    if (category && typeof category === "string" && category.trim() !== "" && category !== "all") {
      query = query.where("serviceCategoryId", "==", category.trim());
    }

    const snapshot = await query.limit(100).get();
    const opportunities: ArtisanOpportunityDTO[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      const offers: Array<Record<string, unknown>> = Array.isArray(data.offers) ? data.offers : [];

      const myOfferRaw = offers.find((o) => o.artisanId === artisanUid);
      const myOffer = myOfferRaw ? {
        id: String(myOfferRaw.id || ""),
        priceDZD: Number(myOfferRaw.priceDZD) || 0,
        estimatedDuration: String(myOfferRaw.estimatedDuration || ""),
        notes: String(myOfferRaw.notes || ""),
        createdAt: String(myOfferRaw.createdAt || ""),
        status: String(myOfferRaw.status || "pending")
      } : null;

      const locationLabel = data.commune ? `${data.commune}, ${data.wilaya || ""}` : (data.wilaya || "Algérie");
      const customerDisplayName = `Client Olmart (${locationLabel})`;

      const dto: ArtisanOpportunityDTO = {
        id: data.id || doc.id,
        serviceCategoryId: data.serviceCategoryId || "",
        serviceName: data.serviceName || "Prestation de Bricolage",
        wilaya: data.wilaya || "",
        commune: data.commune || "",
        urgency: data.urgency || "normal",
        description: data.description || "",
        projectPhotos: Array.isArray(data.projectPhotos) ? data.projectPhotos : [],
        preferredDate: data.preferredDate || "",
        estimatedPriceDZD: data.estimatedPriceDZD || { min: 0, max: 0 },
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || "pending",

        customerDisplayName,
        offersCount: offers.length,
        hasSubmittedOffer: Boolean(myOfferRaw),
        myOffer
      };

      opportunities.push(dto);
    });

    return opportunities;
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

  static async upgradeToArtisan(uid: string, userEmail: string, payload: ArtisanUpgradePayload): Promise<Record<string, unknown>> {
    const now = new Date().toISOString();

    const identityDoc = payload.identityDoc ? {
      id: `DOC-ID-${Date.now()}`,
      docType: payload.identityDoc.type || "cni",
      title: payload.identityDoc.type === "passport" ? "Passeport Algérien" : payload.identityDoc.type === "permis" ? "Permis de Conduire" : "Carte Nationale d'Identité (CNI)",
      docNumber: payload.identityDoc.number || "CNI-DZ-998822",
      fileName: payload.identityDoc.fileName || "Piece_Identite.pdf",
      fileUrl: payload.identityDoc.fileUrl || "",
      status: "pending",
      uploadedAt: now
    } : undefined;

    const diplomaDoc = payload.diplomaDoc ? {
      id: `DOC-DIP-${Date.now()}`,
      docType: "diploma",
      title: payload.diplomaDoc.title || "Diplôme / Attestation de Qualification",
      issuingInstitution: payload.diplomaDoc.institution || "Centre de Formation Professionnelle IFP",
      fileName: payload.diplomaDoc.fileName || "Diplome_Qualification.pdf",
      fileUrl: payload.diplomaDoc.fileUrl || "",
      status: "pending",
      uploadedAt: now
    } : undefined;

    const registryDoc = payload.registryDoc ? {
      id: `DOC-REG-${Date.now()}`,
      docType: "artisan_card",
      title: "Carte d'Artisan / Extrait du Registre de Commerce",
      docNumber: payload.registryDoc.number || payload.registryNumber || "CAM-16-2026",
      issuingInstitution: `Chambre des Métiers (CAM ${payload.registryDoc.camWilaya || payload.wilaya})`,
      fileName: payload.registryDoc.fileName || "Carte_Artisan_CAM.pdf",
      fileUrl: payload.registryDoc.fileUrl || "",
      status: "pending",
      uploadedAt: now
    } : undefined;

    const hasDocs = Boolean(identityDoc || diplomaDoc || registryDoc);
    const verificationStatus = hasDocs ? "pending_review" : "incomplete_docs";

    const verificationData = {
      status: verificationStatus,
      submittedAt: now,
      identityDoc,
      diplomaDoc,
      registryDoc
    };

    if (db) {
      const userRef = db.collection("users").doc(uid);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() : {};

      const fullName = payload.fullName || userData?.displayName || userEmail.split("@")[0] || "Artisan Olmart";

      const artisanProfile = {
        id: uid,
        fullName,
        specialty: payload.specialty,
        wilaya: payload.wilaya,
        commune: payload.commune || "Centre",
        phone: payload.phone,
        registryNumber: payload.registryNumber || `ART-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
        yearsOfExperience: Number(payload.yearsOfExperience) || 3,
        isAvailable24_7: Boolean(payload.isAvailable24_7),
        registeredAt: now,
        verifiedBadge: false,
        rating: null,
        verificationStatus,
        verificationData
      };

      await userRef.set({
        role: "artisan",
        artisanProfile,
        phone: payload.phone,
        wilaya: payload.wilaya,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await db.collection("bricolage_artisans").doc(uid).set(artisanProfile, { merge: true });
      await admin.auth().setCustomUserClaims(uid, { role: "artisan" });

      safeLogger.info("User registered as Artisan", { artisanId: uid, verificationStatus });

      return {
        profile: artisanProfile,
        message: hasDocs 
          ? "Demande d'inscription enregistrée ! Vos pièces d'identité et diplômes sont en cours d'examen par l'équipe de modération Olmart." 
          : "Profil artisan enregistré. Veuillez transmettre vos pièces justificatives (CNI, Carte CAM) pour obtenir le badge Vérifié."
      };
    }

    return {
      profile: {
        id: uid,
        fullName: payload.fullName || "Artisan Olmart",
        specialty: payload.specialty,
        wilaya: payload.wilaya,
        commune: payload.commune || "Centre",
        phone: payload.phone,
        registryNumber: payload.registryNumber || "ART-2026-16098",
        yearsOfExperience: Number(payload.yearsOfExperience) || 3,
        isAvailable24_7: Boolean(payload.isAvailable24_7),
        registeredAt: now,
        verifiedBadge: false,
        rating: null,
        verificationStatus,
        verificationData
      },
      message: "Compte mis à jour au statut Artisan Pro."
    };
  }

  static async getPendingArtisans(): Promise<Array<Record<string, unknown>>> {
    if (!db) return [];
    const snapshot = await db.collection("bricolage_artisans")
      .where("verificationStatus", "==", "pending_review")
      .get();

    const pendingArtisans: Array<Record<string, unknown>> = [];
    snapshot.forEach(doc => pendingArtisans.push(doc.data()));
    return pendingArtisans;
  }

  static async verifyArtisan(payload: ArtisanVerificationActionPayload): Promise<{ success: boolean; message: string }> {
    const { artisanId, action, rejectionReason, docType } = payload;
    if (!db) {
      return { success: true, message: "Statut de vérification mis à jour." };
    }

    const artisanRef = db.collection("bricolage_artisans").doc(artisanId);
    const userRef = db.collection("users").doc(artisanId);

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(artisanRef);
      if (!snap.exists) return;

      const data = snap.data() || {};
      const vData = data.verificationData || {};
      const now = new Date().toISOString();

      if (action === "approve") {
        if (vData.identityDoc) vData.identityDoc.status = "approved";
        if (vData.diplomaDoc) vData.diplomaDoc.status = "approved";
        if (vData.registryDoc) vData.registryDoc.status = "approved";

        vData.status = "verified";
        vData.reviewedAt = now;
        vData.reviewedByAdmin = "Equipe Olmart Moderation";

        const updatedProfile = {
          ...data,
          verifiedBadge: true,
          verificationStatus: "verified",
          verificationData: vData
        };

        transaction.set(artisanRef, updatedProfile, { merge: true });
        transaction.set(userRef, { artisanProfile: updatedProfile }, { merge: true });
      } else if (action === "reject") {
        if (docType === "identity" && vData.identityDoc) {
          vData.identityDoc.status = "rejected";
          vData.identityDoc.rejectionReason = rejectionReason || "Document illisible ou invalide.";
        } else if (docType === "diploma" && vData.diplomaDoc) {
          vData.diplomaDoc.status = "rejected";
          vData.diplomaDoc.rejectionReason = rejectionReason || "Attestation ou diplôme non reconnu.";
        } else if (docType === "registry" && vData.registryDoc) {
          vData.registryDoc.status = "rejected";
          vData.registryDoc.rejectionReason = rejectionReason || "N° de carte artisan CAM non valide.";
        } else {
          vData.status = "rejected";
          vData.adminNotes = rejectionReason || "Documents incomplets ou non conformes.";
        }

        vData.status = "rejected";
        vData.reviewedAt = now;

        const updatedProfile = {
          ...data,
          verifiedBadge: false,
          verificationStatus: "rejected",
          verificationData: vData
        };

        transaction.set(artisanRef, updatedProfile, { merge: true });
        transaction.set(userRef, { artisanProfile: updatedProfile }, { merge: true });
      }
    });

    safeLogger.info("Artisan verification updated", { artisanId, action });
    return {
      success: true,
      message: action === "approve" 
        ? "Artisan vérifié avec succès et Badge Certifié attribué !" 
        : "Statut de vérification mis à jour (Rejeté)."
    };
  }

  static async getReviews(): Promise<Array<Record<string, unknown>>> {
    const SAMPLE_REVIEWS = [
      {
        id: "rev-01",
        artisanName: "Mourad Benali",
        clientName: "Karim M.",
        wilaya: "Alger (Hydra)",
        serviceName: "Chauffe-eau & Chaudière",
        rating: 5,
        comment: "Intervention très rapide pour une fuite de gaz sur la chaudière. Travail propre, professionnel et prix très raisonnable !",
        date: "Hier"
      },
      {
        id: "rev-02",
        artisanName: "Kamel Bricolage",
        clientName: "Yassine B.",
        wilaya: "Blida",
        serviceName: "Dépannage Court-circuit",
        rating: 5,
        comment: "Panne électrique générale résolue à 22h un vendredi soir. Électricien courtois et équipé.",
        date: "Il y a 3 jours"
      },
      {
        id: "rev-03",
        artisanName: "Atelier Hamza Alumi",
        clientName: "Amina S.",
        wilaya: "Oran",
        serviceName: "Fenêtres PVC & Aluminium",
        rating: 4.9,
        comment: "Installation de 4 fenêtres double vitrage aluminium. Finitions impeccables et respect des délais.",
        date: "Il y a 5 jours"
      }
    ];

    if (!db) return SAMPLE_REVIEWS;
    const snapshot = await db.collection("bricolage_reviews").get();
    if (snapshot.empty) return SAMPLE_REVIEWS;

    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return list;
  }
}
