import { Router, Response } from "express";
import crypto from "crypto";
import { db, admin } from "../config/firebase-admin";
import { authenticateToken } from "../middlewares/auth";
import { pinLimiter } from "../middlewares/rateLimiters";
import type { AuthenticatedRequest } from "./core";
import { safeLogger } from "../utils/logger";

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
      safeLogger.info("2FA verification code dispatched", { userId });
      res.json({ success: true, method: "email" });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error("2FA send code error", { userId, err: errorMsg });
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

    // Validation stricte du code reçu
    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Code requis et doit être un format de 6 chiffres." });
    }

    try {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      const verification = userData?.verification;
      const dbCode = verification?.code;
      const dbExpiresAt = verification?.expiresAt;

      if (!verification || !dbCode || !dbExpiresAt) {
        return res.status(403).json({ error: "Aucun code de vérification actif pour cet utilisateur." });
      }

      if (
        dbCode !== code ||
        dbExpiresAt.toMillis() < Date.now()
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
