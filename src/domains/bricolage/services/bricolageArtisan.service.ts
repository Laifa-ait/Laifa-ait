import { db, admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { ArtisanUpgradePayload, ArtisanVerificationActionPayload } from "../../../types/bricolage";

export class BricolageArtisanService {
  static async getOpportunities(
    _artisanUid?: string,
    _userRole?: string,
    artisanWilaya?: string,
    category?: string
  ): Promise<Array<Record<string, unknown>>> {
    if (!db) {
      return [
        {
          id: "DEM-2026-001",
          customerName: "Mohamed K.",
          wilaya: "Alger (Hydra)",
          serviceName: "Installation Climatiseur 12000 BTU",
          urgency: "urgent",
          description: "Recherche installateur certifié pour climatiseur split neuf.",
          estimatedPriceDZD: { min: 4000, max: 7000 },
          createdAt: "Récemment"
        }
      ];
    }
    let query: FirebaseFirestore.Query = db.collection("bricolage_quote_requests").where("status", "==", "pending");
    if (artisanWilaya) {
      query = query.where("wilaya", "==", artisanWilaya);
    }
    if (category) {
      query = query.where("serviceCategoryId", "==", category);
    }
    const snapshot = await query.get();
    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return list;
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
}
