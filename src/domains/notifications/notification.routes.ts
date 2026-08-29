import { Router, Response } from "express";
import { db, admin } from "../../config/firebase-admin";
import { ai } from "../../config/gemini";
import { authenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { safeLogger } from "../../utils/logger";

const router = Router();

// Route API: Système de notifications internes (Acheteur <-> Vendeur) avec Traduction Gemini
router.post(
  "/api/v1/notifications/send",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      recipientId,
      title,
      message,
      type,
      orderId,
      productId,
      conversationId,
    } = req.body;
    const senderId = req.user?.uid || "";

    if (!recipientId || !title || !message) {
      return res
        .status(400)
        .json({ error: "recipientId, title, et message sont obligatoires." });
    }

    try {
      let translations = {
        title: {
          fr: title,
          en: `${title} (EN)`,
          ar: `${title} (AR)`,
        },
        message: {
          fr: message,
          en: `${message} (EN)`,
          ar: `${message} (AR)`,
        },
      };

      try {
        const prompt = `Vous êtes Mabrouk, l'expert traducteur e-commerce d'OLMART Algérie (58 wilayas).
Traduisez les chaînes de caractères e-commerce suivantes en Arabe d'Algérie littéraire (soigné, professionnel) et en Anglais :
1. Titre: "${title}"
2. Message: "${message}"

Format de retour JSON STRICT (sans markdown, uniquement le JSON):
{
  "title": {
    "fr": "${title.replace(/"/g, '\\"')}",
    "ar": "La traduction en Arabe",
    "en": "La traduction en Anglais"
  },
  "message": {
    "fr": "${message.replace(/"/g, '\\"')}",
    "ar": "La traduction du message en Arabe",
    "en": "La traduction du message en Anglais"
  }
}
Répondez uniquement avec le JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const resultText = response.text || "";
        const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
        const parsed = JSON.parse(jsonStr);
        if (parsed.title && parsed.message) {
          translations = parsed;
        }
      } catch (geminiErr: unknown) {
        safeLogger.warn(
          "Gemini automatic translation failed for notifications, using fallback suffixes",
          { err: geminiErr instanceof Error ? geminiErr.message : String(geminiErr) },
        );
      }

      const notificationPayload = {
        senderId,
        recipientId,
        title: translations.title,
        message: translations.message,
        type: type || "system",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(orderId && { orderId }),
        ...(productId && { productId }),
        ...(conversationId && { conversationId }),
      };

      const docRef = await db
        .collection("user_notifications")
        .add(notificationPayload);

      return res.status(201).json({
        success: true,
        notificationId: docRef.id,
        notification: {
          id: docRef.id,
          ...notificationPayload,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      safeLogger.error("Failed to register notification", { err: error instanceof Error ? error.message : String(error) });
      return res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Erreur lors de la création de la notification.",
        });
    }
  },
);

export default router;
