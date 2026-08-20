import { admin, db } from "../../../config/firebase-admin";

export interface UpdateCommissionConfigParams {
  adminId: string;
  defaultRate: number;
  categoryRates: Record<string, number>;
}

export interface FinancialSummaryResult {
  totalGMV: number;
  totalCommissions: number;
  totalOrdersCount: number;
  pendingWithdrawalsAmount: number;
  pendingWithdrawalsCount: number;
}

export class AdminFinanceService {
  /**
   * Récupère la configuration actuelle des commissions.
   */
  static async getCommissionConfig(): Promise<{ defaultRate: number; categoryRates: Record<string, number> }> {
    const docSnap = await db.collection("system_config").doc("commissions").get();

    if (!docSnap.exists) {
      return { defaultRate: 5, categoryRates: {} };
    }

    const data = docSnap.data() || {};
    return {
      defaultRate: typeof data.defaultRate === "number" ? data.defaultRate : 5,
      categoryRates: (data.categoryRates as Record<string, number>) || {},
    };
  }

  /**
   * Met à jour la configuration globale des commissions.
   */
  static async updateCommissionConfig(params: UpdateCommissionConfigParams): Promise<{ success: boolean }> {
    const { adminId, defaultRate, categoryRates } = params;

    await db.collection("system_config").doc("commissions").set(
      {
        defaultRate,
        categoryRates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: adminId,
      },
      { merge: true }
    );

    return { success: true };
  }

  /**
   * Calcule le résumé financier (GMV, commissions, retraits en attente).
   */
  static async getFinancialSummary(): Promise<FinancialSummaryResult> {
    const ordersSnap = await db.collection("orders").where("status", "==", "DELIVERED").get();

    let totalGMV = 0;
    let totalCommissions = 0;
    let totalOrdersCount = 0;

    ordersSnap.forEach((doc) => {
      const o = doc.data();
      const amount = typeof o.totalAmount === "number" ? o.totalAmount : 0;
      const comm = typeof o.commissionAmount === "number" ? o.commissionAmount : 0;
      totalGMV += amount;
      totalCommissions += comm;
      totalOrdersCount++;
    });

    const pendingWithdrawalsSnap = await db
      .collection("withdrawals")
      .where("status", "==", "pending")
      .get();

    let pendingWithdrawalsAmount = 0;
    let pendingWithdrawalsCount = 0;

    pendingWithdrawalsSnap.forEach((doc) => {
      const w = doc.data();
      const amount = typeof w.amount === "number" ? w.amount : 0;
      pendingWithdrawalsAmount += amount;
      pendingWithdrawalsCount++;
    });

    return {
      totalGMV,
      totalCommissions,
      totalOrdersCount,
      pendingWithdrawalsAmount,
      pendingWithdrawalsCount,
    };
  }
}
