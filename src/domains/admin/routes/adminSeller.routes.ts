import { Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import {
  SellerApprovalSchema,
  SellerRejectionSchema,
  SellerSuspensionSchema,
  SellerDetailsUpdateSchema,
} from "../../../validators/adminValidators";
import { AdminSellerService } from "../services/adminSeller.service";
import { safeLogger } from "../../../utils/logger";

const router = Router();

// GET /api/v1/admin/sellers/list
router.get("/admin/sellers/list", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellers = await AdminSellerService.listSellersSimple();
    res.json({ success: true, sellers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Handle sellers query and pagination using offset
router.get("/admin/sellers", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");
    const limitNum = parseInt((req.query.limit as string) || "50");
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const result = await AdminSellerService.listSellersPaginated({
      page,
      limit: limitNum,
      status,
      search,
      sortBy,
      sortOrder,
    });

    res.json(result);
  } catch (error: unknown) {
    safeLogger.error("Error fetching sellers", { err: error instanceof Error ? error.message : String(error) });
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Approve Seller
router.post("/admin/sellers/:id/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = SellerApprovalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const sellerId = req.params.id;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminSellerService.approveSeller({ sellerId, adminId });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Vendeur non trouvé") {
      return res.status(404).json({ error: "Vendeur non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Reject Seller
router.post("/admin/sellers/:id/reject", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = SellerRejectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const sellerId = req.params.id;
  const adminId = req.user?.uid || "";
  const { reasons, comment } = parsed.data;

  try {
    const result = await AdminSellerService.rejectSeller({
      sellerId,
      adminId,
      reasons,
      comment,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Vendeur non trouvé") {
      return res.status(404).json({ error: "Vendeur non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Suspend Seller
router.post("/admin/sellers/:id/suspend", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = SellerSuspensionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const sellerId = req.params.id;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminSellerService.suspendSeller({ sellerId, adminId });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Vendeur non trouvé") {
      return res.status(404).json({ error: "Vendeur non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Update Seller Details (Internal Notes / Commission Rate)
router.patch("/admin/sellers/:id/details", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = SellerDetailsUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const sellerId = req.params.id;
  const adminId = req.user?.uid || "";
  const { internalNotes, commissionRate } = parsed.data;

  try {
    const result = await AdminSellerService.updateSellerDetails({
      sellerId,
      adminId,
      internalNotes,
      commissionRate,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Vendeur non trouvé") {
      return res.status(404).json({ error: "Vendeur non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Check NIF duplicates
router.post("/admin/sellers/check-nif", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nifNumber, sellerId } = req.body;
    if (!nifNumber || typeof nifNumber !== "string") {
      return res.status(400).json({ error: "NIF valide requis" });
    }

    const result = await AdminSellerService.checkNif({ nifNumber, sellerId });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

export default router;
