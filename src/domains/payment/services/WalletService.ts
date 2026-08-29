import { db } from "../../../config/firebase-admin";
import { WalletAccount, WalletTransaction, PayoutRequest, PayoutMethod } from "../payment.types";
import { safeLogger } from "../../../utils/logger";

export class WalletService {
  /**
   * Get or initialize seller wallet
   */
  public static async getSellerWallet(sellerId: string): Promise<WalletAccount> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const walletRef = db.collection("seller_wallets").doc(sellerId);
    const doc = await walletRef.get();

    if (doc.exists) {
      return doc.data() as WalletAccount;
    }

    const newWallet: WalletAccount = {
      sellerId,
      availableBalanceDZD: 0,
      pendingEscrowBalanceDZD: 0,
      totalEarningsDZD: 0,
      totalWithdrawnDZD: 0,
      currency: "DZD",
      updatedAt: new Date().toISOString(),
    };
    await walletRef.set(newWallet);
    return newWallet;
  }

  /**
   * Request a payout/withdrawal within an ACID transaction
   */
  public static async requestPayout(payload: {
    sellerId: string;
    amountDZD: number;
    method: PayoutMethod;
    accountDetails: string;
    accountHolderName: string;
  }): Promise<PayoutRequest> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const walletRef = db.collection("seller_wallets").doc(payload.sellerId);
    const payoutRef = db.collection("payout_requests").doc();
    const now = new Date().toISOString();
    let createdPayout: PayoutRequest | null = null;

    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists) {
        throw new Error("WALLET_NOT_FOUND");
      }

      const wallet = walletDoc.data() as WalletAccount;
      if (wallet.availableBalanceDZD < payload.amountDZD) {
        throw new Error("INSUFFICIENT_WALLET_BALANCE");
      }

      const newAvailable = wallet.availableBalanceDZD - payload.amountDZD;
      transaction.update(walletRef, {
        availableBalanceDZD: newAvailable,
        updatedAt: now,
      });

      createdPayout = {
        id: payoutRef.id,
        sellerId: payload.sellerId,
        amountDZD: payload.amountDZD,
        method: payload.method,
        accountDetails: payload.accountDetails,
        accountHolderName: payload.accountHolderName,
        status: "PENDING",
        createdAt: now,
      };
      transaction.set(payoutRef, createdPayout);

      const txRef = db.collection("seller_wallet_transactions").doc();
      const txData: WalletTransaction = {
        id: txRef.id,
        sellerId: payload.sellerId,
        type: "WITHDRAWAL_REQUEST",
        amountDZD: -payload.amountDZD,
        withdrawalId: payoutRef.id,
        balanceAfterDZD: newAvailable,
        description: `Demande de retrait ${payload.method} - #${payoutRef.id}`,
        createdAt: now,
      };
      transaction.set(txRef, txData);
    });

    if (!createdPayout) {
      throw new Error("PAYOUT_TRANSACTION_FAILED");
    }

    safeLogger.info("Payout requested successfully", { sellerId: payload.sellerId, amount: payload.amountDZD });
    return createdPayout;
  }

  /**
   * List recent transactions for seller wallet
   */
  public static async listTransactions(sellerId: string, limitCount = 50): Promise<WalletTransaction[]> {
    if (!db) return [];
    const snapshot = await db
      .collection("seller_wallet_transactions")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();

    return snapshot.docs.map((d) => d.data() as WalletTransaction);
  }

  /**
   * Admin: List pending payout requests
   */
  public static async listPayouts(status?: string): Promise<PayoutRequest[]> {
    if (!db) return [];
    let query: FirebaseFirestore.Query = db.collection("payout_requests");
    if (status) {
      query = query.where("status", "==", status);
    }
    const snapshot = await query.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((d) => d.data() as PayoutRequest);
  }

  /**
   * Admin: Process or resolve a payout (Mark paid with receipt, or reject and refund wallet)
   */
  public static async processPayout(
    payoutId: string,
    payload: { status: "PROCESSING" | "COMPLETED" | "REJECTED"; receiptUrl?: string; adminNotes?: string }
  ): Promise<PayoutRequest> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const payoutRef = db.collection("payout_requests").doc(payoutId);
    const now = new Date().toISOString();
    let updatedPayout: PayoutRequest | null = null;

    await db.runTransaction(async (transaction) => {
      const payoutDoc = await transaction.get(payoutRef);
      if (!payoutDoc.exists) {
        throw new Error("PAYOUT_NOT_FOUND");
      }

      const payout = payoutDoc.data() as PayoutRequest;
      if (payout.status === "COMPLETED" || payout.status === "REJECTED") {
        throw new Error("PAYOUT_ALREADY_FINALIZED");
      }

      const walletRef = db.collection("seller_wallets").doc(payout.sellerId);

      if (payload.status === "REJECTED") {
        // Refund amount back to seller's available balance
        const walletDoc = await transaction.get(walletRef);
        if (walletDoc.exists) {
          const wallet = walletDoc.data() as WalletAccount;
          const newAvailable = wallet.availableBalanceDZD + payout.amountDZD;
          transaction.update(walletRef, {
            availableBalanceDZD: newAvailable,
            updatedAt: now,
          });

          const txRef = db.collection("seller_wallet_transactions").doc();
          const txData: WalletTransaction = {
            id: txRef.id,
            sellerId: payout.sellerId,
            type: "WITHDRAWAL_REJECTED_REFUND",
            amountDZD: payout.amountDZD,
            withdrawalId: payoutId,
            balanceAfterDZD: newAvailable,
            description: `Remboursement suite à rejet de retrait #${payoutId}`,
            createdAt: now,
          };
          transaction.set(txRef, txData);
        }
      } else if (payload.status === "COMPLETED") {
        const walletDoc = await transaction.get(walletRef);
        if (walletDoc.exists) {
          const wallet = walletDoc.data() as WalletAccount;
          transaction.update(walletRef, {
            totalWithdrawnDZD: (wallet.totalWithdrawnDZD || 0) + payout.amountDZD,
            updatedAt: now,
          });
        }
      }

      updatedPayout = {
        ...payout,
        status: payload.status,
        receiptUrl: payload.receiptUrl || payout.receiptUrl,
        adminNotes: payload.adminNotes || payout.adminNotes,
        processedAt: now,
      };

      transaction.update(payoutRef, {
        status: payload.status,
        receiptUrl: payload.receiptUrl || null,
        adminNotes: payload.adminNotes || null,
        processedAt: now,
      });
    });

    if (!updatedPayout) {
      throw new Error("PAYOUT_UPDATE_FAILED");
    }

    safeLogger.info("Payout processed successfully", { payoutId, status: payload.status });
    return updatedPayout;
  }
}
