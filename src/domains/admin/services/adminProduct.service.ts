import { admin, db } from "../../../config/firebase-admin";

export function checkProductExternalContact(text: string): boolean {
  if (!text) return false;
  const phoneRegex = /(?:\+?213|0)(?:5|6|7)[0-9]{8}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const socialRegex = /(facebook|instagram|viber|whatsapp|telegram|tiktok|page\s*fb)/gi;
  return phoneRegex.test(text) || emailRegex.test(text) || urlRegex.test(text) || socialRegex.test(text);
}

export interface AdminProductDoc {
  title?: string;
  description?: string;
  images?: string[];
  price?: number;
  stock?: number;
  specifications?: Record<string, unknown>;
  wilaya?: string;
  sellerId?: string;
  [key: string]: unknown;
}

export class AdminProductService {
  static async listCategoriesSimple() {
    const categoriesSnap = await db.collection("categories").get();
    return categoriesSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: (data.name as string) || doc.id,
        slug: (data.slug as string) || doc.id,
      };
    });
  }

  static async listTags() {
    const snap = await db.collection("tags").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async createTag(data: { name: string; slug: string }) {
    const tagRef = await db.collection("tags").add({
      name: data.name,
      slug: data.slug,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: tagRef.id, name: data.name, slug: data.slug };
  }

  static async deleteTag(tagId: string) {
    await db.collection("tags").doc(tagId).delete();
  }

  static async recalculateProductScores({ adminId }: { adminId: string }) {
    const productsSnap = await db.collection("products").get();
    let updatedCount = 0;

    const batchSize = 400;
    let batch = db.batch();
    let opCount = 0;

    for (const doc of productsSnap.docs) {
      const p = doc.data() as AdminProductDoc;
      let score = 0;

      if (p.title && p.title.trim().length >= 10) score += 15;
      if (p.description && p.description.trim().length >= 50) score += 20;
      if (Array.isArray(p.images) && p.images.length >= 3) score += 20;
      else if (Array.isArray(p.images) && p.images.length >= 1) score += 10;
      if (p.price && p.price > 0) score += 15;
      if (p.stock !== undefined && p.stock > 0) score += 10;
      if (p.specifications && typeof p.specifications === "object" && Object.keys(p.specifications).length > 0) score += 10;
      if (p.wilaya) score += 10;

      score = Math.min(100, Math.max(0, score));

      batch.update(doc.ref, {
        qualityScore: score,
        qualityScoreCalculatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      opCount++;
      updatedCount++;

      if (opCount >= batchSize) {
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    await db.collection("audit_logs").add({
      type: "SYSTEM_RECALCULATE",
      action: "RECALCULATE_PRODUCT_SCORES",
      adminId,
      details: `${updatedCount} produits recalculés`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { count: updatedCount };
  }

  static async approveProduct({ productId, adminId }: { productId: string; adminId: string }) {
    const productRef = db.collection("products").doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new Error("Produit non trouvé");
    }

    const pData = productSnap.data() || {};
    const fullTextToScan = `${pData.title || ""} ${pData.description || ""} ${JSON.stringify(pData.specifications || {})}`;
    if (checkProductExternalContact(fullTextToScan)) {
      throw new Error("Validation impossible : le produit contient des coordonnées externes (numéro algérien, email ou réseaux sociaux). Le vendeur doit les retirer.");
    }

    await productRef.update({
      status: "published",
      isApproved: true,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: adminId,
    });

    if (pData.sellerId) {
      await db.collection("user_notifications").add({
        recipientId: pData.sellerId,
        type: "PRODUCT_APPROVED",
        title: "Produit approuvé ! 🎉",
        message: `Votre produit "${pData.title || "Produit"}" a été validé et est maintenant en ligne sur Olmart.`,
        productId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    }

    await db.collection("audit_logs").add({
      type: "PRODUCT_MODERATION",
      action: "PUBLISHED",
      productId,
      adminId,
      details: "Produit approuvé par administrateur",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }

  static async rejectProduct({
    productId,
    adminId,
    rejectionReasons,
    comment,
  }: {
    productId: string;
    adminId: string;
    rejectionReasons: string[];
    comment?: string;
  }) {
    const productRef = db.collection("products").doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new Error("Produit non trouvé");
    }

    const pData = productSnap.data() || {};

    await productRef.update({
      status: "rejected",
      isApproved: false,
      rejectionReasons,
      rejectionComment: comment || "",
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectedBy: adminId,
    });

    if (pData.sellerId) {
      await db.collection("user_notifications").add({
        recipientId: pData.sellerId,
        type: "PRODUCT_REJECTED",
        title: "Produit non validé ⚠️",
        message: `Votre produit "${pData.title || "Produit"}" n'a pas été validé. Raisons : ${rejectionReasons.join(", ")}.`,
        productId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    }

    await db.collection("audit_logs").add({
      type: "PRODUCT_MODERATION",
      action: "REJECTED",
      productId,
      adminId,
      details: `Produit rejeté: ${rejectionReasons.join(", ")}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }

  static async listCategoriesFull() {
    const categoriesSnap = await db.collection("categories").get();
    return categoriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async updateCategoryCommission({
    categoryId,
    commissionRate,
    adminId,
  }: {
    categoryId: string;
    commissionRate: number;
    adminId: string;
  }) {
    await db.collection("categories").doc(categoryId).update({
      commissionRate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("audit_logs").add({
      type: "CATEGORY_MODERATION",
      action: "UPDATE_COMMISSION",
      categoryId,
      adminId,
      details: { commissionRate },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
}
