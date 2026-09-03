import { db } from "../../../config/firebase-admin";
import { EscrowAccount, WalletAccount, WalletTransaction, PaymentMethod } from "../payment.types";
import { Order } from "../../order/order.types";
import { safeLogger } from "../../../utils/logger";

export interface HoldEscrowParams {
  orderId: string;
  callerUid?: string;
  isAdmin?: boolean;
  autoReleaseDays?: number;
  // Optional direct params when called internally by verified webhooks
  directBuyerId?: string;
  directSellerId?: string;
  directAmountDZD?: number;
  directPaymentMethod?: PaymentMethod;
}

export class EscrowService {
  /**
   * Create an escrow record within an ACID transaction after validating order and payment
   */
  public static async holdEscrow(payload: HoldEscrowParams): Promise<EscrowAccount> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const { orderId, callerUid, isAdmin = false, autoReleaseDays = 3 } = payload;
    const escrowRef = db.collection("escrow_accounts").doc(orderId);
    const orderRef = db.collection("orders").doc(orderId);

    const now = new Date().toISOString();
    const autoReleaseDate = new Date(Date.now() + autoReleaseDays * 24 * 60 * 60 * 1000).toISOString();

    const createdEscrow = await db.runTransaction(async (transaction): Promise<EscrowAccount> => {
      const existingEscrow = await transaction.get(escrowRef);
      if (existingEscrow.exists) {
        throw new Error("ESCROW_ALREADY_EXISTS");
      }

      // 1. Reconcile directly with order in Firestore
      const orderDoc = await transaction.get(orderRef);
      let buyerId = payload.directBuyerId;
      let sellerId = payload.directSellerId;
      let totalAmountDZD = payload.directAmountDZD;
      let paymentMethod: PaymentMethod = payload.directPaymentMethod || "CIB_EDAHABIA";

      if (orderDoc.exists) {
        const order = orderDoc.data() as Order;

        // Security check: caller must be the buyer or an admin
        if (callerUid && !isAdmin) {
          const orderBuyer = order.userId || order.buyerId;
          if (orderBuyer !== callerUid) {
            throw new Error("FORBIDDEN_ORDER_ACCESS");
          }
        }

        // Security check: order must be paid or confirmed
        const isPaid =
          order.paymentStatus === "PAID" ||
          order.status === "CONFIRMED" ||
          order.status === "PROCESSING" ||
          order.status === "confirmed" ||
          order.status === "processing";

        if (!isPaid && !isAdmin && !payload.directAmountDZD) {
          throw new Error("ORDER_NOT_PAID");
        }

        // Derive verified financial values from order
        totalAmountDZD = Number(order.total || totalAmountDZD || 0);
        buyerId = order.userId || order.buyerId || buyerId || "unknown_buyer";
        sellerId = order.sellerIds?.[0] || order.items?.[0]?.sellerId || sellerId || "unknown_seller";
        if (order.paymentMethod) {
          paymentMethod = order.paymentMethod as PaymentMethod;
        }
      } else if (!isAdmin && !payload.directAmountDZD) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (!buyerId) buyerId = "unknown_buyer";
      if (!sellerId) sellerId = "unknown_seller";
      if (!totalAmountDZD || totalAmountDZD <= 0) {
        throw new Error("INVALID_ORDER_AMOUNT");
      }

      // Server-authoritative platform fee (standard 5%)
      const feeRate = 5;
      const platformFeeDZD = Math.round((totalAmountDZD * feeRate) / 100);
      const sellerPayoutAmountDZD = totalAmountDZD - platformFeeDZD;

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
        paymentMethod,
        heldAt: now,
        autoReleaseAt: autoReleaseDate,
      };

      // 2. Update Seller Wallet pending balance
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

      transaction.set(escrowRef, escrowData);
      return escrowData;
    });

    safeLogger.info("Escrow funds held securely in transaction", {
      orderId,
      totalAmountDZD: createdEscrow.totalAmountDZD,
    });
    return createdEscrow;
  }

  /**
   * Release escrow funds to seller's wallet after buyer confirmation or admin override
   */
  public static async releaseEscrow(
    orderId: string,
    callerUid: string,
    isAdmin = false
  ): Promise<EscrowAccount> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const escrowRef = db.collection("escrow_accounts").doc(orderId);
    const orderRef = db.collection("orders").doc(orderId);
    const now = new Date().toISOString();
    let updatedEscrow: EscrowAccount | null = null;

    await db.runTransaction(async (transaction) => {
      const escrowDoc = await transaction.get(escrowRef);
      if (!escrowDoc.exists) {
        throw new Error("ESCROW_NOT_FOUND");
      }

      const escrow = escrowDoc.data() as EscrowAccount;
      if (escrow.status !== "HELD" && escrow.status !== "DISPUTED") {
        throw new Error(`ESCROW_CANNOT_BE_RELEASED_STATUS_${escrow.status}`);
      }

      // Only the buyer of the order or an authorized admin can release
      if (!isAdmin && escrow.buyerId !== callerUid) {
        throw new Error("FORBIDDEN_ESCROW_RELEASE");
      }

      // Verify order delivery state
      const orderDoc = await transaction.get(orderRef);
      if (orderDoc.exists) {
        const order = orderDoc.data() as Order;
        const validStatuses = [
          "DELIVERED",
          "delivered",
          "CONFIRMED",
          "confirmed",
          "COMPLETED",
          "completed",
          "PICKED_UP",
          "picked_up",
        ];
        if (!isAdmin && !validStatuses.includes(order.status)) {
          throw new Error("ORDER_NOT_DELIVERED");
        }
      }

      const walletRef = db.collection("seller_wallets").doc(escrow.sellerId);
      const walletDoc = await transaction.get(walletRef);

      const currentAvailable = walletDoc.exists ? (walletDoc.data()?.availableBalanceDZD || 0) : 0;
      const currentPending = walletDoc.exists ? (walletDoc.data()?.pendingEscrowBalanceDZD || 0) : 0;
      const currentEarnings = walletDoc.exists ? (walletDoc.data()?.totalEarningsDZD || 0) : 0;

      const newAvailable = currentAvailable + escrow.sellerPayoutAmountDZD;
      const newPending = Math.max(0, currentPending - escrow.sellerPayoutAmountDZD);
      const newEarnings = currentEarnings + escrow.sellerPayoutAmountDZD;

      transaction.update(walletRef, {
        availableBalanceDZD: newAvailable,
        pendingEscrowBalanceDZD: newPending,
        totalEarningsDZD: newEarnings,
        updatedAt: now,
      });

      // Log wallet transaction
      const txRef = db.collection("seller_wallet_transactions").doc();
      const txData: WalletTransaction = {
        id: txRef.id,
        sellerId: escrow.sellerId,
        type: "ESCROW_RELEASE",
        amountDZD: escrow.sellerPayoutAmountDZD,
        orderId: escrow.orderId,
        balanceAfterDZD: newAvailable,
        description: `Libération séquestre Olmart Aman - Commande #${orderId}`,
        createdAt: now,
      };
      transaction.set(txRef, txData);

      // Update escrow record
      updatedEscrow = {
        ...escrow,
        status: "RELEASED",
        releasedAt: now,
      };
      transaction.update(escrowRef, {
        status: "RELEASED",
        releasedAt: now,
      });
    });

    if (!updatedEscrow) {
      throw new Error("TRANSACTION_FAILED");
    }

    safeLogger.info("Escrow successfully released to seller wallet", { orderId });
    return updatedEscrow;
  }

  /**
   * Fetch escrow account for an order
   */
  public static async getEscrow(orderId: string): Promise<EscrowAccount | null> {
    if (!db) return null;
    const doc = await db.collection("escrow_accounts").doc(orderId).get();
    if (!doc.exists) return null;
    return doc.data() as EscrowAccount;
  }
}
