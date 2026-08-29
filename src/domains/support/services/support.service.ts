import { db, admin } from "../../../config/firebase-admin";
import { validateFileContent } from "../../../utils/fileSignatureValidator";
import { safeLogger } from "../../../utils/logger";
import {
  SUPPORT_TICKETS_COLLECTION,
  BusinessError,
  type SupportAttachment,
  type CreateLegacyTicketDTO,
  type CreateTicketDTO,
  type PostMessageDTO,
  type UploadAttachmentDTO
} from "../types/support.types";
import { validateSecureFilePath } from "../utils/supportValidation";

export class SupportService {
  /**
   * Crée un ticket de support via le format legacy / compatibility
   */
  static async createLegacyTicket(uid: string, body: CreateLegacyTicketDTO): Promise<string> {
    const { name, email, requestType, message } = body;
    if (!name || !email || !requestType || !message) {
      throw new BusinessError(400, "Missing required fields");
    }

    const ticketData = {
      userId: uid,
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
    return docRef.id;
  }

  /**
   * Récupère tous les tickets appartenant à l'utilisateur connecté
   */
  static async getUserTickets(uid: string): Promise<Array<Record<string, unknown>>> {
    const snap = await db.collection(SUPPORT_TICKETS_COLLECTION)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Crée un nouveau ticket de support
   */
  static async createTicket(uid: string, body: CreateTicketDTO): Promise<Record<string, unknown>> {
    const { subject, priority, userName } = body;
    if (!subject) {
      throw new BusinessError(400, "Sujet requis");
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
    return { id: docRef.id, ...ticketData };
  }

  /**
   * Récupère les messages d'un ticket avec contrôle IDOR strict
   */
  static async getTicketMessages(ticketId: string, uid: string, role?: string): Promise<Array<Record<string, unknown>>> {
    const ticketDoc = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!ticketDoc.exists) {
      throw new BusinessError(404, "Ticket de support introuvable");
    }

    const ticket = ticketDoc.data() as { userId?: string };
    const isAdmin = role === "admin" || role === "superadmin";

    if (!isAdmin && ticket.userId !== uid) {
      throw new BusinessError(403, "Accès non autorisé");
    }

    const snap = await db.collection("supportMessages")
      .where("ticketId", "==", ticketId)
      .orderBy("createdAt", "asc")
      .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Envoie un message sur un ticket de support en tant que client (Transaction ACID + anti-TOCTOU)
   */
  static async postClientMessage(ticketId: string, uid: string, role: string | undefined, body: PostMessageDTO): Promise<Record<string, unknown>> {
    const { text, attachmentId } = body;

    // Strict validation
    if (text !== undefined && typeof text !== "string") {
      throw new BusinessError(400, "Le texte du message doit être une chaîne de caractères.");
    }
    if (text && text.length > 10000) {
      throw new BusinessError(400, "Le texte du message dépasse la longueur maximale de 10000 caractères.");
    }

    if (attachmentId !== undefined) {
      if (typeof attachmentId !== "string" || attachmentId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(attachmentId)) {
        throw new BusinessError(400, "Format d'attachmentId invalide");
      }
    }

    if (!text && !attachmentId) {
      throw new BusinessError(400, "Le contenu du message ou une pièce jointe est requis.");
    }

    const isAdmin = role === "admin" || role === "superadmin";

    // 1. First retrieve ticket from SUPPORT_TICKETS_COLLECTION
    const preTicketSnap = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!preTicketSnap.exists) {
      throw new BusinessError(404, "Ticket de support introuvable");
    }

    // 2. Verify authorization for the parent ticket
    const preTicket = preTicketSnap.data() as { userId?: string };
    if (!isAdmin && preTicket.userId !== uid) {
      throw new BusinessError(403, "Accès non autorisé");
    }

    // 3. ONLY AFTER ticket authorization: Pre-transaction snapshot of attachment (anti-TOCTOU)
    let preAttachmentSnapshot: SupportAttachment | null = null;
    if (attachmentId) {
      const preSnap = await db.collection("supportAttachments").doc(attachmentId).get();
      if (!preSnap.exists) {
        throw new BusinessError(404, "Pièce jointe introuvable");
      }
      preAttachmentSnapshot = preSnap.data() as SupportAttachment;
      if (preAttachmentSnapshot.ticketId !== ticketId) {
        throw new BusinessError(400, "La pièce jointe n'appartient pas à ce ticket");
      }
      if (!validateSecureFilePath(preAttachmentSnapshot.filePath, ticketId, attachmentId)) {
        throw new BusinessError(403, "Chemin d'accès non autorisé ou corrompu");
      }
      if (!preAttachmentSnapshot.fileName || !preAttachmentSnapshot.fileType) {
        throw new BusinessError(400, "Métadonnées de pièce jointe incomplètes");
      }
    }

    // Anti-tampering: Server-generated fields
    const messageRef = db.collection("supportMessages").doc();
    let finalMessagePayload: Record<string, unknown> = {};

    await db.runTransaction(async (transaction) => {
      // PHASE 1 — READS
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

        attachmentInfo = {
          attachmentId,
          fileUrl: `/api/v1/support/tickets/${ticketId}/attachments/${attachmentId}`,
          fileName: snapData.fileName,
          fileType: snapData.fileType,
          filePath: snapData.filePath
        };
      }

      // PHASE 2 — WRITES
      const messageData: Record<string, unknown> = {
        ticketId,
        userId: uid,
        text: text || "",
        sender: "client",
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

    return { id: messageRef.id, ...finalMessagePayload };
  }

  /**
   * Ré-ouvre un ticket fermé (Transaction ACID)
   */
  static async reopenTicket(ticketId: string, uid: string, role?: string): Promise<void> {
    const isAdmin = role === "admin" || role === "superadmin";

    await db.runTransaction(async (transaction) => {
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
  }

  /**
   * Upload sécurisé d'une pièce jointe avec validation de signature et rollback
   */
  static async uploadAttachment(
    ticketId: string,
    uid: string,
    role: string | undefined,
    userEmail: string,
    body: UploadAttachmentDTO
  ): Promise<{ fileUrl: string; attachmentId: string; fileName: string; fileType: string }> {
    const { fileName, mimeType, base64Data } = body;

    if (!fileName || !mimeType) {
      throw new BusinessError(400, "Champs requis manquants: fileName, mimeType");
    }

    const MAX_SUPPORT_ATTACHMENT_BYTES = 1048576; // 1 Mo

    if (typeof base64Data !== "string") {
      throw new BusinessError(400, "base64Data doit être une chaîne de caractères.");
    }

    if (!base64Data || base64Data.trim() === "") {
      throw new BusinessError(400, "base64Data ne peut pas être vide.");
    }

    const maxBase64Length = Math.ceil((MAX_SUPPORT_ATTACHMENT_BYTES * 4) / 3) + 4;
    if (base64Data.length > maxBase64Length) {
      throw new BusinessError(400, "La taille estimée du fichier dépasse la limite autorisée de 1 Mo.");
    }

    const cleanBase64 = base64Data.replace(/\s/g, "");
    const base64Regex = /^[a-zA-Z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanBase64)) {
      throw new BusinessError(400, "Format Base64 invalide.");
    }

    const buffer = Buffer.from(cleanBase64, "base64");

    if (buffer.length === 0) {
      throw new BusinessError(400, "Le fichier décodé est vide.");
    }
    if (buffer.length > MAX_SUPPORT_ATTACHMENT_BYTES) {
      throw new BusinessError(400, "La taille réelle du fichier dépasse la limite autorisée de 1 Mo.");
    }

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
      throw new BusinessError(400, "Type de fichier non supporté. Seuls les images, PDF, CSV, TXT et ZIP sont acceptés.");
    }

    const validation = validateFileContent(buffer, fileName, mimeType);
    if (!validation.isValid) {
      throw new BusinessError(400, validation.error || "Le contenu du fichier ne correspond pas au format déclaré.");
    }

    const ticketDoc = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!ticketDoc.exists) {
      throw new BusinessError(404, "Ticket de support introuvable.");
    }

    const ticket = ticketDoc.data() as { userId?: string };
    const isAdmin = role === "admin" || role === "superadmin";
    if (!isAdmin && ticket.userId !== uid) {
      throw new BusinessError(403, "Accès refusé. Vous n'êtes pas autorisé à uploader pour ce ticket.");
    }

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const attachRef = db.collection("supportAttachments").doc();
    const attachmentId = attachRef.id;
    const uniquePath = `support/${ticketId}/${attachmentId}/${sanitizedName}`;

    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
    const fileUpload = bucket.file(uniquePath);
    let uploadedFile = false;

    try {
      await fileUpload.save(buffer, {
        metadata: { contentType: mimeType }
      });
      uploadedFile = true;

      await attachRef.set({
        ticketId,
        filePath: uniquePath,
        fileName: sanitizedName,
        fileType: mimeType,
        userId: uid,
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

    await db.collection("adminActions").add({
      action: "support-file-upload",
      uid,
      email: userEmail || "inconnu",
      ticketId,
      fileName: sanitizedName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "success"
    });

    safeLogger.info("File uploaded successfully to support ticket", { ticketId, filePath: uniquePath });

    return {
      fileUrl,
      attachmentId,
      fileName: sanitizedName,
      fileType: mimeType
    };
  }

  /**
   * Récupère les métadonnées et le stream d'une pièce jointe
   */
  static async getAttachmentStream(
    ticketId: string,
    attachmentId: string,
    uid: string,
    role?: string
  ): Promise<{ fileStream: NodeJS.ReadableStream; fileType: string; fileName: string; dispositionType: "inline" | "attachment" }> {
    const ticketDoc = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!ticketDoc.exists) {
      throw new BusinessError(404, "Ticket de support introuvable");
    }

    const ticket = ticketDoc.data() as { userId?: string };
    const isAdmin = role === "admin" || role === "superadmin";

    if (!isAdmin && ticket.userId !== uid) {
      throw new BusinessError(403, "Accès non autorisé");
    }

    const attachDoc = await db.collection("supportAttachments").doc(attachmentId).get();
    if (!attachDoc.exists) {
      throw new BusinessError(404, "Pièce jointe introuvable");
    }

    const attachment = attachDoc.data() as { ticketId?: string; filePath?: string; fileName?: string; fileType?: string };

    if (attachment.ticketId !== ticketId) {
      throw new BusinessError(400, "La pièce jointe n'appartient pas à ce ticket");
    }

    const filePath = attachment.filePath;
    if (!filePath) {
      throw new BusinessError(404, "Chemin du fichier manquant");
    }

    if (!validateSecureFilePath(filePath, ticketId, attachmentId)) {
      throw new BusinessError(403, "Chemin d'accès non autorisé ou corrompu");
    }

    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
    const file = bucket.file(filePath);

    const [fileExists] = await file.exists();
    if (!fileExists) {
      throw new BusinessError(404, "Fichier physique introuvable");
    }

    const inlineMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const dispositionType = inlineMimeTypes.includes(attachment.fileType || "") ? "inline" : "attachment";
    const rawFileName = attachment.fileName || "file";
    const sanitizedHeaderFileName = rawFileName.replace(/[\r\n";\\]/g, "_");

    return {
      fileStream: file.createReadStream(),
      fileType: attachment.fileType || "application/octet-stream",
      fileName: sanitizedHeaderFileName,
      dispositionType
    };
  }

  /**
   * Récupère la liste des tickets pour le dashboard administrateur
   */
  static async getAdminTickets(): Promise<Array<Record<string, unknown>>> {
    const snap = await db.collection(SUPPORT_TICKETS_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Récupère tous les messages d'un ticket pour l'administrateur
   */
  static async getAdminTicketMessages(ticketId: string): Promise<Array<Record<string, unknown>>> {
    const snap = await db.collection("supportMessages")
      .where("ticketId", "==", ticketId)
      .orderBy("createdAt", "asc")
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Envoie un message en tant qu'administrateur (Transaction ACID + audit log)
   */
  static async postAdminTicketMessage(
    ticketId: string,
    adminUid: string,
    adminEmail: string,
    body: PostMessageDTO
  ): Promise<Record<string, unknown>> {
    const { text, attachmentId, isInternal } = body;

    if (text !== undefined && typeof text !== "string") {
      throw new BusinessError(400, "Le texte du message doit être une chaîne de caractères.");
    }
    if (text && text.length > 10000) {
      throw new BusinessError(400, "Le texte du message dépasse la longueur maximale de 10000 caractères.");
    }

    if (attachmentId !== undefined) {
      if (typeof attachmentId !== "string" || attachmentId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(attachmentId)) {
        throw new BusinessError(400, "Format d'attachmentId invalide");
      }
    }

    if (!text && !attachmentId) {
      throw new BusinessError(400, "Le contenu du message ou une pièce jointe est requis.");
    }

    const preTicketSnap = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!preTicketSnap.exists) {
      throw new BusinessError(404, "Ticket de support introuvable");
    }

    let preAttachmentSnapshot: SupportAttachment | null = null;
    if (attachmentId) {
      const preSnap = await db.collection("supportAttachments").doc(attachmentId).get();
      if (!preSnap.exists) {
        throw new BusinessError(404, "Pièce jointe introuvable");
      }
      preAttachmentSnapshot = preSnap.data() as SupportAttachment;
      if (preAttachmentSnapshot.ticketId !== ticketId) {
        throw new BusinessError(400, "La pièce jointe n'appartient pas à ce ticket");
      }
      if (!validateSecureFilePath(preAttachmentSnapshot.filePath, ticketId, attachmentId)) {
        throw new BusinessError(403, "Chemin d'accès non autorisé ou corrompu");
      }
      if (!preAttachmentSnapshot.fileName || !preAttachmentSnapshot.fileType) {
        throw new BusinessError(400, "Métadonnées de pièce jointe incomplètes");
      }
    }

    const messageRef = db.collection("supportMessages").doc();
    let finalMessagePayload: Record<string, unknown> = {};

    await db.runTransaction(async (transaction) => {
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

        const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
        const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
        const file = bucket.file(snapData.filePath);
        const [fileExists] = await file.exists();
        if (!fileExists) {
          throw new BusinessError(404, "Fichier physique introuvable dans Cloud Storage");
        }

        attachmentInfo = {
          attachmentId,
          fileUrl: `/api/v1/support/tickets/${ticketId}/attachments/${attachmentId}`,
          fileName: snapData.fileName,
          fileType: snapData.fileType,
          filePath: snapData.filePath
        };
      }

      const messageData: Record<string, unknown> = {
        ticketId,
        userId: adminUid,
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

    await db.collection("adminActions").add({
      action: "support-message-sent",
      uid: adminUid,
      email: adminEmail || "inconnu",
      ticketId,
      isInternal: !!isInternal,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: messageRef.id, ...finalMessagePayload };
  }

  /**
   * Met à jour le statut d'un ticket de support (Admin)
   */
  static async updateTicketStatus(ticketId: string, adminUid: string, adminEmail: string, status: string): Promise<void> {
    const allowedStatuses = ["open", "closed", "pending"];
    if (!status || typeof status !== "string" || !allowedStatuses.includes(status)) {
      throw new BusinessError(400, "Statut invalide ou non supporté.");
    }

    await db.runTransaction(async (transaction) => {
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable.");
      }

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

    await db.collection("adminActions").add({
      action: "support-status-updated",
      uid: adminUid,
      email: adminEmail || "inconnu",
      ticketId,
      newStatus: status,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Met à jour la priorité d'un ticket de support (Admin)
   */
  static async updateTicketPriority(ticketId: string, adminUid: string, adminEmail: string, priority: string): Promise<void> {
    const allowedPriorities = ["low", "medium", "high"];
    if (!priority || typeof priority !== "string" || !allowedPriorities.includes(priority)) {
      throw new BusinessError(400, "Priorité invalide ou non supportée.");
    }

    await db.runTransaction(async (transaction) => {
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable.");
      }

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

    await db.collection("adminActions").add({
      action: "support-priority-updated",
      uid: adminUid,
      email: adminEmail || "inconnu",
      ticketId,
      newPriority: priority,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
