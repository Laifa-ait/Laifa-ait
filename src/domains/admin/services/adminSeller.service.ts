import { admin, db } from "../../../config/firebase-admin";

export interface ListSellersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SellerListSimpleResult {
  id: string;
  name: string;
  email: string;
}

export interface PaginatedSellersResult {
  sellers: Array<Record<string, unknown> & { id: string }>;
  total: number;
  page: number;
  totalPages: number;
}

export interface ApproveSellerParams {
  sellerId: string;
  adminId: string;
}

export interface RejectSellerParams {
  sellerId: string;
  adminId: string;
  reasons: string[];
  comment?: string;
}

export interface SuspendSellerParams {
  sellerId: string;
  adminId: string;
}

export interface UpdateSellerDetailsParams {
  sellerId: string;
  adminId: string;
  internalNotes?: string;
  commissionRate?: number;
}

export interface CheckNifParams {
  nifNumber: string;
  sellerId?: string;
}

export class AdminSellerService {
  /**
   * Get simplified list of sellers for dropdowns/quick selection
   */
  static async listSellersSimple(): Promise<SellerListSimpleResult[]> {
    const sellersSnap = await db.collection("users").where("role", "==", "seller").get();
    return sellersSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.storeName || data.displayName || data.name || data.email || doc.id,
        email: data.email || "",
      };
    });
  }

  /**
   * Paginated sellers query with filters and search
   */
  static async listSellersPaginated(query: ListSellersQuery): Promise<PaginatedSellersResult> {
    const page = query.page || 1;
    const limitNum = query.limit || 50;
    const status = query.status;
    const search = query.search;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const Filter = admin.firestore.Filter;
    let baseQuery: admin.firestore.Query = db.collection("users");

    if (status) {
      if (status === "pending") {
        baseQuery = baseQuery.where("status", "in", ["pending", "pending_verification"]);
      } else {
        baseQuery = baseQuery.where("role", "==", "seller").where("status", "==", status);
      }
    } else {
      baseQuery = baseQuery.where(
        Filter.or(
          Filter.where("role", "==", "seller"),
          Filter.where("status", "in", ["pending", "pending_verification"])
        )
      );
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      baseQuery = baseQuery.where("email", ">=", lowerSearch).where("email", "<=", lowerSearch + "\uf8ff");
    }

    baseQuery = baseQuery.orderBy(sortBy, sortOrder);

    const countSnapshot = await baseQuery.count().get();
    const totalCount = countSnapshot.data().count;

    const offset = (page - 1) * limitNum;
    const snapshot = await baseQuery.offset(offset).limit(limitNum).get();

    const paginatedSellers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      sellers: paginatedSellers,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limitNum),
    };
  }

  /**
   * Approve seller account and create public profile + notifications + email + audit log
   */
  static async approveSeller(params: ApproveSellerParams): Promise<{ success: boolean }> {
    const { sellerId, adminId } = params;
    const userRef = db.collection("users").doc(sellerId);

    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new Error("Vendeur non trouvé");
    }
    const userData = userSnap.data() || {};

    await userRef.update({
      role: "seller",
      status: "active",
      isVerified: true,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("publicProfiles").doc(sellerId).set(
      {
        shopName: userData.shopName || userData.displayName || "",
        shopDescription: userData.shopDescription || "",
        logoUrl: userData.logoUrl || "",
        bannerUrl: userData.bannerUrl || "",
        wilaya: userData.wilaya || "",
      },
      { merge: true }
    );

    await db.collection("user_notifications").add({
      recipientId: sellerId,
      type: "KYC_APPROVED",
      title: "Votre compte vendeur est approuvé ! 🎉",
      message:
        "Félicitations, vos documents ont été validés avec succès par l'équipe Olmart. Vous pouvez maintenant ajouter des produits et commencer à vendre.",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    if (userData.email) {
      await db.collection("mail").add({
        to: userData.email,
        message: {
          subject: "Félicitations ! Votre compte Vendeur Olmart est actif 🎉",
          html: `<p>Bonjour ${
            userData.displayName || userData.shopName || "Partenaire"
          },</p><p>Excellente nouvelle ! Vos documents de vérification (KYC) ont été <strong>validés avec succès</strong>.</p><p>Votre boutique est maintenant en ligne et prête à recevoir ses premiers produits. Connectez-vous dès maintenant pour configurer votre catalogue et préparer vos premières ventes.</p><p>Bienvenue dans l'aventure Olmart!</p>`,
        },
      });
    }

    await db.collection("audit_logs").add({
      type: "SELLER_MODERATION",
      action: "ACTIVE",
      sellerId,
      adminId,
      details: "Vendeur approuvé (Statut mis à jour vers active)",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }

  /**
   * Reject seller account + moderation log + notifications + email + audit log
   */
  static async rejectSeller(params: RejectSellerParams): Promise<{ success: boolean }> {
    const { sellerId, adminId, reasons, comment } = params;

    const userRef = db.collection("users").doc(sellerId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new Error("Vendeur non trouvé");
    }
    const userData = userSnap.data() || {};

    await userRef.update({
      status: "rejected",
      rejectionReasons: reasons,
      rejectionComment: comment || "",
      rejectedBy: adminId,
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await userRef.collection("moderation_logs").add({
      status: "rejected",
      reasons,
      comment: comment || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      adminId,
    });

    await db.collection("user_notifications").add({
      recipientId: sellerId,
      type: "KYC_REJECTED",
      title: "Mise à jour concernant vos documents (KYC) ⚠️",
      message: `Vos documents nécessitent des corrections. Raisons : ${reasons.join(", ")}. Remarque admin : ${
        comment || ""
      }`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    if (userData.email) {
      await db.collection("mail").add({
        to: userData.email,
        message: {
          subject: "Mise à jour de votre compte Vendeur Olmart - Action Requise",
          html: `<p>Bonjour,</p><p>Lors de la révision de votre dossier de création de boutique, nous avons constaté que certains documents nécessitent votre attention.</p>
               <p><strong>Raisons :</strong> ${reasons.join(", ")}</p>
               <p>Veuillez vous connecter à votre compte pour mettre à jour vos informations afin que nous puissions finaliser l'activation de votre boutique.</p>`,
        },
      });
    }

    await db.collection("audit_logs").add({
      type: "SELLER_MODERATION",
      action: "REJECTED",
      sellerId,
      adminId,
      details: `Vendeur rejeté: ${reasons.join(", ")}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }

  /**
   * Suspend seller account
   */
  static async suspendSeller(params: SuspendSellerParams): Promise<{ success: boolean }> {
    const { sellerId, adminId } = params;

    const userRef = db.collection("users").doc(sellerId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new Error("Vendeur non trouvé");
    }

    await userRef.update({
      status: "suspended",
      suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      await admin.auth().revokeRefreshTokens(sellerId);
    } catch (authErr: unknown) {
      safeLogger.warn("Failed to revoke refresh tokens for suspended seller", {
        sellerId,
        err: authErr instanceof Error ? authErr.message : String(authErr),
      });
    }

    await db.collection("audit_logs").add({
      type: "SELLER_MODERATION",
      action: "SUSPENDED",
      sellerId,
      adminId,
      details: "Statut mis à jour vers: suspended",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }

  /**
   * Update internal seller details (notes, commission rate)
   */
  static async updateSellerDetails(params: UpdateSellerDetailsParams): Promise<{ success: boolean }> {
    const { sellerId, adminId, internalNotes, commissionRate } = params;

    const userRef = db.collection("users").doc(sellerId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new Error("Vendeur non trouvé");
    }

    const updates: Record<string, unknown> = {};
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;
    if (commissionRate !== undefined) updates.commissionRate = commissionRate;
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await userRef.update(updates);

    await db.collection("audit_logs").add({
      type: "SELLER_MODERATION",
      action: "UPDATE_DETAILS",
      sellerId,
      adminId,
      details: updates,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }

  /**
   * Check for NIF duplicate registrations
   */
  static async checkNif(
    params: CheckNifParams
  ): Promise<{ success: boolean; count: number; duplicates: Array<Record<string, unknown> & { id: string }> }> {
    const { nifNumber, sellerId } = params;

    const snap = await db.collection("users").where("nifNumber", "==", nifNumber.trim()).get();
    const duplicates = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user) => !sellerId || user.id !== sellerId);

    return {
      success: true,
      count: duplicates.length,
      duplicates,
    };
  }
}
