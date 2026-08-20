import { db, admin } from "../../config/firebase-admin";
import { ReviewDocument, SubmitReviewData } from "./review.types";

export interface IReviewRepository {
  getReview(id: string): Promise<ReviewDocument | null>;
  addReview(userId: string, userName: string, data: SubmitReviewData): Promise<void>;
  updateReview(id: string, data: Partial<ReviewDocument>): Promise<void>;
  reportReview(id: string, reason: string): Promise<void>;
  addReply(id: string, reply: { sellerId: string; text: string }): Promise<void>;
  approveReview(id: string): Promise<void>;
  deleteReview(id: string): Promise<void>;
}

function getSafeNumber(val: any, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val) && !Number.isNaN(val)) {
    return val;
  }
  return fallback;
}

function getSafeRating(val: any): number | null {
  if (typeof val === "number" && Number.isFinite(val) && !Number.isNaN(val) && val >= 1 && val <= 5) {
    return val;
  }
  return null;
}

async function recalculateProductStatsInsideTransaction(
  t: admin.firestore.Transaction,
  productId: string,
  targetReviewId?: string,
  targetReviewPatch?: Partial<ReviewDocument>,
  isDelete = false
): Promise<void> {
  const reviewsQuery = db.collection("reviews").where("productId", "==", productId);
  const reviewsSnap = await t.get(reviewsQuery);

  let totalRatingSum = 0;
  let reviewCount = 0;

  reviewsSnap.docs.forEach(doc => {
    const rId = doc.id;
    if (isDelete && rId === targetReviewId) return;

    const rData = doc.data() as ReviewDocument;
    
    // Apply patch in memory if this is the target review being updated
    const currentStatus = (targetReviewId && rId === targetReviewId && targetReviewPatch && targetReviewPatch.status !== undefined)
      ? targetReviewPatch.status
      : rData.status;

    const currentRating = (targetReviewId && rId === targetReviewId && targetReviewPatch && targetReviewPatch.rating !== undefined)
      ? targetReviewPatch.rating
      : rData.rating;

    // We only count reviews that are approved, replied, or published
    if (["approved", "replied", "published"].includes(currentStatus || "")) {
      const safeRating = getSafeRating(currentRating);
      if (safeRating !== null) {
        totalRatingSum += safeRating;
        reviewCount++;
      }
    }
  });

  const rawAverage = reviewCount > 0 ? totalRatingSum / reviewCount : null;
  const safeAverage = rawAverage !== null && Number.isFinite(rawAverage) && !Number.isNaN(rawAverage)
    ? Number(rawAverage.toFixed(1))
    : null;

  const productRef = db.collection("products").doc(productId);
  t.update(productRef, {
    stats: {
      reviewCount: getSafeNumber(reviewCount, 0),
      totalReviews: getSafeNumber(reviewCount, 0),
      averageRating: safeAverage,
      totalRatingSum: getSafeNumber(totalRatingSum, 0),
      lastReviewAt: admin.firestore.FieldValue.serverTimestamp()
    }
  });
}

export class FirebaseReviewRepository implements IReviewRepository {
  async getReview(id: string): Promise<ReviewDocument | null> {
    const snap = await db.collection("reviews").doc(id).get();
    return snap.exists ? { id: snap.id, ...(snap.data() as Omit<ReviewDocument, "id">) } : null;
  }

  async addReview(userId: string, userName: string, data: SubmitReviewData): Promise<void> {
    const { orderId, productId, rating, comment, images } = data;

    const safeRating = getSafeRating(rating);
    if (safeRating === null || !Number.isInteger(safeRating)) {
      throw new Error("Note invalide. Le score doit être un entier entre 1 et 5.");
    }

    if (comment && comment.length > 1000) {
      throw new Error("Le commentaire est trop long (maximum 1000 caractères).");
    }

    if (images && (!Array.isArray(images) || images.length > 5 || images.some(img => typeof img !== "string" || !img.startsWith("http")))) {
      throw new Error("Format d'images invalide (maximum 5 URLs HTTP/HTTPS).");
    }

    const reviewId = productId + "_" + userId + "_" + orderId;
    const reviewRef = db.collection("reviews").doc(reviewId);
    const orderRef = db.collection("orders").doc(orderId);
    const productRef = db.collection("products").doc(productId);

    await db.runTransaction(async (t) => {
      const orderSnap = await t.get(orderRef);
      if (!orderSnap.exists) {
        throw new Error("Commande introuvable.");
      }

      const orderData = orderSnap.data() || {};
      if (orderData.userId !== userId && orderData.buyerId !== userId) {
        throw new Error("Accès refusé. Cette commande ne vous appartient pas.");
      }

      if ((orderData.status || "").toLowerCase() !== "delivered") {
        throw new Error("Vous ne pouvez évaluer un produit qu'après sa livraison finale.");
      }

      const orderItems = orderData.items || orderData.products || orderData.orderItems || [];
      const containsProduct = Array.isArray(orderItems) && orderItems.some((item: { id?: string; productId?: string }) => (item.id || item.productId) === productId);
      if (!containsProduct) {
        throw new Error("Ce produit ne fait pas partie de cette commande.");
      }

      if (orderData.reviewsSubmitted && orderData.reviewsSubmitted[productId]) {
        throw new Error("Vous avez déjà évalué ce produit pour cette commande.");
      }

      const productSnap = await t.get(productRef);
      if (!productSnap.exists) {
        throw new Error("Produit introuvable.");
      }

      // 1. Create review doc
      const reviewPayload: ReviewDocument = {
        orderId,
        productId,
        rating: safeRating,
        comment: comment || "",
        images: images || [],
        userId,
        userName,
        status: "approved",
        flags: 0,
        replies: []
      };

      t.set(reviewRef, {
        ...reviewPayload,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Update order doc reviewsSubmitted
      t.update(orderRef, {
        [`reviewsSubmitted.${productId}`]: {
          rating: safeRating,
          comment: comment || "",
          createdAt: new Date().toISOString()
        }
      });

      // 3. Recalculate stats for product in unified transaction
      await recalculateProductStatsInsideTransaction(t, productId, reviewId, reviewPayload);
    });
  }

  async updateReview(id: string, data: Partial<ReviewDocument>): Promise<void> {
    const reviewRef = db.collection("reviews").doc(id);
    await db.runTransaction(async (t) => {
      const rSnap = await t.get(reviewRef);
      if (!rSnap.exists) {
        throw new Error("Avis introuvable.");
      }
      const existingReview = rSnap.data() as ReviewDocument;
      const productId = existingReview.productId;

      t.update(reviewRef, data);

      if (productId) {
        await recalculateProductStatsInsideTransaction(t, productId, id, data);
      }
    });
  }

  async reportReview(id: string, reason: string): Promise<void> {
    const reviewRef = db.collection("reviews").doc(id);
    await db.runTransaction(async (t) => {
      const rSnap = await t.get(reviewRef);
      if (!rSnap.exists) {
        throw new Error("Avis introuvable.");
      }
      const existingReview = rSnap.data() as ReviewDocument;
      const productId = existingReview.productId;

      const patch: Partial<ReviewDocument> = {
        flags: getSafeNumber(existingReview.flags || 0, 0) + 1,
        status: "flagged",
        lastReportedReason: reason,
        lastReportedAt: admin.firestore.FieldValue.serverTimestamp() as any
      };

      t.update(reviewRef, patch);

      if (productId) {
        await recalculateProductStatsInsideTransaction(t, productId, id, patch);
      }
    });
  }

  async addReply(id: string, reply: { sellerId: string; text: string }): Promise<void> {
    const reviewRef = db.collection("reviews").doc(id);
    await db.runTransaction(async (t) => {
      const rSnap = await t.get(reviewRef);
      if (!rSnap.exists) {
        throw new Error("Avis introuvable.");
      }
      const existingReview = rSnap.data() as ReviewDocument;
      const productId = existingReview.productId;

      const newReplies = [...(existingReview.replies || []), { ...reply, createdAt: new Date().toISOString() }];
      const patch: Partial<ReviewDocument> = {
        replies: newReplies,
        status: "replied"
      };

      t.update(reviewRef, patch);

      if (productId) {
        await recalculateProductStatsInsideTransaction(t, productId, id, patch);
      }
    });
  }

  async approveReview(id: string): Promise<void> {
    const reviewRef = db.collection("reviews").doc(id);
    await db.runTransaction(async (t) => {
      const rSnap = await t.get(reviewRef);
      if (!rSnap.exists) {
        throw new Error("Avis introuvable.");
      }
      const existingReview = rSnap.data() as ReviewDocument;
      const productId = existingReview.productId;

      const patch: Partial<ReviewDocument> = {
        status: "published",
        flags: 0
      };

      t.update(reviewRef, patch);

      if (productId) {
        await recalculateProductStatsInsideTransaction(t, productId, id, patch);
      }
    });
  }

  async deleteReview(id: string): Promise<void> {
    const reviewRef = db.collection("reviews").doc(id);
    await db.runTransaction(async (t) => {
      const rSnap = await t.get(reviewRef);
      if (!rSnap.exists) {
        throw new Error("Avis introuvable.");
      }
      const existingReview = rSnap.data() as ReviewDocument;
      const productId = existingReview.productId;

      t.delete(reviewRef);

      if (productId) {
        await recalculateProductStatsInsideTransaction(t, productId, id, {}, true);
      }
    });
  }
}
