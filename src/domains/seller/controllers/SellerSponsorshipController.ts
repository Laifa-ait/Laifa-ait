import { Router, Response } from "express";
import { db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { SponsorshipPackService } from "../../../services/sponsorshipPackService";
import { sellerSponsorshipRequestSchema } from "../validators/seller.validators";

const router = Router();

// GET seller sponsorships
router.get("/api/v1/seller/sponsorships", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const now = new Date();

    // 1. Fetch seller active products
    const productsSnap = await db.collection("products")
      .where("sellerId", "==", uid)
      .where("status", "==", "active")
      .limit(50)
      .get();

    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Fetch sponsorship requests
    const reqsSnap = await db.collection("sponsorship_requests")
      .where("sellerId", "==", uid)
      .limit(100)
      .get();

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSales = 0;
    let totalRevenue = 0;
    let activeCount = 0;

    const sponsorshipRequests = await Promise.all(
      reqsSnap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const reqId = docSnap.id;

        // Auto-expire check
        if (data.status === "approved" && data.endDate) {
          const endDate = typeof data.endDate.toDate === "function" ? data.endDate.toDate() : new Date(data.endDate);
          if (endDate < now) {
            await db.collection("sponsorship_requests").doc(reqId).update({
              status: "expired",
              updatedAt: now
            });
            await db.collection("products").doc(data.productId).update({
              isSponsored: false,
              updatedAt: now
            });
            data.status = "expired";
          }
        }

        const impressions = Number(data.impressionsCount) || 0;
        const clicks = Number(data.clicksCount) || 0;
        const sales = Number(data.salesCount) || 0;
        const revenue = Number(data.revenueGenerated) || 0;

        totalImpressions += impressions;
        totalClicks += clicks;
        totalSales += sales;
        totalRevenue += revenue;

        if (data.status === "approved") {
          activeCount += 1;
        }

        const ctr = impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0;

        return {
          id: reqId,
          ...data,
          ctr
        };
      })
    );

    const packs = await SponsorshipPackService.getPacks();
    const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0;

    const analyticsSummary = {
      totalImpressions,
      totalClicks,
      avgCtr,
      totalSales,
      totalRevenue,
      activeSponsorshipsCount: activeCount
    };

    return res.json({ products, sponsorshipRequests, packs, analyticsSummary });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// POST seller sponsorship request
router.post(
  "/api/v1/seller/sponsorships",
  authenticateToken,
  authorizeSeller,
  validateRequest(sellerSponsorshipRequestSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      const uid = req.user.uid;
      const { productId, tier = "bronze", durationDays = 7 } = req.body;

      const duration = [7, 14, 30].includes(Number(durationDays)) ? Number(durationDays) : 7;
      const selectedTier = ["bronze", "silver", "gold"].includes(tier) ? tier : "bronze";

      // Ownership Verification (Anti-IDOR)
      const productDoc = await db.collection("products").doc(productId).get();
      if (!productDoc.exists) {
        return res.status(404).json({ error: "Produit non trouvé." });
      }
      const productData = productDoc.data();
      if (!productData || productData.sellerId !== uid) {
        return res.status(403).json({ error: "Accès refusé : vous n'êtes pas le propriétaire de ce produit (IDOR Guard)." });
      }

      // Check active requests limit (max 5)
      const activeReqsSnap = await db.collection("sponsorship_requests")
        .where("sellerId", "==", uid)
        .where("status", "==", "approved")
        .get();

      if (activeReqsSnap.size >= 5) {
        return res.status(400).json({ error: "Limite atteinte : vous avez déjà 5 sponsorings actifs simultanés." });
      }

      // Fetch dynamic pack configs
      const packs = await SponsorshipPackService.getPacks();
      const packConfig = packs[selectedTier as "bronze" | "silver" | "gold"] || packs.bronze;
      const packPrice = packConfig.pricing[duration] || packConfig.pricing[7] || 1500;

      const now = new Date();

      await db.collection("sponsorship_requests").add({
        productId,
        productName: productData.name || "Produit",
        productImage: productData.image || "",
        sellerId: uid,
        sellerName: productData.sellerName || "Vendeur",
        status: "pending",
        tier: selectedTier,
        durationDays: duration,
        price: packPrice,
        paymentStatus: "pending",
        impressionsCount: 0,
        clicksCount: 0,
        salesCount: 0,
        revenueGenerated: 0,
        requestDate: now
      });

      return res.json({
        success: true,
        message: `Demande de Pack ${packConfig.name} soumise à l'administration avec succès.`,
        autoApproved: false
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal error";
      return res.status(400).json({ error: msg });
    }
  }
);

export default router;
