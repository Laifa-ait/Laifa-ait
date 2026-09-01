import { Router, Request, Response } from "express";
import { authenticateToken, authorizeAdmin } from "../../middlewares/auth";
import type { AuthenticatedSettingsRequest, NewsletterSubscribeDTO } from "./types/settings.types";
import { SettingsService } from "./services/settings.service";
import { safeLogger } from "../../utils/logger";

const router = Router();

// GET homepage categories configs
router.get("/api/v1/settings/homepage-categories", async (_req: Request, res: Response) => {
  try {
    const categories = await SettingsService.getHomepageCategories();
    return res.json({ categories });
  } catch {
    return res.json({ categories: [] });
  }
});

// GET categories hierarchy (Public)
router.get("/api/v1/settings/categories-hierarchy", async (_req: Request, res: Response) => {
  try {
    const data = await SettingsService.getCategoriesHierarchy();
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// GET categories alias (Public)
router.get("/api/v1/settings/categories", async (_req: Request, res: Response) => {
  try {
    const data = await SettingsService.getCategoriesHierarchy();
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// GET any setting document by id
router.get("/api/v1/settings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await SettingsService.getSettingById(id);
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// POST any setting document by id (Admin only)
router.post("/api/v1/settings/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedSettingsRequest, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;
    await SettingsService.saveSettingById(id, data);
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Error saving setting", { settingId: id, err: error instanceof Error ? error.message : String(error) });
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// POST subscribe to newsletter
router.post("/api/v1/newsletter/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body as NewsletterSubscribeDTO;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const result = await SettingsService.subscribeNewsletter(email);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Newsletter subscription error", { err: error instanceof Error ? error.message : String(error) });
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET any metadata document by id
router.get("/api/v1/metadata/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await SettingsService.getMetadataById(id);
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// GET any seasonal theme by id
router.get("/api/v1/seasonal-themes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await SettingsService.getSeasonalThemeById(id);
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// GET any ui-element document by id
router.get("/api/v1/ui-elements/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await SettingsService.getUiElementById(id);
    return res.json(data);
  } catch {
    return res.json({ products: [] });
  }
});

// GET any homepage-categories-v2 document by id
router.get("/api/v1/homepage-categories-v2/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await SettingsService.getHomepageCategoriesV2ById(id);
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// GET any platform stats document by id
router.get("/api/v1/platform-stats/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await SettingsService.getPlatformStatsById(id);
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// GET site monthly updates
router.get("/api/v1/monthly-updates", async (_req: Request, res: Response) => {
  try {
    const updates = await SettingsService.getMonthlyUpdates();
    return res.json({ updates });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    safeLogger.warn("Monthly updates fetch warning", { err: message });
    return res.json({ updates: [] });
  }
});

// GET categories hierarchy
router.get("/api/v1/settings/categories-hierarchy", async (_req: Request, res: Response) => {
  try {
    const data = await SettingsService.getCategoriesHierarchy();
    return res.json(data);
  } catch {
    return res.json({});
  }
});

// GET tags
router.get("/api/v1/settings/tags", async (_req: Request, res: Response) => {
  try {
    const tags = await SettingsService.getTags();
    return res.json({ tags });
  } catch {
    return res.json({ tags: [] });
  }
});

export default router;
