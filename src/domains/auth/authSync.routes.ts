import { Response, Router } from "express";
import { authenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { loginLimiter } from "../../middlewares/rateLimiters";
import { admin, db } from "../../config/firebase-admin";
import { ALGERIA_WILAYAS, ALGERIA_SHIPPING_DATA } from "../../constants";
import { safeLogger } from "../../utils/logger";

const authSyncRouter = Router();

authSyncRouter.post("/sync-user-claims", loginLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const dbRole = userData?.role;
      
      let claimRole = 'buyer';
      if (dbRole === 'admin' || dbRole === 'superadmin') {
        if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
          claimRole = dbRole;
        } else {
          claimRole = 'buyer';
        }
      } else if (dbRole === 'seller' && userData?.status === 'active' && userData?.isVerified === true) {
        claimRole = 'seller';
      } else if (dbRole === 'artisan' && userData?.status === 'active' && userData?.isVerified === true) {
        claimRole = 'artisan';
      } else {
        claimRole = 'buyer';
      }

      const customClaims = {
        role: claimRole,
        isAdmin: claimRole === 'admin' || claimRole === 'superadmin'
      };
      
      await admin.auth().setCustomUserClaims(uid, customClaims);
      return res.json({ success: true, message: "Claims synced successfully" });
    } else {
      return res.status(404).json({ error: "User not found in Firestore" });
    }
  } catch (error: unknown) {
    safeLogger.error("Error syncing claims", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

authSyncRouter.post("/sync", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  const { displayName, email, photoURL, role, lastAuthMethod } = req.body;
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const userRole = role === "seller" ? "seller" : "buyer";
      const userStatus = userRole === "seller" ? "pending_verification" : "active";

      const defaultTariffs: Record<string, number> = {};
      if (userRole === "seller") {
        ALGERIA_WILAYAS.forEach((w: string) => {
          const cleanName = w.replace(/^\d+\s+/, "").trim();
          const known = ALGERIA_SHIPPING_DATA[cleanName] || ALGERIA_SHIPPING_DATA.Default;
          defaultTariffs[w] = known.price;
        });
      }

      const initialProfile = {
        uid,
        displayName: displayName || "Utilisateur",
        email: email || "",
        photoURL: photoURL || "",
        role: userRole,
        onboardingCompleted: false,
        status: userStatus,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAuthMethod: lastAuthMethod || "google",
        ...(userRole === "seller" ? { isVerified: false, trustScore: 50, shippingTariffs: defaultTariffs } : {}),
      };

      await userRef.set(initialProfile);

      if (userRole === "seller") {
        try {
          await db.collection("internal_notifications").add({
            type: "NEW_SELLER_REGISTRATION",
            title: "Nouvelle Inscription Vendeur",
            message: `Le vendeur "${displayName || 'Inconnu'}" vient de s'inscrire sur la plateforme et attend la vérification de compte.`,
            sellerId: uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
          });
        } catch (err) {
          safeLogger.warn("Failed sending seller registration internal notification", { err: err instanceof Error ? err.message : String(err) });
        }
      }

      return res.json({ success: true, profile: initialProfile });
    } else {
      const existingData = (userDoc.data() || {}) as Record<string, unknown>;
      const updates: Record<string, unknown> = {};

      if (typeof photoURL === "string" && photoURL.trim().length > 0 && photoURL.startsWith("http")) {
        const currentPhoto = typeof existingData.photoURL === "string" ? existingData.photoURL : "";
        if (!currentPhoto || currentPhoto.startsWith("/avatars/") || currentPhoto !== photoURL) {
          updates.photoURL = photoURL;
        }
      }

      if (typeof displayName === "string" && displayName.trim().length > 0 && displayName !== "Utilisateur") {
        const currentName = typeof existingData.displayName === "string" ? existingData.displayName : "";
        if (!currentName || currentName === "Utilisateur") {
          updates.displayName = displayName;
        }
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await userRef.update(updates);
        Object.assign(existingData, updates);
      }

      return res.json({ success: true, profile: { uid: userDoc.id, ...existingData } });
    }
  } catch (error: unknown) {
    safeLogger.error("Error syncing user profile", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

export default authSyncRouter;
