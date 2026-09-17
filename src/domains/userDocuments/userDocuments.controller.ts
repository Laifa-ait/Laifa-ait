import { Response, Router } from "express";
import { z } from "zod";
import { db } from "../../config/firebase-admin";
import { AuthenticatedRequest, authenticateToken } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validation";
import { safeLogger } from "../../utils/logger";
import { DocumentCategory, UserDocumentDTO, UserDataConsentPreferences } from "../../types/documents";

const RecordDocumentSchema = z.object({
  category: z.enum([
    "identity",
    "real_estate_legal",
    "artisan_qualification",
    "seller_registry",
    "invoice",
    "dispute_evidence",
    "general",
  ]),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(30 * 1024 * 1024),
  mimeType: z.string().min(1).max(100),
  downloadUrl: z.string().url(),
  storagePath: z.string().min(1).max(500),
  description: z.string().max(1000).optional(),
});

const ConsentSchema = z.object({
  essential: z.literal(true),
  localStorageCache: z.boolean(),
  documentMemory: z.boolean(),
  analyticsPerformance: z.boolean(),
  consentTimestamp: z.string(),
  consentVersion: z.string(),
});

export const userDocumentsRouter = Router();

// 1. GET /api/v1/user-documents/my - List user's documents
userDocumentsRouter.get("/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifié" });
  }

  try {
    const category = req.query.category as DocumentCategory | undefined;
    let query: FirebaseFirestore.Query = db.collection("user_documents").where("userId", "==", userId);

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    const documents: UserDocumentDTO[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        category: data.category,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        downloadUrl: data.downloadUrl,
        storagePath: data.storagePath,
        description: data.description,
        isVerified: data.isVerified,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      };
    });

    safeLogger.info(`[UserDocuments] 🟢 ${documents.length} document(s) récupéré(s) pour uid=${userId}`);
    return res.json({ success: true, data: documents });
  } catch (err) {
    safeLogger.error("[UserDocuments] ❌ Erreur récupération documents", { error: err });
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la récupération des documents" });
  }
});

// 2. POST /api/v1/user-documents/record - Register uploaded document metadata
userDocumentsRouter.post(
  "/record",
  authenticateToken,
  validateRequest(RecordDocumentSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifié" });
    }

    const body = req.body as z.infer<typeof RecordDocumentSchema>;

    // Strict path verification: path must start with user_documents/{userId}/
    if (!body.storagePath.startsWith(`user_documents/${userId}/`)) {
      safeLogger.warn(`[UserDocuments] ⚠️ Tentative IDOR sur storagePath: ${body.storagePath} par uid=${userId}`);
      return res.status(403).json({ success: false, error: "Accès refusé : chemin de stockage non autorisé" });
    }

    try {
      const now = new Date();
      const docRef = db.collection("user_documents").doc();
      const newDoc = {
        userId,
        category: body.category,
        fileName: body.fileName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        downloadUrl: body.downloadUrl,
        storagePath: body.storagePath,
        description: body.description || "",
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(newDoc);

      const createdDTO: UserDocumentDTO = {
        id: docRef.id,
        userId: newDoc.userId,
        category: newDoc.category,
        fileName: newDoc.fileName,
        fileSize: newDoc.fileSize,
        mimeType: newDoc.mimeType,
        downloadUrl: newDoc.downloadUrl,
        storagePath: newDoc.storagePath,
        description: newDoc.description,
        isVerified: newDoc.isVerified,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      safeLogger.info(`[UserDocuments] 🟢 Document enregistré: ${docRef.id} pour uid=${userId}`);
      return res.status(201).json({ success: true, data: createdDTO });
    } catch (err) {
      safeLogger.error("[UserDocuments] ❌ Erreur enregistrement document", { error: err });
      return res.status(500).json({ success: false, error: "Impossible d'enregistrer le document" });
    }
  }
);

// 3. DELETE /api/v1/user-documents/:id - Delete a document (Strict IDOR)
userDocumentsRouter.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.uid;
  const docId = req.params.id;
  const isAdmin = req.user?.role === "admin" || req.user?.admin === true;

  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifié" });
  }

  try {
    const docSnap = await db.collection("user_documents").doc(docId).get();
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: "Document introuvable" });
    }

    const docData = docSnap.data();
    if (docData?.userId !== userId && !isAdmin) {
      safeLogger.warn(`[UserDocuments] ⚠️ Tentative IDOR de suppression: docId=${docId} par uid=${userId}`);
      return res.status(403).json({ success: false, error: "Accès refusé" });
    }

    await db.collection("user_documents").doc(docId).delete();
    safeLogger.info(`[UserDocuments] 🟢 Document supprimé: ${docId} par uid=${userId}`);
    return res.json({ success: true, message: "Document supprimé avec succès" });
  } catch (err) {
    safeLogger.error("[UserDocuments] ❌ Erreur suppression document", { error: err });
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la suppression" });
  }
});

// 4. GET /api/v1/user-documents/consent - Get user consent state
userDocumentsRouter.get("/consent", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifié" });
  }

  try {
    const consentSnap = await db.collection("users").doc(userId).collection("consents").doc("privacy").get();
    if (!consentSnap.exists) {
      return res.json({ success: true, data: null });
    }
    return res.json({ success: true, data: consentSnap.data() as UserDataConsentPreferences });
  } catch (err) {
    safeLogger.error("[UserDocuments] ❌ Erreur récupération consentement", { error: err });
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// 5. POST /api/v1/user-documents/consent - Save user consent preferences
userDocumentsRouter.post(
  "/consent",
  authenticateToken,
  validateRequest(ConsentSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifié" });
    }

    const body = req.body as UserDataConsentPreferences;
    try {
      await db.collection("users").doc(userId).collection("consents").doc("privacy").set(body, { merge: true });
      safeLogger.info(`[UserDocuments] 🟢 Consentement enregistré pour uid=${userId}`);
      return res.json({ success: true, data: body });
    } catch (err) {
      safeLogger.error("[UserDocuments] ❌ Erreur enregistrement consentement", { error: err });
      return res.status(500).json({ success: false, error: "Erreur serveur" });
    }
  }
);
