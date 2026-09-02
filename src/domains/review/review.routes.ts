import { Router, Response } from "express";
import { authenticateToken, authorizeAdmin, authorizeSeller, AuthenticatedRequest } from "../../middlewares/auth";
import { FirebaseReviewRepository } from "./review.repository";
import { ReviewService } from "./review.service";
import { enqueueSellerVelocityCheck } from "../../utils/velocity";

const router = Router();
const reviewRepo = new FirebaseReviewRepository();
const reviewService = new ReviewService(reviewRepo);

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid || "";
    const userName = (req.user?.name as string) || req.user?.email || "Client Olma";
    
    // Ignore userId or sellerId sent by client - only pass strict body params
    const { orderId, productId, rating, comment, images } = req.body;
    
    const result = await reviewService.submitReview(userId, userName, {
      orderId,
      productId,
      rating,
      comment,
      images
    });
    
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    let status = 500;
    
    if (msg.includes("introuvable")) {
      status = 404;
    } else if (msg.includes("Accès refusé") || msg.includes("livraison finale")) {
      status = 403;
    } else if (
      msg.includes("partie de cette commande") || 
      msg.includes("déjà évalué") || 
      msg.includes("Note") || 
      msg.includes("commentaire") || 
      msg.includes("images") || 
      msg.includes("requis") || 
      msg.includes("Missing")
    ) {
      status = 400;
    }
    
    res.status(status).json({ error: msg });
  }
});

router.post("/report", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reviewId, reason } = req.body;
    const result = await reviewService.reportReview(reviewId, reason);
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

router.get("/admin", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const startAfter = req.query.startAfter as string | undefined;

    const result = await reviewService.listAdminReviews({ status, limit, startAfter });
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

router.post("/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reviewId } = req.body;
    const result = await reviewService.approveReview(reviewId);
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

router.post("/:id/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewId = req.params.id;
    const result = await reviewService.approveReview(reviewId);
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

router.delete("/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewId = req.params.id;
    const result = await reviewService.deleteReview(reviewId);
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

router.post("/:id/delete", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewId = req.params.id;
    const result = await reviewService.deleteReview(reviewId);
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

router.post("/reply", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reviewId, replyText } = req.body;
    const userId = req.user?.uid || "";
    const result = await reviewService.replyToReview(reviewId, userId, replyText);
    
    // Enforce velocity limits durably in background queue
    enqueueSellerVelocityCheck(userId);
    
    res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

export default router;
