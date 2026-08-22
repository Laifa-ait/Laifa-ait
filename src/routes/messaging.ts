import { Router, Response } from "express";
import { AuthenticatedRequest, authenticateToken } from "../middlewares/auth";
import { strictLimiter } from "../middlewares/rateLimiters";
import {
  CreateNegotiationSchema,
  InitiateConversationSchema,
  ReportMessageSchema,
  ResolveNegotiationSchema,
  SendMessageSchema
} from "../schemas/messaging";
import { MessagingService } from "../domains/messaging/services/MessagingService";
import { NegotiationService } from "../domains/messaging/services/NegotiationService";

const router = Router();

// Apply strict rate limiting on message and negotiation routes
router.use(strictLimiter);

/**
 * GET /api/v1/messaging/conversations
 * List all conversations for the authenticated user
 */
router.get("/conversations", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const before = typeof req.query.before === "string" ? req.query.before : undefined;
    const isArchived = req.query.isArchived === "true";

    const result = await MessagingService.listConversations(callerUid, { limit, before, isArchived });
    return res.status(200).json({
      success: true,
      data: result.conversations,
      hasMore: result.hasMore
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `Erreur lors de la récupération des conversations : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/conversations/initiate
 * Initiate a new conversation with context verification
 */
router.post("/conversations/initiate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const parsed = InitiateConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Données de conversation invalides",
        details: parsed.error.issues
      });
    }

    const result = await MessagingService.initiateConversation(callerUid, parsed.data);
    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (
      errorMsg === "PROPERTY_NOT_FOUND" ||
      errorMsg === "ORDER_NOT_FOUND" ||
      errorMsg === "PRODUCT_NOT_FOUND" ||
      errorMsg === "QUOTE_REQUEST_NOT_FOUND"
    ) {
      return res.status(404).json({ error: "Ressource de contexte introuvable." });
    }

    if (
      errorMsg === "SELF_CONVERSATION_FORBIDDEN" ||
      errorMsg === "FORBIDDEN_NOT_ORDER_PARTICIPANT" ||
      errorMsg === "FORBIDDEN_NOT_QUOTE_PARTICIPANT"
    ) {
      return res.status(403).json({ error: "Action non autorisée sur cette ressource." });
    }

    if (
      errorMsg === "PROPERTY_ID_REQUIRED" ||
      errorMsg === "ORDER_ID_REQUIRED" ||
      errorMsg === "PRODUCT_ID_REQUIRED" ||
      errorMsg === "QUOTE_REQUEST_ID_REQUIRED"
    ) {
      return res.status(400).json({ error: errorMsg });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * GET /api/v1/messaging/conversations/:id/messages
 * List messages in a conversation
 */
router.get("/conversations/:id/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const conversationId = req.params.id;
    if (!conversationId) {
      return res.status(400).json({ error: "Identifiant de conversation requis" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const before = typeof req.query.before === "string" ? req.query.before : undefined;
    const isAdminUser = req.user?.role === "admin" || req.user?.role === "superadmin";

    const result = await MessagingService.listMessages(callerUid, conversationId, { limit, before }, isAdminUser);
    return res.status(200).json({
      success: true,
      data: result.messages,
      hasMore: result.hasMore
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (errorMsg === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ error: "Conversation introuvable." });
    }
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant de cette conversation." });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/messages
 * Send a message in an existing conversation
 */
router.post("/conversations/:id/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const conversationId = req.params.id;
    if (!conversationId) {
      return res.status(400).json({ error: "Identifiant de conversation requis" });
    }

    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Message invalide",
        details: parsed.error.issues
      });
    }

    const message = await MessagingService.sendMessage(callerUid, conversationId, parsed.data);
    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (errorMsg === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ error: "Conversation introuvable." });
    }
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant." });
    }
    if (errorMsg === "CONVERSATION_BLOCKED" || errorMsg === "CONVERSATION_ARCHIVED") {
      return res.status(400).json({ error: "Impossible d'envoyer un message dans une conversation bloquée ou archivée." });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/negotiate
 * Create a new negotiation offer
 */
router.post("/conversations/:id/negotiate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const conversationId = req.params.id;
    if (!conversationId) {
      return res.status(400).json({ error: "Identifiant de conversation requis" });
    }

    const parsed = CreateNegotiationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Offre de négociation invalide",
        details: parsed.error.issues
      });
    }

    const offer = await NegotiationService.createOffer({
      callerUid,
      conversationId,
      amountDZD: parsed.data.amountDZD,
      terms: parsed.data.terms
    });

    return res.status(201).json({
      success: true,
      data: offer
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (errorMsg === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ error: "Conversation introuvable." });
    }
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant." });
    }
    if (errorMsg === "ACTIVE_OFFER_ALREADY_EXISTS") {
      return res.status(400).json({ error: "Une offre de négociation est déjà active sur cette conversation." });
    }
    if (errorMsg === "CONVERSATION_BLOCKED" || errorMsg === "CONVERSATION_ARCHIVED") {
      return res.status(400).json({ error: "Négociation impossible dans une conversation bloquée ou archivée." });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/negotiate/resolve
 * Resolve or counter an active negotiation offer
 */
router.post("/conversations/:id/negotiate/resolve", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const conversationId = req.params.id;
    if (!conversationId) {
      return res.status(400).json({ error: "Identifiant de conversation requis" });
    }

    const parsed = ResolveNegotiationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Résolution d'offre invalide",
        details: parsed.error.issues
      });
    }

    const offer = await NegotiationService.resolveOffer({
      callerUid,
      conversationId,
      payload: parsed.data
    });

    return res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (errorMsg === "CONVERSATION_NOT_FOUND" || errorMsg === "OFFER_NOT_FOUND_OR_MISMATCH") {
      return res.status(404).json({ error: "Offre ou conversation introuvable." });
    }
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT" || errorMsg === "UNAUTHORIZED_OFFER_RESOLUTION") {
      return res.status(403).json({ error: "Action non autorisée : seul le destinataire de l'offre peut y répondre." });
    }
    if (errorMsg === "OFFER_EXPIRED") {
      return res.status(400).json({ error: "Cette offre a expiré." });
    }
    if (errorMsg.startsWith("CANNOT_TRANSITION_FROM_")) {
      return res.status(400).json({ error: `Transition impossible pour cette offre (${errorMsg}).` });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/negotiate/cancel
 * Cancel a pending offer by the proposer
 */
router.post("/conversations/:id/negotiate/cancel", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const conversationId = req.params.id;
    const offerId = req.body?.offerId;
    if (!conversationId || typeof offerId !== "string" || !offerId) {
      return res.status(400).json({ error: "Identifiants de conversation et d'offre requis" });
    }

    const offer = await NegotiationService.cancelOffer(callerUid, conversationId, offerId);
    return res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (errorMsg === "CONVERSATION_NOT_FOUND" || errorMsg === "OFFER_NOT_FOUND_OR_MISMATCH") {
      return res.status(404).json({ error: "Offre ou conversation introuvable." });
    }
    if (errorMsg === "UNAUTHORIZED_OFFER_CANCELLATION") {
      return res.status(403).json({ error: "Seul l'émetteur de l'offre peut l'annuler." });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/block
 * Block a conversation
 */
router.post("/conversations/:id/block", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const conversationId = req.params.id;
    if (!conversationId) {
      return res.status(400).json({ error: "Identifiant de conversation requis" });
    }

    await MessagingService.blockConversation(callerUid, conversationId);
    return res.status(200).json({
      success: true,
      message: "Conversation bloquée avec succès."
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (errorMsg === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ error: "Conversation introuvable." });
    }
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") {
      return res.status(403).json({ error: "Accès refusé." });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/read
 * Mark conversation as read
 */
router.post("/conversations/:id/read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const conversationId = req.params.id;
    if (!conversationId) {
      return res.status(400).json({ error: "Identifiant de conversation requis" });
    }

    await MessagingService.markConversationRead(callerUid, conversationId);
    return res.status(200).json({
      success: true,
      message: "Conversation marquée comme lue."
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (errorMsg === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ error: "Conversation introuvable." });
    }
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") {
      return res.status(403).json({ error: "Accès refusé." });
    }

    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

/**
 * POST /api/v1/messaging/messages/:id/report
 * Report a message for moderation
 */
router.post("/messages/:id/report", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const messageId = req.params.id;
    if (!messageId) {
      return res.status(400).json({ error: "Identifiant de message requis" });
    }

    const parsed = ReportMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Signalement invalide",
        details: parsed.error.issues
      });
    }

    await MessagingService.reportMessage(callerUid, messageId, parsed.data.reason, parsed.data.description);
    return res.status(200).json({
      success: true,
      message: "Message signalé avec succès à l'équipe de modération."
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `Erreur serveur : ${errorMsg}` });
  }
});

export default router;
