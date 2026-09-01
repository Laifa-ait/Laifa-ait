import { Router, Response } from "express";
import { authenticateToken } from "../../middlewares/auth";
import type { AuthenticatedBuyerRequest, BuyerFollowStoreDTO, BuyerUnfollowStoreDTO } from "./types/buyer.types";
import { BuyerService } from "./services/buyer.service";
import { PersonalizedFeedService, AffinityDigestPayload } from "../../services/PersonalizedFeedService";
import { safeLogger } from "../../utils/logger";

const router = Router();

// POST /api/v1/user/affinity-digest (1 single consolidated sync per day)
router.post("/api/v1/user/affinity-digest", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const digest = req.body as AffinityDigestPayload;
    await PersonalizedFeedService.saveUserDailyDigest(uid, digest);
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Affinity digest sync error", { err: message });
    return res.status(500).json({ error: message });
  }
});

// GET buyer returns
router.get("/api/v1/buyer/returns", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const returns = await BuyerService.getReturns(uid);
    return res.json({ returns });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Returns fetch error", { err: message });
    return res.status(500).json({ error: message });
  }
});

// GET buyer orders
router.get("/api/v1/buyer/orders", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { startAfter, limit } = req.query;
    const startAfterParam = typeof startAfter === "string" ? startAfter : undefined;
    const limitParam = limit ? Number(limit) : 20;

    const result = await BuyerService.getOrders(uid, startAfterParam, limitParam);
    return res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Orders fetch error", { err: message });
    return res.status(500).json({ error: message });
  }
});

// GET buyer followed stores
router.get("/api/v1/buyer/followed-stores", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const stores = await BuyerService.getFollowedStores(uid);
    return res.json({ stores });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Followed stores fetch error", { err: message });
    return res.status(500).json({ error: message });
  }
});

// POST unfollow store
router.post("/api/v1/buyer/unfollow", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { sellerId } = req.body as BuyerUnfollowStoreDTO;
    if (!sellerId) {
      return res.status(400).json({ error: "sellerId required" });
    }
    await BuyerService.unfollowStore(uid, sellerId);
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Unfollow store error", { err: message });
    return res.status(500).json({ error: message });
  }
});

// POST follow store
router.post("/api/v1/buyer/follow", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { sellerId, followPayload } = req.body as BuyerFollowStoreDTO;
    if (!sellerId || !followPayload) {
      return res.status(400).json({ error: "sellerId and followPayload required" });
    }
    await BuyerService.followStore(uid, sellerId, followPayload);
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Follow store error", { err: message });
    return res.status(500).json({ error: message });
  }
});

export default router;
