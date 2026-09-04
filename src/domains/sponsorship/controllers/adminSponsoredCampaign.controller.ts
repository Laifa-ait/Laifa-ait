import { Router, Response } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { SponsoredCampaignService } from "../sponsoredCampaign.service";

const router = Router();

/**
 * GET /api/v1/admin/sponsored-campaigns
 * List all campaigns with optional filters
 */
router.get("/admin/sponsored-campaigns", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, moderationStatus } = req.query;
    const campaigns = await SponsoredCampaignService.adminListCampaigns({
      status: status as string,
      moderationStatus: moderationStatus as string,
    });
    return res.status(200).json({ success: true, data: campaigns });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur récupération des campagnes admin.";
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/v1/admin/sponsored-campaigns/:campaignId/approve
 * Approve a campaign
 */
router.post("/admin/sponsored-campaigns/:campaignId/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid;
    if (!adminId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const campaign = await SponsoredCampaignService.adminApproveCampaign(adminId, req.params.campaignId);
    return res.status(200).json({ success: true, data: campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'approbation.";
    const status = message.includes("introuvable") ? 404 : 400;
    return res.status(status).json({ error: message });
  }
});

/**
 * POST /api/v1/admin/sponsored-campaigns/:campaignId/reject
 * Reject a campaign with reason
 */
router.post("/admin/sponsored-campaigns/:campaignId/reject", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid;
    if (!adminId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { reason } = req.body;
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return res.status(400).json({ error: "Le motif du refus est obligatoire." });
    }

    const campaign = await SponsoredCampaignService.adminRejectCampaign(adminId, req.params.campaignId, reason);
    return res.status(200).json({ success: true, data: campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors du rejet.";
    const status = message.includes("introuvable") ? 404 : 400;
    return res.status(status).json({ error: message });
  }
});

/**
 * POST /api/v1/admin/sponsored-campaigns/:campaignId/suspend
 * Suspend an active campaign
 */
router.post("/admin/sponsored-campaigns/:campaignId/suspend", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid;
    if (!adminId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { reason } = req.body;
    const campaign = await SponsoredCampaignService.adminSuspendCampaign(adminId, req.params.campaignId, reason);
    return res.status(200).json({ success: true, data: campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la suspension.";
    const status = message.includes("introuvable") ? 404 : 400;
    return res.status(status).json({ error: message });
  }
});

export default router;
