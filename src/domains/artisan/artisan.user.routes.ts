import { Router, Response } from "express";
import { ArtisanServiceLayer } from "./artisan.service";
import {
  authenticateToken,
  optionalAuthenticateToken,
  AuthenticatedRequest,
} from "../../middlewares/auth";
import { safeLogger } from "../../utils/logger";

export const artisanUserRouter = Router();

/**
 * POST /api/v1/artisans/apply
 */
artisanUserRouter.post(
  "/artisans/apply",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";

      if (!uid) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      const {
        fullName,
        professionalName,
        phone,
        whatsapp,
        bio,
        tradeId,
        tradeName,
        specialties,
        yearsOfExperience,
        wilaya,
        wilayaCode,
        commune,
        serviceArea,
        address,
        documents,
      } = req.body;

      if (!fullName || !phone || !tradeId || !tradeName || !wilaya || !commune) {
        return res.status(400).json({
          error: "Veuillez remplir tous les champs obligatoires (nom, téléphone, métier, wilaya, commune).",
        });
      }

      const result = await ArtisanServiceLayer.applyArtisan(uid, email, {
        fullName,
        professionalName,
        phone,
        whatsapp,
        bio: bio || "",
        tradeId,
        tradeName,
        specialties: Array.isArray(specialties) ? specialties : [],
        yearsOfExperience: parseInt(String(yearsOfExperience || 1), 10),
        wilaya,
        wilayaCode: String(wilayaCode || "16"),
        commune,
        serviceArea: Array.isArray(serviceArea) ? serviceArea : [commune],
        address: address || "",
        documents: Array.isArray(documents) ? documents : [],
      });

      return res.status(201).json({
        success: true,
        data: result,
        message: "Votre candidature d'artisan a été soumise avec succès.",
      });
    } catch (error) {
      safeLogger.error("[artisanUserRouter] POST /artisans/apply failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erreur lors de la soumission de la candidature",
      });
    }
  }
);

/**
 * GET /api/v1/artisans/me
 */
artisanUserRouter.get(
  "/artisans/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

      const profile = await ArtisanServiceLayer.getArtisanByUserId(uid);
      return res.json({ success: true, data: profile });
    } catch (error) {
      safeLogger.error("[artisanUserRouter] GET /artisans/me failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement de votre profil artisan" });
    }
  }
);

/**
 * PUT /api/v1/artisans/profile
 */
artisanUserRouter.put(
  "/artisans/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

      const profile = await ArtisanServiceLayer.getArtisanByUserId(uid);
      if (!profile) {
        return res.status(404).json({ error: "Aucun profil artisan associé à ce compte." });
      }

      await ArtisanServiceLayer.updateArtisanProfile(profile.id, uid, req.body);
      const updated = await ArtisanServiceLayer.getArtisanById(profile.id);

      return res.json({
        success: true,
        data: updated,
        message: "Profil mis à jour avec succès",
      });
    } catch (error) {
      safeLogger.error("[artisanUserRouter] PUT /artisans/profile failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
    }
  }
);

/**
 * POST /api/v1/artisans/quote-request & /api/v1/artisans/requests (Client submits quote request)
 */
const handleQuoteRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientId = req.user?.uid || "";
    const clientEmail = req.user?.email || req.body.clientEmail || "";
    const {
      artisanId,
      clientName,
      clientPhone,
      tradeId,
      serviceTitle,
      title,
      description,
      wilaya,
      commune,
      address,
      urgency,
      preferredDate,
      estimatedBudget,
    } = req.body;

    if (!artisanId || !clientName || !clientPhone || !wilaya || !commune || !description) {
      return res.status(400).json({
        error: "Veuillez fournir toutes les informations requises (artisan, nom, téléphone, wilaya, commune, description).",
      });
    }

    const result = await ArtisanServiceLayer.submitQuoteRequest(clientId, clientEmail, {
      artisanId,
      clientName,
      clientPhone,
      tradeId: tradeId || "",
      serviceTitle,
      title: title || `Demande pour ${serviceTitle || "Prestation"}`,
      description,
      wilaya,
      commune,
      address,
      urgency: urgency || "standard",
      preferredDate,
      estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error || "Impossible d'enregistrer la demande" });
    }

    return res.status(201).json({
      success: true,
      data: result.request,
      message: "Votre demande de devis a été transmise à l'artisan avec succès.",
    });
  } catch (error) {
    safeLogger.error("[artisanUserRouter] POST /artisans/requests failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors de la création de la demande de devis" });
  }
};

artisanUserRouter.post("/artisans/quote-request", optionalAuthenticateToken, handleQuoteRequest);
artisanUserRouter.post("/artisans/requests", optionalAuthenticateToken, handleQuoteRequest);

/**
 * GET /api/v1/artisans/my-requests (Client lists their submitted quote requests)
 */
artisanUserRouter.get(
  "/artisans/my-requests",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

      const requests = await ArtisanServiceLayer.getClientQuoteRequests(uid);
      return res.json({ success: true, data: requests });
    } catch (error) {
      safeLogger.error("[artisanUserRouter] GET /artisans/my-requests failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors du chargement de vos demandes de devis" });
    }
  }
);

/**
 * GET /api/v1/artisans/me/requests & /api/v1/artisans/quotes/my-quotes (Artisan lists received requests)
 */
const handleGetArtisanRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const requests = await ArtisanServiceLayer.getArtisanQuoteRequests(uid);
    return res.json({ success: true, data: requests });
  } catch (error) {
    safeLogger.error("[artisanUserRouter] GET artisan requests failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors du chargement des demandes" });
  }
};

artisanUserRouter.get("/artisans/me/requests", authenticateToken, handleGetArtisanRequests);
artisanUserRouter.get("/artisans/quotes/my-quotes", authenticateToken, handleGetArtisanRequests);

/**
 * PUT /api/v1/artisans/me/requests/:id/status & PUT /api/v1/artisans/quotes/:id/status (Artisan updates request status)
 */
const handleUpdateRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;
    const { status, artisanResponse } = req.body;

    if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const result = await ArtisanServiceLayer.updateQuoteRequestStatus(uid, id, status, artisanResponse);
    if (!result.success) {
      return res.status(400).json({ error: result.error || "Impossible de mettre à jour la demande" });
    }

    return res.json({ success: true, message: "Demande mise à jour avec succès" });
  } catch (error) {
    safeLogger.error("[artisanUserRouter] update quote status failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Erreur lors de la mise à jour de la demande" });
  }
};

artisanUserRouter.put("/artisans/me/requests/:id/status", authenticateToken, handleUpdateRequestStatus);
artisanUserRouter.put("/artisans/quotes/:id/status", authenticateToken, handleUpdateRequestStatus);

/**
 * POST /api/v1/artisans/:id/reviews
 */
artisanUserRouter.post(
  "/artisans/:id/reviews",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      const { id } = req.params;
      const { rating, comment, userName } = req.body;

      if (!uid) return res.status(401).json({ error: "Utilisateur non authentifié" });
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "La note doit être comprise entre 1 et 5." });
      }

      const review = await ArtisanServiceLayer.addReview({
        artisanId: id,
        userId: uid,
        userName: userName || req.user?.name || "Client vérifié",
        rating: Number(rating),
        comment: comment || "",
      });

      return res.status(201).json({
        success: true,
        data: review,
        message: "Votre avis a été publié avec succès.",
      });
    } catch (error) {
      safeLogger.error("[artisanUserRouter] POST /artisans/:id/reviews failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erreur lors de la publication de l'avis" });
    }
  }
);
