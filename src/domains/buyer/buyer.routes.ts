import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../../config/firebase-admin";
import { authenticateToken } from "../../middlewares/auth";
import type { AuthenticatedBuyerRequest } from "./types/buyer.types";
import { BuyerService } from "./services/buyer.service";
import { PersonalizedFeedService, AffinityDigestPayload } from "../../services/PersonalizedFeedService";
import { safeLogger } from "../../utils/logger";

const router = Router();

// Strict Zod Schemas
const UserHabitsSchema = z.object({
  historique_recherches: z.array(z.string().max(120)).max(100).optional(),
  categories_visitees: z.record(z.string(), z.number()).optional(),
}).strict();

const CartItemSchema = z.object({
  productId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(99),
  variantId: z.string().max(100).optional(),
  selected: z.boolean().optional(),
}).strict();

const CartSchema = z.object({
  items: z.array(CartItemSchema).max(100),
}).strict();

const WishlistSchema = z.object({
  productIds: z.array(z.string().min(1).max(100)).max(200),
}).strict();

const FollowStoreSchema = z.object({
  sellerId: z.string().min(1).max(100),
  followPayload: z.record(z.string(), z.unknown()).optional(),
}).strict();

const UnfollowStoreSchema = z.object({
  sellerId: z.string().min(1).max(100),
}).strict();

// 1. POST /api/v1/user/habits - User habits tracking
router.post("/api/v1/user/habits", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: "Authentification requise" });

  const parsed = UserHabitsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Données de comportement invalides", details: parsed.error.issues });
  }

  try {
    await db.collection("user_habits").doc(uid).set(parsed.data, { merge: true });
    return res.json({ success: true });
  } catch (err: unknown) {
    safeLogger.error("[Buyer Domain] Error saving user habits", { err: String(err) });
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// 2. POST /api/v1/user/cart - User cart synchronization
router.post("/api/v1/user/cart", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: "Authentification requise" });

  const parsed = CartSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Données de panier invalides", details: parsed.error.issues });
  }

  try {
    await db.collection("users").doc(uid).collection("cart").doc("current").set(parsed.data, { merge: true });
    return res.json({ success: true, data: parsed.data });
  } catch (err: unknown) {
    safeLogger.error("[Buyer Domain] Error saving cart", { err: String(err) });
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// 3. POST /api/v1/user/wishlist - User wishlist synchronization
router.post("/api/v1/user/wishlist", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: "Authentification requise" });

  const parsed = WishlistSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Données de liste d'envies invalides", details: parsed.error.issues });
  }

  try {
    await db.collection("users").doc(uid).collection("wishlist").doc("current").set(parsed.data, { merge: true });
    return res.json({ success: true, data: parsed.data });
  } catch (err: unknown) {
    safeLogger.error("[Buyer Domain] Error saving wishlist", { err: String(err) });
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// 4. POST /api/v1/user/affinity-digest (1 single consolidated sync per day)
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

// 5. GET buyer returns
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

// 6. GET buyer orders
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

// 7. GET buyer followed stores
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

// 8. GET buyer follow status for a specific store
router.get("/api/v1/buyer/follow-status/:sellerId", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { sellerId } = req.params;
    if (!sellerId) {
      return res.status(400).json({ error: "sellerId parameter required" });
    }
    const isFollowing = await BuyerService.isStoreFollowed(uid, sellerId);
    return res.json({ isFollowing });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Follow status fetch error", { err: message });
    return res.status(500).json({ error: message });
  }
});

// 9. POST unfollow store with Zod validation
router.post("/api/v1/buyer/unfollow", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const parsed = UnfollowStoreSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Données désabonnement invalides", details: parsed.error.issues });
    }
    await BuyerService.unfollowStore(uid, parsed.data.sellerId);
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Unfollow store error", { err: message });
    return res.status(500).json({ error: message });
  }
});

// 10. POST follow store with Zod validation
router.post("/api/v1/buyer/follow", authenticateToken, async (req: AuthenticatedBuyerRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const parsed = FollowStoreSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Données d'abonnement invalides", details: parsed.error.issues });
    }
    await BuyerService.followStore(uid, parsed.data.sellerId, parsed.data.followPayload || {});
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[Buyer Domain] Follow store error", { err: message });
    return res.status(500).json({ error: message });
  }
});

export default router;
