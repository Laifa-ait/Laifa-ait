import { Router, Response } from "express";
import { ArtisanServiceLayer } from "./artisan.service";
import {
  authenticateToken,
  authorizeAdmin,
  AuthenticatedRequest,
} from "../../middlewares/auth";
import { safeLogger } from "../../utils/logger";
import { ArtisanStatus } from "../../types/artisan";

export const artisanAdminRouter = Router();

// Secure all admin routes under /artisans/admin with authentication and strict server-side admin claims check
artisanAdminRouter.use("/artisans/admin", authenticateToken, authorizeAdmin);

/**
 * GET /api/v1/artisans/admin/all
 */
artisanAdminRouter.get("/artisans/admin/all", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, tradeId, wilaya, search, limit } = req.query;

    const artisans = await ArtisanServiceLayer.listAllArtisansForAdmin({
      status: status ? (String(status) as ArtisanStatus | "all") : "all",
      tradeId: tradeId ? String(tradeId) : undefined,
      wilaya: wilaya ? String(wilaya) : undefined,
      search: search ? String(search) : undefined,
      limit: limit ? parseInt(String(limit), 10) : 100,
    });

    return res.json({
      success: true,
      data: {
        artisans,
        total: artisans.length,
      },
    });
  } catch (error) {
    safeLogger.error("[artisanAdminRouter] GET /artisans/admin/all failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement des artisans (Admin)" });
  }
});

/**
 * PUT /api/v1/artisans/admin/:id/status
 */
artisanAdminRouter.put(
  "/artisans/admin/:id/status",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const adminUid = req.user?.uid || "admin";
      const adminEmail = req.user?.email || "admin@olmart.dz";

      if (!status) {
        return res.status(400).json({ error: "Le paramètre status est obligatoire" });
      }

      await ArtisanServiceLayer.updateArtisanStatus(
        id,
        status as ArtisanStatus,
        adminUid,
        adminEmail,
        reason
      );

      return res.json({
        success: true,
        message: `Statut de l'artisan mis à jour vers '${status}' avec succès.`,
      });
    } catch (error) {
      safeLogger.error("[artisanAdminRouter] PUT /artisans/admin/:id/status failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du changement de statut" });
    }
  }
);

/**
 * GET /api/v1/artisans/admin/stats
 */
artisanAdminRouter.get("/artisans/admin/stats", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await ArtisanServiceLayer.getAdminStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    safeLogger.error("[artisanAdminRouter] GET /artisans/admin/stats failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement des statistiques" });
  }
});

/**
 * POST /api/v1/artisans/admin/trades
 */
artisanAdminRouter.post(
  "/artisans/admin/trades",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const trade = req.body;
      if (!trade.name || !trade.slug) {
        return res.status(400).json({ error: "Nom et identifiant slug obligatoires" });
      }

      await ArtisanServiceLayer.saveTrade(trade);
      return res.status(201).json({ success: true, message: "Catégorie de métier enregistrée" });
    } catch (error) {
      safeLogger.error("[artisanAdminRouter] POST /artisans/admin/trades failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de l'enregistrement du métier" });
    }
  }
);

/**
 * DELETE /api/v1/artisans/admin/trades/:id
 */
artisanAdminRouter.delete(
  "/artisans/admin/trades/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await ArtisanServiceLayer.deleteTrade(id);
      return res.json({ success: true, message: "Catégorie supprimée" });
    } catch (error) {
      safeLogger.error("[artisanAdminRouter] DELETE /artisans/admin/trades/:id failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la suppression du métier" });
    }
  }
);

/**
 * GET /api/v1/artisans/admin/audit-logs
 */
artisanAdminRouter.get(
  "/artisans/admin/audit-logs",
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const logs = await ArtisanServiceLayer.getAuditLogs();
      return res.json({ success: true, data: logs });
    } catch (error) {
      safeLogger.error("[artisanAdminRouter] GET /artisans/admin/audit-logs failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement des logs d'audit" });
    }
  }
);
