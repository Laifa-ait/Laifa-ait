import { Router, Response } from "express";
import { ArtisanServiceLayer } from "./artisan.service";
import {
  authenticateToken,
  optionalAuthenticateToken,
  AuthenticatedRequest,
} from "../../middlewares/auth";
import { safeLogger } from "../../utils/logger";

export const artisanBroadcastRouter = Router();

/**
 * POST /api/v1/artisans/broadcasts
 * Client posts a job broadcast / recherche d'artisan
 */
artisanBroadcastRouter.post(
  "/artisans/broadcasts",
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid || "guest";
      const {
        tradeId,
        tradeName,
        categoryPreset,
        title,
        description,
        wilaya,
        wilayaCode,
        commune,
        address,
        urgency,
        estimatedBudget,
        clientName,
        clientPhone,
        clientEmail,
      } = req.body;

      if (!tradeId || !tradeName || !title || !description || !wilaya || !commune || !clientName || !clientPhone) {
        return res.status(400).json({
          error: "Veuillez fournir toutes les informations nécessaires (métier, titre, description, wilaya, nom, téléphone).",
        });
      }

      const cleanPhone = String(clientPhone).replace(/\s+/g, "");
      if (!/^(0[567][0-9]{8}|\+213[567][0-9]{8})$/.test(cleanPhone)) {
        return res.status(400).json({
          error: "Numéro de téléphone algérien invalide. Ex: 0550123456 ou 0660123456",
        });
      }

      const result = await ArtisanServiceLayer.createJobBroadcast(uid, {
        tradeId: String(tradeId).trim(),
        tradeName: String(tradeName).trim(),
        categoryPreset: categoryPreset ? String(categoryPreset).trim() : undefined,
        title: String(title).trim(),
        description: String(description).trim(),
        wilaya: String(wilaya).trim(),
        wilayaCode: wilayaCode ? String(wilayaCode).trim() : undefined,
        commune: String(commune).trim(),
        address: address ? String(address).trim() : undefined,
        urgency: urgency === "urgent" || urgency === "flexible" ? urgency : "standard",
        estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
        clientName: String(clientName).trim(),
        clientPhone: cleanPhone,
        clientEmail: clientEmail ? String(clientEmail).trim() : req.user?.email || undefined,
      });

      if (!result.success || !result.broadcast) {
        return res.status(500).json({ error: result.error || "Erreur lors de la publication de l'annonce" });
      }

      return res.status(201).json({
        success: true,
        data: result.broadcast,
        message: "Votre recherche d'artisan a été publiée avec succès.",
      });
    } catch (error) {
      safeLogger.error("[artisanBroadcastRouter] POST /broadcasts failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur serveur lors de la publication" });
    }
  }
);

/**
 * GET /api/v1/artisans/broadcasts
 * List open job broadcasts (filtered by category / wilaya)
 */
artisanBroadcastRouter.get(
  "/artisans/broadcasts",
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tradeId, wilaya, urgency, limit } = req.query;

      const broadcasts = await ArtisanServiceLayer.listJobBroadcasts({
        tradeId: tradeId ? String(tradeId) : undefined,
        wilaya: wilaya ? String(wilaya) : undefined,
        urgency: urgency ? String(urgency) : undefined,
        limit: limit ? parseInt(String(limit), 10) : 50,
      });

      return res.json({ success: true, data: broadcasts });
    } catch (error) {
      safeLogger.error("[artisanBroadcastRouter] GET /broadcasts failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement des annonces" });
    }
  }
);

/**
 * GET /api/v1/artisans/my-broadcasts
 * Client lists their own published broadcasts
 */
artisanBroadcastRouter.get(
  "/artisans/my-broadcasts",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

      const broadcasts = await ArtisanServiceLayer.getClientJobBroadcasts(uid);
      return res.json({ success: true, data: broadcasts });
    } catch (error) {
      safeLogger.error("[artisanBroadcastRouter] GET /my-broadcasts failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement de vos annonces" });
    }
  }
);

/**
 * PATCH /api/v1/artisans/broadcasts/:id/status
 */
artisanBroadcastRouter.patch(
  "/artisans/broadcasts/:id/status",
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !/^[a-zA-Z0-9_-]{3,128}$/.test(id)) {
        return res.status(400).json({ error: "Identifiant d'annonce invalide" });
      }

      if (!status || !["open", "contacted", "fulfilled", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }

      const result = await ArtisanServiceLayer.updateJobBroadcastStatus(id, status);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Impossible de mettre à jour le statut" });
      }

      return res.json({ success: true, message: "Statut mis à jour avec succès" });
    } catch (error) {
      safeLogger.error("[artisanBroadcastRouter] PATCH /broadcasts/:id/status failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
    }
  }
);
