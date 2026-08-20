import { Router, Response } from "express";
import crypto from "crypto";
import { db, admin } from "../config/firebase-admin";
import { authenticateToken } from "../middlewares/auth";
import { pinLimiter } from "../middlewares/rateLimiters";
import type { AuthenticatedRequest } from "./core";

const router = Router();

// --- 2FA Verification System ---
router.post(
  "/api/v1/auth/2fa/send-code",
  pinLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const userId = req.user.uid;
    const code = crypto.randomInt(100000, 999999).toString();

    try {
      await db
        .collection("users")
        .doc(userId)
        .update({
          "verification.code": code,
          "verification.expiresAt": admin.firestore.Timestamp.fromMillis(
            Date.now() + 10 * 60 * 1000,
          ),
        });
      (process.env.NODE_ENV === 'development' ? console.log : function(){})(`[SIMULATION] Sending code ${code} to user ${userId}`);
      res.json({ success: true, method: "email" });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMsg });
    }
  },
);

router.post(
  "/api/v1/auth/2fa/verify",
  pinLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { code } = req.body;
    const userId = req.user.uid;

    // Mode dév: autoriser le code de test fixe
    if (process.env.NODE_ENV !== "production" && code === "123456") {
      try {
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          "verification.verified": true,
          "verification.verifiedAt": admin.firestore.Timestamp.fromMillis(Date.now()),
        });
        return res.json({ success: true });
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ error: errorMsg });
      }
    }

    try {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (
        !userData?.verification ||
        userData.verification.code !== code ||
        userData.verification.expiresAt.toMillis() < Date.now()
      ) {
        return res.status(403).json({ error: "Code invalide ou expiré" });
      }

      await userRef.update({
        "verification.verified": true,
        "verification.verifiedAt": admin.firestore.Timestamp.fromMillis(Date.now()),
        "verification.code": admin.firestore.FieldValue.delete(),
      });

      res.json({ success: true });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMsg });
    }
  },
);

export default router;
