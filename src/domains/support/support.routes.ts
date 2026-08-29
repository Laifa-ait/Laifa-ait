import { Router, Response } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../middlewares/auth";
import { safeLogger } from "../../utils/logger";
import { SupportService } from "./services/support.service";
import {
  SUPPORT_TICKETS_COLLECTION,
  BusinessError,
  type SupportAttachment,
  type SupportTicket,
  type SupportMessage,
  type CreateLegacyTicketDTO,
  type CreateTicketDTO,
  type PostMessageDTO,
  type UploadAttachmentDTO
} from "./types/support.types";
import { validateSecureFilePath } from "./utils/supportValidation";

const router = Router();

// Re-exports for backward-compatibility with tests and other modules
export {
  SUPPORT_TICKETS_COLLECTION,
  BusinessError,
  validateSecureFilePath
};
export type {
  SupportAttachment,
  SupportTicket,
  SupportMessage,
  CreateLegacyTicketDTO,
  CreateTicketDTO,
  PostMessageDTO,
  UploadAttachmentDTO
};

// POST support ticket (legacy / compatibility format)
router.post("/api/v1/support-tickets", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const id = await SupportService.createLegacyTicket(req.user.uid, req.body);
    return res.json({ id });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// GET support tickets
router.get("/api/v1/support/tickets", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const tickets = await SupportService.getUserTickets(req.user.uid);
    return res.json({ tickets });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// POST support ticket
router.post("/api/v1/support/tickets", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const result = await SupportService.createTicket(req.user.uid, req.body);
    return res.json(result);
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// GET messages of a support ticket
router.get("/api/v1/support/tickets/:ticketId/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { ticketId } = req.params;
    const messages = await SupportService.getTicketMessages(ticketId, req.user.uid, req.user.role);
    return res.json({ messages });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// POST message to support ticket
router.post("/api/v1/support/tickets/:ticketId/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { ticketId } = req.params;
    const result = await SupportService.postClientMessage(ticketId, req.user.uid, req.user.role, req.body);
    return res.json({ success: true, message: result });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// POST reopen support ticket (using secure atomic transaction)
router.post("/api/v1/support/tickets/:ticketId/reopen", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { ticketId } = req.params;
    await SupportService.reopenTicket(ticketId, req.user.uid, req.user.role);
    return res.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// POST upload attachment for support ticket (secure backend private upload)
router.post("/api/v1/support/tickets/:ticketId/upload", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const result = await SupportService.uploadAttachment(
      ticketId,
      req.user.uid,
      req.user.role,
      req.user.email || "inconnu",
      req.body
    );
    return res.json({
      success: true,
      ...result
    });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    safeLogger.error("Support upload error", { ticketId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur serveur lors de l'upload de la pièce jointe." });
  }
});

// GET download attachment for support ticket (secure streaming)
router.get("/api/v1/support/tickets/:ticketId/attachments/:attachmentId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId, attachmentId } = req.params;
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { fileStream, fileType, fileName, dispositionType } = await SupportService.getAttachmentStream(
      ticketId,
      attachmentId,
      req.user.uid,
      req.user.role
    );

    res.setHeader("Content-Type", fileType);
    res.setHeader("Content-Disposition", `${dispositionType}; filename="${encodeURIComponent(fileName)}"`);

    fileStream
      .on("error", (err) => {
        safeLogger.error("Stream error in support attachment", { ticketId, attachmentId, err: err instanceof Error ? err.message : String(err) });
        if (!res.headersSent) {
          res.status(500).json({ error: "Erreur de lecture du fichier" });
        }
      })
      .pipe(res);

  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    safeLogger.error("Attachment retrieval error", { ticketId, attachmentId, err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// GET admin support tickets (retrieve all support tickets for administration dashboard)
router.get("/api/v1/admin/support/tickets", authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await SupportService.getAdminTickets();
    return res.json({ success: true, tickets });
  } catch (error: unknown) {
    safeLogger.error("Error fetching admin support tickets", { err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// GET messages of support ticket for admin
router.get("/api/v1/admin/support/tickets/:ticketId/messages", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  try {
    const messages = await SupportService.getAdminTicketMessages(ticketId);
    return res.json({ success: true, messages });
  } catch (error: unknown) {
    safeLogger.error("Error fetching admin support messages", { ticketId, err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// POST message to support ticket as admin
router.post("/api/v1/admin/support/tickets/:ticketId/messages", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const result = await SupportService.postAdminTicketMessage(
      ticketId,
      req.user.uid,
      req.user.email || "inconnu",
      req.body
    );
    return res.json({ success: true, message: result });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    safeLogger.error("Error adding admin support message", { ticketId, err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// PUT update status of support ticket
router.put("/api/v1/admin/support/tickets/:ticketId/status", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    await SupportService.updateTicketStatus(ticketId, req.user.uid, req.user.email || "inconnu", status);
    return res.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    safeLogger.error("Error updating support status", { ticketId, newStatus: status, err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// PUT update priority of support ticket
router.put("/api/v1/admin/support/tickets/:ticketId/priority", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  const { priority } = req.body;
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    await SupportService.updateTicketPriority(ticketId, req.user.uid, req.user.email || "inconnu", priority);
    return res.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    safeLogger.error("Error updating support priority", { ticketId, newPriority: priority, err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

export default router;
