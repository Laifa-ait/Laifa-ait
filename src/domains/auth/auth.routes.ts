import { Response, Router } from "express";
import crypto from "crypto";
import { authenticateToken, require2FA, AuthenticatedRequest } from "../../middlewares/auth";
import { loginLimiter } from "../../middlewares/rateLimiters";
import { admin, db } from "../../config/firebase-admin";
import { ALGERIA_WILAYAS, ALGERIA_SHIPPING_DATA } from "../../constants";
import { CouponService } from "../marketing/coupon.service";
import { safeLogger } from "../../utils/logger";

const router = Router();

router.post("/onboard", loginLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const { name, phone, wilaya, address, role, interests } = req.body;
    
    if (!name || !phone || !wilaya || !address || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const existingUserData = userSnap.exists ? userSnap.data() : {};

    // Strict client role sanitization: only "buyer" and "seller" allowed from client payload
    const safeClientRole = role === "seller" ? "seller" : "buyer";

    const updateObj: Record<string, unknown> = {
      uid,
      email: req.user?.email || "",
      displayName: name,
      phone,
      wilaya,
      address,
      preferences: {
        interests: interests || [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      isVerified: existingUserData?.isVerified ?? false,
      onboardingCompleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!existingUserData?.createdAt) {
      updateObj.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Preserve existing admin/superadmin roles if present, otherwise assign sanitized role
    const isExistingAdmin = existingUserData?.role === 'admin' || existingUserData?.role === 'superadmin';
    if (!isExistingAdmin) {
      updateObj.role = safeClientRole;
      if (safeClientRole === 'seller') {
        updateObj.trustScore = 50;
        updateObj.status = 'pending_verification';
        
        // Hydrate default regulated shipping tariffs
        const defaultTariffs: Record<string, number> = {};
        ALGERIA_WILAYAS.forEach((w: string) => {
          const cleanName = w.replace(/^\d+\s+/, "").trim();
          const known = ALGERIA_SHIPPING_DATA[cleanName] || ALGERIA_SHIPPING_DATA.Default;
          defaultTariffs[w] = known.price;
        });
        updateObj.shippingTariffs = defaultTariffs;
      } else {
        updateObj.status = 'active';
      }
    }

    await userRef.set(updateObj, { merge: true });

    // Set custom claims safely: never promote to admin or seller via self-onboarding
    const tokenIsAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const finalClaimRole = (isExistingAdmin && tokenIsAdmin) ? existingUserData.role : 'buyer';
    const customClaims = {
      role: finalClaimRole,
      isAdmin: finalClaimRole === 'admin' || finalClaimRole === 'superadmin'
    };
    await admin.auth().setCustomUserClaims(uid, customClaims);

    return res.json({ success: true, message: "Onboarding completed successfully" });
  } catch (error: unknown) {
    safeLogger.error("Onboarding error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/seller-onboard", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const { storeName, storeDescription, documentId, rib } = req.body;
    if (!storeName || !storeDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get().catch(() => null);
    const userData = userDoc && userDoc.exists ? userDoc.data() : {};

    // Strict Security: seller onboarding creates a PENDING request, NEVER an active verified seller
    const shopUpdate = {
      role: userData?.role === 'seller' && userData?.isVerified ? 'seller' : 'buyer',
      sellerRequested: true,
      shopName: storeName,
      storeName: storeName,
      shopDescription: storeDescription,
      storeDescription: storeDescription,
      documentId: documentId || "",
      rib: rib || "",
      onboardingCompleted: true,
      sellerOnboardingCompleted: true,
      status: 'pending_verification',
      sellerStatus: 'pending_verification',
      isVerified: false,
      trustScore: 50,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(shopUpdate, { merge: true });

    // Sync to publicProfiles collection with PENDING status (never active or verified until admin approval)
    await db.collection('publicProfiles').doc(uid).set({
      id: uid,
      sellerId: uid,
      shopName: storeName,
      storeName: storeName,
      shopDescription: storeDescription,
      description: storeDescription,
      logoUrl: userData?.logoUrl || userData?.photoURL || "",
      bannerUrl: userData?.bannerUrl || userData?.coverUrl || "",
      wilaya: userData?.wilaya || "16 - Alger",
      rating: null,
      reviewsCount: 0,
      sellerTrustScore: 50,
      isVerified: false,
      status: "PENDING_VERIFICATION",
      productsCount: userData?.productsCount || 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Administrative internal notification for KYC compliance review
    try {
      await db.collection("internal_notifications").add({
        type: "NEW_SELLER_APPLICATION",
        title: "Nouvelle Demande Vendeur (KYC)",
        message: `Le vendeur "${storeName}" a soumis son dossier (NIF/RC: ${documentId || 'N/A'}, RIB: ${rib ? 'Fourni' : 'N/A'}) et est en attente de vérification.`,
        sellerId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    } catch (notifErr) {
      safeLogger.warn("Failed to create admin notification for seller application", {
        err: notifErr instanceof Error ? notifErr.message : String(notifErr),
      });
    }

    return res.json({
      success: true,
      message: "Demande d'ouverture de boutique soumise avec succès. Votre dossier est en cours d'examen administratif.",
    });
  } catch (error: unknown) {
    safeLogger.error("Seller onboarding error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/sync-user-claims", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const dbRole = userData?.role;
      
      let claimRole = 'buyer';
      if (dbRole === 'admin' || dbRole === 'superadmin') {
        // Admin claims can ONLY be synchronized if the requesting token already holds verified admin rights
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

router.post("/sync", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  const { displayName, email, photoURL, role, lastAuthMethod } = req.body;
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Strict sanitization: client can ONLY be buyer or seller on initial sync
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
      return res.json({ success: true, profile: { uid: userDoc.id, ...userDoc.data() } });
    }
  } catch (error: unknown) {
    safeLogger.error("Error syncing user profile", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

router.get("/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

router.post("/cart", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

router.get("/wishlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

router.post("/wishlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

router.get("/notifications", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid || "";
  try {
    // 1. Fetch buyer's orders
    const ordersSnap = await db.collection("orders")
      .where("userId", "==", uid)
      .orderBy("updatedAt", "desc")
      .limit(10)
      .get();
    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Fetch direct user notifications
    const directSnap = await db.collection("user_notifications")
      .where("recipientId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    const direct = directSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Fetch active coupons safely (sanitized public DTO, no usedBy/userUsages leak)
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

router.post("/notifications/:id/read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection("user_notifications").doc(id).update({ read: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Mark notification read error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/notifications/read-all", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

// GET user habits
router.get("/user-habits", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

// POST update user habits
router.post("/user-habits", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const habitsData = req.body;
    await db.collection("user_habits").doc(uid).set(habitsData, { merge: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// GET check follow status
router.get("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    const uid = req.user?.uid || "";
    const followDoc = await db.collection("users").doc(uid).collection("following").doc(shopId).get();
    return res.json({ following: followDoc.exists });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST follow shop
router.post("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

// DELETE unfollow shop
router.delete("/following/:shopId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    const uid = req.user?.uid || "";
    await db.collection("users").doc(uid).collection("following").doc(shopId).delete();
    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST update profile
router.post("/profile", authenticateToken, require2FA, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || "";
    const safeProfileUpdate = { ...req.body };
    delete safeProfileUpdate.role;
    delete safeProfileUpdate.isAdmin;
    delete safeProfileUpdate.customClaims;
    delete safeProfileUpdate.permissions;
    delete safeProfileUpdate.status;
    await db.collection("users").doc(uid).set(safeProfileUpdate, { merge: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST convert guest to registered user
router.post("/convert-guest", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

export default router;

