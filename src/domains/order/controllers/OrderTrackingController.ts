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
import { webhookLimiter } from "../../../middlewares/rateLimiters";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

const router = Router();

// Helper de vérification HMAC SHA-256 avec protection timing-safe contre attaques par canal auxiliaire
const verifyCarrierWebhookSignature = (
  payload: unknown,
  providedSignatureHeader: string | string[] | undefined,
  providedKeyHeader: string | string[] | undefined,
  secretKey: string
): boolean => {
  if (!secretKey) return false;

  // 1. Vérification par signature numérique HMAC SHA-256
  const sigHeader = Array.isArray(providedSignatureHeader) ? providedSignatureHeader[0] : providedSignatureHeader;
  if (sigHeader) {
    const cleanSig = sigHeader.replace(/^sha256=/i, "").trim();
    const rawBody = typeof payload === "string" ? payload : JSON.stringify(payload);
    const computedHMAC = crypto.createHmac("sha256", secretKey).update(rawBody).digest("hex");

    try {
      const sigBuffer = Buffer.from(cleanSig, "hex");
      const computedBuffer = Buffer.from(computedHMAC, "hex");
      if (sigBuffer.length === computedBuffer.length && crypto.timingSafeEqual(sigBuffer, computedBuffer)) {
        return true;
      }
    } catch {
      // En cas de format invalide
    }
  }

  // 2. Fallback sécurisé par Clé API avec comparaison à temps constant
  const keyHeader = Array.isArray(providedKeyHeader) ? providedKeyHeader[0] : providedKeyHeader;
  if (keyHeader) {
    const cleanKey = keyHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const keyBuffer = Buffer.from(cleanKey);
      const secretBuffer = Buffer.from(secretKey);
      if (keyBuffer.length === secretBuffer.length && crypto.timingSafeEqual(keyBuffer, secretBuffer)) {
        return true;
      }
    } catch {
      // En cas d'erreur de conversion Buffer
    }
  }

  return false;
};

// Route de mise à jour manuelle des informations de suivi par le vendeur (Livraison Directe Vendeur)
router.post("/seller/orders/tracking", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, carrier, trackingNumber, trackingLink } = req.body;
  const sellerId = req.user?.uid || "";

  if (!orderId || !trackingNumber) {
    return res.status(400).json({ error: "orderId and trackingNumber are required" });
  }

  try {
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderData = orderDoc.data();
    const isUserAdmin = req.user?.role === "admin";
    const isUserSeller = orderData?.sellerIds?.includes(sellerId) || orderData?.sellerId === sellerId;

    if (!isUserAdmin && !isUserSeller) {
      return res.status(403).json({ error: "Forbidden: You are not authorized to update this order" });
    }

    const finalCarrier = carrier || "Livraison Directe Vendeur";

    // Update order status & tracking info in Firestore
    await orderRef.update({
      carrier: finalCarrier,
      trackingNumber: trackingNumber,
      trackingLink: trackingLink || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add log entry
    await orderRef.collection("order_logs").add({
      status: orderData?.status || "processing",
      type: "tracking_updated",
      date: admin.firestore.FieldValue.serverTimestamp(),
      carrier: finalCarrier,
      trackingNumber,
      trackingLink: trackingLink || "",
      actor: req.user?.email || sellerId
    });

    console.log(`[Firestore Core] 🟢 [Olmart Delivery] Direct Seller shipping info updated for order ${orderId} by ${req.user?.email || sellerId}`);

    return res.json({
      success: true,
      message: "Informations de livraison directe vendeur mises à jour avec succès."
    });
  } catch (error: unknown) {
    console.error("[Order Tracking] ❌ Error updating tracking info:", error);
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: msg });
  }
});



router.post("/prepare-shipment", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, orderIds } = req.body;
  const sellerId = req.user?.uid || "";
  const idsToProcess = orderIds || (orderId ? [orderId] : []);

  if (idsToProcess.length === 0) return res.status(400).json({ error: "orderId ou orderIds requis" });

  try {
    const trackingNumbers: Record<string, string> = {};
    const pdfUrl = ""; // No external fake URL. Local thermal printing is triggered on the frontend

    for (const id of idsToProcess) {
      const orderDoc = await db.collection("orders").doc(id).get();
      const orderData = orderDoc.data();
      const isUserAdmin = req.user?.role === "admin";
      const isUserSeller = orderData?.sellerIds?.includes(sellerId) || orderData?.sellerId === sellerId;
      if (!orderDoc.exists || (!isUserAdmin && !isUserSeller)) {
        continue;
      }

      // Generate stable, idempotent internal trackingId if missing or legacy fake "EXP-"
      const existingTrackingId = orderData?.trackingId;
      const internalTrackingId =
        typeof existingTrackingId === "string" && existingTrackingId.trim() !== "" && !existingTrackingId.startsWith("EXP-")
          ? existingTrackingId
          : `OLM-SHP-${id.slice(-8).toUpperCase()}`;

      await db.collection("orders").doc(id).update({
        trackingId: internalTrackingId,
        labelUrl: pdfUrl,
        status: "shipped", // Update status to shipped directly so it's ready for delivery
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log event
      await db.collection("orders").doc(id).collection("order_logs").add({
        status: "shipped",
        type: "label_generated",
        date: admin.firestore.FieldValue.serverTimestamp(),
        trackingId: internalTrackingId,
      });

      trackingNumbers[id] = internalTrackingId;
    }

    if (orderId && !orderIds) {
      res.json({
        tracking_id: trackingNumbers[orderId],
        pdf_label_url: "", // Rely on local printing template
        status: "success",
      });
    } else {
      res.json({ trackingNumbers, pdfUrl: "", status: "success" });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});


router.post("/cron/sync-tracking", async (req: Request, res: Response) => {
  try {
    // Vérifier un secret Cron
    const cronSecret = req.headers["x-cron-secret"] || req.query.secret;
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized cron access" });
    }

    res.json({ success: true, syncedCount: 0, message: "Tracking sync complete" });
  } catch (error: unknown) {
    console.error("Cron sync tracking error:", error);
    res.status(500).json({ error: "Internal server error during sync" });
  }
});



export default router;
