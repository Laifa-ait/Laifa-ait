import { Router, Response } from "express";
import { db, admin } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";

const router = Router();

// POST duplicate seller product
router.post("/api/v1/seller/products/:id/duplicate", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;

    const docSnap = await db.collection("products").doc(id).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    const data = docSnap.data();
    if (data?.sellerId !== uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas propriétaire de ce produit" });
    }

    const rawData = (data || {}) as Record<string, unknown>;
    const restData: Record<string, unknown> = {};
    const excludedKeys = new Set(["id", "createdAt", "updatedAt"]);
    for (const [key, value] of Object.entries(rawData)) {
      if (!excludedKeys.has(key)) {
        restData[key] = value;
      }
    }
    const duplicatedData = {
      ...restData,
      sellerId: uid,
      name: `${data?.name || "Produit"} (Copie)`,
      status: "draft",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("products").add(duplicatedData);
    return res.json({ id: docRef.id, success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// POST request deletion of seller product
router.post("/api/v1/seller/products/:id/request-deletion", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;

    const docSnap = await db.collection("products").doc(id).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    const data = docSnap.data();
    if (data?.sellerId !== uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas propriétaire de ce produit" });
    }

    await db.collection("products").doc(id).update({ status: "pending_deletion" });

    await db.collection("internal_notifications").add({
      type: "PRODUCT_DELETION_REQUEST",
      title: "Demande de suppression de produit",
      message: `Un vendeur demande la suppression de "${data?.name || id}".`,
      productId: id,
      sellerId: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    }).catch(() => null);

    return res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
