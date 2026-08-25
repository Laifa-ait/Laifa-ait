import { Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { AdminFinanceService } from "../services/adminFinance.service";
import {
  AdminCommissionUpdateSchema,
} from "../../../validators/adminValidators";

const router = Router();

// GET /api/v1/admin/finances/commissions
router.get("/admin/finances/commissions", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const config = await AdminFinanceService.getCommissionConfig();
    res.json({ success: true, config });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// PUT /api/v1/admin/finances/commissions
router.put("/admin/finances/commissions", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = AdminCommissionUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { globalRate, defaultRate, categoryRates } = req.body;
  const effectiveDefaultRate = typeof globalRate === "number" ? globalRate : typeof defaultRate === "number" ? defaultRate : 5;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminFinanceService.updateCommissionConfig({
      adminId,
      defaultRate: effectiveDefaultRate,
      categoryRates: categoryRates || {},
    });
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// GET /api/v1/admin/finances/summary
router.get("/admin/finances/summary", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = await AdminFinanceService.getFinancialSummary();
    res.json({ success: true, summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// GET /api/v1/admin/finances/chart
router.get("/admin/finances/chart", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 30;
    const chartData = await AdminFinanceService.getChartData(days);
    res.json({ success: true, chartData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

export default router;
