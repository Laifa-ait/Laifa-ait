import { Request, Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { db, admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";

const router = Router();

// Helper to clear public cache
async function clearHomepageCache() {
  try {
    await db.collection("public").doc("homepage_cache").delete();
    safeLogger.info("[Olmart Gateway] 🧹 Homepage cache invalidated successfully");
  } catch {
    // Ignore cache clear error if document did not exist
  }
}

// GET /api/v1/admin/homepage/sections
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

// POST /api/v1/admin/homepage/sections
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

// PUT /api/v1/admin/homepage/sections/:id
router.put("/admin/homepage/sections/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const docRef = db.collection("homepage_sections").doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return res.status(404).json({ error: "Section non trouvée" });
    }

    const payload = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    delete (payload as Record<string, unknown>).id;

    await docRef.set(payload, { merge: true });
    await clearHomepageCache();

    safeLogger.info("[Olmart Gateway] 🟢 Updated homepage section", { sectionId: id });
    res.json({ success: true, data: { id, ...payload } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur modification section";
    safeLogger.error("[Olmart Gateway] ❌ Error updating homepage section", { err: message });
    res.status(500).json({ error: message });
  }
});

// DELETE /api/v1/admin/homepage/sections/:id
router.delete("/admin/homepage/sections/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("homepage_sections").doc(id).delete();
    await clearHomepageCache();

    safeLogger.info("[Olmart Gateway] 🗑️ Deleted homepage section", { sectionId: id });
    res.json({ success: true, data: { id } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur suppression section";
    safeLogger.error("[Olmart Gateway] ❌ Error deleting homepage section", { err: message });
    res.status(500).json({ error: message });
  }
});

// PUT /api/v1/admin/homepage/sections/reorder (ACID batch update)
router.put("/admin/homepage/sections/reorder", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "Format invalide, orderedIds attendu" });
    }

    const batch = db.batch();
    orderedIds.forEach((id: string, index: number) => {
      if (id && typeof id === "string") {
        const ref = db.collection("homepage_sections").doc(id);
        batch.update(ref, {
          orderIndex: index + 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    await batch.commit();
    await clearHomepageCache();

    safeLogger.info("[Olmart Gateway] ⚡ Reordered homepage sections (ACID batch)", { count: orderedIds.length });
    res.json({ success: true, data: { count: orderedIds.length } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur réordonnancement";
    safeLogger.error("[Olmart Gateway] ❌ Error reordering sections", { err: message });
    res.status(500).json({ error: message });
  }
});

// GET /api/v1/admin/homepage/categories
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

// PUT /api/v1/admin/homepage/categories/:id
router.put("/admin/homepage/categories/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const payload = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection("homepage_categories_v2").doc(id).set(payload, { merge: true });
    await clearHomepageCache();

    safeLogger.info("[Olmart Gateway] 🟢 Updated category configuration", { categoryId: id });
    res.json({ success: true, data: { id, ...payload } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur modification catégorie";
    res.status(500).json({ error: message });
  }
});

// GET /api/v1/admin/homepage/versions
router.get("/admin/homepage/versions", authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("homepage_versions").orderBy("createdAt", "desc").limit(20).get();
    const versions = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json({ success: true, data: versions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// POST /api/v1/admin/homepage/versions
router.post("/admin/homepage/versions", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body || {};
    const sectionsSnap = await db.collection("homepage_sections").get();
    const sections = sectionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const categoriesSnap = await db.collection("homepage_categories_v2").get();
    const categories = categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const payload = {
      name: (name && String(name).trim()) || `Sauvegarde du ${new Date().toLocaleString("fr-FR")}`,
      sections,
      categories,
      adminEmail: req.user?.email || "admin@olmart.dz",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("homepage_versions").add(payload);
    safeLogger.info("[Olmart Gateway] 💾 Created homepage version point", { versionId: docRef.id });
    res.json({ success: true, data: { id: docRef.id, ...payload } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur création version";
    res.status(500).json({ error: message });
  }
});

// POST /api/v1/admin/homepage/versions/:id/restore
router.post("/admin/homepage/versions/:id/restore", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const versionDoc = await db.collection("homepage_versions").doc(id).get();
    if (!versionDoc.exists) {
      return res.status(404).json({ error: "Version introuvable" });
    }

    const versionData = versionDoc.data() || {};
    const sections = Array.isArray(versionData.sections) ? versionData.sections : [];

    // Delete existing sections
    const existingSnap = await db.collection("homepage_sections").get();
    const deleteBatch = db.batch();
    existingSnap.docs.forEach((d) => deleteBatch.delete(d.ref));
    await deleteBatch.commit();

    // Insert restored sections
    for (const item of sections) {
      const itemData = { ...item };
      delete itemData.id;
      await db.collection("homepage_sections").add({
        ...itemData,
        restoredAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await clearHomepageCache();
    safeLogger.info("[Olmart Gateway] 🔄 Restored homepage version", { versionId: id, sectionsCount: sections.length });
    res.json({ success: true, data: { restoredCount: sections.length } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur restauration version";
    res.status(500).json({ error: message });
  }
});

// DELETE /api/v1/admin/homepage/versions/:id
router.delete("/admin/homepage/versions/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("homepage_versions").doc(id).delete();
    res.json({ success: true, data: { id } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur suppression version";
    res.status(500).json({ error: message });
  }
});

// POST /api/v1/admin/homepage/sync-cache
router.post("/admin/homepage/sync-cache", authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    await clearHomepageCache();
    res.json({ success: true, message: "Cache synchronisé avec succès" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur synchronisation";
    res.status(500).json({ error: message });
  }
});

export default router;
