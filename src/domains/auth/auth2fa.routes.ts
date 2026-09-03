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
    const otpHash = crypto.createHash("sha256").update(`${userId}:${code}`).digest("hex");
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

    // Save hashed OTP, trial counter and expiration in private server-only collection user_secrets
    await db
      .collection("user_secrets")
      .doc(userId)
      .set({
        otpHash,
        expiresAt,
        attempts: 0,
        createdAt: admin.firestore.Timestamp.fromMillis(Date.now()),
      });

    // Update public/user document without exposing plaintext code
    await db
      .collection("users")
      .doc(userId)
      .update({
        "verification.expiresAt": expiresAt,
        "verification.code": admin.firestore.FieldValue.delete(),
      })
      .catch(() => null);
  }

  static async verifyCode(userId: string, code: string): Promise<{ success: boolean; error?: string; status?: number }> {
    const secretRef = db.collection("user_secrets").doc(userId);
    const secretSnap = await secretRef.get();

    // Check private user_secrets first
    let secretData = secretSnap.exists ? secretSnap.data() : null;

    // Fallback for legacy / mock user document verification.code if user_secrets doc does not exist
    if (!secretData) {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const legacyCode = userData?.verification?.code;
      const legacyExpiresAt = userData?.verification?.expiresAt;

      if (!userData?.verification || !legacyCode || !legacyExpiresAt) {
        return { success: false, status: 403, error: "Aucun code de vérification actif pour cet utilisateur." };
      }

      const legacyHash = crypto.createHash("sha256").update(`${userId}:${legacyCode}`).digest("hex");
      secretData = {
        otpHash: legacyHash,
        expiresAt: legacyExpiresAt,
        attempts: 0,
      };
    }

    const attempts = Number(secretData?.attempts || 0);
    if (attempts >= 5) {
      await secretRef.delete().catch(() => null);
      return { success: false, status: 429, error: "Nombre maximal de tentatives dépassé (5/5). Veuillez demander un nouveau code." };
    }

    if (secretSnap.exists) {
      await secretRef.update({
        attempts: admin.firestore.FieldValue.increment(1),
      }).catch(() => null);
    }

    const otpHash = secretData?.otpHash;
    const expiresAt = secretData?.expiresAt;

    if (!otpHash || !expiresAt) {
      return { success: false, status: 403, error: "Aucun code de vérification actif pour cet utilisateur." };
    }

    const expiresAtMillis = typeof expiresAt.toMillis === "function" ? expiresAt.toMillis() : new Date(expiresAt).getTime();
    if (expiresAtMillis < Date.now()) {
      await secretRef.delete().catch(() => null);
      return { success: false, status: 403, error: "Code invalide ou expiré" };
    }

    const incomingHash = crypto.createHash("sha256").update(`${userId}:${code}`).digest("hex");
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(incomingHash, "utf8"),
      Buffer.from(otpHash, "utf8")
    );

    if (!isMatch) {
      return { success: false, status: 403, error: "Code invalide ou expiré" };
    }

    // Clear secrets and record successful verification session timestamp
    await secretRef.delete().catch(() => null);

    const userRef = db.collection("users").doc(userId);
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
      return res.status(500).json({ error: "Une erreur interne est survenue lors de l'envoi du code 2FA." });
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
      safeLogger.error("2FA verify code error", { userId, err: errorMsg });
      return res.status(500).json({ error: "Une erreur interne est survenue lors de la vérification du code 2FA." });
    }
  },
);

export default router;
