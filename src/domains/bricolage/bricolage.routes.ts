import { Router, Request, Response } from "express";
import { authenticateToken, optionalAuthenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../middlewares/auth";
import { QuoteRequestPayload } from "../../types/bricolage";
import { safeLogger } from "../../utils/logger";
import { BricolageService } from "./services/bricolage.service";

export const bricolageRouter = Router();

// 1. Get Bricolage Categories & Services
bricolageRouter.get("/bricolage/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await BricolageService.getCategories();
    return res.json({ success: true, data: categories });
  } catch (error) {
    safeLogger.error("Error fetching bricolage categories", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors du chargement des catégories." });
  }
});

// 2. Get Verified Artisans Directory
bricolageRouter.get("/bricolage/artisans", async (req: Request, res: Response) => {
  const { wilaya, specialty } = req.query;
  try {
    const list = await BricolageService.getArtisans(
      wilaya ? String(wilaya) : undefined,
      specialty ? String(specialty) : undefined
    );
    return res.json({ success: true, data: list });
  } catch (error) {
    safeLogger.error("Error fetching artisans", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors du chargement des artisans." });
  }
});

// 3. Submit Project Quote Request (ACID Transaction)
bricolageRouter.post("/bricolage/quotes", optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const payload = req.body as QuoteRequestPayload;

  if (!payload.customerName || !payload.customerPhone || !payload.serviceCategoryId) {
    return res.status(400).json({ success: false, error: "Champs obligatoires manquants." });
  }

  const customerId = req.user?.uid || null;

  try {
    const result = await BricolageService.createQuoteRequest(payload, customerId);
    return res.json({ success: true, data: result });
  } catch (error) {
    safeLogger.error("Error saving quote request", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de l'enregistrement de la demande." });
  }
});

// 3.1 Get Bricolage Opportunities for Artisans (Secured DTO)
bricolageRouter.get("/bricolage/opportunities", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Authentification requise." });
  }

  const { wilaya, category } = req.query;

  try {
    const opportunities = await BricolageService.getOpportunities(
      req.user.uid,
      req.user.role,
      wilaya ? String(wilaya) : undefined,
      category ? String(category) : undefined
    );
    return res.json({ success: true, data: opportunities });
  } catch (error: unknown) {
    const customErr = error as { status?: number; message?: string };
    const statusCode = customErr?.status || 500;
    const msg = customErr?.message || "Erreur lors de la récupération des opportunités.";
    return res.status(statusCode).json({ success: false, error: msg });
  }
});

// 4. Submit Offer by Artisan
bricolageRouter.post("/bricolage/offers", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Authentification requise pour soumettre un devis." });
  }

  const { requestId, priceDZD, estimatedDuration, notes } = req.body;

  if (!requestId || !priceDZD || isNaN(Number(priceDZD)) || Number(priceDZD) <= 0) {
    return res.status(400).json({ success: false, error: "Informations de devis incomplètes ou prix invalide." });
  }

  try {
    const offerId = await BricolageService.submitOffer(
      req.user.uid,
      requestId,
      Number(priceDZD),
      estimatedDuration,
      notes,
      req.user.role,
      req.user.email
    );
    return res.json({
      success: true,
      data: { offerId, message: "Devis transmis directement au client." }
    });
  } catch (error: unknown) {
    const customErr = error as { status?: number; message?: string };
    const statusCode = customErr?.status || 500;
    const msg = customErr?.message || "Erreur lors de l'enregistrement du devis.";
    return res.status(statusCode).json({ success: false, error: msg });
  }
});

// 4.1 Accept Quote Offer by Customer Owner (ACID Transaction)
bricolageRouter.post("/bricolage/quotes/:id/accept-offer", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Authentification requise." });
  }

  const requestId = req.params.id;
  const { offerId } = req.body;

  if (!requestId || typeof requestId !== "string") {
    return res.status(400).json({ success: false, error: "Identifiant de demande invalide." });
  }

  if (!offerId || typeof offerId !== "string" || !offerId.trim()) {
    return res.status(400).json({ success: false, error: "L'identifiant du devis (offerId) est obligatoire." });
  }

  try {
    const acceptedOfferResult = await BricolageService.acceptOffer(requestId, offerId, req.user.uid);
    return res.json({
      success: true,
      data: {
        requestId,
        status: "accepted",
        acceptedOffer: acceptedOfferResult
      }
    });
  } catch (error: unknown) {
    const customErr = error as { status?: number; message?: string };
    const statusCode = customErr?.status || 500;
    const errorMessage = customErr?.message || "Erreur serveur lors de l'acceptation du devis.";
    return res.status(statusCode).json({ success: false, error: errorMessage });
  }
});

// 5. Unified Account Role Evolution: Upgrade Current Olmart Account to Artisan Pro Status
bricolageRouter.post("/bricolage/artisans/upgrade", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const payload = req.body;

  if (!payload.specialty || !payload.wilaya || !payload.phone) {
    return res.status(400).json({ success: false, error: "Informations de profil artisan incomplètes." });
  }

  try {
    const result = await BricolageService.upgradeToArtisan(req.user.uid, req.user.email || "", payload);
    return res.json({ success: true, data: result });
  } catch (error: unknown) {
    safeLogger.error("Error upgrading user to artisan", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors du passage au statut artisan." });
  }
});

// 5.1 Admin Endpoint: Get Pending Artisan Registration & Verification Requests
bricolageRouter.get("/bricolage/admin/artisans/pending", authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const pendingArtisans = await BricolageService.getPendingArtisans();
    return res.json({ success: true, data: pendingArtisans });
  } catch (error) {
    safeLogger.error("Error fetching pending artisan verifications", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors du chargement des demandes." });
  }
});

// 5.2 Admin Endpoint: Verify or Reject Artisan Documents & Grant Badge
bricolageRouter.post("/bricolage/admin/artisans/verify", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { artisanId, action, rejectionReason, docType } = req.body;

  if (!artisanId || !action || (action !== "approve" && action !== "reject")) {
    return res.status(400).json({ success: false, error: "Paramètres de vérification invalides (artisanId requis, action: \"approve\"|\"reject\")." });
  }

  try {
    const result = await BricolageService.verifyArtisan({ artisanId, action, rejectionReason, docType });
    return res.json(result);
  } catch (error) {
    safeLogger.error("Error in admin artisan verification", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors de la vérification de l'artisan." });
  }
});

// 6. Get Customer Reviews
bricolageRouter.get("/bricolage/reviews", async (_req: Request, res: Response) => {
  try {
    const reviews = await BricolageService.getReviews();
    return res.json({ success: true, data: reviews });
  } catch (error) {
    safeLogger.error("Error fetching reviews", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: "Erreur lors du chargement des avis." });
  }
});
