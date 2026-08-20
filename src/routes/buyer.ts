import { Router, Response } from "express";
import { db } from "../config/firebase-admin";
import { authenticateToken } from "../middlewares/auth";
import type { AuthenticatedRequest } from "./core";

const router = Router();

// GET buyer returns
router.get("/api/v1/buyer/returns", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const snap = await db.collection("orders")
      .where("userId", "==", uid)
      .where("returnRequest", "!=", null)
      .get();
    const returns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ returns });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET buyer orders
router.get("/api/v1/buyer/orders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { startAfter: startAfterParam, limit: limitParam } = req.query;
    let queryRef = db.collection("orders")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc");
      
    if (startAfterParam) {
      // Fetch the doc to use as startAfter
      const docSnap = await db.collection("orders").doc(startAfterParam as string).get();
      if (docSnap.exists) {
        queryRef = queryRef.startAfter(docSnap);
      }
    }
    
    queryRef = queryRef.limit(Number(limitParam) || 20);
    
    const snap = await queryRef.get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ orders, lastVisible: snap.docs[snap.docs.length - 1]?.id || null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET buyer followed stores
router.get("/api/v1/buyer/followed-stores", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const snap = await db.collection("users").doc(uid).collection("following").limit(100).get();
    const stores = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ stores });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// POST unfollow store
router.post("/api/v1/buyer/unfollow", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { sellerId } = req.body;
    if (!sellerId) return res.status(400).json({ error: "sellerId required" });
    await db.collection("users").doc(uid).collection("following").doc(sellerId).delete();
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// POST follow store
router.post("/api/v1/buyer/follow", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { sellerId, followPayload } = req.body;
    if (!sellerId || !followPayload) return res.status(400).json({ error: "sellerId and followPayload required" });
    await db.collection("users").doc(uid).collection("following").doc(sellerId).set(followPayload);
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

export default router;
