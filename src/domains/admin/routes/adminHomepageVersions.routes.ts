import { Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { db, admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { clearHomepageCache } from "./adminHomepageCache";

const router = Router();

// GET /admin/homepage/versions
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

// POST /admin/homepage/versions
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

// POST /admin/homepage/versions/:id/restore
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

// DELETE /admin/homepage/versions/:id
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

// POST /admin/homepage/sync-cache
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
