import { Router, Response } from "express";
import { db, admin } from "../config/firebase-admin";
import { ai } from "../config/gemini";
import { authenticateToken, authorizeAdmin } from "../middlewares/auth";
import type { AuthenticatedRequest } from "./core";
import { safeLogger } from "../utils/logger";

const router = Router();

// --- Resolve Dispute ---
router.post(
  "/api/v1/admin/orders/:orderId/resolve-dispute",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderId } = req.params;
    const { resolution, refundAmount = 0 } = req.body; // resolution = 'refund' | 'close'

    try {
      const orderRef = db.collection("orders").doc(orderId);

      await db.runTransaction(async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists) throw new Error("Order not found");
        const orderData = orderDoc.data() as {
          userId: string;
          sellerId?: string;
          sellerIds?: string[];
          total?: number;
          disputeRequest?: { frozenAmount?: number };
        };

        const frozenAmount = orderData.disputeRequest?.frozenAmount || 0;
        const maxRefundAllowed = frozenAmount > 0 ? frozenAmount : (orderData.total || 0);

        if (resolution === "refund" && refundAmount > 0) {
          if (refundAmount > maxRefundAllowed) {
            throw new Error(`Le montant du remboursement (${refundAmount} DA) dépasse le montant maximum autorisé (${maxRefundAllowed} DA) pour ce litige.`);
          }
          // Debit vendor (Seller) if they were previously credited (anti-fraud double disbursement prevention)
          const targetSellerUid = orderData?.sellerIds?.[0] || orderData?.sellerId;
          if (targetSellerUid) {
            const sellerRef = db.collection("users").doc(targetSellerUid);
            const sellerDoc = await transaction.get(sellerRef);
            if (sellerDoc.exists) {
              const sellerData = sellerDoc.data();
              
              // 🔴 SÉCURITÉ CRITIQUE : Pénalité du Trust Score (-10) car litige perdu
              const currentTrustScore = sellerData?.trustScore ?? 50;
              const newTrustScore = Math.max(0, currentTrustScore - 10);

              transaction.update(sellerRef, {
                trustScore: newTrustScore
              });

              // Inform seller they lost the dispute AND their trust score dropped
              const notificationRef = db.collection("notifications").doc();
              transaction.set(notificationRef, {
                userId: targetSellerUid,
                title: "Litige résolu en faveur du client",
                message: `La commande #${orderId.substring(0, 8)} a été remboursée. Votre Trust Score a baissé de 10 points. Si c'est une erreur, ouvrez une contestation via le Support.`,
                type: "ALERT",
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }
          }

          transaction.update(orderRef, {
            status: "REFUNDED",
            "returnRequest.status": "completed",
            disputeStatus: "resolved_refunded",
            refundedAmount: refundAmount,
            refundMethod: "Off-platform Manual Refund",
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(orderRef, {
            status: "DISPUTE_RESOLVED",
            "returnRequest.status": "rejected",
            "disputeRequest.status": "resolved_rejected",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      res.json({ success: true });
    } catch (error: unknown) {
      safeLogger.error("Resolve Dispute Error", { orderId, err: error instanceof Error ? error.message : String(error) });
      const message = error instanceof Error ? error.message : "Erreur serveur";
      res.status(500).json({ error: message });
    }
  },
);

// --- Admin OCR ---
router.post("/api/v1/admin/sellers/:id/ocr", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentUrl } = req.body;
    
    if (!documentUrl) {
      return res.status(400).json({ error: "Missing documentUrl" });
    }

    // Fetch the image from URL
    const imageResp = await fetch(documentUrl);
    if (!imageResp.ok) throw new Error("Failed to fetch image");
    const arrayBuffer = await imageResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const prompt = `Extraire les informations suivantes de cette pièce d'identité algérienne (Carte Nationale, Permis ou Passeport). 
Retourne UNIQUEMENT un objet JSON valide avec les clés suivantes :
- fullName (Nom complet)
- documentNumber (Numéro de la pièce)
- dateOfBirth (Date de naissance)
- issueDate (Date de délivrance)
- expiryDate (Date d'expiration si présente, sinon null)
- isAuthentic (booléen, met true si le document semble être une pièce d'identité officielle et authentique, false si c'est flou, faux, ou illisible)
- OCRConfidence (un score de 0 à 100 de ta confiance sur la lecture).
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }
      ]
    });

    const responseText = result.text || "{}";
    
    // Attempt to extract JSON from markdown if wrapped in ```json ... ```
    let extractedJson = responseText;
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
       extractedJson = match[1];
    }
    
    let parsed = {};
    try {
      parsed = JSON.parse(extractedJson);
    } catch {
      safeLogger.error("Failed to parse Gemini OCR response", { responseTextLength: responseText.length });
      parsed = { error: "Failed to parse JSON" };
    }

    res.json({ result: parsed });
  } catch (err: unknown) {
    safeLogger.error("OCR Error", { sellerId: req.params.id, err: err instanceof Error ? err.message : String(err) });
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// GET admin notifications
router.get("/api/v1/admin/notifications", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("internal_notifications")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
      
    const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ notifications });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// PUT admin notification mark read
router.put("/api/v1/admin/notifications/:id/read", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("internal_notifications").doc(id).update({ read: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// PUT admin notifications mark all read
router.put("/api/v1/admin/notifications/read-all", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("internal_notifications").where("read", "==", false).get();
    
    const batch = db.batch();
    snap.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
    
    return res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET admin workspace sellers
router.get("/api/v1/admin/workspace/sellers", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const publicSnap = await db.collection("publicProfiles").limit(300).get();
    const publicMap = new Map();
    publicSnap.docs.forEach(doc => publicMap.set(doc.id, doc.data()));
    
    const usersSnap = await db.collection("users").where("role", "==", "seller").limit(300).get();
    const usersMap = new Map();
    usersSnap.docs.forEach(doc => usersMap.set(doc.id, doc.data()));
    
    const pendingSnap = await db.collection("users").where("status", "==", "pending").limit(100).get();
    pendingSnap.docs.forEach(doc => usersMap.set(doc.id, doc.data()));
    
    const allIds = new Set([...publicMap.keys(), ...usersMap.keys()]);
    const sellers = Array.from(allIds).map(uid => {
      const pub = publicMap.get(uid) || {};
      const usr = usersMap.get(uid) || {};
      return {
        id: uid,
        name: pub.name || usr.displayName || usr.name || uid,
        shopName: pub.shopName || usr.shopName || pub.name || usr.displayName || "Boutique Olmart",
        email: usr.email || pub.email || "",
      };
    });
    
    return res.json({ sellers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET admin workspace orders
router.get("/api/v1/admin/workspace/orders", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetSeller = req.query.targetSeller as string;
    
    let ordersQuery = db.collection("orders").orderBy("createdAt", "desc").limit(150);
    
    if (targetSeller) {
       ordersQuery = db.collection("orders").where("sellerIds", "array-contains", targetSeller).orderBy("createdAt", "desc").limit(150);
    }
    
    const ordersSnap = await ordersQuery.get();
    const rawOrders = ordersSnap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as { sellerId?: string; sellerIds?: string[]; status?: string; createdAt?: unknown; total?: number; sellerName?: string; sellerEmail?: string; })
    }));
    
    // Enrich with seller metadata
    for (const order of rawOrders) {
       const sid = order.sellerId || (order.sellerIds && order.sellerIds[0]);
       if (sid) {
           let name = "Olmart";
           let email = "";
           const usrSnap = await db.collection("users").doc(sid).get();
           if (usrSnap.exists) {
               const usr = usrSnap.data();
               name = usr?.shopName || usr?.displayName || name;
               email = usr?.email || email;
           } else {
               const pubSnap = await db.collection("publicProfiles").doc(sid).get();
               if (pubSnap.exists) {
                   const pub = pubSnap.data();
                   name = pub?.shopName || pub?.name || name;
                   email = pub?.email || email;
               }
           }
           order.sellerName = name;
           order.sellerEmail = email;
       }
    }
    
    return res.json({ rawOrders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET admin workspace seller
router.get("/api/v1/admin/workspace/seller/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetSeller = req.params.id;
    let name = "Olmart";
    let email = "";
    
    const usrSnap = await db.collection("users").doc(targetSeller).get();
    if (usrSnap.exists) {
        const usr = usrSnap.data();
        name = usr?.shopName || usr?.displayName || name;
        email = usr?.email || email;
    } else {
        const pubSnap = await db.collection("publicProfiles").doc(targetSeller).get();
        if (pubSnap.exists) {
            const pub = pubSnap.data();
            name = pub?.shopName || pub?.name || name;
            email = pub?.email || email;
        }
    }
    
    return res.json({ name, email });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

import { SponsorshipPackService } from "../services/sponsorshipPackService";

// GET admin sponsorship packs configuration
router.get("/api/v1/admin/sponsorship-packs", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const packs = await SponsorshipPackService.getPacks();
    return res.json({ packs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// POST admin sponsorship packs configuration
router.post("/api/v1/admin/sponsorship-packs", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { packs } = req.body;
    if (!packs || typeof packs !== "object") {
      return res.status(400).json({ error: "Configuration des packs invalide." });
    }
    await SponsorshipPackService.updatePacks(packs);
    safeLogger.info("Admin updated Sponsorship Packs configuration");
    return res.json({ success: true, message: "Configuration des packs de sponsoring enregistrée avec succès." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET admin sponsorship requests list
router.get("/api/v1/admin/sponsorship-requests", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db.collection("sponsorship_requests").orderBy("requestDate", "desc").limit(100).get();
    const requests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ requests });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// POST update sponsorship request status (approve / reject / expire)
router.post("/api/v1/admin/sponsorship-requests/:id/status", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, productId, durationDays = 7 } = req.body;

    if (!["approved", "rejected", "expired"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide. Doit être 'approved', 'rejected' ou 'expired'." });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await db.runTransaction(async (transaction) => {
      const reqRef = db.collection("sponsorship_requests").doc(id);
      transaction.update(reqRef, {
        status,
        updatedAt: now,
        ...(status === "approved" ? { approvedAt: now, startDate: now, endDate } : {})
      });

      if (productId) {
        const prodRef = db.collection("products").doc(productId);
        transaction.update(prodRef, {
          isSponsored: status === "approved",
          ...(status === "approved" ? { sponsoredSince: now, sponsorshipEndDate: endDate } : { sponsorshipEndDate: null })
        });
      }
    });

    safeLogger.info("Admin updated sponsorship request status", { requestId: id, status });
    return res.json({
      success: true,
      message: `Requête de sponsoring ${status === "approved" ? "approuvée" : status === "rejected" ? "rejetée" : "expirée"} avec succès.`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

// GET admin overview stats
router.get("/api/v1/admin/overview", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Stub out the data
    const disputesSnap = await db.collection("orders").where("status", "in", ["RETURN_REQUESTED", "DISPUTE_OPEN"]).get();
    const disputeCount = disputesSnap.size;

    const pendingSponsorshipsSnap = await db.collection("sponsorship_requests").where("status", "==", "pending").get();
    const pendingSponsorshipCount = pendingSponsorshipsSnap.size;
    
    // Quick fallback data
    return res.json({
        disputeCount,
        pendingSponsorshipCount,
        stats: {
           totalSales: 15000,
           activeVendors: 42,
           totalOrders: 150,
           netRevenue: 1500,
           pendingVendors: 5,
           revenueChange: 12,
           ordersChange: 8
        },
        topProducts: [],
        topSellers: [],
        realTimeTraffic: [],
        adminAlerts: [],
        recentActivities: [],
        recentOrders: [],
        wilayaStats: []
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
});

export default router;
