import { Router, Request, Response } from "express";
import { AuthenticatedRequest, authenticateToken, authorizeAdmin } from "../../middlewares/auth";
import {
  CreateEscrowSchema,
  ReleaseEscrowSchema,
  WithdrawalRequestSchema,
  ProcessPayoutSchema,
} from "./payment.validators";
import { EscrowService } from "./services/EscrowService";
import { WalletService } from "./services/WalletService";
import { WebhookService } from "./services/WebhookService";
import { safeLogger } from "../../utils/logger";

const router = Router();

/**
 * GET /api/v1/payment/escrow/order/:orderId
 * Get escrow status for a given order
 */
router.get("/escrow/order/:orderId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { orderId } = req.params;
    const escrow = await EscrowService.getEscrow(orderId);

    if (!escrow) {
      return res.status(404).json({ error: "Compte séquestre introuvable pour cette commande." });
    }

    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    if (!isAdmin && escrow.buyerId !== callerUid && escrow.sellerId !== callerUid) {
      return res.status(403).json({ error: "Accès refusé aux détails financiers de cette commande." });
    }

    return res.status(200).json({ success: true, data: escrow });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    safeLogger.error("Error fetching escrow", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * POST /api/v1/payment/escrow/hold
 * Create an escrow hold for an order
 */
router.post("/escrow/hold", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const parsed = CreateEscrowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Données de séquestre invalides", details: parsed.error.issues });
    }

    // Ensure the caller is either the buyer creating the order or an admin
    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    if (!isAdmin && parsed.data.buyerId !== callerUid) {
      return res.status(403).json({ error: "Impossible de créer un séquestre pour un autre utilisateur." });
    }

    const escrow = await EscrowService.holdEscrow(parsed.data);
    return res.status(201).json({ success: true, data: escrow });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "ESCROW_ALREADY_EXISTS") {
      return res.status(409).json({ error: "Un compte séquestre existe déjà pour cette commande." });
    }
    safeLogger.error("Error creating escrow", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * POST /api/v1/payment/escrow/release/:orderId
 * Confirm delivery and release escrow funds to the seller
 */
router.post("/escrow/release/:orderId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { orderId } = req.params;
    const parsed = ReleaseEscrowSchema.safeParse({ orderId, ...req.body });
    if (!parsed.success) {
      return res.status(400).json({ error: "Paramètres invalides", details: parsed.error.issues });
    }

    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    const updatedEscrow = await EscrowService.releaseEscrow(orderId, callerUid, isAdmin);

    return res.status(200).json({
      success: true,
      message: "Fonds libérés avec succès vers le portefeuille vendeur.",
      data: updatedEscrow,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "ESCROW_NOT_FOUND") {
      return res.status(404).json({ error: "Séquestre introuvable." });
    }
    if (message === "FORBIDDEN_ESCROW_RELEASE") {
      return res.status(403).json({ error: "Seul l'acheteur ou un administrateur peut valider la libération." });
    }
    if (message.startsWith("ESCROW_CANNOT_BE_RELEASED_STATUS_")) {
      return res.status(400).json({ error: `Impossible de libérer les fonds dans l'état actuel : ${message}` });
    }
    safeLogger.error("Error releasing escrow", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * GET /api/v1/payment/wallet/me
 * Get current seller's wallet balance
 */
router.get("/wallet/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const wallet = await WalletService.getSellerWallet(callerUid);
    return res.status(200).json({ success: true, data: wallet });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    safeLogger.error("Error fetching seller wallet", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * GET /api/v1/payment/wallet/transactions
 * List seller's wallet transactions
 */
router.get("/wallet/transactions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const transactions = await WalletService.listTransactions(callerUid, limit);

    return res.status(200).json({ success: true, data: transactions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    safeLogger.error("Error listing wallet transactions", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * POST /api/v1/payment/wallet/withdraw
 * Request payout from available wallet balance
 */
router.post("/wallet/withdraw", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const parsed = WithdrawalRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Demande de retrait invalide", details: parsed.error.issues });
    }

    const payout = await WalletService.requestPayout({
      sellerId: callerUid,
      amountDZD: parsed.data.amountDZD,
      method: parsed.data.method,
      accountDetails: parsed.data.accountDetails,
      accountHolderName: parsed.data.accountHolderName,
    });

    return res.status(201).json({
      success: true,
      message: "Demande de virement enregistrée avec succès.",
      data: payout,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "INSUFFICIENT_WALLET_BALANCE") {
      return res.status(400).json({ error: "Solde disponible insuffisant pour ce montant." });
    }
    if (message === "WALLET_NOT_FOUND") {
      return res.status(404).json({ error: "Portefeuille vendeur introuvable." });
    }
    safeLogger.error("Error requesting withdrawal", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * GET /api/v1/payment/admin/withdrawals
 * Admin: List all payout requests
 */
router.get("/admin/withdrawals", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const payouts = await WalletService.listPayouts(status);

    return res.status(200).json({ success: true, data: payouts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    safeLogger.error("Admin error listing payouts", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * POST /api/v1/payment/admin/withdrawals/:id/process
 * Admin: Process / Pay / Reject payout request
 */
router.post("/admin/withdrawals/:id/process", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = ProcessPayoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Données de traitement invalides", details: parsed.error.issues });
    }

    const updatedPayout = await WalletService.processPayout(id, parsed.data);
    return res.status(200).json({
      success: true,
      message: `Demande de retrait mise à jour : ${parsed.data.status}`,
      data: updatedPayout,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "PAYOUT_NOT_FOUND") {
      return res.status(404).json({ error: "Demande de retrait introuvable." });
    }
    if (message === "PAYOUT_ALREADY_FINALIZED") {
      return res.status(400).json({ error: "Cette demande a déjà été clôturée." });
    }
    safeLogger.error("Admin error processing payout", { err: message });
    return res.status(500).json({ error: `Erreur serveur : ${message}` });
  }
});

/**
 * POST /api/v1/payment/webhook/chargily
 * Webhook handler for Chargily Pay V2 (Edahabia / CIB)
 */
router.post("/webhook/chargily", async (req: Request, res: Response) => {
  try {
    const signature = (req.headers["x-chargily-signature"] || req.headers["signature"]) as string | undefined;
    const rawBody = JSON.stringify(req.body);

    const isValid = WebhookService.verifyChargilySignature(rawBody, signature);
    if (!isValid) {
      safeLogger.warn("[Webhook Payment] Rejected Chargily webhook: Invalid signature");
      return res.status(401).json({ error: "Signature de webhook invalide ou manquante." });
    }

    const result = await WebhookService.processChargilyEvent(req.body);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    safeLogger.error("[Webhook Payment] Error processing Chargily webhook", { err: message });
    return res.status(500).json({ error: "Erreur lors du traitement du webhook." });
  }
});

/**
 * POST /api/v1/payment/webhook/baridimob
 * Webhook handler for BaridiMob payment callbacks
 */
router.post("/webhook/baridimob", async (req: Request, res: Response) => {
  try {
    const signature = (req.headers["x-baridimob-signature"] || req.headers["x-signature"] || req.headers["signature"]) as string | undefined;
    const rawBody = JSON.stringify(req.body);

    const isValid = WebhookService.verifyBaridiMobSignature(rawBody, signature);
    if (!isValid) {
      safeLogger.warn("[Webhook Payment] Rejected BaridiMob webhook: Invalid signature");
      return res.status(401).json({ error: "Signature de webhook invalide ou manquante." });
    }

    const result = await WebhookService.processBaridiMobEvent(req.body);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    safeLogger.error("[Webhook Payment] Error processing BaridiMob webhook", { err: message });
    return res.status(500).json({ error: "Erreur lors du traitement du webhook." });
  }
});

export default router;
