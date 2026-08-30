import crypto from "crypto";
import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { EscrowService } from "./EscrowService";

export interface ChargilyWebhookPayload {
  id?: string;
  type?: string; // e.g. "checkout.paid", "checkout.failed", "invoice.paid"
  data?: {
    id?: string;
    status?: string; // "paid", "failed", "canceled"
    amount?: number;
    currency?: string;
    metadata?: {
      orderId?: string;
      buyerId?: string;
      sellerId?: string;
    };
    payment_method?: string;
  };
}

export interface BaridiMobWebhookPayload {
  transactionId?: string;
  orderId?: string;
  buyerId?: string;
  sellerId?: string;
  amountDZD?: number;
  status?: "SUCCESS" | "FAILED" | "CANCELLED";
  timestamp?: string;
}

export class WebhookService {
  /**
   * Verify cryptographic signature for Chargily Pay V2 (Edahabia / CIB) callbacks
   */
  public static verifyChargilySignature(
    rawOrStringBody: string | Buffer,
    signatureHeader?: string
  ): boolean {
    const secret = process.env.CHARGILY_WEBHOOK_SECRET || process.env.CHARGILY_SECRET_KEY;
    if (!signatureHeader || signatureHeader.trim() === "") {
      safeLogger.warn("[Webhook Payment] Chargily callback missing signature header");
      return false;
    }

    if (!secret) {
      if (process.env.NODE_ENV !== "production") {
        safeLogger.warn("[Webhook Payment] CHARGILY_WEBHOOK_SECRET not set in dev, skipping signature enforcement");
        return true;
      }
      safeLogger.error("[Webhook Payment] CHARGILY_WEBHOOK_SECRET not configured in production");
      return false;
    }

    const payloadStr = typeof rawOrStringBody === "string" ? rawOrStringBody : rawOrStringBody.toString("utf8");
    const computedHmac = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");

    try {
      const headerBuf = Buffer.from(signatureHeader.trim().toLowerCase(), "utf8");
      const computedBuf = Buffer.from(computedHmac.toLowerCase(), "utf8");
      if (headerBuf.length !== computedBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(headerBuf, computedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Verify cryptographic signature for BaridiMob callbacks
   */
  public static verifyBaridiMobSignature(
    rawOrStringBody: string | Buffer,
    signatureHeader?: string
  ): boolean {
    const secret = process.env.BARIDIMOB_WEBHOOK_SECRET || process.env.BARIDIMOB_SECRET_KEY;
    if (!signatureHeader || signatureHeader.trim() === "") {
      safeLogger.warn("[Webhook Payment] BaridiMob callback missing signature header");
      return false;
    }

    if (!secret) {
      if (process.env.NODE_ENV !== "production") {
        safeLogger.warn("[Webhook Payment] BARIDIMOB_WEBHOOK_SECRET not set in dev, skipping signature enforcement");
        return true;
      }
      safeLogger.error("[Webhook Payment] BARIDIMOB_WEBHOOK_SECRET not configured in production");
      return false;
    }

    const payloadStr = typeof rawOrStringBody === "string" ? rawOrStringBody : rawOrStringBody.toString("utf8");
    const computedHmac = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");

    try {
      const headerBuf = Buffer.from(signatureHeader.trim().toLowerCase(), "utf8");
      const computedBuf = Buffer.from(computedHmac.toLowerCase(), "utf8");
      if (headerBuf.length !== computedBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(headerBuf, computedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Process Chargily (Edahabia / CIB) payment result atomically in Firestore
   */
  public static async processChargilyEvent(payload: ChargilyWebhookPayload): Promise<{ success: boolean; message: string }> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const eventId = payload.id || `chargily_evt_${Date.now()}`;
    const eventType = payload.type || (payload.data?.status === "paid" ? "checkout.paid" : "checkout.failed");
    const orderId = payload.data?.metadata?.orderId || payload.data?.id;

    if (!orderId) {
      safeLogger.warn("[Webhook Payment] Chargily event missing orderId", { eventId });
      return { success: false, message: "orderId manquant dans les métadonnées" };
    }

    const logRef = db.collection("payment_webhooks_log").doc(eventId);
    const orderRef = db.collection("orders").doc(orderId);

    const now = new Date().toISOString();
    let processedResult = false;

    await db.runTransaction(async (transaction) => {
      const existingLog = await transaction.get(logRef);
      if (existingLog.exists && existingLog.data()?.processed) {
        safeLogger.info("[Webhook Payment] Idempotency skip: Chargily event already processed", { eventId });
        processedResult = true;
        return;
      }

      const isPaid = eventType === "checkout.paid" || eventType === "invoice.paid" || payload.data?.status === "paid";

      if (isPaid) {
        const orderDoc = await transaction.get(orderRef);
        if (orderDoc.exists) {
          transaction.update(orderRef, {
            status: "PROCESSING",
            paymentStatus: "PAID",
            paymentMethod: "CIB_EDAHABIA",
            paidAt: now,
            updatedAt: now,
          });
        }

        // Record event in log
        transaction.set(logRef, {
          eventId,
          provider: "CHARGILY",
          eventType,
          orderId,
          amountDZD: payload.data?.amount || 0,
          processed: true,
          processedAt: now,
        });

        processedResult = true;
      } else {
        const orderDoc = await transaction.get(orderRef);
        if (orderDoc.exists) {
          transaction.update(orderRef, {
            paymentStatus: "FAILED",
            updatedAt: now,
          });
        }

        transaction.set(logRef, {
          eventId,
          provider: "CHARGILY",
          eventType,
          orderId,
          processed: true,
          processedAt: now,
        });
      }
    });

    // If order was marked as paid, ensure escrow hold exists
    if (processedResult && (eventType === "checkout.paid" || payload.data?.status === "paid")) {
      try {
        const buyerId = payload.data?.metadata?.buyerId || "unknown_buyer";
        const sellerId = payload.data?.metadata?.sellerId || "unknown_seller";
        const amountDZD = payload.data?.amount || 0;

        await EscrowService.holdEscrow({
          orderId,
          buyerId,
          sellerId,
          totalAmountDZD: amountDZD,
          paymentMethod: "CIB_EDAHABIA",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg !== "ESCROW_ALREADY_EXISTS") {
          safeLogger.error("[Webhook Payment] Failed to hold escrow for Chargily payment", { orderId, err: msg });
        }
      }
    }

    return { success: true, message: "Événement Chargily traité avec succès" };
  }

  /**
   * Process BaridiMob payment result atomically in Firestore
   */
  public static async processBaridiMobEvent(payload: BaridiMobWebhookPayload): Promise<{ success: boolean; message: string }> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const eventId = payload.transactionId || `baridimob_tx_${Date.now()}`;
    const orderId = payload.orderId;

    if (!orderId) {
      safeLogger.warn("[Webhook Payment] BaridiMob callback missing orderId", { eventId });
      return { success: false, message: "orderId manquant dans la requête BaridiMob" };
    }

    const logRef = db.collection("payment_webhooks_log").doc(eventId);
    const orderRef = db.collection("orders").doc(orderId);
    const now = new Date().toISOString();

    const isSuccess = payload.status === "SUCCESS";

    await db.runTransaction(async (transaction) => {
      const existingLog = await transaction.get(logRef);
      if (existingLog.exists && existingLog.data()?.processed) {
        safeLogger.info("[Webhook Payment] Idempotency skip: BaridiMob transaction already processed", { eventId });
        return;
      }

      if (isSuccess) {
        const orderDoc = await transaction.get(orderRef);
        if (orderDoc.exists) {
          transaction.update(orderRef, {
            status: "PROCESSING",
            paymentStatus: "PAID",
            paymentMethod: "BARIDIMOB",
            paidAt: now,
            updatedAt: now,
          });
        }

        transaction.set(logRef, {
          eventId,
          provider: "BARIDIMOB",
          orderId,
          amountDZD: payload.amountDZD || 0,
          processed: true,
          processedAt: now,
        });
      } else {
        const orderDoc = await transaction.get(orderRef);
        if (orderDoc.exists) {
          transaction.update(orderRef, {
            paymentStatus: "FAILED",
            updatedAt: now,
          });
        }

        transaction.set(logRef, {
          eventId,
          provider: "BARIDIMOB",
          orderId,
          processed: true,
          processedAt: now,
        });
      }
    });

    if (isSuccess) {
      try {
        await EscrowService.holdEscrow({
          orderId,
          buyerId: payload.buyerId || "unknown_buyer",
          sellerId: payload.sellerId || "unknown_seller",
          totalAmountDZD: payload.amountDZD || 0,
          paymentMethod: "BARIDIMOB",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg !== "ESCROW_ALREADY_EXISTS") {
          safeLogger.error("[Webhook Payment] Failed to hold escrow for BaridiMob payment", { orderId, err: msg });
        }
      }
    }

    return { success: true, message: "Callback BaridiMob traité avec succès" };
  }
}
