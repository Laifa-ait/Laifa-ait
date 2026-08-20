import { Request, Response } from "express";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  file?: unknown;
  files?: unknown;
}

interface OrderDoc {
  userId?: string;
  buyerId?: string;
  status?: string;
  disputeRequest?: unknown;
  deliveredAt?: { toDate?: () => Date } | string | number | Date;
  updatedAt?: { toDate?: () => Date } | string | number | Date;
  sellerIds?: string[];
  sellerId?: string;
  total?: number | string;
  [key: string]: unknown;
}

import { Router } from "express";
import { firestore } from "firebase-admin";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, optionalAuthenticateToken, authorizeSeller } from "../../../middlewares/auth";
import { Order, OrderStatus, StockUpdatePayload, OrderSnapshot, OrderTransactionContext } from "../order.types";
import { validateRequest } from "../../../middlewares/validation";
import { ALGERIA_WILAYAS, ALGERIA_SHIPPING_DATA } from "../../../constants";
import { placeOrderSchema } from "../../../utils/validation";
import { checkSellerVelocityLimit } from "../../../utils/velocity";
import { orderBreaker } from "../../../utils/circuitBreaker";
import { calculateOrderCommission } from "../../../utils/orderCalculations";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendLowStockEmail = async (sellerEmail: string, message: string) => {
  try {
    if (!process.env.SMTP_USER) {
      console.log("Mock Email Sent (SMTP not configured). To:", sellerEmail, "Message:", message);
      return;
    }
    await transporter.sendMail({
      from: '"Olmart" <noreply@olmart.dz>',
      to: sellerEmail,
      subject: "⚠️ Alerte Stock Critique - Olmart",
      text: message,
    });
  } catch (err) {
    console.error("Failed to send stock alert email", err);
  }
};

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
    } else if (photoStr.startsWith("http")) {
      const response = await fetch(photoStr);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/jpeg";
        return {
          inlineData: {
            mimeType: contentType,
            data: base64
          }
        };
      }
    }
  } catch (err) {
    console.error("Error fetching photo for Gemini:", err);
  }
  return null;
}

const router = Router();

// Update Order Status Securely
router.post("/buyer/orders/dispute", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, disputeReason, disputeDetails, disputePhotos } = req.body;
  const buyerId = req.user?.uid || "";

  if (!orderId || !disputeReason) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Validate reasons strictly (Non-conforme, Cassé, Contrefaçon)
  const validReasons = ["Non-conforme", "Cassé", "Contrefaçon"];
  if (!validReasons.includes(disputeReason)) {
    return res.status(400).json({
      error: "Motif de litige invalide. Veuillez sélectionner l'un des motifs suivants : Non-conforme, Cassé, Contrefaçon."
    });
  }

  // Validate written description (disputeDetails)
  if (!disputeDetails || typeof disputeDetails !== "string" || disputeDetails.trim().length < 10) {
    return res.status(400).json({
      error: "Une description détaillée (minimum 10 caractères) est obligatoire pour ouvrir un litige."
    });
  }

  // Validate mandatory photos upload (disputePhotos)
  if (!disputePhotos || !Array.isArray(disputePhotos) || disputePhotos.length === 0) {
    return res.status(400).json({
      error: "L'upload de photos d'évidence est obligatoire pour constituer votre dossier de réclamation."
    });
  }

  try {
    let createdDisputeId = "";

    await db.runTransaction(async (t: firestore.Transaction) => {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await t.get(orderRef);

      if (!orderSnap.exists) {
        throw new Error("Commande introuvable.");
      }

      const orderData = orderSnap.data() as OrderDoc;

      // Only the buyer can open a dispute
      if (orderData.userId !== buyerId && orderData.buyerId !== buyerId) {
        throw new Error("Accès refusé.");
      }

      if (orderData.status !== "delivered" && orderData.status !== "DELIVERED") {
        throw new Error("Impossible d'ouvrir un litige sur une commande non livrée.");
      }

      if (orderData.disputeRequest) {
        throw new Error("Un litige est déjà ouvert pour cette commande.");
      }

      // Enforce 3-day eligibility window following delivery
      const deliveredAtRaw = orderData.deliveredAt || orderData.updatedAt;
      let deliveredAtDate: Date | null = null;
      if (deliveredAtRaw) {
        if (typeof (deliveredAtRaw as { toDate?: () => Date }).toDate === "function") {
          deliveredAtDate = (deliveredAtRaw as { toDate: () => Date }).toDate();
        } else {
          deliveredAtDate = new Date(deliveredAtRaw as string | number | Date);
        }
      }

      if (deliveredAtDate && !isNaN(deliveredAtDate.getTime())) {
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        if (Date.now() - deliveredAtDate.getTime() > threeDaysInMs) {
          throw new Error("ELIGIBILITY_WINDOW_EXPIRED");
        }
      }

      // Identify the seller
      const targetSellerUid = (orderData.sellerIds && orderData.sellerIds[0]) || orderData.sellerId;
      if (!targetSellerUid) throw new Error("Vendeur introuvable pour ce litige.");

      const amountToFreeze = Number(orderData.total) || 0;

      const disputeRef = db.collection("disputes").doc();
      const disputeId = disputeRef.id;

      const disputeObj = {
        id: disputeId,
        orderId: orderId,
        buyerId: buyerId,
        sellerId: targetSellerUid,
        status: 'open',
        reason: disputeReason,
        details: disputeDetails || '',
        photos: disputePhotos || [],
        frozenAmount: amountToFreeze,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      createdDisputeId = disputeId;

      t.set(disputeRef, disputeObj);

      t.update(orderRef, {
        status: 'dispute_open',
        hasDispute: true,
        disputeId: disputeId,
        disputeRequest: disputeObj, // Keep for backward compatibility
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const notifRef = db.collection("user_notifications").doc();
      t.set(notifRef, {
        recipientId: targetSellerUid,
        title: {
          fr: "Alerte de Litige",
          ar: "تنبيه نزاع",
          en: "Dispute Alert"
        },
        message: {
          fr: `Le client a ouvert un litige pour la commande #${orderId.substring(0,8)}. Vos fonds (${amountToFreeze} DA) sont gelés en attendant la résolution.`,
          ar: `قام العميل بفتح نزاع للطلب #${orderId.substring(0,8)}. تم تجميد أموالك (${amountToFreeze} دينار) لحين الحل.`,
          en: `The customer opened a dispute for order #${orderId.substring(0,8)}. Your funds (${amountToFreeze} DZD) are frozen pending resolution.`
        },
        type: "dispute_opened",
        orderId: orderId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    if (createdDisputeId) {
      // Async task to generate Gemini summary
      (async () => {
        try {
          if (!process.env.GEMINI_API_KEY) {
             console.warn("No GEMINI_API_KEY, skipping dispute AI summary");
             return;
          }
          const genAI = new GoogleGenAI({
             apiKey: process.env.GEMINI_API_KEY,
             httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });
          
          const parts: any[] = [];
          
          const systemInstruction = `Vous êtes l'assistant de médiation officiel d'OLMART, la marketplace leader en Algérie.
Votre rôle est d'analyser de manière objective le litige ouvert par l'acheteur et de produire instantanément un Rapport d'Analyse IA structuré pour l'administrateur afin de l'aider à résoudre ce litige.

Le rapport doit obligatoirement être rédigé en français professionnel, être propre, structuré, et présenter exactement les points clés suivants :
- **Analyse de la réclamation de l'acheteur** : Synthèse de la réclamation, faits relevés, et mots-clés importants.
- **Vérification de la réponse du vendeur** : À ce stade initial, indiquez "Aucune réponse fournie à ce stade - En attente des arguments du vendeur".
- **Niveau de gravité du litige** : Évaluez rigoureusement le niveau de gravité en tant que "Faible", "Moyen" ou "Élevé" en vous basant sur la description écrite et l'analyse visuelle des photos d'évidence jointes.
- **Recommandation d'arbitrage financier** : Donnez une recommandation claire basée sur les conditions générales d'OLMART (ex: remboursement partiel, remboursement intégral après retour, ou rejet si la réclamation est abusive).`;

          parts.push({
             text: `Détails du Litige :
- Commande ID: ${orderId}
- Motif: ${disputeReason}
- Description détaillée de l'acheteur: "${disputeDetails}"

Veuillez analyser ces éléments textuels ainsi que les photos d'évidence jointes ci-dessous pour produire instantanément le Rapport d'Analyse IA structuré.`
          });

          // Fetch and process photos for Gemini multimodal capability
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

          const aiSummary = aiResponse.text;

          if (aiSummary) {
            await db.collection("disputes").doc(createdDisputeId).update({
              aiSummary: aiSummary,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            await db.collection("disputeMessages").add({
               disputeId: createdDisputeId,
               senderId: 'system_ai',
               senderRole: 'admin',
               message: `🤖 [Pré-Analyse IA Médiateur]\n\n${aiSummary}`,
               createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        } catch (aiErr) {
           console.error("AI Mediation summary failed:", aiErr);
        }
      })();
    }

    res.json({ success: true });
  } catch (error: unknown) {
    console.error("Dispute error:", error);
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    if (msg === "ELIGIBILITY_WINDOW_EXPIRED") {
      return res.status(400).json({ error: "La fenêtre d'éligibilité est dépassée. L'ouverture d'un litige n'est possible que dans les 3 jours suivant la livraison du colis." });
    }
    if (msg === "Commande introuvable.") {
      return res.status(404).json({ error: "Commande introuvable." });
    }
    if (msg === "Accès refusé.") {
      return res.status(403).json({ error: "Accès refusé." });
    }
    if (msg === "Impossible d'ouvrir un litige sur une commande non livrée.") {
      return res.status(400).json({ error: "Impossible d'ouvrir un litige sur une commande non livrée." });
    }
    if (msg === "Un litige est déjà ouvert pour cette commande.") {
      return res.status(400).json({ error: "Un litige est déjà ouvert pour cette commande." });
    }
    if (msg === "Vendeur introuvable pour ce litige.") {
      return res.status(400).json({ error: "Vendeur introuvable pour ce litige." });
    }
    res.status(500).json({ error: msg });
  }
});


router.post("/buyer/orders/return", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, reason, details } = req.body;
  const userId = req.user?.uid || "";

  if (!orderId || !reason) {
    return res.status(400).json({ error: "orderId and reason are required" });
  }

  try {
    const orderRef = db.collection("orders").doc(orderId);
    let returnObj: Record<string, unknown> | undefined;

    await db.runTransaction(async (t: firestore.Transaction) => {
      const snap = await t.get(orderRef);
      if (!snap.exists) {
        throw new Error("Commande introuvable");
      }
      const orderData = snap.data();
      if (orderData?.userId !== userId) {
        throw new Error("Accès non autorisé");
      }

      returnObj = {
        id: `ret_${Date.now()}`,
        status: 'pending',
        reason,
        details: details || "",
        createdAt: new Date().toISOString()
      };

      t.update(orderRef, {
        status: 'RETURN_REQUESTED',
        returnRequest: returnObj,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return res.json({ success: true, returnRequest: returnObj });
  } catch (error: unknown) {
    console.error("Order return error:", error);
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: msg });
  }
});



export default router;
