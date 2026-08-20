import { Router, Response } from "express";
import { db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { SellerService } from "../../../services/SellerService";
import { SellerAnalyticsPeriod } from "../../../types/seller";

const router = Router();

// GET seller overview stats
router.get("/api/v1/seller/overview-stats", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const data = await SellerService.getOverviewStats(req.user.uid);
    return res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET seller analytics - REAL DATA ONLY
router.get("/api/v1/seller/analytics", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const period = (req.query.period as SellerAnalyticsPeriod) || "7d";

    const summaryDoc = await db.collection("seller_analytics").doc(uid).get();
    if (summaryDoc.exists) {
      const stats = summaryDoc.data()?.[period] || {};
      const revenue = Number(stats.revenue) || 0;
      const orders = Number(stats.orders) || 0;
      const aov = orders > 0 ? Math.round(revenue / orders) : 0;
      const conversionRate = Number(stats.conversionRate) || 0;
      const chartData = Array.isArray(stats.chartData) ? stats.chartData : [];
      const topProducts = Array.isArray(stats.topProducts) ? stats.topProducts : [];

      return res.json({
        revenue,
        orders,
        aov,
        conversionRate,
        chartData,
        topProducts
      });
    }

    // Pure real fallback when no analytics document exists yet
    return res.json({
      revenue: 0,
      orders: 0,
      aov: 0,
      conversionRate: 0,
      chartData: [],
      topProducts: []
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
