import { Request, Response, Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeAdmin, require2FA, AuthenticatedRequest } from "../../../middlewares/auth";
import { safeLogger } from "../../../utils/logger";

const router = Router();

// ADMIN ONLY: DANGER ZONE - Database Wipe / Reset (Restricted to non-production environments)
router.post("/admin/danger-zone-wipe", authenticateToken, authorizeAdmin, require2FA, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Strict Production Guard: Global database wipe is strictly forbidden in production.
    if (process.env.NODE_ENV === "production") {
      await db.collection("audit_logs").add({
        type: "SECURITY_ALERT",
        action: "DANGER_ZONE_WIPE_BLOCKED_IN_PRODUCTION",
        adminId: req.user?.uid || "unknown",
        ip: req.ip || req.socket.remoteAddress || "unknown",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(403).json({
        error: "Opération de réinitialisation globale formellement interdite et désactivée en environnement de production.",
      });
    }

    const { confirmationCode } = req.body;
    const requiredSecret = process.env.DANGER_ZONE_SECRET;

    // 2. Secret Verification: Must be explicitly configured in non-production environment.
    if (!requiredSecret || requiredSecret.trim() === "") {
      return res.status(500).json({
        error: "DANGER_ZONE_SECRET non configuré sur le serveur. Opération impossible.",
      });
    }

    if (!confirmationCode || typeof confirmationCode !== "string" || confirmationCode !== requiredSecret.trim()) {
      await db.collection("audit_logs").add({
        type: "SECURITY_ALERT",
        action: "DANGER_ZONE_WIPE_INVALID_SECRET",
        adminId: req.user?.uid || "unknown",
        ip: req.ip || req.socket.remoteAddress || "unknown",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(400).json({ error: "Code de confirmation de sécurité invalide." });
    }

    // 3. 24h Safety Window check via system_config
    const configDoc = await db.collection("system_config").doc("danger_zone").get();
    if (configDoc.exists) {
      const data = configDoc.data();
      if (data?.wipeRequestedAt) {
        const reqTime = data.wipeRequestedAt.toDate().getTime();
        const now = Date.now();
        const hoursPassed = (now - reqTime) / (1000 * 60 * 60);
        if (hoursPassed < 24) {
          return res.status(400).json({
            error: `Délai de sécurité de 24h non révolu. Il reste ${Math.ceil(24 - hoursPassed)} heures avant déverrouillage.`,
          });
        }
      }
    }

    const collectionsToClear = [
      "products",
      "orders",
      "withdrawals",
      "disputes",
      "coupons",
      "audit_logs",
      "finance_logs",
      "user_notifications",
    ];

    for (const collName of collectionsToClear) {
      let hasMore = true;
      let iterations = 0;
      const MAX_BATCH_ROUNDS = 50; // Safety guard: max 22,500 docs per collection per wipe

      while (hasMore && iterations < MAX_BATCH_ROUNDS) {
        iterations++;
        const snap = await db.collection(collName).limit(450).get();
        if (snap.empty) {
          hasMore = false;
          break;
        }

        const batch = db.batch();
        snap.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        if (snap.size < 450) {
          hasMore = false;
        }
      }
    }

    await db.collection("audit_logs").add({
      type: "DANGER_ZONE",
      action: "DATABASE_WIPE",
      adminId: req.user?.uid || "admin",
      details: "Nettoyage intégral effectué en environnement hors-production après validation stricte.",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Réinitialisation des données de test effectuée avec succès." });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

// GET & POST Translations Management
router.get("/api/v1/translations", async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || "fr";
    const snap = await db.collection("translations").doc(lang).get();

    if (!snap.exists) {
      return res.json({ success: true, translations: {} });
    }

    res.json({ success: true, translations: snap.data() });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/admin/save-translation", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lang, key, value } = req.body;
    if (!lang || !key) {
      return res.status(400).json({ error: "Langue et clé obligatoires." });
    }

    const ref = db.collection("translations").doc(lang);
    await ref.set(
      {
        [key]: value,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user?.uid || "admin",
      },
      { merge: true }
    );

    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// ADMIN ONLY: User Management
router.get("/admin/users", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, status, limit: limitStr } = req.query;
    let query: admin.firestore.Query<admin.firestore.DocumentData> = db.collection("users");

    if (role) query = query.where("role", "==", role);
    if (status) query = query.where("status", "==", status);

    const limitNum = parseInt((limitStr as string) || "100", 10);
    query = query.limit(limitNum);

    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, users });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.put("/admin/users/:id/status", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { status, reason } = req.body;

    if (!["active", "suspended", "blocked"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    await db.collection("users").doc(userId).update({
      status,
      statusReason: reason || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Invalidate refresh tokens immediately when a user is suspended or blocked
    if (status === "suspended" || status === "blocked") {
      try {
        await admin.auth().revokeRefreshTokens(userId);
      } catch (authErr: unknown) {
        safeLogger.warn("Failed to revoke refresh tokens on user suspension", {
          userId,
          err: authErr instanceof Error ? authErr.message : String(authErr),
        });
      }
    }

    await db.collection("audit_logs").add({
      type: "USER_MANAGEMENT",
      action: "UPDATE_STATUS",
      targetUserId: userId,
      adminId: req.user?.uid || "admin",
      details: { newStatus: status, reason },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.put("/admin/users/:id/role", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!["buyer", "seller", "artisan", "property_owner", "moderator", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }

    // Only superadmin can assign administrative roles
    if ((role === "admin" || role === "superadmin") && req.user?.role !== "superadmin") {
      return res.status(403).json({ error: "Seul un superadministrateur peut attribuer les rôles d'administration" });
    }

    await db.collection("users").doc(userId).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const customClaims = {
      role,
      isAdmin: role === "admin" || role === "superadmin",
    };
    await admin.auth().setCustomUserClaims(userId, customClaims);

    // Invalidate refresh tokens on role change/downgrade to force re-authentication with new claims
    try {
      await admin.auth().revokeRefreshTokens(userId);
    } catch (authErr: unknown) {
      safeLogger.warn("Failed to revoke refresh tokens on role update", {
        userId,
        err: authErr instanceof Error ? authErr.message : String(authErr),
      });
    }

    await db.collection("audit_logs").add({
      type: "USER_MANAGEMENT",
      action: "UPDATE_ROLE",
      targetUserId: userId,
      adminId: req.user?.uid || "admin",
      details: { newRole: role },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, role });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.put("/admin/users/:id/client-type", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { clientType, isB2BVerified } = req.body;

    if (!["B2C", "B2B_PARTICULIER", "B2B_ENTREPRISE"].includes(clientType)) {
      return res.status(400).json({ error: "Type de client invalide" });
    }

    await db.collection("users").doc(userId).update({
      clientType,
      isB2BVerified: isB2BVerified !== undefined ? Boolean(isB2BVerified) : false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/admin/users/bulk-status", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userIds, status, reason } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Liste d'utilisateurs requise" });
    }
    if (!["active", "suspended", "blocked"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const batchSize = 400;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const chunk = userIds.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach((uid: string) => {
        const ref = db.collection("users").doc(uid);
        batch.update(ref, {
          status,
          statusReason: reason || "",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }

    // Invalidate refresh tokens for suspended/blocked users in bulk
    if (status === "suspended" || status === "blocked") {
      await Promise.allSettled(
        userIds.map((uid: string) =>
          admin.auth().revokeRefreshTokens(uid).catch((authErr: unknown) => {
            safeLogger.warn("Failed to revoke refresh tokens in bulk suspension", {
              uid,
              err: authErr instanceof Error ? authErr.message : String(authErr),
            });
          })
        )
      );
    }

    await db.collection("audit_logs").add({
      type: "USER_MANAGEMENT",
      action: "BULK_UPDATE_STATUS",
      targetUserIds: userIds,
      adminId: req.user?.uid || "admin",
      details: { newStatus: status, reason, count: userIds.length },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, count: userIds.length });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/admin/users/bulk-delete", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Liste d'utilisateurs requise" });
    }

    const batchSize = 400;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const chunk = userIds.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach((uid: string) => {
        const ref = db.collection("users").doc(uid);
        batch.delete(ref);
      });
      await batch.commit();
    }

    // Invalidate refresh tokens on bulk delete
    await Promise.allSettled(
      userIds.map((uid: string) =>
        admin.auth().revokeRefreshTokens(uid).catch((authErr: unknown) => {
          safeLogger.warn("Failed to revoke refresh tokens on bulk user deletion", {
            uid,
            err: authErr instanceof Error ? authErr.message : String(authErr),
          });
        })
      )
    );

    await db.collection("audit_logs").add({
      type: "USER_MANAGEMENT",
      action: "BULK_DELETE_USERS",
      targetUserIds: userIds,
      adminId: req.user?.uid || "admin",
      details: { count: userIds.length },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, count: userIds.length });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.delete("/admin/users/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    await db.collection("users").doc(userId).delete();

    try {
      await admin.auth().revokeRefreshTokens(userId);
    } catch (authErr: unknown) {
      safeLogger.warn("Failed to revoke refresh tokens on user deletion", {
        userId,
        err: authErr instanceof Error ? authErr.message : String(authErr),
      });
    }

    await db.collection("audit_logs").add({
      type: "USER_MANAGEMENT",
      action: "DELETE_USER",
      targetUserId: userId,
      adminId: req.user?.uid || "admin",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// Audit logs
router.get("/admin/audit-logs", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limitNum = parseInt((req.query.limit as string) || "50", 10);
    const snapshot = await db.collection("audit_logs").orderBy("timestamp", "desc").limit(limitNum).get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, logs });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// CSV Exports
router.get("/admin/reports/export", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.query;
    if (!type || !["orders", "sellers", "finances"].includes(type as string)) {
      return res.status(400).json({ error: "Type de rapport invalide (orders, sellers, finances)" });
    }

    let csvContent = "";

    if (type === "orders") {
      const snap = await db.collection("orders").limit(500).get();
      csvContent = "ID,Client,Montant,Statut,Date\n";
      snap.docs.forEach(doc => {
        const d = doc.data();
        csvContent += `"${doc.id}","${d.customerName || ""}","${d.totalAmount || 0}","${d.status || ""}","${d.createdAt ? d.createdAt.toDate().toISOString() : ""}"\n`;
      });
    } else if (type === "sellers") {
      const snap = await db.collection("users").where("role", "==", "seller").limit(500).get();
      csvContent = "ID,Boutique,Email,Statut,Wilaya\n";
      snap.docs.forEach(doc => {
        const d = doc.data();
        csvContent += `"${doc.id}","${d.shopName || ""}","${d.email || ""}","${d.status || ""}","${d.wilaya || ""}"\n`;
      });
    } else if (type === "finances") {
      const snap = await db.collection("withdrawals").limit(500).get();
      csvContent = "ID,VendeurID,Montant,Statut,Date\n";
      snap.docs.forEach(doc => {
        const d = doc.data();
        csvContent += `"${doc.id}","${d.sellerId || ""}","${d.amount || 0}","${d.status || ""}","${d.createdAt ? d.createdAt.toDate().toISOString() : ""}"\n`;
      });
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=olmart_report_${type}_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// Search Configuration
router.get("/admin/search/config", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await db.collection("system_config").doc("search_engine").get();
    const config = doc.exists ? doc.data() : { provider: "typesense", apiKey: "", nodeUrl: "" };

    if (config?.apiKey) {
      config.apiKey = "••••••••" + config.apiKey.slice(-4);
    }

    res.json({ success: true, config });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

interface SearchEngineConfigUpdates {
  provider: string;
  nodeUrl: string;
  indexName: string;
  updatedAt: admin.firestore.FieldValue;
  updatedBy: string;
  apiKey?: string;
}

router.put("/admin/search/config", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { provider, apiKey, nodeUrl, indexName } = req.body;
    if (!["typesense", "algolia", "firestore_native"].includes(provider)) {
      return res.status(400).json({ error: "Moteur de recherche non supporté" });
    }

    const updates: SearchEngineConfigUpdates = {
      provider,
      nodeUrl: nodeUrl || "",
      indexName: indexName || "products",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user?.uid || "admin",
    };

    if (apiKey && !apiKey.startsWith("••••")) {
      updates.apiKey = apiKey;
    }

    await db.collection("system_config").doc("search_engine").set(updates, { merge: true });

    await db.collection("audit_logs").add({
      type: "SYSTEM_CONFIG",
      action: "UPDATE_SEARCH_ENGINE",
      adminId: req.user?.uid || "admin",
      details: { provider, nodeUrl },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.get("/admin/search/products-preview", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("products").where("status", "==", "published").limit(10).get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: products.length, sample: products });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

export default router;
