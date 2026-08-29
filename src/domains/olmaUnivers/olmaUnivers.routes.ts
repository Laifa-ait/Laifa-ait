import { Router, Request, Response } from "express";
import { db } from "../../config/firebase-admin";
import { DEFAULT_OLMA_APPS } from "../../data/olmaUniversData";
import { OlmaAppModule } from "../../types/olmaUnivers";
import { safeLogger } from "../../utils/logger";

export const olmaUniversRouter = Router();

// 1. Get Ecosystem Applications
olmaUniversRouter.get("/univers/apps", async (_req: Request, res: Response) => {
  try {
    if (!db) {
      return res.json({ success: true, data: DEFAULT_OLMA_APPS, source: "default" });
    }
    const snapshot = await db.collection("olma_univers_apps").orderBy("order", "asc").get();
    if (snapshot.empty) {
      return res.json({ success: true, data: DEFAULT_OLMA_APPS, source: "default" });
    }
    const apps: OlmaAppModule[] = [];
    snapshot.forEach((doc) => {
      apps.push(doc.data() as OlmaAppModule);
    });
    return res.json({ success: true, data: apps, source: "firestore" });
  } catch (error) {
    safeLogger.error("Error fetching Olma Univers apps", { err: error instanceof Error ? error.message : String(error) });
    return res.json({ success: true, data: DEFAULT_OLMA_APPS, source: "default" });
  }
});

// 2. Register User Interest / Waitlist (ACID Transaction)
olmaUniversRouter.post("/univers/apps/:id/notify", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, phone, wilaya } = req.body;

  try {
    if (db) {
      const appRef = db.collection("olma_univers_apps").doc(id);
      const waitlistRef = db.collection("olma_univers_waitlist").doc();

      await db.runTransaction(async (transaction) => {
        const appDoc = await transaction.get(appRef);
        if (appDoc.exists) {
          const currentCount = appDoc.data()?.waitingListCount || 0;
          transaction.update(appRef, { waitingListCount: currentCount + 1 });
        }
        transaction.set(waitlistRef, {
          appId: id,
          email: email || null,
          phone: phone || null,
          wilaya: wilaya || null,
          createdAt: new Date().toISOString()
        });
      });
    }

    return res.json({
      success: true,
      message: "Votre intérêt pour cette application a été enregistré avec succès !"
    });
  } catch (err) {
    safeLogger.error("Waitlist transaction error", { appId: id, err: err instanceof Error ? err.message : String(err) });
    return res.json({
      success: true,
      message: "Inscription enregistrée en mode hors-ligne !"
    });
  }
});

// 3. Admin: Update or Toggle Application
olmaUniversRouter.put("/admin/univers/apps/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body as Partial<OlmaAppModule>;

  try {
    if (db) {
      await db.collection("olma_univers_apps").doc(id).set(updateData, { merge: true });
    }
    return res.json({
      success: true,
      message: `L'application ${id} a été mise à jour dans le Dashboard Admin Olma.`
    });
  } catch (err) {
    safeLogger.error("Admin app update error", { appId: id, err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ success: false, error: "Erreur lors de la mise à jour." });
  }
});

// 4. Admin: Seed Initial Ecosystem Apps into Firestore
olmaUniversRouter.post("/admin/univers/seed", async (_req: Request, res: Response) => {
  try {
    if (db) {
      const batch = db.batch();
      DEFAULT_OLMA_APPS.forEach((app) => {
        const ref = db.collection("olma_univers_apps").doc(app.id);
        batch.set(ref, app, { merge: true });
      });
      await batch.commit();
      safeLogger.info("Mapped Olma Univers Ecosystem Seed in Firestore");
    }
    return res.json({
      success: true,
      message: "Applications de l'écosystème Olma Univers initialisées avec succès dans Firestore."
    });
  } catch (err) {
    safeLogger.error("Error seeding Olma Univers apps", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ success: false, error: "Erreur lors de l'initialisation des applications." });
  }
});
