import { Router, Response } from "express";
import { ArtisanServiceLayer } from "./artisan.service";
import { safeLogger } from "../../utils/logger";

export const artisanPublicRouter = Router();

/**
 * GET /api/v1/artisans
 */
artisanPublicRouter.get("/artisans", async (req, res: Response) => {
  try {
    const { tradeId, wilaya, commune, search, isAvailable, limit } = req.query;

    const artisans = await ArtisanServiceLayer.listApprovedArtisans({
      tradeId: tradeId ? String(tradeId) : undefined,
      wilaya: wilaya ? String(wilaya) : undefined,
      commune: commune ? String(commune) : undefined,
      search: search ? String(search) : undefined,
      isAvailable: isAvailable === "true" ? true : isAvailable === "false" ? false : undefined,
      limit: limit ? parseInt(String(limit), 10) : 50,
    });

    return res.json({ success: true, data: artisans });
  } catch (error) {
    safeLogger.error("[artisanPublicRouter] GET /artisans failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement des artisans" });
  }
});

/**
 * GET /api/v1/artisans/trades
 */
artisanPublicRouter.get("/artisans/trades", async (_req, res: Response) => {
  try {
    const trades = await ArtisanServiceLayer.getTrades();
    return res.json({ success: true, data: trades });
  } catch (error) {
    safeLogger.error("[artisanPublicRouter] GET /artisans/trades failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement des métiers" });
  }
});

/**
 * GET /api/v1/artisans/profile/:id
 */
artisanPublicRouter.get("/artisans/profile/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;
    const artisan = await ArtisanServiceLayer.getArtisanById(id, true);

    if (!artisan) {
      return res.status(404).json({ error: "Artisan introuvable" });
    }

    return res.json({ success: true, data: artisan });
  } catch (error) {
    safeLogger.error("[artisanPublicRouter] GET /artisans/profile/:id failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement du profil artisan" });
  }
});

/**
 * GET /api/v1/artisans/:id/reviews
 */
artisanPublicRouter.get("/artisans/:id/reviews", async (req, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await ArtisanServiceLayer.getArtisanReviews(id);
    return res.json({ success: true, data: reviews });
  } catch (error) {
    safeLogger.error("[artisanPublicRouter] GET /artisans/:id/reviews failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement des avis" });
  }
});
