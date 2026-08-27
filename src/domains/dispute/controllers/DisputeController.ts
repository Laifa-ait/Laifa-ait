import { Response, Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { firestore } from "firebase-admin";
import { GoogleGenAI } from "@google/genai";
import { validateFileContent } from "../../../utils/fileSignatureValidator";
import { safeLogger } from "../../../utils/logger";

export class BusinessError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

export interface DisputeAttachment {
  disputeId: string;
  userId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize?: number;
  createdAt?: string | firestore.FieldValue;
}

export function validateSecureDisputeFilePath(filePath: string, disputeId: string, attachmentId: string): boolean {
  if (!filePath) return false;

  const expectedPrefix = `disputes/${disputeId}/${attachmentId}/`;
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

async function getGeminiImagePart(photoStr: string) {
  try {
    if (photoStr.startsWith("data:")) {
      const match = photoStr.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        };
      }
    }
  } catch (err) {
    safeLogger.error("Error fetching photo for Gemini in DisputeController", { err: err instanceof Error ? err.message : String(err) });
  }
  return null;
}

const router = Router();

// 1. GET /api/v1/disputes - Get disputes for the logged-in user (buyer or seller)
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.uid || "";
  const role = req.user?.role || "buyer";
  
  try {
    let disputesSnap: firestore.QuerySnapshot;
    if (role === "seller") {
      disputesSnap = await db.collection("disputes").where("sellerId", "==", userId).orderBy("createdAt", "desc").get();
    } else {
      disputesSnap = await db.collection("disputes").where("buyerId", "==", userId).orderBy("createdAt", "desc").get();
    }
    
    const disputes = disputesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, disputes });
  } catch (error: unknown) {
    safeLogger.error("Error fetching disputes", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur serveur" });
  }
});

// 2. GET /api/v1/disputes/:disputeId/attachments/:attachmentId - Secure streaming gateway for dispute attachments
router.get("/:disputeId/attachments/:attachmentId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { disputeId, attachmentId } = req.params;
    const userId = req.user.uid;

    // 1. Récupérer le litige
    const disputeDoc = await db.collection("disputes").doc(disputeId).get();
    if (!disputeDoc.exists) {
      return res.status(404).json({ error: "Litige introuvable" });
    }

    const dispute = disputeDoc.data() as Record<string, unknown>;

    // 2. Contrôle IDOR : Admin, acheteur ou vendeur du litige uniquement
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin" || req.user.customClaims?.admin === true;
    const isBuyer = dispute.buyerId === userId;
    const isSeller = dispute.sellerId === userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // 3. Récupérer l'attachment
    const attachDoc = await db.collection("disputeAttachments").doc(attachmentId).get();
    if (!attachDoc.exists) {
      return res.status(404).json({ error: "Pièce jointe introuvable" });
    }

    const attachment = attachDoc.data() as DisputeAttachment;

    // 4. Vérifier la cohérence de l'attachment
    if (attachment.disputeId !== disputeId) {
      return res.status(400).json({ error: "La pièce jointe n'appartient pas à ce litige" });
    }

    const filePath = attachment.filePath;
    if (!filePath) {
      return res.status(404).json({ error: "Chemin du fichier manquant" });
    }

    // Validation du chemin sécurisé (anti-path traversal & isolation)
    if (!validateSecureDisputeFilePath(filePath, disputeId, attachmentId)) {
      return res.status(403).json({ error: "Chemin d'accès non autorisé ou corrompu" });
    }

    // 5. Streamer le fichier privé depuis Storage
    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
    const file = bucket.file(filePath);

    const [fileExists] = await file.exists();
    if (!fileExists) {
      return res.status(404).json({ error: "Fichier physique introuvable" });
    }

    const inlineMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const dispositionType = inlineMimeTypes.includes(attachment.fileType || "") ? "inline" : "attachment";

    const rawFileName = attachment.fileName || "file";
    const sanitizedHeaderFileName = rawFileName.replace(/[\r\n";\\]/g, "_");

    res.setHeader("Content-Type", attachment.fileType || "application/octet-stream");
    res.setHeader("Content-Disposition", `${dispositionType}; filename="${encodeURIComponent(sanitizedHeaderFileName)}"`);

    file.createReadStream()
      .on("error", (err) => {
        safeLogger.error("Dispute attachment stream error", { err: err instanceof Error ? err.message : String(err) });
        if (!res.headersSent) {
          res.status(500).json({ error: "Erreur de lecture du fichier" });
        }
      })
      .pipe(res);

  } catch (error: unknown) {
    safeLogger.error("Dispute attachment retrieval error", { err: error instanceof Error ? error.message : String(error) });
    const messageStr = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: messageStr });
  }
});

// 3. GET /api/v1/disputes/:id - Get specific dispute details
router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const disputeId = req.params.id;
  const userId = req.user?.uid || "";
  
  try {
    const disputeDoc = await db.collection("disputes").doc(disputeId).get();
    if (!disputeDoc.exists) {
      return res.status(404).json({ error: "Litige introuvable." });
    }
    
    const dispute = { id: disputeDoc.id, ...disputeDoc.data() } as Record<string, unknown>;
    
    // Check IDOR: only buyer, seller or admin can view
    const isBuyer = dispute.buyerId === userId;
    const isSeller = dispute.sellerId === userId;
    const isAdmin = req.user?.role === "admin" || req.user?.customClaims?.admin === true;
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    const msgsSnap = await db.collection("disputeMessages")
                             .where("disputeId", "==", disputeId)
                             .orderBy("createdAt", "asc")
                             .get();
    
    let messages = msgsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Hide administrative Gemini AI / system messages and the AI summary from non-admin users
    if (!isAdmin) {
      messages = messages.filter((msg: Record<string, unknown>) => msg.senderId !== "system_ai" && msg.senderId !== "system");
      if (dispute.aiSummary) {
        delete dispute.aiSummary;
      }
    }
    
    res.json({ success: true, dispute, messages });
  } catch (error: unknown) {
    safeLogger.error("Error fetching dispute", { disputeId, err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur serveur" });
  }
});

// 4. POST /api/v1/disputes/:id/messages - Post a message in the dispute (Atomic Transaction)
router.post("/:id/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const disputeId = req.params.id;
    const userId = req.user.uid;
    const { message, text, attachmentId } = req.body;
    const messageText = typeof message === "string" ? message : (typeof text === "string" ? text : "");
    
    if (messageText && messageText.length > 10000) {
      return res.status(400).json({ error: "Le texte du message dépasse la longueur maximale de 10000 caractères." });
    }

    if (attachmentId !== undefined && attachmentId !== null) {
      if (typeof attachmentId !== "string" || attachmentId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(attachmentId)) {
        return res.status(400).json({ error: "Format d'attachmentId invalide" });
      }
    }

    if (!messageText.trim() && !attachmentId) {
      return res.status(400).json({ error: "Le contenu du message ou une pièce jointe est requis." });
    }

    const messageRef = db.collection("disputeMessages").doc();
    let finalMessagePayload: Record<string, unknown> = {};
    let shouldTriggerAiAnalysis = false;
    let disputeSnapshot: Record<string, unknown> = {};

    await db.runTransaction(async (transaction) => {
      // ==========================================
      // PHASE 1 — READS (Must precede any writes)
      // ==========================================
      const disputeRef = db.collection("disputes").doc(disputeId);
      const disputeSnap = await transaction.get(disputeRef);
      if (!disputeSnap.exists) {
        throw new BusinessError(404, "Litige introuvable.");
      }

      const dispute = (disputeSnap.data() || {}) as Record<string, unknown>;
      disputeSnapshot = dispute;

      const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin" || req.user?.customClaims?.admin === true;
      const isBuyer = dispute.buyerId === userId;
      const isSeller = dispute.sellerId === userId;

      if (!isAdmin && !isBuyer && !isSeller) {
        throw new BusinessError(403, "Accès refusé.");
      }

      let senderRole = "buyer";
      if (isSeller) senderRole = "seller";
      if (isAdmin) senderRole = "admin";

      let attachmentInfo: {
        attachmentId?: string;
        fileUrl?: string;
        fileName?: string;
        fileType?: string;
        filePath?: string;
      } = {};

      if (attachmentId) {
        const attachRef = db.collection("disputeAttachments").doc(attachmentId);
        const attachSnap = await transaction.get(attachRef);
        if (!attachSnap.exists) {
          throw new BusinessError(404, "Pièce jointe introuvable.");
        }
        const snapData = attachSnap.data() as DisputeAttachment;
        if (snapData.disputeId !== disputeId) {
          throw new BusinessError(400, "La pièce jointe n'appartient pas à ce litige");
        }
        if (!validateSecureDisputeFilePath(snapData.filePath, disputeId, attachmentId)) {
          throw new BusinessError(403, "Chemin d'accès non autorisé ou corrompu");
        }

        attachmentInfo = {
          attachmentId,
          fileUrl: `/api/v1/disputes/${disputeId}/attachments/${attachmentId}`,
          fileName: snapData.fileName,
          fileType: snapData.fileType,
          filePath: snapData.filePath
        };
      }

      // ==========================================
      // PHASE 2 — WRITES
      // ==========================================
      const messageData: Record<string, unknown> = {
        disputeId,
        senderId: userId,
        senderRole,
        message: messageText || (attachmentId ? "Pièce jointe envoyée" : ""),
        text: messageText || (attachmentId ? "Pièce jointe envoyée" : ""),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ...attachmentInfo
      };

      transaction.create(messageRef, messageData);

      transaction.update(disputeRef, {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
      });

      finalMessagePayload = messageData;
      if (senderRole === "seller") {
        shouldTriggerAiAnalysis = true;
      }
    });

    // If the sender is a seller, trigger real-time AI re-analysis in background
    if (shouldTriggerAiAnalysis) {
      (async () => {
        try {
          if (!process.env.GEMINI_API_KEY) {
            return;
          }
          const genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { "User-Agent": "aistudio-build" } }
          });
          
          const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
          
          const systemInstruction = `Vous êtes l'assistant de médiation officiel d'OLMART, la marketplace leader en Algérie.
Votre rôle est d'analyser de manière objective le litige ouvert par l'acheteur ainsi que la réponse/explication fournie par le vendeur, afin de mettre à jour le Rapport d'Analyse IA destiné à l'administrateur.

Le rapport doit obligatoirement être rédigé en français professionnel, être propre, structuré, et présenter exactement les points clés suivants :
- **Analyse de la réclamation de l'acheteur** : Synthèse de la réclamation initiale, faits relevés et photos d'évidence.
- **Vérification de la réponse du vendeur** : Analyse rigoureuse de la réponse, des arguments, des preuves de livraison ou justifications fournies par le vendeur dans son message.
- **Niveau de gravité du litige** : Évaluez le niveau de gravité actuel en tant que "Faible", "Moyen" ou "Élevé".
- **Recommandation d'arbitrage financier** : Donnez une suggestion claire basée sur les conditions générales d'OLMART (ex: remboursement de l'acheteur, paiement du vendeur, ou partage 50/50).`;

          parts.push({
            text: `Détails initiaux du Litige :
- Motif: ${disputeSnapshot.reason}
- Description initiale de l'acheteur: "${disputeSnapshot.details}"

Message de réponse du vendeur :
"${messageText}"

Veuillez réanalyser le dossier complet incluant la nouvelle réponse du vendeur pour produire le Rapport d'Analyse IA mis à jour.`
          });

          // Fetch and process base64 photos only for Gemini multimodal capability
          const disputePhotos = (disputeSnapshot.photos || []) as string[];
          if (disputePhotos && disputePhotos.length > 0) {
            for (const photo of disputePhotos) {
              const imgPart = await getGeminiImagePart(photo);
              if (imgPart) {
                parts.push(imgPart);
              }
            }
          }

          const aiResponse = await genAI.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts },
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.2
            }
          });

          const updatedAiSummary = aiResponse.text;

          if (updatedAiSummary) {
            await db.collection("disputes").doc(disputeId).update({
              aiSummary: updatedAiSummary,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            await db.collection("disputeMessages").add({
              disputeId,
              senderId: "system_ai",
              senderRole: "admin",
              message: `🤖 [Rapport IA Mis à Jour - Analyse de la Réponse Vendeur]\n\n${updatedAiSummary}`,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        } catch (aiErr) {
          safeLogger.error("AI Seller response analysis failed", { err: aiErr instanceof Error ? aiErr.message : String(aiErr) });
        }
      })();
    }
    
    return res.json({ success: true, message: { id: messageRef.id, ...finalMessagePayload } });
  } catch (error: unknown) {
    if (error instanceof BusinessError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    safeLogger.error("Error posting dispute message", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur serveur" });
  }
});

// 5. GET /api/v1/disputes/admin/all - Admin get all disputes
router.get("/admin/all", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const disputesSnap = await db.collection("disputes").orderBy("createdAt", "desc").limit(100).get();
    const disputes = disputesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, disputes });
  } catch (error: unknown) {
    safeLogger.error("Error fetching all disputes", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur serveur" });
  }
});

// 6. POST /api/v1/disputes/admin/:id/resolve - Admin resolve dispute
router.post("/admin/:id/resolve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const disputeId = req.params.id;
  const { resolution, note } = req.body;
  
  if (!["buyer_refunded", "seller_paid", "split"].includes(resolution)) {
    return res.status(400).json({ error: "Résolution invalide." });
  }
  
  try {
    await db.runTransaction(async (t: firestore.Transaction) => {
      const disputeRef = db.collection("disputes").doc(disputeId);
      const disputeSnap = await t.get(disputeRef);
      if (!disputeSnap.exists) throw new Error("Litige introuvable.");
      
      const dispute = (disputeSnap.data() || {}) as Record<string, unknown>;
      if (dispute.status === "resolved" || dispute.status === "closed") {
        throw new Error("Ce litige est déjà résolu.");
      }
      
      const orderRef = db.collection("orders").doc(dispute.orderId as string);
      const orderSnap = await t.get(orderRef);
      
      t.update(disputeRef, {
        status: "resolved",
        resolution,
        resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        adminNote: note || ""
      });
      
      let newOrderStatus = orderSnap.exists ? orderSnap.data()?.status : "dispute_open";
      if (resolution === "buyer_refunded") newOrderStatus = "refunded";
      if (resolution === "seller_paid") newOrderStatus = "delivered";
      
      if (orderSnap.exists) {
        t.update(orderRef, {
          status: newOrderStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      const financeTaskRef = db.collection("finance_tasks").doc();
      t.set(financeTaskRef, {
        type: "DISPUTE_RESOLUTION",
        disputeId,
        orderId: dispute.orderId,
        resolution,
        sellerId: dispute.sellerId,
        buyerId: dispute.buyerId,
        frozenAmount: dispute.frozenAmount,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const msgRef = db.collection("disputeMessages").doc();
      t.set(msgRef, {
        disputeId,
        senderId: "system",
        senderRole: "admin",
        message: `L'administrateur a résolu le litige : ${resolution === "buyer_refunded" ? "Remboursement de l'Acheteur" : "Paiement du Vendeur"}. Note: ${note || "Aucune note."}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    res.json({ success: true, message: "Litige résolu avec succès. Tâche financière asynchrone créée." });
  } catch (error: unknown) {
    safeLogger.error("Error resolving dispute", { disputeId, err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur serveur" });
  }
});

// 7. POST /api/v1/disputes/:id/upload - Secure private upload for dispute attachments
router.post("/:id/upload", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const disputeId = req.params.id;
    const userId = req.user.uid;

    // 1. Récupérer et vérifier le litige AVANT tout traitement de fichier lourd
    const disputeRef = db.collection("disputes").doc(disputeId);
    const disputeDoc = await disputeRef.get();
    if (!disputeDoc.exists) {
      return res.status(404).json({ error: "Litige introuvable." });
    }

    const disputeData = disputeDoc.data() || {};

    // 2. Contrôle IDOR strict : Admin, acheteur ou vendeur du litige
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin" || req.user.customClaims?.admin === true;
    const isBuyer = disputeData.buyerId === userId;
    const isSeller = disputeData.sellerId === userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas autorisé à uploader pour ce litige." });
    }

    // 3. Traitement et validation du fichier UNIQUEMENT APRÈS autorisation
    const { fileName, mimeType, base64Data } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({ error: "Champs requis manquants: fileName, mimeType" });
    }

    const MAX_DISPUTE_ATTACHMENT_BYTES = 1048576; // 1 Mo

    if (typeof base64Data !== "string") {
      return res.status(400).json({ error: "base64Data doit être une chaîne de caractères." });
    }

    if (!base64Data || base64Data.trim() === "") {
      return res.status(400).json({ error: "base64Data ne peut pas être vide." });
    }

    const maxBase64Length = Math.ceil((MAX_DISPUTE_ATTACHMENT_BYTES * 4) / 3) + 4;
    if (base64Data.length > maxBase64Length) {
      return res.status(400).json({ error: "La taille estimée du fichier dépasse la limite autorisée de 1 Mo." });
    }

    const cleanBase64 = base64Data.replace(/\s/g, "");
    const base64Regex = /^[a-zA-Z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanBase64)) {
      return res.status(400).json({ error: "Format Base64 invalide." });
    }

    const buffer = Buffer.from(cleanBase64, "base64");

    if (buffer.length === 0) {
      return res.status(400).json({ error: "Le fichier décodé est vide." });
    }
    if (buffer.length > MAX_DISPUTE_ATTACHMENT_BYTES) {
      return res.status(400).json({ error: "La taille réelle du fichier dépasse la limite autorisée de 1 Mo." });
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
      return res.status(400).json({ error: "Type de fichier non supporté. Seuls les images, PDF, CSV, TXT et ZIP sont acceptés." });
    }

    const validation = validateFileContent(buffer, fileName, mimeType);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error || "Le contenu du fichier ne correspond pas au format déclaré." });
    }

    // 4. Génération déterministe d'identifiant et chemin sécurisé privé
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const attachRef = db.collection("disputeAttachments").doc();
    const attachmentId = attachRef.id;
    const uniquePath = `disputes/${disputeId}/${attachmentId}/${sanitizedName}`;

    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
    const fileUpload = bucket.file(uniquePath);
    let uploadedFile = false;

    // 5. Sauvegarde privée dans Cloud Storage (JAMAIS public: true)
    try {
      await fileUpload.save(buffer, {
        metadata: { contentType: mimeType }
      });
      uploadedFile = true;

      // 6. Enregistrement des métadonnées dans la collection disputeAttachments
      await attachRef.set({
        disputeId,
        userId,
        fileName: sanitizedName,
        fileType: mimeType,
        filePath: uniquePath,
        fileSize: buffer.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (writeError) {
      if (uploadedFile) {
        try {
          await fileUpload.delete();
        } catch (cleanupError) {
          safeLogger.error("Dispute Storage cleanup failed", { err: cleanupError instanceof Error ? cleanupError.message : String(cleanupError) });
        }
      }
      throw writeError;
    }

    const fileUrl = `/api/v1/disputes/${disputeId}/attachments/${attachmentId}`;

    // 7. Audit log
    await db.collection("adminActions").add({
      action: "dispute-file-upload",
      uid: userId,
      email: req.user.email || "inconnu",
      disputeId,
      attachmentId,
      fileName: sanitizedName,
      fileSize: buffer.length,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "success"
    });

    safeLogger.info("[Firestore Core] 🟢 Dispute file uploaded securely", { path: uniquePath, bytes: buffer.length });

    return res.json({
      success: true,
      attachmentId,
      fileUrl,
      fileName: sanitizedName,
      fileType: mimeType,
      fileSize: buffer.length
    });
  } catch (error: unknown) {
    safeLogger.error("[Firestore Core] ❌ Dispute upload error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur serveur lors de l'upload de la pièce jointe." });
  }
});

export default router;

