import { Response, Router } from "express";
import { authenticateToken, require2FA, AuthenticatedRequest } from "../../middlewares/auth";
import { admin, db } from "../../config/firebase-admin";
import { CouponService } from "../marketing/coupon.service";
import { safeLogger } from "../../utils/logger";
import { profileUpdateSchema } from "../user/user.schema";

const authUserDataRouter = Router();

authUserDataRouter.get("/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return res.json({ uid: userDoc.id, ...userDoc.data() });
    } else {
      return res.status(404).json({ error: "User not found in Firestore" });
    }
  } catch (error: unknown) {
    safeLogger.error("Error fetching profile", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.post("/profile", authenticateToken, require2FA, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const parseResult = profileUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Données de profil invalides ou champ d'autorisation non autorisé.",
        details: parseResult.error.format(),
      });
    }

    const safeProfileUpdate = {
      ...parseResult.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(uid).set(safeProfileUpdate, { merge: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.get("/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const cartDoc = await db.collection("users").doc(uid).collection("cart").doc("active").get();
    if (cartDoc.exists) {
      return res.json({ items: cartDoc.data()?.items || [] });
    }
    return res.json({ items: [] });
  } catch (error: unknown) {
    safeLogger.error("Get cart error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.post("/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  const { items } = req.body;
  try {
    await db.collection("users").doc(uid).collection("cart").doc("active").set({
      items: items || [],
      updatedAt: Date.now()
    }, { merge: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Save cart error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.get("/wishlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const wishDoc = await db.collection("users").doc(uid).collection("wishlist").doc("active").get();
    if (wishDoc.exists) {
      return res.json({ items: wishDoc.data()?.items || [] });
    }
    return res.json({ items: [] });
  } catch (error: unknown) {
    safeLogger.error("Get wishlist error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.post("/wishlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  const { items } = req.body;
  try {
    await db.collection("users").doc(uid).collection("wishlist").doc("active").set({
      items: items || [],
      updatedAt: Date.now()
    }, { merge: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Save wishlist error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.get("/notifications", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const ordersSnap = await db.collection("orders")
      .where("userId", "==", uid)
      .orderBy("updatedAt", "desc")
      .limit(10)
      .get();
    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const directSnap = await db.collection("user_notifications")
      .where("recipientId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    const direct = directSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const couponsSnap = await db.collection("coupons")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();
    const coupons = couponsSnap.docs.map(doc => CouponService.formatPublicCouponDTO(doc.data(), doc.id));

    return res.json({ orders, direct, coupons });
  } catch (error: unknown) {
    safeLogger.error("Fetch notifications backend error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.post("/notifications/:id/read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  try {
    const notifRef = db.collection("user_notifications").doc(id);
    const notifSnap = await notifRef.get();
    if (!notifSnap.exists || notifSnap.data()?.recipientId !== uid) {
      return res.status(404).json({ error: "Notification introuvable" });
    }

    await notifRef.update({ read: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Mark notification read error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.post("/notifications/read-all", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const unreadSnap = await db.collection("user_notifications")
      .where("recipientId", "==", uid)
      .where("read", "==", false)
      .get();
    
    const batch = db.batch();
    unreadSnap.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Mark all notifications read error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.get("/user-habits", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const docSnap = await db.collection("user_habits").doc(uid).get();
    if (docSnap.exists) {
      return res.json(docSnap.data() || {});
    }
    return res.json({ historique_recherches: [], categories_visitees: {} });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.post("/user-habits", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const habitsData = req.body;
    await db.collection("user_habits").doc(uid).set(habitsData, { merge: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.get("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    const uid = req.user?.uid || "";
    const followDoc = await db.collection("users").doc(uid).collection("following").doc(shopId).get();
    return res.json({ following: followDoc.exists });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.post("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    const uid = req.user?.uid || "";
    const followData = req.body;
    await db.collection("users").doc(uid).collection("following").doc(shopId).set({
      ...followData,
      followedAt: new Date().toISOString()
    });
    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authUserDataRouter.delete("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    const uid = req.user?.uid || "";
    await db.collection("users").doc(uid).collection("following").doc(shopId).delete();
    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

export default authUserDataRouter;
