import { Router, Response } from "express";
import crypto from "crypto";
import { db, admin } from "../../config/firebase-admin";
import { authenticateToken } from "../../middlewares/auth";
import { pinLimiter } from "../../middlewares/rateLimiters";
import { safeLogger } from "../../utils/logger";

const router = Router();

interface Authenticated2FARequest extends Express.Request {
  user?: {
    uid?: string;
    role?: string;
    email?: string;
    [key: string]: unknown;
  };
  body: {
    code?: string;
    [key: string]: unknown;
  };
}

export class TwoFactorService {
  static async sendCode(userId: string): Promise<void> {
    const code = crypto.randomInt(100000, 999999).toString();
    await db
      .collection("users")
      .doc(userId)
      .update({
        "verification.code": code,
        "verification.expiresAt": admin.firestore.Timestamp.fromMillis(
          Date.now() + 10 * 60 * 1000,
        ),
      });
  }

  static async verifyCode(userId: string, code: string): Promise<{ success: boolean; error?: string; status?: number }> {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const verification = userData?.verification;
    const dbCode = verification?.code;
    const dbExpiresAt = verification?.expiresAt;

    if (!verification || !dbCode || !dbExpiresAt) {
      return { success: false, status: 403, error: "Aucun code de vérification actif pour cet utilisateur." };
    }

    if (
      dbCode !== code ||
      dbExpiresAt.toMillis() < Date.now()
    ) {
      return { success: false, status: 403, error: "Code invalide ou expiré" };
    }

    await userRef.update({
      "verification.verified": true,
      "verification.verifiedAt": admin.firestore.Timestamp.fromMillis(Date.now()),
      "verification.code": admin.firestore.FieldValue.delete(),
    });

    return { success: true };
  }
}

// --- 2FA Verification System ---
router.post(
  "/send-code",
  pinLimiter,
  authenticateToken,
  async (req: Authenticated2FARequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    try {
      await TwoFactorService.sendCode(userId);
      safeLogger.info("2FA verification code dispatched", { userId });
      return res.json({ success: true, method: "email" });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error("2FA send code error", { userId, err: errorMsg });
      return res.status(500).json({ error: errorMsg });
    }
  },
);

router.post(
  "/verify",
  pinLimiter,
  authenticateToken,
  async (req: Authenticated2FARequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const { code } = req.body;

    // Validation stricte du code reçu
    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Code requis et doit être un format de 6 chiffres." });
    }

    try {
      const result = await TwoFactorService.verifyCode(userId, code);
      if (!result.success) {
        return res.status(result.status || 400).json({ error: result.error });
      }

      return res.json({ success: true });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: errorMsg });
    }
  },
);

export default router;
