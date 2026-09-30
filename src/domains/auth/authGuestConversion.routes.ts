import crypto from "crypto";
import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { loginLimiter } from "../../middlewares/rateLimiters";
import { admin, db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";

const authGuestConversionRouter = Router();

// POST convert guest to registered user
authGuestConversionRouter.post("/convert-guest", loginLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const { email, fullName, phone, wilaya, commune, address, guestUserId } = req.body;
    
    // Save/update user profile
    await db.collection("users").doc(uid).set({
      uid,
      email: email || req.user?.email || "",
      displayName: fullName || "",
      role: "buyer",
      onboardingCompleted: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      phone: phone || "",
      wilaya: wilaya || "",
      commune: commune || "",
      address: address || "",
      isGuest: false,
    }, { merge: true });
    
    // Convert orders if guestUserId is provided and different from the authenticated user's uid
    if (guestUserId && guestUserId !== uid) {
      // 1. Extract recovery token from payload, cookie, or header
      let rawToken: string | undefined = req.body.guestRecoveryToken;

      if (!rawToken && req.cookies?.olmart_guest_claim_token) {
        const cookieVal = String(req.cookies.olmart_guest_claim_token);
        if (cookieVal.includes(":")) {
          const [cookieGuestId, cookieToken] = cookieVal.split(":");
          if (cookieGuestId === guestUserId) {
            rawToken = cookieToken;
          }
        } else {
          rawToken = cookieVal;
        }
      }

      if (!rawToken && req.headers["x-guest-recovery-token"]) {
        rawToken = String(req.headers["x-guest-recovery-token"]);
      }

      if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
        safeLogger.warn("[Auth Security] Tentative de conversion de commandes invité sans jeton de récupération", {
          uid,
          guestUserId,
        });
        return res.status(403).json({
          error: "Jeton de récupération invité manquant ou invalide. Impossible de rattacher les commandes sans preuve de possession.",
        });
      }

      const candidateToken = rawToken.trim();
      const candidateHash = crypto.createHash("sha256").update(candidateToken).digest("hex");

      // 2. ACID Firestore transaction ensuring token validation, expiration check, and single-use guarantee
      await db.runTransaction(async (t) => {
        // Step A: Read token document
        const tokenRef = db.collection("guest_recovery_tokens").doc(guestUserId);
        const tokenSnap = await t.get(tokenRef);

        if (!tokenSnap.exists) {
          throw new Error("GUEST_TOKEN_NOT_FOUND");
        }

        const tokenData = tokenSnap.data();
        if (!tokenData) {
          throw new Error("GUEST_TOKEN_NOT_FOUND");
        }

        // Check 1: Already used
        if (tokenData.used) {
          throw new Error("GUEST_TOKEN_ALREADY_USED");
        }

        // Check 2: Expired
        if (tokenData.expiresAt && typeof tokenData.expiresAt.toDate === "function") {
          if (tokenData.expiresAt.toDate() < new Date()) {
            throw new Error("GUEST_TOKEN_EXPIRED");
          }
        }

        // Check 3: Timing-safe cryptographic comparison
        const storedHash = String(tokenData.tokenHash || "");
        if (!storedHash || storedHash.length !== candidateHash.length) {
          throw new Error("GUEST_TOKEN_INVALID");
        }

        const storedBuf = Buffer.from(storedHash, "hex");
        const candidateBuf = Buffer.from(candidateHash, "hex");

        if (storedBuf.length !== candidateBuf.length || !crypto.timingSafeEqual(storedBuf, candidateBuf)) {
          throw new Error("GUEST_TOKEN_INVALID");
        }

        // Step B: Query orders and order masters
        const ordersSnap = await db.collection("orders").where("userId", "==", guestUserId).get();
        const mastersSnap = await db.collection("order_masters").where("userId", "==", guestUserId).get();

        // Step C: Atomically invalidate token and reassign orders
        t.update(tokenRef, {
          used: true,
          convertedToUid: uid,
          usedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const guestUserRef = db.collection("users").doc(guestUserId);
        t.set(
          guestUserRef,
          {
            isGuestConverted: true,
            convertedToUid: uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        ordersSnap.docs.forEach((doc) => {
          t.update(doc.ref, {
            userId: uid,
            isGuest: false,
            claimedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        mastersSnap.docs.forEach((doc) => {
          t.update(doc.ref, {
            userId: uid,
            isGuest: false,
            claimedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      });

      // Clear the cookie upon successful migration
      res.clearCookie("olmart_guest_claim_token", { path: "/" });

      safeLogger.info("[Auth Security] Conversion d'invité réussie avec validation cryptographique", {
        uid,
        guestUserId,
      });
    }
    
    return res.json({ success: true, message: "Compte configuré et commandes rattachées avec succès." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";

    if (message === "GUEST_TOKEN_NOT_FOUND" || message === "GUEST_TOKEN_INVALID") {
      return res.status(403).json({
        error: "Preuve de possession invité invalide. La tentative d'association a été rejetée.",
      });
    }

    if (message === "GUEST_TOKEN_ALREADY_USED") {
      return res.status(409).json({
        error: "Ce jeton de conversion invité a déjà été utilisé.",
      });
    }

    if (message === "GUEST_TOKEN_EXPIRED") {
      return res.status(403).json({
        error: "Le jeton de récupération invité a expiré.",
      });
    }

    safeLogger.error("[Auth Security] Erreur interne lors de la conversion de l'invité", {
      err: message,
    });
    return res.status(500).json({ error: message });
  }
});

export default authGuestConversionRouter;
