import { Request, Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { db, admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { clearHomepageCache } from "./adminHomepageCache";

const router = Router();

// GET /admin/homepage/sections
router.get("/admin/homepage/sections", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("homepage_sections").get();
    const sections: Array<{ id: string; orderIndex?: number; [key: string]: unknown }> = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    sections.sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));
    safeLogger.info("[Olmart Gateway] 🚀 Loaded homepage sections", { count: sections.length });
    res.json({ success: true, data: sections });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    safeLogger.error("[Olmart Gateway] ❌ Error fetching homepage sections", { err: message });
    res.status(500).json({ error: message });
  }
});

// POST /admin/homepage/sections
router.post("/admin/homepage/sections", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body || {};
    const existingSnap = await db.collection("homepage_sections").get();
    const orderIndex = typeof data.orderIndex === "number" ? data.orderIndex : existingSnap.size + 1;

    const payload = {
      ...data,
      orderIndex,
      isActive: data.isActive !== false,
      adminId: req.user?.uid || "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("homepage_sections").add(payload);
    await clearHomepageCache();

    safeLogger.info("[Olmart Gateway] 🟢 Created homepage section", { sectionId: docRef.id });
    res.json({ success: true, data: { id: docRef.id, ...payload } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur création section";
    safeLogger.error("[Olmart Gateway] ❌ Error creating homepage section", { err: message });
    res.status(500).json({ error: message });
  }
});

// PUT /admin/homepage/sections/reorder
router.put("/admin/homepage/sections/reorder", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Liste invalide" });
    }

    const batch = db.batch();
    items.forEach((item: { id: string; orderIndex: number }) => {
      const docRef = db.collection("homepage_sections").doc(item.id);
      batch.update(docRef, {
        orderIndex: item.orderIndex,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    await clearHomepageCache();

    safeLogger.info("[Olmart Gateway] 🔄 Sections reordered", { count: items.length });
    res.json({ success: true, message: "Ordre mis à jour" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur réordonnancement";
    res.status(500).json({ error: message });
  }
});

// PUT /admin/homepage/sections/:id
router.put("/admin/homepage/sections/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const docRef = db.collection("homepage_sections").doc(id);

    const payload = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.set(payload, { merge: true });
    await clearHomepageCache();

    res.json({ success: true, data: { id, ...payload } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur mise à jour section";
    res.status(500).json({ error: message });
  }
});

// DELETE /admin/homepage/sections/:id
router.delete("/admin/homepage/sections/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("homepage_sections").doc(id).delete();
    await clearHomepageCache();
    res.json({ success: true, data: { id } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur suppression section";
    res.status(500).json({ error: message });
  }
});

// GET /admin/homepage/categories
router.get("/admin/homepage/categories", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("homepage_categories_v2").get();
    const categories = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json({ success: true, data: categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// POST /admin/homepage/categories
router.post("/admin/homepage/categories", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body || {};
    const docRef = await db.collection("homepage_categories_v2").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await clearHomepageCache();
    res.json({ success: true, data: { id: docRef.id, ...data } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur création catégorie";
    res.status(500).json({ error: message });
  }
});

// PUT /admin/homepage/categories/:id
router.put("/admin/homepage/categories/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    await db.collection("homepage_categories_v2").doc(id).set(
      {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    await clearHomepageCache();
    res.json({ success: true, data: { id, ...data } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur modification catégorie";
    res.status(500).json({ error: message });
  }
});

export default router;
