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
  listAdminReviews(params: { status?: string; limit?: number; startAfter?: string }): Promise<{
    reviews: (ReviewDocument & { productName?: string; productImage?: string })[];
    total: number;
    flaggedCount: number;
    avgRating: number;
  }>;
}

function getSafeNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val) && !Number.isNaN(val)) {
    return val;
  }
  return fallback;
}

function getSafeRating(val: unknown): number | null {
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
        lastReportedAt: admin.firestore.FieldValue.serverTimestamp()
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

  async listAdminReviews(params: { status?: string; limit?: number; startAfter?: string }): Promise<{
    reviews: (ReviewDocument & { productName?: string; productImage?: string })[];
    total: number;
    flaggedCount: number;
    avgRating: number;
  }> {
    const snap = await db.collection("reviews").get();
    const allDocs = snap.docs;

    let flaggedCount = 0;
    let totalScore = 0;
    let validScoreCount = 0;

    const rawList: (ReviewDocument & { productName?: string; productImage?: string })[] = [];

    // Collect product IDs to fetch product titles in batch
    const productIdsSet = new Set<string>();

    allDocs.forEach((d) => {
      const data = d.data() as ReviewDocument;
      const isFlagged = data.status === "flagged" || (data.flags && data.flags > 0);
      if (isFlagged) flaggedCount++;

      const safeRating = getSafeRating(data.rating);
      if (safeRating !== null) {
        totalScore += safeRating;
        validScoreCount++;
      }

      if (data.productId) productIdsSet.add(data.productId);

      rawList.push({
        id: d.id,
        ...data,
      });
    });

    // Fetch product information in chunks
    const productMap = new Map<string, { title: string; image?: string }>();
    const productIds = Array.from(productIdsSet);
    for (let i = 0; i < productIds.length; i += 30) {
      const chunk = productIds.slice(i, i + 30);
      if (chunk.length > 0) {
        const prodSnap = await db.collection("products").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
        prodSnap.docs.forEach((pDoc) => {
          const pData = pDoc.data();
          productMap.set(pDoc.id, {
            title: pData.name || pData.title || "Produit Olmart",
            image: Array.isArray(pData.images) && pData.images.length > 0 ? pData.images[0] : (typeof pData.image === "string" ? pData.image : undefined),
          });
        });
      }
    }

    // Attach product details
    rawList.forEach((r) => {
      if (r.productId && productMap.has(r.productId)) {
        const pInfo = productMap.get(r.productId)!;
        r.productName = pInfo.title;
        r.productImage = pInfo.image;
      }
    });

    // Filter by status if specified
    let filtered = rawList;
    if (params.status === "flagged") {
      filtered = rawList.filter((r) => r.status === "flagged" || (r.flags && r.flags > 0));
    } else if (params.status === "approved" || params.status === "published") {
      filtered = rawList.filter((r) => r.status === "approved" || r.status === "published");
    }

    // Sort: flagged first, then newest first
    filtered.sort((a, b) => {
      const aFlagged = a.status === "flagged" || (a.flags && a.flags > 0) ? 1 : 0;
      const bFlagged = b.status === "flagged" || (b.flags && b.flags > 0) ? 1 : 0;
      if (aFlagged !== bFlagged) return bFlagged - aFlagged;

      const aTime = a.createdAt ? (typeof a.createdAt === "object" && "toMillis" in a.createdAt ? (a.createdAt as { toMillis: () => number }).toMillis() : new Date(a.createdAt as string).getTime()) : 0;
      const bTime = b.createdAt ? (typeof b.createdAt === "object" && "toMillis" in b.createdAt ? (b.createdAt as { toMillis: () => number }).toMillis() : new Date(b.createdAt as string).getTime()) : 0;
      return bTime - aTime;
    });

    const limitVal = params.limit ? Math.min(Math.max(1, params.limit), 100) : 50;
    const paginated = filtered.slice(0, limitVal);

    const avgRating = validScoreCount > 0 ? Number((totalScore / validScoreCount).toFixed(1)) : 0;

    return {
      reviews: paginated,
      total: rawList.length,
      flaggedCount,
      avgRating,
    };
  }
}
