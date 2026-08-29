import { Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { admin, db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { AdminAIService } from "../services/adminAI.service";

const router = Router();

// Get configurations
router.get("/admin/ai-agents", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const configs = await AdminAIService.getAgentsConfigFromDb();
    res.json({ success: true, configs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});

// Toggle agent status
router.post("/admin/ai-agents/:key/toggle", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { isActive } = req.body;
    if (isActive === undefined) return res.status(400).json({ error: "isActive requis" });

    await AdminAIService.toggleAgentStatus(key, isActive);
    res.json({ success: true, key, isActive });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});

// Update configuration
router.post("/admin/ai-agents/:key/configure", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;
    const configData = req.body;

    await AdminAIService.configureAgent(key, configData);
    res.json({ success: true, key, config: configData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});

// Run Growth Analyst
router.post("/admin/ai-agents/growth/run", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportDoc = await AdminAIService.runGrowthAgent();
    res.json({ success: true, report: reportDoc });
  } catch (error: unknown) {
    safeLogger.error("Growth Agent execution error", { err: error instanceof Error ? error.message : String(error) });
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: "Une erreur est survenue lors de l'exécution de l'analyse : " + msg });
  }
});

// Run Cart Recovery Simulation
router.post("/admin/ai-agents/cart/run-simulation", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await AdminAIService.runCartSimulation();
    res.json({ success: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});

// Run Content Moderator Test
router.post("/admin/ai-agents/moderator/test", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Titre et description requis." });

    const result = await AdminAIService.moderateProduct(title, description);
    res.json({ success: true, result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});

// Run Sentinel System Diagnostics & AI Error Detection
router.post("/admin/ai-agents/sentinel/diagnose", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminEmail = req.user?.email || "admin@olmart.dz";
    const diagDoc = await AdminAIService.runSentinelDiagnostic(adminEmail);
    res.json({ success: true, report: diagDoc });
  } catch (error: unknown) {
    safeLogger.error("Sentinel Agent execution error", { err: error instanceof Error ? error.message : String(error) });
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: "Échec du diagnostic de l'Agent Sentinel : " + msg });
  }
});

// Save Checkout UX Audit via Admin SDK
router.post("/admin/checkout-audits", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { overallScore, scores, checksPassed, checksFailed, authorEmail } = req.body;

    const docRef = await admin.firestore().collection("checkout_audits").add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      overallScore: overallScore || 98,
      scores: scores || {},
      checksPassed: checksPassed || 15,
      checksFailed: checksFailed || 0,
      authorEmail: authorEmail || req.user?.email || "admin@olmart.dz"
    });

    await admin.firestore().collection("audit_logs").add({
      action: "CHECKOUT_UX_AUDIT",
      details: { reportId: docRef.id, score: overallScore },
      adminEmail: authorEmail || req.user?.email || "admin@olmart.dz",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, id: docRef.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});

// Get Checkout UX Audits
router.get("/admin/checkout-audits", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("checkout_audits").orderBy("timestamp", "desc").limit(10).get();
    const reports = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date()
    }));
    res.json({ success: true, reports });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: msg });
  }
});

export default router;
