import { Router, Response } from "express";
import { db } from "../../../config/firebase-admin";
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

// GET seller orders
router.get("/api/v1/seller/orders", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const snap = await db.collection("orders").where("sellerIds", "array-contains", uid).get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a: TimedDocument, b: TimedDocument) => getTimestamp(b) - getTimestamp(a));
    return res.json({ orders });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET seller order by id
router.get("/api/v1/seller/orders/:id", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;
    const docSnap = await db.collection("orders").doc(id).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data?.sellerIds?.includes(uid) || req.user.role === "admin") {
        return res.json({ order: { id: docSnap.id, ...data } });
      }
    }
    return res.status(404).json({ error: "Commande introuvable ou accès non autorisé" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
