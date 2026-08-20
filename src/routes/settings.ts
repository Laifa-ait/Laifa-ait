import { Router, Request, Response } from "express";
import { db } from "../config/firebase-admin";
import { authenticateToken, authorizeAdmin } from "../middlewares/auth";
import type { AuthenticatedRequest } from "./core";

const router = Router();

// In-memory cache for public read-only settings endpoints to avoid Firestore rate limits
const settingsCache = new Map<string, { data: unknown; expiry: number }>();

async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 120000 // 2 minute cache
): Promise<T | null> {
  const cached = settingsCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data as T;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const data = await fetcher();
      if (data !== undefined && data !== null) {
        settingsCache.set(key, { data, expiry: Date.now() + ttlMs });
      }
      return data;
    } catch (err: unknown) {
      const errorObj = err as { message?: string; code?: string };
      if (
        attempt < 2 &&
        (errorObj?.message?.includes("Rate exceeded") ||
          errorObj?.message?.includes("RESOURCE_EXHAUSTED") ||
          errorObj?.code === "resource-exhausted")
      ) {
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        continue;
      }
      if (cached) {
        return cached.data as T;
      }
      console.warn(`[Olmart Gateway] Settings fetch error for ${key}:`, errorObj?.message || err);
      return null;
    }
  }
  return cached ? (cached.data as T) : null;
}

// GET homepage categories configs
router.get("/api/v1/settings/homepage-categories", async (req: Request, res: Response) => {
  try {
    const data = await getCachedOrFetch("homepage-categories", async () => {
      const snap = await db.collection("homepage_categories_v2").limit(100).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return res.json({ categories: data || [] });
  } catch {
    return res.json({ categories: [] });
  }
});

// GET any setting document by id
router.get("/api/v1/settings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getCachedOrFetch(`setting_${id}`, async () => {
      const docSnap = await db.collection("settings").doc(id).get();
      return docSnap.exists ? docSnap.data() || {} : {};
    });
    return res.json(data || {});
  } catch {
    return res.json({});
  }
});

// POST any setting document by id (Admin only)
router.post("/api/v1/settings/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await db.collection("settings").doc(id).set(data, { merge: true });
    settingsCache.clear();
    return res.json({ success: true });
  } catch (error: unknown) {
    console.error("Error saving setting:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// POST subscribe to newsletter
router.post("/api/v1/newsletter/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const normEmail = email.trim();
    const existingSnap = await db.collection("newsletterEmails").where("email", "==", normEmail).get();
    if (!existingSnap.empty) {
      return res.status(400).json({ error: "ALREADY_SUBSCRIBED" });
    }
    await db.collection("newsletterEmails").add({
      email: normEmail,
      subscribedAt: new Date().toISOString(),
    });
    return res.json({ success: true });
  } catch (error: unknown) {
    console.error("Newsletter subscription error:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET any metadata document by id
router.get("/api/v1/metadata/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getCachedOrFetch(`metadata_${id}`, async () => {
      const docSnap = await db.collection("metadata").doc(id).get();
      return docSnap.exists ? docSnap.data() || {} : {};
    });
    return res.json(data || {});
  } catch {
    return res.json({});
  }
});

// GET any seasonal theme by id
router.get("/api/v1/seasonal-themes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getCachedOrFetch(`theme_${id}`, async () => {
      const docSnap = await db.collection("seasonal_themes").doc(id).get();
      return docSnap.exists ? docSnap.data() || {} : {};
    });
    return res.json(data || {});
  } catch {
    return res.json({});
  }
});

// GET any ui-element document by id
router.get("/api/v1/ui-elements/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getCachedOrFetch(`ui_${id}`, async () => {
      const docSnap = await db.collection("ui_elements").doc(id).get();
      return docSnap.exists ? docSnap.data() || {} : { products: [] };
    });
    return res.json(data || { products: [] });
  } catch {
    return res.json({ products: [] });
  }
});

// GET any homepage-categories-v2 document by id
router.get("/api/v1/homepage-categories-v2/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getCachedOrFetch(`hp_cat_${id}`, async () => {
      const docSnap = await db.collection("homepage_categories_v2").doc(id).get();
      return docSnap.exists ? docSnap.data() || {} : {};
    });
    return res.json(data || {});
  } catch {
    return res.json({});
  }
});

// GET any platform stats document by id
router.get("/api/v1/platform-stats/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getCachedOrFetch(`stats_${id}`, async () => {
      const docSnap = await db.collection("platform_stats").doc(id).get();
      return docSnap.exists ? docSnap.data() || {} : {};
    });
    return res.json(data || {});
  } catch {
    return res.json({});
  }
});

// GET site monthly updates
router.get("/api/v1/monthly-updates", async (req: Request, res: Response) => {
  try {
    const updates = await getCachedOrFetch("monthly-updates", async () => {
      const snap = await db.collection("site_content_monthly").limit(20).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return res.json({ updates: updates || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Monthly updates fetch warning:", message);
    return res.json({ updates: [] });
  }
});

// GET categories hierarchy
router.get("/api/v1/settings/categories-hierarchy", async (req: Request, res: Response) => {
  try {
    const data = await getCachedOrFetch("categories-hierarchy", async () => {
      const docSnap = await db.collection("settings").doc("categories").get();
      return docSnap.exists ? docSnap.data() : {};
    });
    return res.json(data || {});
  } catch {
    return res.json({});
  }
});

// GET tags
router.get("/api/v1/settings/tags", async (req: Request, res: Response) => {
  try {
    const tags = await getCachedOrFetch("tags", async () => {
      const snap = await db.collection("tags").get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return res.json({ tags: tags || [] });
  } catch {
    return res.json({ tags: [] });
  }
});

export default router;
