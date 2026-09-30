import { Response, Router } from "express";
import { authenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { loginLimiter } from "../../middlewares/rateLimiters";
import { admin, db } from "../../config/firebase-admin";
import { ALGERIA_WILAYAS, ALGERIA_SHIPPING_DATA } from "../../constants";
import { safeLogger } from "../../utils/logger";

const authOnboardingRouter = Router();

authOnboardingRouter.post("/onboard", loginLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

authOnboardingRouter.post("/seller-onboard", loginLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

export default authOnboardingRouter;
