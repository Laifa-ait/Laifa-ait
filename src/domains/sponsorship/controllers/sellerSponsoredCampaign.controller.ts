import { Router, Response } from "express";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { SponsoredCampaignService } from "../sponsoredCampaign.service";
import { calculateCampaignPrice } from "../../../config/sponsoredPricing";
import { SponsoredPlacement } from "../../../types/sponsoredCampaign";
import { safeLogger } from "../../../utils/logger";

const router = Router();

/**
 * GET /api/v1/seller/sponsored-campaigns/pricing/preview
 * Returns server-calculated pricing preview
 */
router.get("/api/v1/seller/sponsored-campaigns/pricing/preview", authenticateToken, authorizeSeller, (req: AuthenticatedRequest, res: Response) => {
  try {
    const placement = req.query.placement as SponsoredPlacement;
    const startAt = req.query.startAt as string;
    const endAt = req.query.endAt as string;

    if (!placement || !startAt || !endAt) {
      return res.status(400).json({ error: "Paramètres manquants (placement, startAt, endAt requis)." });
    }

    const calc = calculateCampaignPrice(placement, startAt, endAt);
    if (!calc.valid) {
      return res.status(400).json({ error: calc.error });
    }

    return res.status(200).json({ success: true, data: calc.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur calcul tarif";
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/v1/seller/sponsored-campaigns
 * Create a new sponsored campaign
 */
router.post("/api/v1/seller/sponsored-campaigns", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.uid;
    if (!sellerId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { productId, placement, startAt, endAt, payFromWallet } = req.body;

    // Strict validation
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Identifiant du produit obligatoire." });
    }

    if (!placement || (placement !== "home" && placement !== "category" && placement !== "search")) {
      return res.status(400).json({ error: "Emplacement invalide. Choix : home, category, search." });
    }

    if (!startAt || typeof startAt !== "string" || !endAt || typeof endAt !== "string") {
      return res.status(400).json({ error: "Dates de début et de fin obligatoires." });
    }

    // Notice: Any sellerId, status, priceAmount, paymentStatus passed in req.body are completely ignored!
    // Everything is derived from authenticated token and server pricing rules.
    const campaign = await SponsoredCampaignService.createCampaign(sellerId, {
      productId,
      placement,
      startAt,
      endAt,
      payFromWallet: Boolean(payFromWallet),
    });

    return res.status(201).json({ success: true, data: campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la création de la campagne.";
    safeLogger.error("[SellerSponsoredCampaignController] Error creating campaign", { err: message });
    return res.status(400).json({ error: message });
  }
});

/**
 * GET /api/v1/seller/sponsored-campaigns
 * List all campaigns of the authenticated seller
 */
router.get("/api/v1/seller/sponsored-campaigns", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.uid;
    if (!sellerId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const campaigns = await SponsoredCampaignService.listSellerCampaigns(sellerId);
    return res.status(200).json({ success: true, data: campaigns });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur récupération des campagnes.";
    return res.status(500).json({ error: message });
  }
});

/**
 * GET /api/v1/seller/sponsored-campaigns/:campaignId
 * Get a single campaign with IDOR protection
 */
router.get("/api/v1/seller/sponsored-campaigns/:campaignId", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.uid;
    if (!sellerId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const campaign = await SponsoredCampaignService.getSellerCampaign(sellerId, req.params.campaignId);
    return res.status(200).json({ success: true, data: campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la récupération.";
    const status = message.includes("Accès refusé") ? 403 : message.includes("introuvable") ? 404 : 400;
    return res.status(status).json({ error: message });
  }
});

/**
 * POST /api/v1/seller/sponsored-campaigns/:campaignId/cancel
 * Cancel a campaign with IDOR protection
 */
router.post("/api/v1/seller/sponsored-campaigns/:campaignId/cancel", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.uid;
    if (!sellerId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const campaign = await SponsoredCampaignService.cancelSellerCampaign(sellerId, req.params.campaignId);
    return res.status(200).json({ success: true, data: campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'annulation.";
    const status = message.includes("Accès refusé") ? 403 : message.includes("introuvable") ? 404 : 400;
    return res.status(status).json({ error: message });
  }
});

export default router;
