import { Router, Response } from "express";
import { db, admin } from "../config/firebase-admin";
import { authenticateToken, authorizeAdmin } from "../middlewares/auth";
import type { AuthenticatedRequest } from "./core";
import { validateFileContent } from "../utils/fileSignatureValidator";
import { safeLogger } from "../utils/logger";

const router = Router();

export const SUPPORT_TICKETS_COLLECTION = "supportTickets";

export class BusinessError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

export interface SupportAttachment {
  ticketId: string;
  filePath: string;
  fileName?: string;
  fileType?: string;
  userId?: string;
  createdAt?: string;
}

export function validateSecureFilePath(filePath: string, ticketId: string, attachmentId: string): boolean {
  if (!filePath) return false;
  
  const expectedPrefix = `support/${ticketId}/${attachmentId}/`;
  if (!filePath.startsWith(expectedPrefix)) return false;

  if (
    filePath.includes("..") ||
    filePath.includes("\\") ||
    filePath.startsWith("/") ||
    /* eslint-disable-next-line no-control-regex */
    /[\x00-\x1F\x7F]/.test(filePath)
  ) {
    return false;
  }
  return true;
}

// POST support ticket (legacy / compatibility format)
router.post("/api/v1/support-tickets", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { name, email, requestType, message } = req.body;
    if (!name || !email || !requestType || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ticketData = {
      userId: req.user.uid,
      name,
      email,
      requestType,
      message,
      status: "open",
      priority: requestType === "order_issue" ? "high" : "medium",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(SUPPORT_TICKETS_COLLECTION).add(ticketData);
    return res.json({ id: docRef.id });
  } catch (error: unknown) {
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
    const uid = req.user.uid;
    const snap = await db.collection(SUPPORT_TICKETS_COLLECTION)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    const tickets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ tickets });
  } catch (error: unknown) {
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
    const uid = req.user.uid;
    const { subject, priority, userName } = req.body;
    if (!subject) {
      return res.status(400).json({ error: "Sujet requis" });
    }
    const ticketData = {
      userId: uid,
      userName: userName || "Client",
      subject,
      priority: priority || "medium",
      status: "open",
      lastMessage: "Ticket créé",
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    };
    const docRef = await db.collection(SUPPORT_TICKETS_COLLECTION).add(ticketData);
    return res.json({ id: docRef.id, ...ticketData });
  } catch (error: unknown) {
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
    
    const ticketDoc = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!ticketDoc.exists) {
      return res.status(404).json({ error: "Ticket de support introuvable" });
    }
    
    const ticket = ticketDoc.data() as { userId?: string };
    const userRole = req.user.role;
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    
    if (!isAdmin && ticket.userId !== req.user.uid) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const snap = await db.collection("supportMessages")
      .where("ticketId", "==", ticketId)
      .orderBy("createdAt", "asc")
      .get();
    const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ messages });
  } catch (error: unknown) {
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
    const uid = req.user.uid;
    const { ticketId } = req.params;
    const { text, attachmentId } = req.body;

    // Strict validation
    if (text !== undefined && typeof text !== "string") {
      return res.status(400).json({ error: "Le texte du message doit être une chaîne de caractères." });
    }
    if (text && text.length > 10000) {
      return res.status(400).json({ error: "Le texte du message dépasse la longueur maximale de 10000 caractères." });
    }

    if (attachmentId !== undefined) {
      if (typeof attachmentId !== "string" || attachmentId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(attachmentId)) {
        return res.status(400).json({ error: "Format d'attachmentId invalide" });
      }
    }

    if (!text && !attachmentId) {
      return res.status(400).json({ error: "Le contenu du message ou une pièce jointe est requis." });
    }

    const userRole = req.user.role;
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    // 1. First retrieve ticket from SUPPORT_TICKETS_COLLECTION
    const preTicketSnap = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!preTicketSnap.exists) {
      return res.status(404).json({ error: "Ticket de support introuvable" });
    }

    // 2. Verify authorization for the parent ticket
    const preTicket = preTicketSnap.data() as { userId?: string };
    if (!isAdmin && preTicket.userId !== uid) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // 3. ONLY AFTER ticket authorization: Pre-transaction snapshot of attachment (anti-TOCTOU)
    let preAttachmentSnapshot: SupportAttachment | null = null;
    if (attachmentId) {
      const preSnap = await db.collection("supportAttachments").doc(attachmentId).get();
      if (!preSnap.exists) {
        return res.status(404).json({ error: "Pièce jointe introuvable" });
      }
      preAttachmentSnapshot = preSnap.data() as SupportAttachment;
      if (preAttachmentSnapshot.ticketId !== ticketId) {
        return res.status(400).json({ error: "La pièce jointe n'appartient pas à ce ticket" });
      }
      if (!validateSecureFilePath(preAttachmentSnapshot.filePath, ticketId, attachmentId)) {
        return res.status(403).json({ error: "Chemin d'accès non autorisé ou corrompu" });
      }
      if (!preAttachmentSnapshot.fileName || !preAttachmentSnapshot.fileType) {
        return res.status(400).json({ error: "Métadonnées de pièce jointe incomplètes" });
      }
    }

    // Anti-tampering: Server-generated fields
    const messageRef = db.collection("supportMessages").doc();
    let finalMessagePayload: Record<string, unknown> = {};

    await db.runTransaction(async (transaction) => {
      // ==========================================
      // PHASE 1 — READS (Must precede any writes)
      // ==========================================
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable");
      }

      const ticket = ticketSnap.data() as { userId?: string };
      if (!isAdmin && ticket.userId !== uid) {
        throw new BusinessError(403, "Accès non autorisé");
      }

      let attachmentInfo: {
        attachmentId?: string;
        fileUrl?: string;
        fileName?: string;
        fileType?: string;
        filePath?: string;
      } = {};

      if (attachmentId) {
        const attachRef = db.collection("supportAttachments").doc(attachmentId);
        const attachmentSnap = await transaction.get(attachRef);
        if (!attachmentSnap.exists) {
          throw new BusinessError(404, "Pièce jointe introuvable");
        }
        const snapData = attachmentSnap.data() as SupportAttachment;
        if (snapData.ticketId !== ticketId) {
          throw new BusinessError(400, "La pièce jointe n'appartient pas à ce ticket");
        }
        if (!validateSecureFilePath(snapData.filePath, ticketId, attachmentId)) {
          throw new BusinessError(403, "Chemin d'accès non autorisé ou corrompu");
        }
        if (!snapData.fileName || !snapData.fileType) {
          throw new BusinessError(400, "Métadonnées de pièce jointe incomplètes");
        }

        // Anti-TOCTOU validation: verify that critical fields did not mutate
        if (preAttachmentSnapshot) {
          if (
            snapData.ticketId !== preAttachmentSnapshot.ticketId ||
            snapData.filePath !== preAttachmentSnapshot.filePath ||
            snapData.fileName !== preAttachmentSnapshot.fileName ||
            snapData.fileType !== preAttachmentSnapshot.fileType
          ) {
            throw new BusinessError(409, "Modification concurrente des métadonnées détectée (TOCTOU)");
          }
        }

        // Storage existence verification: verify physical file exists in bucket
        const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
        const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
        const file = bucket.file(snapData.filePath);
        const [fileExists] = await file.exists();
        if (!fileExists) {
          throw new BusinessError(404, "Fichier physique introuvable dans Cloud Storage");
        }

        // Utilize the attachment data reread inside the transaction to build the message payload
        attachmentInfo = {
          attachmentId,
          fileUrl: `/api/v1/support/tickets/${ticketId}/attachments/${attachmentId}`,
          fileName: snapData.fileName,
          fileType: snapData.fileType,
          filePath: snapData.filePath
        };
      }

      // ==========================================
      // PHASE 2 — WRITES
      // ==========================================
      const messageData: Record<string, unknown> = {
        ticketId,
        userId: uid,
        text: text || "",
        sender: "client", // Anti-tampering: Client message sender must be "client"
        createdAt: new Date().toISOString(),
        ...attachmentInfo
      };

      transaction.create(messageRef, messageData);

      transaction.update(ticketRef, {
        lastMessage: attachmentId ? "Pièce jointe envoyée" : (text || ""),
        lastMessageAt: new Date().toISOString()
      });

      finalMessagePayload = messageData;
    });

    return res.json({ success: true, message: { id: messageRef.id, ...finalMessagePayload } });
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
    const uid = req.user.uid;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    const { ticketId } = req.params;
    
    await db.runTransaction(async (transaction) => {
      // ==========================================
      // PHASE 1 — READS (Must precede any writes)
      // ==========================================
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable");
      }
      
      const ticket = ticketSnap.data() as { userId?: string; status?: string };
      
      if (!isAdmin && ticket.userId !== uid) {
        throw new BusinessError(403, "Accès non autorisé");
      }
      
      if (ticket.status === "open") {
        throw new BusinessError(400, "Le ticket est déjà ouvert");
      }
      
      // ==========================================
      // PHASE 2 — WRITES
      // ==========================================
      transaction.update(ticketRef, {
        status: "open",
        lastMessage: "Ticket ré-ouvert par l'utilisateur",
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const messageRef = db.collection("supportMessages").doc();
      transaction.create(messageRef, {
        ticketId,
        userId: uid,
        text: "⚠️ J'ai ré-ouvert ce ticket. Mon problème n'est pas tout à fait résolu.",
        sender: "client",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // HTTP response triggered only after success of the entire transaction
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
    const { fileName, mimeType, base64Data } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({ error: "Champs requis manquants: fileName, mimeType" });
    }

    const MAX_SUPPORT_ATTACHMENT_BYTES = 1048576; // 1 Mo

    // 1. Vérifier que base64Data est une string
    if (typeof base64Data !== "string") {
      return res.status(400).json({ error: "base64Data doit être une chaîne de caractères." });
    }

    // 2. Refuser une chaîne vide
    if (!base64Data || base64Data.trim() === "") {
      return res.status(400).json({ error: "base64Data ne peut pas être vide." });
    }

    // 3. Refuser une chaîne dépassant la limite maximale raisonnable
    const maxBase64Length = Math.ceil((MAX_SUPPORT_ATTACHMENT_BYTES * 4) / 3) + 4;
    if (base64Data.length > maxBase64Length) {
      return res.status(400).json({ error: "La taille estimée du fichier dépasse la limite autorisée de 1 Mo." });
    }

    // 4. Vérifier le format Base64 (regex format check)
    const cleanBase64 = base64Data.replace(/\s/g, "");
    const base64Regex = /^[a-zA-Z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanBase64)) {
      return res.status(400).json({ error: "Format Base64 invalide." });
    }

    // 5. Décoder
    const buffer = Buffer.from(cleanBase64, "base64");

    // 6. Vérifier la taille réelle du Buffer après décodage
    if (buffer.length === 0) {
      return res.status(400).json({ error: "Le fichier décodé est vide." });
    }
    if (buffer.length > MAX_SUPPORT_ATTACHMENT_BYTES) {
      return res.status(400).json({ error: "La taille réelle du fichier dépasse la limite autorisée de 1 Mo." });
    }

    // Valider le type MIME contre une liste blanche sécurisée
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/zip",
      "text/plain",
      "text/csv"
    ];
    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Type de fichier non supporté. Seuls les images, PDF, CSV, TXT et ZIP sont acceptés." });
    }

    // 7. Vérifier les magic bytes via validateFileContent
    const validation = validateFileContent(buffer, fileName, mimeType);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error || "Le contenu du fichier ne correspond pas au format déclaré." });
    }

    // Récupérer le ticket de support pour vérifier l'existence et l'accès
    const ticketDoc = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!ticketDoc.exists) {
      return res.status(404).json({ error: "Ticket de support introuvable." });
    }

    const ticket = ticketDoc.data() as { userId?: string };

    // Contrôle IDOR : L'utilisateur doit être admin ou être le propriétaire du ticket
    const userRole = req.user.role;
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    if (!isAdmin && ticket.userId !== req.user.uid) {
      return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas autorisé à uploader pour ce ticket." });
    }

    // Sanitize file name
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    // Generate attachmentId first for deterministic path
    const attachRef = db.collection("supportAttachments").doc();
    const attachmentId = attachRef.id;

    // Server-generated structured path
    const uniquePath = `support/${ticketId}/${attachmentId}/${sanitizedName}`;

    // Obtenir le bucket de stockage
    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();

    // 9. Ne stocker le fichier qu'après toutes les validations
    const fileUpload = bucket.file(uniquePath);
    let uploadedFile = false;

    try {
      await fileUpload.save(buffer, {
        metadata: { contentType: mimeType }
      });
      uploadedFile = true;

      // Enregistrer l'attachment dans Firestore
      await attachRef.set({
        ticketId,
        filePath: uniquePath,
        fileName: sanitizedName,
        fileType: mimeType,
        userId: req.user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (writeError) {
      if (uploadedFile) {
        try {
          await fileUpload.delete();
        } catch (cleanupError) {
          safeLogger.error("Storage cleanup failed", { err: cleanupError instanceof Error ? cleanupError.message : String(cleanupError) });
        }
      }
      throw writeError;
    }

    const fileUrl = `/api/v1/support/tickets/${ticketId}/attachments/${attachmentId}`;

    // Journalisation d'audit
    await db.collection("adminActions").add({
      action: "support-file-upload",
      uid: req.user.uid,
      email: req.user.email || "inconnu",
      ticketId,
      fileName: sanitizedName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "success"
    });

    safeLogger.info("File uploaded successfully to support ticket", { ticketId, filePath: uniquePath });

    return res.json({
      success: true,
      fileUrl,
      attachmentId,
      fileName: sanitizedName,
      fileType: mimeType
    });
  } catch (error: unknown) {
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

    // 1. Récupérer le ticket
    const ticketDoc = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!ticketDoc.exists) {
      return res.status(404).json({ error: "Ticket de support introuvable" });
    }

    const ticket = ticketDoc.data() as { userId?: string };
    const userRole = req.user.role;
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    // 2. Contrôle IDOR : L'utilisateur doit être admin ou être le propriétaire du ticket
    if (!isAdmin && ticket.userId !== req.user.uid) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // 3. Récupérer l'attachment
    const attachDoc = await db.collection("supportAttachments").doc(attachmentId).get();
    if (!attachDoc.exists) {
      return res.status(404).json({ error: "Pièce jointe introuvable" });
    }

    const attachment = attachDoc.data() as { ticketId?: string; filePath?: string; fileName?: string; fileType?: string };

    // 4. Vérifier la cohérence de l'attachment
    if (attachment.ticketId !== ticketId) {
      return res.status(400).json({ error: "La pièce jointe n'appartient pas à ce ticket" });
    }

    const filePath = attachment.filePath;
    if (!filePath) {
      return res.status(404).json({ error: "Chemin du fichier manquant" });
    }

    // Defensive path validation & isolation check
    if (!validateSecureFilePath(filePath, ticketId, attachmentId)) {
      return res.status(403).json({ error: "Chemin d'accès non autorisé ou corrompu" });
    }

    // 5. Streamer le fichier
    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
    const file = bucket.file(filePath);

    const [fileExists] = await file.exists();
    if (!fileExists) {
      return res.status(404).json({ error: "Fichier physique introuvable" });
    }

    // Whitelist inline only for safe image formats, force attachment for others
    const inlineMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const dispositionType = inlineMimeTypes.includes(attachment.fileType || "") ? "inline" : "attachment";

    const rawFileName = attachment.fileName || "file";
    const sanitizedHeaderFileName = rawFileName.replace(/[\r\n";\\]/g, "_");

    res.setHeader("Content-Type", attachment.fileType || "application/octet-stream");
    res.setHeader("Content-Disposition", `${dispositionType}; filename="${encodeURIComponent(sanitizedHeaderFileName)}"`);

    file.createReadStream()
      .on("error", (err) => {
        safeLogger.error("Stream error in support attachment", { ticketId, attachmentId, err: err instanceof Error ? err.message : String(err) });
        if (!res.headersSent) {
          res.status(500).json({ error: "Erreur de lecture du fichier" });
        }
      })
      .pipe(res);

  } catch (error: unknown) {
    safeLogger.error("Attachment retrieval error", { ticketId, attachmentId, err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// GET admin support tickets (retrieve all support tickets for administration dashboard)
router.get("/api/v1/admin/support/tickets", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection(SUPPORT_TICKETS_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    const tickets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const snap = await db.collection("supportMessages")
      .where("ticketId", "==", ticketId)
      .orderBy("createdAt", "asc")
      .get();
    const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const uid = req.user.uid;
    const { text, attachmentId, isInternal } = req.body;

    // Strict validation
    if (text !== undefined && typeof text !== "string") {
      return res.status(400).json({ error: "Le texte du message doit être une chaîne de caractères." });
    }
    if (text && text.length > 10000) {
      return res.status(400).json({ error: "Le texte du message dépasse la longueur maximale de 10000 caractères." });
    }

    if (attachmentId !== undefined) {
      if (typeof attachmentId !== "string" || attachmentId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(attachmentId)) {
        return res.status(400).json({ error: "Format d'attachmentId invalide" });
      }
    }

    if (!text && !attachmentId) {
      return res.status(400).json({ error: "Le contenu du message ou une pièce jointe est requis." });
    }

    // 1. First retrieve ticket from SUPPORT_TICKETS_COLLECTION
    const preTicketSnap = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!preTicketSnap.exists) {
      return res.status(404).json({ error: "Ticket de support introuvable" });
    }

    // 2. ONLY AFTER ticket authorization: Pre-transaction snapshot of attachment (anti-TOCTOU)
    let preAttachmentSnapshot: SupportAttachment | null = null;
    if (attachmentId) {
      const preSnap = await db.collection("supportAttachments").doc(attachmentId).get();
      if (!preSnap.exists) {
        return res.status(404).json({ error: "Pièce jointe introuvable" });
      }
      preAttachmentSnapshot = preSnap.data() as SupportAttachment;
      if (preAttachmentSnapshot.ticketId !== ticketId) {
        return res.status(400).json({ error: "La pièce jointe n'appartient pas à ce ticket" });
      }
      if (!validateSecureFilePath(preAttachmentSnapshot.filePath, ticketId, attachmentId)) {
        return res.status(403).json({ error: "Chemin d'accès non autorisé ou corrompu" });
      }
      if (!preAttachmentSnapshot.fileName || !preAttachmentSnapshot.fileType) {
        return res.status(400).json({ error: "Métadonnées de pièce jointe incomplètes" });
      }
    }

    // Anti-tampering: admin sender forced to "admin"
    const messageRef = db.collection("supportMessages").doc();
    let finalMessagePayload: Record<string, unknown> = {};

    await db.runTransaction(async (transaction) => {
      // ==========================================
      // PHASE 1 — READS (Must precede any writes)
      // ==========================================
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable");
      }

      let attachmentInfo: {
        attachmentId?: string;
        fileUrl?: string;
        fileName?: string;
        fileType?: string;
        filePath?: string;
      } = {};

      if (attachmentId) {
        const attachRef = db.collection("supportAttachments").doc(attachmentId);
        const attachmentSnap = await transaction.get(attachRef);
        if (!attachmentSnap.exists) {
          throw new BusinessError(404, "Pièce jointe introuvable");
        }
        const snapData = attachmentSnap.data() as SupportAttachment;
        if (snapData.ticketId !== ticketId) {
          throw new BusinessError(400, "La pièce jointe n'appartient pas à ce ticket");
        }
        if (!validateSecureFilePath(snapData.filePath, ticketId, attachmentId)) {
          throw new BusinessError(403, "Chemin d'accès non autorisé ou corrompu");
        }
        if (!snapData.fileName || !snapData.fileType) {
          throw new BusinessError(400, "Métadonnées de pièce jointe incomplètes");
        }

        // Anti-TOCTOU validation: verify that critical fields did not mutate
        if (preAttachmentSnapshot) {
          if (
            snapData.ticketId !== preAttachmentSnapshot.ticketId ||
            snapData.filePath !== preAttachmentSnapshot.filePath ||
            snapData.fileName !== preAttachmentSnapshot.fileName ||
            snapData.fileType !== preAttachmentSnapshot.fileType
          ) {
            throw new BusinessError(409, "Modification concurrente des métadonnées détectée (TOCTOU)");
          }
        }

        // Storage existence verification: verify physical file exists in bucket
        const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
        const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
        const file = bucket.file(snapData.filePath);
        const [fileExists] = await file.exists();
        if (!fileExists) {
          throw new BusinessError(404, "Fichier physique introuvable dans Cloud Storage");
        }

        // Utilize the attachment data reread inside the transaction to build the message payload
        attachmentInfo = {
          attachmentId,
          fileUrl: `/api/v1/support/tickets/${ticketId}/attachments/${attachmentId}`,
          fileName: snapData.fileName,
          fileType: snapData.fileType,
          filePath: snapData.filePath
        };
      }

      // ==========================================
      // PHASE 2 — WRITES
      // ==========================================
      const messageData: Record<string, unknown> = {
        ticketId,
        userId: uid,
        text: text || "",
        sender: "admin",
        isInternal: !!isInternal,
        createdAt: new Date().toISOString(),
        ...attachmentInfo
      };

      transaction.create(messageRef, messageData);

      if (!isInternal) {
        transaction.update(ticketRef, {
          lastMessage: attachmentId ? "Pièce jointe envoyée" : (text || ""),
          lastMessageAt: new Date().toISOString()
        });
      }

      finalMessagePayload = messageData;
    });

    // Trace Admin Action
    await db.collection("adminActions").add({
      action: "support-message-sent",
      uid: req.user.uid,
      email: req.user.email || "inconnu",
      ticketId,
      isInternal: !!isInternal,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ success: true, message: { id: messageRef.id, ...finalMessagePayload } });
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

    const allowedStatuses = ["open", "closed", "pending"];
    if (!status || typeof status !== "string" || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Statut invalide ou non supporté." });
    }

    await db.runTransaction(async (transaction) => {
      // ==========================================
      // PHASE 1 — READS (Must precede any writes)
      // ==========================================
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable.");
      }

      // ==========================================
      // PHASE 2 — WRITES
      // ==========================================
      transaction.update(ticketRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      const messageRef = db.collection("supportMessages").doc();
      transaction.create(messageRef, {
        ticketId,
        text: `Le statut du ticket a été changé à "${status}" par l'administrateur.`,
        sender: "system",
        isInternal: true,
        createdAt: new Date().toISOString()
      });
    });

    // Trace Admin Action
    await db.collection("adminActions").add({
      action: "support-status-updated",
      uid: req.user.uid,
      email: req.user.email || "inconnu",
      ticketId,
      newStatus: status,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

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

    const allowedPriorities = ["low", "medium", "high"];
    if (!priority || typeof priority !== "string" || !allowedPriorities.includes(priority)) {
      return res.status(400).json({ error: "Priorité invalide ou non supportée." });
    }

    await db.runTransaction(async (transaction) => {
      // ==========================================
      // PHASE 1 — READS (Must precede any writes)
      // ==========================================
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable.");
      }

      // ==========================================
      // PHASE 2 — WRITES
      // ==========================================
      transaction.update(ticketRef, {
        priority,
        updatedAt: new Date().toISOString()
      });

      const messageRef = db.collection("supportMessages").doc();
      transaction.create(messageRef, {
        ticketId,
        text: `La priorité du ticket a été changée à "${priority}" par l'administrateur.`,
        sender: "system",
        isInternal: true,
        createdAt: new Date().toISOString()
      });
    });

    // Trace Admin Action
    await db.collection("adminActions").add({
      action: "support-priority-updated",
      uid: req.user.uid,
      email: req.user.email || "inconnu",
      ticketId,
      newPriority: priority,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

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
