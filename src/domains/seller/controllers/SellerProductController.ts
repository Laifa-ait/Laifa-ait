import { Router, Response } from "express";
import { db, admin } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";

interface TimedDocument {
  createdAt?: { toDate?: () => Date } | string | number | Date;
  [key: string]: unknown;
}

const getTimestamp = (doc: TimedDocument): number => {
  if (doc.createdAt && typeof (doc.createdAt as { toDate?: () => Date }).toDate === "function") {
    return (doc.createdAt as { toDate: () => Date }).toDate().getTime();
  }
  return new Date((doc.createdAt as string | number | Date) || 0).getTime();
};

const router = Router();

// POST seller product (create)
router.post("/api/v1/seller/products", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const body = req.body as Record<string, unknown>;

    // Fetch seller profile metadata to ensure full linkage
    const [userDoc, pubDoc] = await Promise.all([
      db.collection("users").doc(uid).get().catch(() => null),
      db.collection("publicProfiles").doc(uid).get().catch(() => null)
    ]);

    const uData = userDoc && userDoc.exists ? userDoc.data() : {};
    const pData = pubDoc && pubDoc.exists ? pubDoc.data() : {};

    const shopName = (pData?.shopName || uData?.shopName || uData?.storeName || uData?.displayName || "Boutique Olmart") as string;
    const logoUrl = (pData?.logoUrl || uData?.logoUrl || uData?.photoURL || "") as string;
    const wilaya = (pData?.wilaya || uData?.wilaya || "16 - Alger") as string;

    // Sanitize protected fields - Never trust client
    const {
      rating: _r,
      sellerTrustScore: _sts,
      reviewsCount: _rc,
      commissionRate: _cr,
      isSponsored: _is,
      salesCount: _sc,
      sellerId: _sid,
      role: _role,
      ...safeProductData
    } = body;

    const productData: Record<string, unknown> = {
      ...safeProductData,
      sellerId: uid,
      sellerName: safeProductData.sellerName || shopName,
      storeName: safeProductData.storeName || shopName,
      sellerLogo: safeProductData.sellerLogo || logoUrl,
      wilaya: safeProductData.wilaya || wilaya,
      status: safeProductData.status || "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("products").add(productData);

    await Promise.all([
      db.collection("users").doc(uid).set({
        productsCount: admin.firestore.FieldValue.increment(1)
      }, { merge: true }).catch(() => null),
      db.collection("publicProfiles").doc(uid).set({
        productsCount: admin.firestore.FieldValue.increment(1)
      }, { merge: true }).catch(() => null),
      db.collection("internal_notifications").add({
        type: "NEW_PRODUCT_SUBMITTED",
        title: "Nouveau produit soumis",
        message: `Le vendeur "${shopName}" a soumis un nouveau produit "${String(productData.name || 'Produit')}".`,
        productId: docRef.id,
        sellerId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      }).catch(() => null)
    ]);

    return res.json({ id: docRef.id, success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// PUT seller product (update)
router.put("/api/v1/seller/products/:id", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    // Fetch existing product and verify ownership
    const docSnap = await db.collection("products").doc(id).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    const existing = docSnap.data();
    if (existing?.sellerId !== uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas propriétaire de ce produit" });
    }

    // Strip protected fields from update payload
    const {
      sellerId: _sid,
      rating: _r,
      sellerTrustScore: _sts,
      reviewsCount: _rc,
      commissionRate: _cr,
      isSponsored: _is,
      salesCount: _sc,
      role: _role,
      owner: _o,
      userId: _u,
      ...safeUpdate
    } = body;

    const productDataToSave: Record<string, unknown> = {
      ...safeUpdate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("products").doc(id).set(productDataToSave, { merge: true });

    await db.collection("product_history").add({
      productId: id,
      sellerId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "edit",
      changes: productDataToSave
    }).catch(() => null);

    if (productDataToSave.status === "pending") {
      await db.collection("internal_notifications").add({
        type: "PRODUCT_MODIFICATION",
        title: "Produit modifié soumis à modération",
        message: `Un vendeur a modifié le produit "${String(productDataToSave.name || id)}".`,
        productId: id,
        sellerId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      }).catch(() => null);
    }

    return res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET seller products
router.get("/api/v1/seller/products", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const snap = await db.collection("products").where("sellerId", "==", uid).get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products.sort((a: TimedDocument, b: TimedDocument) => getTimestamp(b) - getTimestamp(a));
    return res.json({ products });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// DELETE seller product
router.delete("/api/v1/seller/products/:id", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
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
    if (docSnap.data()?.sellerId !== uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas propriétaire de ce produit" });
    }

    await db.collection("products").doc(id).delete();

    await db.collection("product_history").add({
      productId: id,
      sellerId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "delete"
    }).catch(() => null);

    return res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
