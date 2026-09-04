import { Router, Request, Response } from "express";
import crypto from "crypto";
import { SponsoredCampaignService } from "../sponsoredCampaign.service";
import { SponsoredPlacement } from "../../../types/sponsoredCampaign";

const router = Router();

function deriveClientFingerprint(req: Request, clientSessionId?: string): string {
  if (clientSessionId && typeof clientSessionId === "string" && clientSessionId.trim().length >= 8) {
    return clientSessionId.trim().substring(0, 64);
  }
  const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const ua = req.headers["user-agent"] || "unknown_ua";
  return crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex").substring(0, 24);
}

/**
 * GET /api/v1/public/sponsored/products
 * Public endpoint to retrieve currently active, eligible sponsored products for a placement
 */
router.get("/products", async (req: Request, res: Response) => {
  try {
    const placement = req.query.placement as SponsoredPlacement;
    const category = req.query.category as string | undefined;
    const searchQuery = (req.query.q as string) || (req.query.searchQuery as string) || undefined;
    const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const limit = Math.min(Math.max(limitParam, 1), 20);

    if (!placement || (placement !== "home" && placement !== "category" && placement !== "search")) {
      return res.status(400).json({ error: "Emplacement invalide (home, category, search requis)." });
    }

    const products = await SponsoredCampaignService.getPublicSponsoredProducts({
      placement,
      category,
      searchQuery,
      limit,
    });

    return res.status(200).json({ success: true, data: products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur récupération produits sponsorisés.";
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/v1/public/sponsored/events
 * Record an impression or click event unitarily
 * Anti-tampering: productId is verified against the stored campaign, status must be paid & active
 */
router.post("/events", async (req: Request, res: Response) => {
  try {
    const { campaignId, eventType, placement, productId, sessionId } = req.body;

    if (!campaignId || typeof campaignId !== "string") {
      return res.status(400).json({ error: "Identifiant de campagne requis." });
    }

    if (!eventType || (eventType !== "impression" && eventType !== "click")) {
      return res.status(400).json({ error: "Type d'événement invalide (impression ou click requis)." });
    }

    if (!placement || (placement !== "home" && placement !== "category" && placement !== "search")) {
      return res.status(400).json({ error: "Emplacement invalide." });
    }

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Identifiant produit requis." });
    }

    const clientIdentifier = deriveClientFingerprint(req, typeof sessionId === "string" ? sessionId : undefined);

    const result = await SponsoredCampaignService.recordAnalyticsEvent({
      campaignId,
      eventType,
      placement,
      productId,
      clientIdentifier,
    });

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur enregistrement événement.";
    const status = message.includes("introuvable") ? 404 : 400;
    return res.status(status).json({ error: message });
  }
});

export default router;
