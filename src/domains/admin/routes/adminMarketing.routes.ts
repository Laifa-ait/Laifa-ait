import { Request, Response, Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { AdminCouponCreateSchema, AdminCouponStatusUpdateSchema } from "../../../validators/adminValidators";
import { CouponService } from "../../marketing/coupon.service";

const router = Router();

// Banners management
router.get("/banners", async (req: Request, res: Response) => {
  try {
    const snap = await db.collection("banners").orderBy("order", "asc").get();
    const banners = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, banners });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/banners/:id", async (req: Request, res: Response) => {
  try {
    const doc = await db.collection("banners").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Banner not found" });
    res.json({ success: true, banner: { id: doc.id, ...doc.data() } });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/banners", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bannerData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await db.collection("banners").add(bannerData);
    res.json({ success: true, banner: { id: ref.id, ...bannerData } });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.put("/banners/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.collection("banners").doc(req.params.id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.delete("/banners/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.collection("banners").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.put("/banners/reorder", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "Items array required" });
    const batch = db.batch();
    items.forEach((item: { id: string; order: number }) => {
      const ref = db.collection("banners").doc(item.id);
      batch.update(ref, { order: item.order });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// Coupons / Promotions
router.get("/admin/promotions/coupons", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("coupons").orderBy("createdAt", "desc").get();
    const coupons = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, coupons });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.post("/admin/promotions/coupons", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = AdminCouponCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((i) => i.message).join(", ");
      return res.status(400).json({ error: errorMessage || "Données de coupon invalides" });
    }

    const validated = parseResult.data;
    const upperCode = validated.code;
    const normalizedDiscountType = CouponService.normalizeDiscountType(validated.discountType);
    const minOrder = validated.minOrderValue ?? validated.minOrderAmount ?? 0;
    const maxDiscount = validated.maxDiscountAmount ?? validated.maxDiscount ?? null;
    const maxUses = validated.usageLimit ?? validated.maxUses ?? null;
    const rawStart = validated.startAt ?? validated.startsAt;
    const startDate = rawStart ? CouponService.parseCouponDate(rawStart) : null;
    const rawExpiry = validated.expiresAt ?? validated.expiryDate;
    const expiryDate = rawExpiry ? CouponService.parseCouponDate(rawExpiry) : null;

    if (startDate && expiryDate && startDate >= expiryDate) {
      return res.status(400).json({ error: "La date de début doit être antérieure à la date d'expiration" });
    }

    // Atomic uniqueness check & coupon creation via Firestore transaction
    const codeLockRef = db.collection("coupon_codes").doc(upperCode);
    const newCouponRef = db.collection("coupons").doc();

    const resultCoupon = await db.runTransaction(async (t) => {
      const lockDoc = await t.get(codeLockRef);
      if (lockDoc.exists) {
        throw new Error("Un coupon avec ce code existe déjà");
      }

      const existingQuery = await t.get(db.collection("coupons").where("code", "==", upperCode).limit(1));
      if (!existingQuery.empty) {
        throw new Error("Un coupon avec ce code existe déjà");
      }

      const couponData = {
        code: upperCode,
        discountType: normalizedDiscountType,
        discountValue: Number(validated.discountValue),
        minOrderValue: minOrder,
        minOrderAmount: minOrder,
        maxDiscountAmount: maxDiscount,
        maxDiscount: maxDiscount,
        startAt: startDate ? admin.firestore.Timestamp.fromDate(startDate) : null,
        startsAt: startDate ? admin.firestore.Timestamp.fromDate(startDate) : null,
        expiresAt: expiryDate ? admin.firestore.Timestamp.fromDate(expiryDate) : null,
        expiryDate: expiryDate ? admin.firestore.Timestamp.fromDate(expiryDate) : null,
        usageLimit: maxUses,
        maxUses: maxUses,
        maxUsesPerUser: validated.maxUsesPerUser ?? (validated.singleUsePerClient ? 1 : null),
        singleUsePerClient: Boolean(validated.singleUsePerClient),
        limitedToCategories: Array.isArray(validated.limitedToCategories) ? validated.limitedToCategories : [],
        limitedToSellers: Array.isArray(validated.limitedToSellers) ? validated.limitedToSellers : [],
        sellerId: validated.sellerId || null,
        usageCount: 0,
        usedCount: 0,
        usedBy: [],
        userUsages: {},
        isActive: validated.isActive !== false,
        createdBy: req.user?.uid || "admin",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      t.set(codeLockRef, {
        couponId: newCouponRef.id,
        code: upperCode,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      t.set(newCouponRef, couponData);

      return { id: newCouponRef.id, ...couponData };
    });

    await db.collection("audit_logs").add({
      type: "MARKETING",
      action: "CREATE_COUPON",
      adminId: req.user?.uid || "admin",
      details: { code: upperCode, discountValue: validated.discountValue, discountType: normalizedDiscountType },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, coupon: resultCoupon });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur interne";
    if (msg.includes("existe déjà")) {
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: msg });
  }
});

router.put("/admin/promotions/coupons/:id/status", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = AdminCouponStatusUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Champ isActive booléen requis" });
    }

    const couponRef = db.collection("coupons").doc(id);
    const couponSnap = await couponRef.get();
    if (!couponSnap.exists) {
      return res.status(404).json({ error: "Coupon introuvable" });
    }

    await couponRef.update({
      isActive: parseResult.data.isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.delete("/admin/promotions/coupons/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const couponRef = db.collection("coupons").doc(id);
    const couponSnap = await couponRef.get();

    if (!couponSnap.exists) {
      return res.status(404).json({ error: "Coupon introuvable" });
    }

    const couponData = couponSnap.data() as Record<string, unknown>;
    const usedCount = Number(couponData.usedCount || couponData.usageCount || 0);
    const usedByArray = Array.isArray(couponData.usedBy) ? couponData.usedBy : [];

    // Check if coupon was ever used in historical orders
    let hasOrderUsage = usedCount > 0 || usedByArray.length > 0;
    if (!hasOrderUsage && couponData.code) {
      const orderQuery = await db.collection("orders").where("couponCode", "==", couponData.code).limit(1).get();
      hasOrderUsage = !orderQuery.empty;
    }

    if (hasOrderUsage) {
      // Deactivate instead of physical delete to preserve financial history integrity
      await couponRef.update({
        isActive: false,
        deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.json({
        success: true,
        deactivated: true,
        message: "Le coupon a été désactivé pour conserver l'historique des commandes passées.",
      });
    }

    // If never used, safely remove document and lock
    const batch = db.batch();
    batch.delete(couponRef);
    if (couponData.code) {
      batch.delete(db.collection("coupon_codes").doc(String(couponData.code).toUpperCase().trim()));
    }
    await batch.commit();

    res.json({ success: true, deleted: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.post("/admin/promotions/coupons/:id/click", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("coupons").doc(id).update({
      clickCount: admin.firestore.FieldValue.increment(1),
    });
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

// Newsletter & Emails
router.post("/admin/send-newsletter", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, content, targetAudience } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: "Sujet et contenu requis" });
    }

    let subscribersQuery: admin.firestore.Query<admin.firestore.DocumentData> = db.collection("newsletter_subscribers").where("active", "==", true);
    if (targetAudience && targetAudience !== "all") {
      subscribersQuery = subscribersQuery.where("segment", "==", targetAudience);
    }

    const snap = await subscribersQuery.get();
    const emails = snap.docs.map(doc => doc.data().email as string).filter(Boolean);

    if (emails.length === 0) {
      return res.status(400).json({ error: "Aucun abonné trouvé pour ce segment" });
    }

    const batchSize = 100;
    for (let i = 0; i < emails.length; i += batchSize) {
      const chunk = emails.slice(i, i + batchSize);
      const mailPromises = chunk.map((email: string) =>
        db.collection("mail").add({
          to: email,
          message: {
            subject,
            html: content,
          },
        })
      );
      await Promise.all(mailPromises);
    }

    await db.collection("newsletter_campaigns").add({
      subject,
      targetAudience: targetAudience || "all",
      recipientCount: emails.length,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: req.user?.uid || "admin",
    });

    await db.collection("audit_logs").add({
      type: "MARKETING",
      action: "NEWSLETTER_SENT",
      adminId: req.user?.uid || "admin",
      details: { subject, recipientCount: emails.length },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, count: emails.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.get("/admin/newsletter/stats", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalSnap = await db.collection("newsletter_subscribers").count().get();
    const activeSnap = await db.collection("newsletter_subscribers").where("active", "==", true).count().get();
    const campaignsSnap = await db.collection("newsletter_campaigns").count().get();

    res.json({
      success: true,
      stats: {
        totalSubscribers: totalSnap.data().count,
        activeSubscribers: activeSnap.data().count,
        totalCampaignsSent: campaignsSnap.data().count,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.get("/admin/newsletter/subscribers", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("newsletter_subscribers").orderBy("createdAt", "desc").limit(100).get();
    const subscribers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, subscribers });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.get("/admin/newsletter/campaigns", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("newsletter_campaigns").orderBy("sentAt", "desc").limit(50).get();
    const campaigns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, campaigns });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.post("/admin/newsletter/campaigns", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, subject, body, segment } = req.body;
    if (!name || !subject || !body) {
      return res.status(400).json({ error: "Nom, sujet et corps du message requis" });
    }
    const campaignData = {
      name,
      subject,
      body,
      segment: segment || "all",
      status: "draft",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.uid || "admin",
    };
    const ref = await db.collection("newsletter_campaigns").add(campaignData);
    res.json({ success: true, campaign: { id: ref.id, ...campaignData } });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.get("/admin/newsletter/settings", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await db.collection("system_config").doc("newsletter").get();
    const settings = doc.exists ? doc.data() : { senderName: "Olmart", senderEmail: "newsletter@olmart.dz" };
    res.json({ success: true, settings });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

router.post("/admin/newsletter/settings", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { senderName, senderEmail, replyTo, footerText } = req.body;
    await db.collection("system_config").doc("newsletter").set(
      {
        senderName,
        senderEmail,
        replyTo,
        footerText,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user?.uid || "admin",
      },
      { merge: true }
    );
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

export default router;
