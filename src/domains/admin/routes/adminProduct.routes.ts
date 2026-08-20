import { Request, Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { ProductApprovalSchema, ProductRejectionSchema } from "../../../validators/adminValidators";
import { AdminProductService } from "../services/adminProduct.service";

const router = Router();

// GET /api/v1/admin/categories/list
router.get("/admin/categories/list", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await AdminProductService.listCategoriesSimple();
    res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// Tags management
router.get("/tags", async (req: Request, res: Response) => {
  try {
    const tags = await AdminProductService.listTags();
    res.json({ success: true, tags });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

router.post("/tags", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "Name and slug required" });
    const tag = await AdminProductService.createTag({ name, slug });
    res.json({ success: true, tag });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

router.delete("/tags/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await AdminProductService.deleteTag(req.params.id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// Recalculate Product Quality Scores
router.post("/admin/products/recalculate-scores", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "";
    const result = await AdminProductService.recalculateProductScores({ adminId });
    res.json({ success: true, count: result.count });
  } catch (error: unknown) {
    console.error("Error recalculating quality scores:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Approve Product
router.post("/admin/products/:id/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = ProductApprovalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const productId = req.params.id;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminProductService.approveProduct({ productId, adminId });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Produit non trouvé") {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    if (message.startsWith("Validation impossible")) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Reject Product
router.post("/admin/products/:id/reject", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = ProductRejectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const productId = req.params.id;
  const adminId = req.user?.uid || "";
  const { rejectionReasons, comment } = parsed.data;

  try {
    const result = await AdminProductService.rejectProduct({
      productId,
      adminId,
      rejectionReasons,
      comment,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Produit non trouvé") {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Category Management
router.get("/admin/categories", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await AdminProductService.listCategoriesFull();
    res.json({ success: true, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

router.put("/admin/categories/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;
    const adminId = req.user?.uid || "";

    if (commissionRate === undefined || typeof commissionRate !== "number" || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ error: "Commission rate valide requis (0 à 100%)" });
    }

    const result = await AdminProductService.updateCategoryCommission({
      categoryId: id,
      commissionRate,
      adminId,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

export default router;
