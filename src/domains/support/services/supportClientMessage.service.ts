import { db, admin } from "../../../config/firebase-admin";
import {
  SUPPORT_TICKETS_COLLECTION,
  BusinessError,
  type SupportAttachment,
  type PostMessageDTO
} from "../types/support.types";
import { validateSecureFilePath } from "../utils/supportValidation";

export class SupportClientMessageService {
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

    const preTicketSnap = await db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId).get();
    if (!preTicketSnap.exists) {
      throw new BusinessError(404, "Ticket de support introuvable");
    }

    const preTicket = preTicketSnap.data() as { userId?: string };
    if (!isAdmin && preTicket.userId !== uid) {
      throw new BusinessError(403, "Accès non autorisé");
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

      const ticket = ticketSnap.data() as { userId?: string };
      if (!isAdmin && ticket.userId !== uid) {
        throw new BusinessError(403, "Accès non autorisé");
      }

      let attachmentInfo: Record<string, unknown> = {};

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
}
