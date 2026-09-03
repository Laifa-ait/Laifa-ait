import crypto from "crypto";
import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { EscrowAccount, WalletAccount, PaymentMethod } from "../payment.types";
import { Order } from "../../order/order.types";

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
   * Verify cryptographic signature for Chargily Pay V2 (Edahabia / CIB) callbacks.
   * Enforces fail-closed validation across all environments.
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
      safeLogger.error("[Webhook Payment] CHARGILY_WEBHOOK_SECRET is not configured. Failing closed.");
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
   * Verify cryptographic signature for BaridiMob callbacks.
   * Enforces fail-closed validation across all environments.
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
      safeLogger.error("[Webhook Payment] BARIDIMOB_WEBHOOK_SECRET is not configured. Failing closed.");
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
   * Process Chargily (Edahabia / CIB) payment result atomically with order & amount reconciliation
   */
  public static async processChargilyEvent(payload: ChargilyWebhookPayload): Promise<{ success: boolean; message: string }> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    // Require stable event identifier to prevent replay and guarantee idempotency
    const eventId = payload.id || payload.data?.id;
    if (!eventId) {
      safeLogger.warn("[Webhook Payment] Chargily event rejected: Missing event identifier");
      return { success: false, message: "Identifiant d'événement manquant" };
    }

    const orderId = payload.data?.metadata?.orderId || payload.data?.id;
    if (!orderId) {
      safeLogger.warn("[Webhook Payment] Chargily event missing orderId", { eventId });
      return { success: false, message: "orderId manquant dans les métadonnées" };
    }

    const logRef = db.collection("payment_webhooks_log").doc(eventId);
    const orderRef = db.collection("orders").doc(orderId);
    const escrowRef = db.collection("escrow_accounts").doc(orderId);

    const eventType = payload.type || (payload.data?.status === "paid" ? "checkout.paid" : "checkout.failed");
    const isPaid = eventType === "checkout.paid" || eventType === "invoice.paid" || payload.data?.status === "paid";
    const paidAmount = Number(payload.data?.amount ?? 0);
    const currency = (payload.data?.currency || "dzd").toLowerCase();
    const now = new Date().toISOString();

    let finalMessage = "Événement Chargily traité avec succès";

    await db.runTransaction(async (transaction) => {
      const existingLog = await transaction.get(logRef);
      if (existingLog.exists && existingLog.data()?.processed) {
        safeLogger.info("[Webhook Payment] Idempotency skip: Chargily event already processed", { eventId });
        finalMessage = "Événement déjà traité (idempotent)";
        return;
      }

      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        safeLogger.warn("[Webhook Payment] Chargily event rejected: Order does not exist", { orderId, eventId });
        transaction.set(logRef, {
          eventId,
          provider: "CHARGILY",
          eventType,
          orderId,
          amountDZD: paidAmount,
          status: "REJECTED_ORDER_NOT_FOUND",
          processed: true,
          processedAt: now,
        });
        finalMessage = "Commande introuvable";
        return;
      }

      const order = orderDoc.data() as Order;

      if (isPaid) {
        // 1. Reconcile Currency
        if (currency !== "dzd") {
          safeLogger.error("[Webhook Payment] Currency mismatch on Chargily payment", { orderId, currency, expected: "dzd" });
          transaction.set(logRef, {
            eventId,
            provider: "CHARGILY",
            eventType,
            orderId,
            amountDZD: paidAmount,
            status: "REJECTED_CURRENCY_MISMATCH",
            processed: true,
            processedAt: now,
          });
          finalMessage = "Devise invalide";
          return;
        }

        // 2. Reconcile Paid Amount with Order Total
        const expectedTotal = Number(order.total || 0);
        if (paidAmount < expectedTotal) {
          safeLogger.error("[Webhook Payment] Underpayment detected on Chargily payment", {
            orderId,
            paidAmount,
            expectedTotal,
          });
          transaction.set(logRef, {
            eventId,
            provider: "CHARGILY",
            eventType,
            orderId,
            amountDZD: paidAmount,
            expectedTotal,
            status: "REJECTED_UNDERPAYMENT",
            processed: true,
            processedAt: now,
          });
          finalMessage = "Montant payé inférieur au montant de la commande";
          return;
        }

        // 3. Idempotent Order State Transition
        if (order.paymentStatus !== "PAID") {
          transaction.update(orderRef, {
            status: "PROCESSING",
            paymentStatus: "PAID",
            paymentMethod: "CIB_EDAHABIA",
            paidAt: now,
            updatedAt: now,
          });
        }

        // 4. Setup Escrow Account atomically in the same transaction
        const buyerId = order.userId || order.buyerId || payload.data?.metadata?.buyerId || "unknown_buyer";
        const sellerId = order.sellerIds?.[0] || order.items?.[0]?.sellerId || payload.data?.metadata?.sellerId || "unknown_seller";
        const totalAmountDZD = expectedTotal > 0 ? expectedTotal : paidAmount;

        const existingEscrowDoc = await transaction.get(escrowRef);
        if (!existingEscrowDoc.exists) {
          const feeRate = 5;
          const platformFeeDZD = Math.round((totalAmountDZD * feeRate) / 100);
          const sellerPayoutAmountDZD = totalAmountDZD - platformFeeDZD;
          const autoReleaseDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

          const escrowData: EscrowAccount = {
            id: orderId,
            orderId,
            buyerId,
            sellerId,
            totalAmountDZD,
            platformFeeRatePercent: feeRate,
            platformFeeDZD,
            sellerPayoutAmountDZD,
            status: "HELD",
            paymentMethod: "CIB_EDAHABIA" as PaymentMethod,
            heldAt: now,
            autoReleaseAt: autoReleaseDate,
          };

          transaction.set(escrowRef, escrowData);

          const walletRef = db.collection("seller_wallets").doc(sellerId);
          const walletDoc = await transaction.get(walletRef);
          if (walletDoc.exists) {
            const wallet = walletDoc.data() as WalletAccount;
            transaction.update(walletRef, {
              pendingEscrowBalanceDZD: (wallet.pendingEscrowBalanceDZD || 0) + sellerPayoutAmountDZD,
              updatedAt: now,
            });
          } else {
            const newWallet: WalletAccount = {
              sellerId,
              availableBalanceDZD: 0,
              pendingEscrowBalanceDZD: sellerPayoutAmountDZD,
              totalEarningsDZD: 0,
              totalWithdrawnDZD: 0,
              currency: "DZD",
              updatedAt: now,
            };
            transaction.set(walletRef, newWallet);
          }
        }

        // 5. Record successful webhook log
        transaction.set(logRef, {
          eventId,
          provider: "CHARGILY",
          eventType,
          orderId,
          amountDZD: paidAmount,
          expectedTotal,
          processed: true,
          status: "SUCCESS",
          processedAt: now,
        });
      } else {
        // Payment failed
        if (order.paymentStatus !== "PAID") {
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
          amountDZD: paidAmount,
          status: "FAILED",
          processed: true,
          processedAt: now,
        });
      }
    });

    return { success: true, message: finalMessage };
  }

  /**
   * Process BaridiMob payment result atomically with order & amount reconciliation
   */
  public static async processBaridiMobEvent(payload: BaridiMobWebhookPayload): Promise<{ success: boolean; message: string }> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const eventId = payload.transactionId;
    if (!eventId) {
      safeLogger.warn("[Webhook Payment] BaridiMob event rejected: Missing transactionId");
      return { success: false, message: "transactionId manquant dans la requête BaridiMob" };
    }

    const orderId = payload.orderId;
    if (!orderId) {
      safeLogger.warn("[Webhook Payment] BaridiMob callback missing orderId", { eventId });
      return { success: false, message: "orderId manquant dans la requête BaridiMob" };
    }

    const logRef = db.collection("payment_webhooks_log").doc(`baridimob_${eventId}`);
    const orderRef = db.collection("orders").doc(orderId);
    const escrowRef = db.collection("escrow_accounts").doc(orderId);
    const now = new Date().toISOString();

    const isSuccess = payload.status === "SUCCESS";
    const paidAmount = Number(payload.amountDZD ?? 0);
    let finalMessage = "Callback BaridiMob traité avec succès";

    await db.runTransaction(async (transaction) => {
      const existingLog = await transaction.get(logRef);
      if (existingLog.exists && existingLog.data()?.processed) {
        safeLogger.info("[Webhook Payment] Idempotency skip: BaridiMob transaction already processed", { eventId });
        finalMessage = "Transaction déjà traitée (idempotent)";
        return;
      }

      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        safeLogger.warn("[Webhook Payment] BaridiMob event rejected: Order does not exist", { orderId, eventId });
        transaction.set(logRef, {
          eventId,
          provider: "BARIDIMOB",
          orderId,
          amountDZD: paidAmount,
          status: "REJECTED_ORDER_NOT_FOUND",
          processed: true,
          processedAt: now,
        });
        finalMessage = "Commande introuvable";
        return;
      }

      const order = orderDoc.data() as Order;

      if (isSuccess) {
        // Reconcile Amount with Order Total
        const expectedTotal = Number(order.total || 0);
        if (paidAmount < expectedTotal) {
          safeLogger.error("[Webhook Payment] Underpayment detected on BaridiMob payment", {
            orderId,
            paidAmount,
            expectedTotal,
          });
          transaction.set(logRef, {
            eventId,
            provider: "BARIDIMOB",
            orderId,
            amountDZD: paidAmount,
            expectedTotal,
            status: "REJECTED_UNDERPAYMENT",
            processed: true,
            processedAt: now,
          });
          finalMessage = "Montant payé inférieur au montant de la commande";
          return;
        }

        if (order.paymentStatus !== "PAID") {
          transaction.update(orderRef, {
            status: "PROCESSING",
            paymentStatus: "PAID",
            paymentMethod: "BARIDIMOB",
            paidAt: now,
            updatedAt: now,
          });
        }

        // Setup Escrow Account atomically in the transaction
        const buyerId = order.userId || order.buyerId || payload.buyerId || "unknown_buyer";
        const sellerId = order.sellerIds?.[0] || order.items?.[0]?.sellerId || payload.sellerId || "unknown_seller";
        const totalAmountDZD = expectedTotal > 0 ? expectedTotal : paidAmount;

        const existingEscrowDoc = await transaction.get(escrowRef);
        if (!existingEscrowDoc.exists) {
          const feeRate = 5;
          const platformFeeDZD = Math.round((totalAmountDZD * feeRate) / 100);
          const sellerPayoutAmountDZD = totalAmountDZD - platformFeeDZD;
          const autoReleaseDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

          const escrowData: EscrowAccount = {
            id: orderId,
            orderId,
            buyerId,
            sellerId,
            totalAmountDZD,
            platformFeeRatePercent: feeRate,
            platformFeeDZD,
            sellerPayoutAmountDZD,
            status: "HELD",
            paymentMethod: "BARIDIMOB" as PaymentMethod,
            heldAt: now,
            autoReleaseAt: autoReleaseDate,
          };

          transaction.set(escrowRef, escrowData);

          const walletRef = db.collection("seller_wallets").doc(sellerId);
          const walletDoc = await transaction.get(walletRef);
          if (walletDoc.exists) {
            const wallet = walletDoc.data() as WalletAccount;
            transaction.update(walletRef, {
              pendingEscrowBalanceDZD: (wallet.pendingEscrowBalanceDZD || 0) + sellerPayoutAmountDZD,
              updatedAt: now,
            });
          } else {
            const newWallet: WalletAccount = {
              sellerId,
              availableBalanceDZD: 0,
              pendingEscrowBalanceDZD: sellerPayoutAmountDZD,
              totalEarningsDZD: 0,
              totalWithdrawnDZD: 0,
              currency: "DZD",
              updatedAt: now,
            };
            transaction.set(walletRef, newWallet);
          }
        }

        transaction.set(logRef, {
          eventId,
          provider: "BARIDIMOB",
          orderId,
          amountDZD: paidAmount,
          expectedTotal,
          processed: true,
          status: "SUCCESS",
          processedAt: now,
        });
      } else {
        if (order.paymentStatus !== "PAID") {
          transaction.update(orderRef, {
            paymentStatus: "FAILED",
            updatedAt: now,
          });
        }

        transaction.set(logRef, {
          eventId,
          provider: "BARIDIMOB",
          orderId,
          amountDZD: paidAmount,
          status: "FAILED",
          processed: true,
          processedAt: now,
        });
      }
    });

    return { success: true, message: finalMessage };
  }
}
