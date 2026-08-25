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

  /**
   * Calcule les données du graphique (GMV et Commissions par jour) sur les X derniers jours.
   */
  static async getChartData(days: number): Promise<{date: string, revenu: number, commission: number}[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days + 1);
    fromDate.setHours(0,0,0,0);

    const ordersSnap = await db.collection("orders").where("status", "==", "DELIVERED").get();

    const chartMap = new Map<string, { revenu: number, commission: number }>();
    
    // Initialisation pour éviter les trous dans le graphique
    for (let i = 0; i < days; i++) {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        chartMap.set(dateStr, { revenu: 0, commission: 0 });
    }

    ordersSnap.forEach((doc) => {
      const o = doc.data();
      if (!o.createdAt) return;
      
      let orderDate: Date;
      if (typeof o.createdAt.toDate === 'function') {
        orderDate = o.createdAt.toDate();
      } else if (o.createdAt._seconds) {
        orderDate = new Date(o.createdAt._seconds * 1000);
      } else {
        orderDate = new Date(o.createdAt);
      }

      if (orderDate >= fromDate) {
         const dateStr = orderDate.toISOString().split('T')[0];
         if (chartMap.has(dateStr)) {
            const current = chartMap.get(dateStr)!;
            const amount = typeof o.totalAmount === "number" ? o.totalAmount : 0;
            const comm = typeof o.commissionAmount === "number" ? o.commissionAmount : 0;
            current.revenu += amount;
            current.commission += comm;
         }
      }
    });

    const result = Array.from(chartMap.entries()).map(([date, data]) => ({
       date,
       revenu: data.revenu,
       commission: data.commission
    })).sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }
}
