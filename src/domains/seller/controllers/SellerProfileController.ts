import { Router, Response } from "express";
import { db, admin } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, require2FA, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { SellerService } from "../../../services/SellerService";
import { shippingTariffsSchema, sellerSettingsSchema } from "../validators/seller.validators";

const router = Router();

// POST seller OCR document scan
router.post("/api/v1/seller/ocr", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, mimeType, type } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 in request body" });
    }
    const result = await SellerService.extractOcr(type || "ID", undefined, imageBase64, mimeType || "image/jpeg");
    return res.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// PUT seller verification submission
router.put("/api/v1/seller/profile/verification", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const updateData = req.body as Record<string, unknown>;

    updateData.status = "pending_verification";
    updateData.updatedAt = new Date();

    await db.collection("users").doc(uid).set(updateData, { merge: true });

    await db.collection("internal_notifications").add({
      type: "DOCUMENT_SUBMISSION",
      sellerId: uid,
      sellerName: updateData.brandName || "Vendeur Olmart",
      read: false,
      createdAt: new Date(),
      message: `Le vendeur ${String(updateData.brandName || "Nouveau")} a soumis ses documents de vérification.`
    }).catch(() => null);

    return res.json({ success: true, message: "Verification submitted" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// PUT seller settings
router.put(
  "/api/v1/seller/profile/settings",
  authenticateToken,
  authorizeSeller,
  require2FA,
  validateRequest(sellerSettingsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const uid = req.user.uid;
      const { shopName, shopDescription, logoUrl, bannerUrl, wilaya } = req.body;

      const updateData: Record<string, unknown> = {};
      if (shopName) {
        updateData.shopName = shopName;
        updateData.storeName = shopName;
      }
      if (shopDescription !== undefined) {
        updateData.shopDescription = shopDescription;
        updateData.description = shopDescription;
      }
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
      if (wilaya !== undefined) updateData.wilaya = wilaya;
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await db.collection("users").doc(uid).set(updateData, { merge: true });
      await db.collection("publicProfiles").doc(uid).set(updateData, { merge: true });

      // Sync active products for this seller
      if (shopName || logoUrl || wilaya) {
        const productsSnap = await db.collection("products").where("sellerId", "==", uid).get().catch(() => null);
        if (productsSnap && !productsSnap.empty) {
          const batch = db.batch();
          const prodUpdate: Record<string, any> = {};
          if (shopName) {
            prodUpdate.sellerName = shopName;
            prodUpdate.storeName = shopName;
          }
          if (logoUrl) prodUpdate.sellerLogo = logoUrl;
          if (wilaya) prodUpdate.wilaya = wilaya;
          prodUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();

          productsSnap.docs.forEach((pDoc) => {
            batch.update(pDoc.ref, prodUpdate);
          });
          await batch.commit().catch(e => console.warn("[Seller Profile Settings] Batch product sync warning:", e));
        }
      }

      return res.json({ success: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal error";
      return res.status(500).json({ error: msg });
    }
  }
);

// PUT seller shipping tariffs
router.put(
  "/api/v1/seller/profile/shipping",
  authenticateToken,
  authorizeSeller,
  require2FA,
  validateRequest(shippingTariffsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const uid = req.user.uid;
      const { shippingTariffs } = req.body;

      await db.collection("users").doc(uid).set({ shippingTariffs, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

      return res.json({ success: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal error";
      return res.status(500).json({ error: msg });
    }
  }
);

export default router;
