import { Router, Response } from "express";
import { db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import type { ReviewDocument } from "../../review/review.types";

const router = Router();

// GET seller reviews
router.get("/api/v1/seller/reviews", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;

    const productsSnap = await db.collection("products").where("sellerId", "==", uid).limit(500).get();
    if (productsSnap.empty) {
      return res.json({ reviews: [], averageRating: 0 });
    }

    const productNames: Record<string, string> = {};
    const productIds: string[] = [];

    productsSnap.docs.forEach(doc => {
      productIds.push(doc.id);
      productNames[doc.id] = doc.data().name;
    });

    if (productIds.length === 0) {
      return res.json({ reviews: [], averageRating: 0 });
    }

    // Divide productIds into batches of 30 to comply with Firestore 'in' limitation
    const batches: string[][] = [];
    for (let i = 0; i < productIds.length; i += 30) {
      batches.push(productIds.slice(i, i + 30));
    }

    // Query reviews for all batches in parallel
    const queries = batches.map(batch => 
      db.collection("reviews")
        .where("productId", "in", batch)
        .get()
    );

    const querySnapshots = await Promise.all(queries);
    const allReviewDocs: Array<ReviewDocument & { id: string }> = [];

    querySnapshots.forEach(snap => {
      snap.docs.forEach(doc => {
        allReviewDocs.push({ id: doc.id, ...(doc.data() as ReviewDocument) });
      });
    });

    // Map and decorate with productNames
    const reviews = allReviewDocs.map(rData => {
      return {
        ...rData,
        productName: productNames[rData.productId] || "Produit"
      };
    });

    // Sort combined reviews by createdAt descending safely
    reviews.sort((a, b) => {
      const getTimestamp = (val: unknown): number => {
        if (!val) return 0;
        if (typeof val === "object" && val !== null) {
          if ("toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
            return (val as { toDate: () => Date }).toDate().getTime();
          }
          if ("_seconds" in val && typeof (val as { _seconds: number })._seconds === "number") {
            return (val as { _seconds: number })._seconds * 1000;
          }
        }
        if (typeof val === "string" || typeof val === "number" || val instanceof Date) {
          const time = new Date(val).getTime();
          return isNaN(time) ? 0 : time;
        }
        return 0;
      };
      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
    });

    // Calculate dynamic seller average rating correctly using weighted average
    let averageRating = 0;
    if (reviews.length > 0) {
      const validRatings = reviews
        .map(r => r.rating)
        .filter(r => typeof r === "number" && Number.isFinite(r) && r >= 1 && r <= 5);

      if (validRatings.length > 0) {
        const sum = validRatings.reduce((acc, r) => acc + r, 0);
        averageRating = Number((sum / validRatings.length).toFixed(1));
      }
    }

    return res.json({ reviews, averageRating });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
