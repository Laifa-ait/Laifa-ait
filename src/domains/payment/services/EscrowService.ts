import { db } from "../../../config/firebase-admin";
import { EscrowAccount, WalletAccount, WalletTransaction } from "../payment.types";
import { safeLogger } from "../../../utils/logger";

export class EscrowService {
  /**
   * Create an escrow record within an ACID transaction when an order is created
   */
  public static async holdEscrow(payload: {
    orderId: string;
    buyerId: string;
    sellerId: string;
    totalAmountDZD: number;
    paymentMethod: "CIB_EDAHABIA" | "BARIDIMOB" | "COD_AMAN" | "WALLET";
    platformFeeRatePercent?: number;
    autoReleaseDays?: number;
  }): Promise<EscrowAccount> {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const feeRate = payload.platformFeeRatePercent ?? 5;
    const platformFeeDZD = Math.round((payload.totalAmountDZD * feeRate) / 100);
    const sellerPayoutAmountDZD = payload.totalAmountDZD - platformFeeDZD;

    const escrowRef = db.collection("escrow_accounts").doc(payload.orderId);
    const walletRef = db.collection("seller_wallets").doc(payload.sellerId);

    const now = new Date().toISOString();
    const autoReleaseDate = new Date(Date.now() + (payload.autoReleaseDays ?? 3) * 24 * 60 * 60 * 1000).toISOString();

    const escrowData: EscrowAccount = {
      id: payload.orderId,
      orderId: payload.orderId,
      buyerId: payload.buyerId,
      sellerId: payload.sellerId,
      totalAmountDZD: payload.totalAmountDZD,
      platformFeeRatePercent: feeRate,
      platformFeeDZD,
      sellerPayoutAmountDZD,
      status: "HELD",
      paymentMethod: payload.paymentMethod,
      heldAt: now,
      autoReleaseAt: autoReleaseDate,
    };

    await db.runTransaction(async (transaction) => {
      const existingEscrow = await transaction.get(escrowRef);
      if (existingEscrow.exists) {
        throw new Error("ESCROW_ALREADY_EXISTS");
      }

      const walletDoc = await transaction.get(walletRef);
      if (walletDoc.exists) {
        const wallet = walletDoc.data() as WalletAccount;
        transaction.update(walletRef, {
          pendingEscrowBalanceDZD: (wallet.pendingEscrowBalanceDZD || 0) + sellerPayoutAmountDZD,
          updatedAt: now,
        });
      } else {
        const newWallet: WalletAccount = {
          sellerId: payload.sellerId,
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
    });

    safeLogger.info("Escrow funds held in transaction", { orderId: payload.orderId, amount: payload.totalAmountDZD });
    return escrowData;
  }

  /**
   * Release escrow funds to seller's wallet after buyer confirmation or timeout
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
