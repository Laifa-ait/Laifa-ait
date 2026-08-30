import { db, admin } from "../../../config/firebase-admin";
import { validateFileContent } from "../../../utils/fileSignatureValidator";
import { safeLogger } from "../../../utils/logger";
import {
  SUPPORT_TICKETS_COLLECTION,
  BusinessError,
  type UploadAttachmentDTO
} from "../types/support.types";
import { validateSecureFilePath } from "../utils/supportValidation";

export class SupportAttachmentService {
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
}
