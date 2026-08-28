import { Request, Response, Router } from "express";
import { db, admin } from "../config/firebase-admin";
import { ai } from "../config/gemini";
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from "../middlewares/auth";
import { CouponService } from "../domains/marketing/coupon.service";
import { safeLogger } from "../utils/logger";
import { CoreService } from "../services/CoreService";

import nodeCache from "node-cache";

// Import split sub-routers
import sellerRouter from "./seller";
import buyerRouter from "./buyer";
import supportRouter from "./support";
import settingsRouter from "./settings";
import adminWorkspaceRouter from "./adminWorkspace";
import auth2faRouter from "./auth2fa";

const cache = new nodeCache({ stdTTL: 300, maxKeys: 1000, useClones: false });

const router = Router();

// Mount split sub-routers
router.use(sellerRouter);
router.use(buyerRouter);
router.use(supportRouter);
router.use(settingsRouter);
router.use(adminWorkspaceRouter);
router.use(auth2faRouter);

router.get("/api/v1/proxy-video", async (req: Request, res: Response) => {
  try {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).send("URL missing");
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(videoUrl);
    } catch {
      return res.status(400).send("Malformed URL");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.status(400).send("Invalid protocol");
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block loopback, link-local, private IP addresses and cloud metadata
    const isLoopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "::1";
    const isCloudMetadata = hostname === "169.254.169.254";
    
    // RFC 1918 Private ranges check
    const privateIpRegex = /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)$/;
    const isPrivateIp = privateIpRegex.test(hostname);

    if (isLoopback || isCloudMetadata || isPrivateIp) {
      return res.status(403).send("Forbidden target address");
    }

    // Domain suffix validation
    const allowedDomainSuffixes = [
      "googleapis.com", 
      "cloudinary.com", 
      "vimeo.com", 
      "youtube.com", 
      "ytimg.com", 
      "vimeocdn.com", 
      "githubusercontent.com",
      "olma-market.dz"
    ];
    
    const isAllowedDomain = allowedDomainSuffixes.some(suffix => hostname === suffix || hostname.endsWith("." + suffix));
    if (!isAllowedDomain) {
       return res.status(400).send("Domain not whitelisted for video streaming");
    }

    const response = await fetch(videoUrl, {
      headers: req.headers.range ? { Range: req.headers.range } : {}
    });

    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.toLowerCase().startsWith("video/")) {
       return res.status(400).send("Invalid MIME type: Only video files can be proxied");
    }

    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'transfer-encoding' && lowerKey !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);

    if (response.body) {
      const reader = response.body.getReader();
      const push = async () => {
        try {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(value);
          push();
        } catch {
          res.end();
        }
      };
      push();
    } else {
      res.end();
    }
  } catch (error) {
    safeLogger.error("Video proxy error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).send("Error proxying video");
  }
});

router.post("/api/v1/analytics/track", async (req: Request, res: Response) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid events payload" });
    }

    const batch = admin.firestore().batch();
    events.forEach((evt: Record<string, unknown>) => {
       const ref = admin.firestore().collection("analytics_events").doc();
       batch.set(ref, {
         ...evt,
         serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
       });
    });

    await batch.commit();
    return res.json({ success: true, count: events.length });
  } catch (error) {
    safeLogger.error("Analytics track error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Failed to track events" });
  }
});

// Sponsorship impression / click analytics tracking endpoint
router.post("/api/v1/sponsorship/analytics/track", async (req: Request, res: Response) => {
  try {
    const { productId, action } = req.body; // action = "impression" | "click"
    if (!productId || !["impression", "click"].includes(action)) {
      return res.status(400).json({ error: "productId and valid action required" });
    }

    const snap = await db.collection("sponsorship_requests")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .limit(1)
      .get();

    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      const fieldToIncrement = action === "impression" ? "impressionsCount" : "clicksCount";
      await docRef.update({
        [fieldToIncrement]: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Sponsorship analytics error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Failed to record sponsorship event" });
  }
});

// --- Internal Messaging & DLP (Data Loss Prevention) ---
router.post(
  "/api/v1/messages/send",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderId, text, imageUrl } = req.body;
    const senderId = req.user?.uid || "";

    if (!orderId || (!text && !imageUrl))
      return res.status(400).json({ error: "Missing fields" });

    try {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) return res.status(404).json({ error: "Order not found" });

      const orderData = orderSnap.data() || {};
      const buyerId = orderData.userId || orderData.buyerId;
      const sellerId = orderData.sellerId || (orderData.sellerIds && orderData.sellerIds[0]);

      if (senderId !== buyerId && senderId !== sellerId) {
         return res.status(403).json({ error: "Not a participant" });
      }

      const recipientId = senderId === buyerId ? sellerId : buyerId;

      // NLP Regex Filter for Phone Numbers, URLs and Social Media
      const phoneRegex = /(0[5672349][0-9]{8}|(\+213|00213)[5672349][0-9]{8})/g;
      const socialRegex = /(whatsapp|viber|telegram|insta|fb|facebook|appel[e]?)/gi;
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

      let secureText = text || "";
      let violationDetected = false;

      if (text && (phoneRegex.test(secureText) || socialRegex.test(secureText) || urlRegex.test(secureText))) {
        violationDetected = true;
        secureText = secureText.replace(phoneRegex, "[NUMÉRO MASQUÉ]");
        secureText = secureText.replace(socialRegex, "[MOT INTERDIT]");
        secureText = secureText.replace(urlRegex, "[LIEN INTERDIT]");
      }

      const messageObj: Record<string, unknown> = {
        orderId,
        senderId,
        recipientId,
        text: secureText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        violation: violationDetected,
      };

      if (imageUrl) {
        messageObj.imageUrl = imageUrl;
      }

      await db.collection("orders").doc(orderId).collection("messages").add(messageObj);

      // Update order document with chat metadata
      const isSenderBuyer = senderId === buyerId;
      await db.collection("orders").doc(orderId).update({
        lastMessageText: imageUrl ? "[Image]" : secureText,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageSenderId: senderId,
        unreadBuyerMessages: !isSenderBuyer,
        unreadSellerMessages: isSenderBuyer
      });

      if (violationDetected) {
        // Create admin alert
        await db.collection("admin_alerts").add({
          type: "DLP_VIOLATION",
          userId: senderId,
          orderId: orderId,
          originalText: text,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          resolved: false
        });

        // Punish seller if sender is seller
        const userDoc = await db.collection("users").doc(senderId).get();
        if (userDoc.exists && userDoc.data()?.role === "seller") {
          const currentScore = userDoc.data()?.trustScore || 50;
          await db.collection("users").doc(senderId).update({
              trustScore: Math.max(0, currentScore - 10),
          });
          
          await db.collection("notifications").add({
            userId: senderId,
            title: "Avertissement de sécurité : Message modéré",
            message: "Votre message a été bloqué pour non-respect de nos règles (ex: partage de coordonnées externes). Votre Trust Score a baissé de 10 points. Si c'est une erreur, ouvrez une contestation via le Support.",
            type: "ALERT",
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // Enqueue a notification for the recipient
      await db.collection("user_notifications").add({
        recipientId: recipientId,
        title: {
          fr: "Nouveau message",
          ar: "رسالة جديدة",
          en: "New message"
        },
        message: {
          fr: `Vous avez reçu un nouveau message pour la commande #${orderId.substring(0,8)}.`,
          ar: `تلقيت رسالة جديدة للطلب #${orderId.substring(0,8)}.`,
          en: `You received a new message for order #${orderId.substring(0,8)}.`
        },
        type: "new_message",
        orderId: orderId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.json({
        success: true,
        masked: violationDetected,
        deliveredText: secureText,
      });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  },
);

// --- Mark Messages as Read ---
router.post(
  "/api/v1/messages/mark-read",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderId } = req.body;
    const userId = req.user?.uid || "";

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    try {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) return res.status(404).json({ error: "Order not found" });

      const orderData = orderSnap.data() || {};
      const buyerId = orderData.userId || orderData.buyerId;
      const sellerId = orderData.sellerId || (orderData.sellerIds && orderData.sellerIds[0]);

      if (userId !== buyerId && userId !== sellerId) {
        return res.status(403).json({ error: "Not an order participant" });
      }

      const isBuyer = userId === buyerId;
      const updateData: Record<string, unknown> = {};
      if (isBuyer) {
        updateData.unreadBuyerMessages = false;
      } else {
        updateData.unreadSellerMessages = false;
      }

      await orderRef.update(updateData);
      return res.json({ success: true });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

// --- Report Inappropriate Message ---
router.post(
  "/api/v1/messages/report",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderId, messageId, reason } = req.body;
    const reporterId = req.user?.uid || "";

    if (!orderId || !messageId) {
      return res.status(400).json({ error: "Missing orderId or messageId" });
    }

    try {
      const messageRef = db.collection("orders").doc(orderId).collection("messages").doc(messageId);
      const messageSnap = await messageRef.get();
      if (!messageSnap.exists) {
        return res.status(404).json({ error: "Message not found" });
      }

      await messageRef.update({
        flagged: true,
        flaggedBy: reporterId,
        flaggedReason: reason || "Inapproprié / Signalé par l'utilisateur",
        flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log alert for the moderator
      await db.collection("admin_alerts").add({
        type: "INAPPROPRIATE_MESSAGE",
        userId: reporterId,
        orderId,
        messageId,
        reason: reason || "Inapproprié / Signalé par l'utilisateur",
        originalText: messageSnap.data()?.text || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        resolved: false,
      });

      return res.json({ success: true, message: "Le message a été signalé avec succès." });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

// GET campaign products
router.get("/api/v1/campaigns/:bannerId/products", async (req, res) => {
  try {
    const bannerId = req.params.bannerId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 24),
    );

    const cacheKey = `campaigns_products_${bannerId}`;
    const campaignData = cache.get(cacheKey) as { banner: Record<string, unknown>; products: Record<string, unknown>[] } | undefined;
    if (campaignData) {
      const totalProducts = campaignData.products.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedProducts = campaignData.products.slice(
        startIndex,
        endIndex,
      );

      return res.json({
        banner: campaignData.banner,
        products: paginatedProducts,
        page,
        limit,
        total: totalProducts,
        hasMore: endIndex < totalProducts,
      });
    }

    const bannerSnap = await db.collection("banners").doc(bannerId).get();

    if (!bannerSnap.exists) {
      return res.status(404).json({ error: "Bannière introuvable" });
    }

    const bannerData = { id: bannerSnap.id, ...bannerSnap.data() } as Record<string, unknown>;
    const tagId = bannerData.tag_id as string | undefined;
    const featuredIds: string[] = Array.isArray(bannerData.featured_products)
      ? (bannerData.featured_products as string[])
      : [];

    const productsMap = new Map<string, Record<string, unknown>>();
    const featuredDocs: Record<string, unknown>[] = [];

    // Fetch featured products in chunks
    if (featuredIds.length > 0) {
      for (let i = 0; i < featuredIds.length; i += 10) {
        const chunk = featuredIds.slice(i, i + 10);
        const chunkSnap = await db
          .collection("products")
          .where("__name__", "in", chunk)
          .get();
        chunkSnap.docs.forEach((doc) => {
          const prodData = { id: doc.id, ...doc.data(), isBannerFeatured: true };
          productsMap.set(doc.id, prodData);
          featuredDocs.push(prodData);
        });
      }
    }

    // Fetch products by banner's tag
    if (tagId) {
      const tagSnap = await db.collection("tags").doc(tagId).get();
      if (tagSnap.exists) {
        const tagName = tagSnap.data()?.name;
        const prodSnap1 = await db
          .collection("products")
          .where("tag_id", "==", tagId)
          .limit(50)
          .get();
        const prodSnap2 = await db
          .collection("products")
          .where("tags", "array-contains", tagId)
          .limit(50)
          .get();
        const prodSnap3 = tagName
          ? await db
              .collection("products")
              .where("tags", "array-contains", tagName)
              .limit(50)
              .get()
          : { docs: [] };

        [...prodSnap1.docs, ...prodSnap2.docs, ...prodSnap3.docs].forEach(
          (doc) => {
            if (!productsMap.has(doc.id)) {
              productsMap.set(doc.id, { id: doc.id, ...doc.data() });
            }
          },
        );
      }
    }

    const finalProducts: Record<string, unknown>[] = [];

    featuredIds.forEach((id) => {
      const p = productsMap.get(id);
      if (p) {
        finalProducts.push(p);
        productsMap.delete(id);
      }
    });

    finalProducts.push(...Array.from(productsMap.values()));

    const responseData = {
      banner: bannerData,
      products: finalProducts,
    };
    cache.set(cacheKey, responseData, 600); // 10 mins cache

    const totalProducts = finalProducts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = finalProducts.slice(startIndex, endIndex);

    return res.json({
      banner: bannerData,
      products: paginatedProducts,
      page,
      limit,
      total: totalProducts,
      hasMore: endIndex < totalProducts,
    });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// GET public home data
router.get("/api/v1/public/home-data", async (req, res) => {
  try {
    const data = await CoreService.getHomeData();
    return res.json(data);
  } catch {
    return res.status(500).json({ error: "Failed to load homepage data" });
  }
});

// GET global settings
router.get("/api/v1/public/settings", async (req, res) => {
  try {
    const data = await CoreService.getPublicSettings();
    return res.json(data);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST log site errors
router.post("/api/v1/logs/error", async (req, res) => {
  try {
    await CoreService.logError(req.body);
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Error writing to site_errors", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST batch public profiles
router.post("/api/v1/public-profiles", async (req, res) => {
  try {
    const profiles = await CoreService.getPublicProfiles(req.body.ids);
    return res.json({ profiles });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// POST validate coupon
router.post("/api/v1/checkout/validate-coupon", optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, items } = req.body;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "Code requis" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Panier requis pour valider ce code promo." });
    }

    const upperCode = code.trim().toUpperCase();
    const qSnap = await db.collection("coupons").where("code", "==", upperCode).get();
    
    const resolveResult = CouponService.resolveActiveCouponFromDocs(qSnap.docs);
    if (!resolveResult.couponDoc) {
      return res.status(400).json({ error: resolveResult.error || "Code promo ou coupon invalide." });
    }

    const couponDoc = resolveResult.couponDoc;
    const couponData = couponDoc.data() as Record<string, unknown>;
    const userId = req.user?.uid;
    const isGuest = !req.user;

    // Reconstruct cart & subtotal server-side, completely ignoring client-provided prices/subtotal
    const reconstructed = await CouponService.reconstructVerifiedCartFromFirestore(items, db);
    if (!reconstructed.valid) {
      return res.status(400).json({ error: reconstructed.error || "Panier requis pour valider ce code promo." });
    }

    const validation = CouponService.validateCoupon({
      couponDocId: couponDoc.id,
      couponData,
      subtotal: reconstructed.serverSubtotal,
      userId,
      isGuest,
      items: reconstructed.verifiedItems,
    });

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    return res.json({
      success: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount,
      eligibleSubtotal: validation.eligibleSubtotal,
    });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// GET explore top sellers & public shops directory
router.get("/api/v1/explore/sellers", async (req: Request, res: Response) => {
  try {
    const snap = await db.collection("publicProfiles").limit(100).get();
    const sellers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ sellers });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/api/v1/public/shops", async (req: Request, res: Response) => {
  try {
    const [publicProfilesSnap, sellersSnap] = await Promise.all([
      db.collection("publicProfiles").limit(200).get().catch(() => ({ docs: [] })),
      db.collection("users").where("role", "==", "seller").limit(200).get().catch(() => ({ docs: [] }))
    ]);

    const shopsMap = new Map<string, Record<string, unknown>>();

    // Process publicProfiles first
    publicProfilesSnap.docs.forEach((d) => {
      const data = d.data();
      shopsMap.set(d.id, {
        id: d.id,
        sellerId: d.id,
        shopName: data.shopName || data.displayName || "Boutique Olmart",
        slogan: data.slogan || "",
        description: data.description || data.shopDescription || "",
        logoUrl: data.logoUrl || data.photoURL || "",
        bannerUrl: data.bannerUrl || data.coverUrl || "",
        wilaya: data.wilaya || "16 - Alger",
        category: data.category || data.specialty || "Général",
        categories: data.categories || [data.category || "Général"],
        rating: data.rating !== undefined ? data.rating : null,
        sellerTrustScore: data.sellerTrustScore !== undefined ? data.sellerTrustScore : null,
        reviewsCount: data.reviewsCount ?? 0,
        productsCount: data.productsCount ?? 0,
        isVerified: data.status === "ACTIVE" || data.status === "active" || data.isVerified !== false,
        status: data.status || "ACTIVE",
        avgPreparationTime: data.avgPreparationTime || "24h",
        badge: data.badge || "Vendeur Vérifié",
        createdAt: data.createdAt || Date.now()
      });
    });

    // Merge from users table if not present or richer
    sellersSnap.docs.forEach((d) => {
      const data = d.data();
      const existing = shopsMap.get(d.id);
      if (!existing) {
        shopsMap.set(d.id, {
          id: d.id,
          sellerId: d.id,
          shopName: data.shopName || data.displayName || "Boutique Indépendante",
          slogan: data.slogan || "",
          description: data.description || data.shopDescription || "",
          logoUrl: data.logoUrl || data.photoURL || data.avatarUrl || "",
          bannerUrl: data.bannerUrl || data.coverUrl || data.coverImage || "",
          wilaya: data.wilaya || "16 - Alger",
          category: data.category || "Général",
          categories: [data.category || "Général"],
          rating: null,
          sellerTrustScore: null,
          reviewsCount: 0,
          productsCount: 0,
          isVerified: true,
          status: data.status || "ACTIVE",
          avgPreparationTime: "24h",
          badge: "Boutique Certifiée",
          createdAt: data.createdAt || Date.now()
        });
      } else {
        if (data.shopName && (existing.shopName === "Boutique Olmart" || !existing.shopName)) {
          existing.shopName = data.shopName;
        }
        if (!existing.logoUrl && (data.logoUrl || data.photoURL || data.avatarUrl)) {
          existing.logoUrl = data.logoUrl || data.photoURL || data.avatarUrl;
        }
        if (!existing.bannerUrl && (data.bannerUrl || data.coverUrl || data.coverImage)) {
          existing.bannerUrl = data.bannerUrl || data.coverUrl || data.coverImage;
        }
      }
    });

    const shops = Array.from(shopsMap.values());
    safeLogger.info("/api/v1/public/shops fetched public shop profiles", { count: shops.length });
    return res.json({ success: true, shops });
  } catch (error: unknown) {
    safeLogger.error("Error fetching public shops", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// GET single public shop profile by sellerId / uid / slug
router.get("/api/v1/public/shops/:sellerId", async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) {
      return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    }

    // 1. Fetch both publicProfiles and users documents in parallel
    const [pubSnap, userSnap] = await Promise.all([
      db.collection("publicProfiles").doc(sellerId).get().catch(() => null),
      db.collection("users").doc(sellerId).get().catch(() => null)
    ]);

    if ((pubSnap && pubSnap.exists) || (userSnap && userSnap.exists)) {
      const pubData = pubSnap && pubSnap.exists ? pubSnap.data() : {};
      const userData = userSnap && userSnap.exists ? userSnap.data() : {};
      const merged = { ...userData, ...pubData };

      const logoUrl = pubData?.logoUrl || pubData?.photoURL || pubData?.avatarUrl ||
                      userData?.logoUrl || userData?.photoURL || userData?.avatarUrl || userData?.photoUrl || "";

      const bannerUrl = pubData?.bannerUrl || pubData?.coverUrl || pubData?.coverImage ||
                        userData?.bannerUrl || userData?.coverUrl || userData?.coverImage || userData?.bannerImage || "";

      return res.json({
        success: true,
        shop: {
          id: sellerId,
          sellerId: sellerId,
          shopName: merged.shopName || merged.displayName || "Boutique Olmart",
          slogan: merged.slogan || "",
          description: merged.description || merged.shopDescription || "Bienvenue dans ma boutique sur Olmart.",
          shopDescription: merged.shopDescription || merged.description || "Bienvenue dans ma boutique sur Olmart.",
          wilaya: merged.wilaya || "16 - Alger",
          category: merged.category || merged.specialty || "Général",
          rating: merged.rating !== undefined ? merged.rating : null,
          sellerTrustScore: merged.sellerTrustScore !== undefined ? merged.sellerTrustScore : null,
          reviewsCount: merged.reviewsCount ?? 0,
          productsCount: merged.productsCount ?? 0,
          isVerified: true,
          status: merged.status || "ACTIVE",
          avgPreparationTime: merged.avgPreparationTime || "24h",
          returnPolicy: merged.returnPolicy || "Retours acceptés sous 7 jours.",
          legalStatus: merged.legalStatus || "Artisan / Commerçant",
          followersCount: merged.followersCount || 0,
          ...merged,
          logoUrl,
          bannerUrl
        }
      });
    }

    // 3. Query users collection by shopSlug, shopName, displayName, email
    const decodedId = decodeURIComponent(sellerId);
    const slugQuery = await db.collection("users").where("shopSlug", "==", sellerId).limit(1).get().catch(() => null);
    if (slugQuery && !slugQuery.empty) {
      const docSnap = slugQuery.docs[0];
      const data = docSnap.data();
      return res.json({
        success: true,
        shop: {
          id: docSnap.id,
          sellerId: docSnap.id,
          shopName: data?.shopName || data?.displayName || "Boutique Vendeur",
          description: data?.description || data?.shopDescription || "",
          shopDescription: data?.shopDescription || data?.description || "",
          logoUrl: data?.logoUrl || data?.photoURL || "",
          bannerUrl: data?.bannerUrl || data?.coverUrl || "",
          wilaya: data?.wilaya || "16 - Alger",
          category: data?.category || "Général",
          rating: data?.rating !== undefined ? data?.rating : null,
          sellerTrustScore: data?.sellerTrustScore !== undefined ? data?.sellerTrustScore : null,
          isVerified: true,
          status: data?.status || "ACTIVE",
          ...data
        }
      });
    }

    const nameQuery = await db.collection("users").where("shopName", "==", decodedId).limit(1).get().catch(() => null);
    if (nameQuery && !nameQuery.empty) {
      const docSnap = nameQuery.docs[0];
      const data = docSnap.data();
      return res.json({
        success: true,
        shop: { id: docSnap.id, sellerId: docSnap.id, shopName: data?.shopName || data?.displayName || "Boutique Vendeur", ...data }
      });
    }

    const displayQuery = await db.collection("users").where("displayName", "==", decodedId).limit(1).get().catch(() => null);
    if (displayQuery && !displayQuery.empty) {
      const docSnap = displayQuery.docs[0];
      const data = docSnap.data();
      return res.json({
        success: true,
        shop: { id: docSnap.id, sellerId: docSnap.id, shopName: data?.shopName || data?.displayName || "Boutique Vendeur", ...data }
      });
    }

    // 4. Check products collection for sellerId / sellerName / storeName match
    const prodQuery = await db.collection("products").where("sellerId", "==", sellerId).limit(1).get().catch(() => null);
    if (prodQuery && !prodQuery.empty) {
      const prodData = prodQuery.docs[0].data();
      return res.json({
        success: true,
        shop: {
          id: sellerId,
          sellerId: sellerId,
          shopName: prodData?.sellerName || prodData?.storeName || prodData?.brand || decodedId || "Boutique Olmart",
          shopDescription: "Boutique officielle sur la Marketplace Olmart.",
          description: "Boutique officielle sur la Marketplace Olmart.",
          logoUrl: prodData?.sellerLogo || prodData?.storeLogo || "",
          bannerUrl: "",
          wilaya: prodData?.wilaya || prodData?.location || "16 - Alger",
          rating: null,
          sellerTrustScore: null,
          isVerified: true,
          status: "ACTIVE"
        }
      });
    }

    const prodNameQuery = await db.collection("products").where("sellerName", "==", decodedId).limit(1).get().catch(() => null);
    if (prodNameQuery && !prodNameQuery.empty) {
      const prodData = prodNameQuery.docs[0].data();
      return res.json({
        success: true,
        shop: {
          id: prodData?.sellerId || sellerId,
          sellerId: prodData?.sellerId || sellerId,
          shopName: prodData?.sellerName || prodData?.storeName || decodedId,
          shopDescription: "Boutique enregistrée sur la Marketplace Olmart.",
          logoUrl: prodData?.sellerLogo || prodData?.storeLogo || "",
          wilaya: prodData?.wilaya || "16 - Alger",
          rating: null,
          sellerTrustScore: null,
          isVerified: true,
          status: "ACTIVE"
        }
      });
    }

    // 5. Synthesize clean shop object so seller profile always loads
    const nameFromId = decodedId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return res.json({
      success: true,
      shop: {
        id: sellerId,
        sellerId: sellerId,
        shopName: nameFromId || "Boutique Vendeur",
        shopDescription: "Boutique enregistrée sur la Marketplace Olmart Algérie.",
        description: "Boutique enregistrée sur la Marketplace Olmart Algérie.",
        logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFromId)}&background=0F766E&color=fff&bold=true`,
        bannerUrl: "",
        wilaya: "16 - Alger",
        rating: null,
        sellerTrustScore: null,
        isVerified: true,
        status: "ACTIVE"
      }
    });
  } catch (error: unknown) {
    safeLogger.error("Error fetching single public shop", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// GET public products for a specific shop by sellerId
router.get("/api/v1/public/shops/:sellerId/products", async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  try {
    if (!sellerId) {
      return res.status(400).json({ success: false, error: "Missing sellerId parameter" });
    }

    const decodedId = decodeURIComponent(sellerId);
    
    // Fetch shop details first to get all shop name aliases
    const [pubSnap, userSnap] = await Promise.all([
      db.collection("publicProfiles").doc(sellerId).get().catch(() => null),
      db.collection("users").doc(sellerId).get().catch(() => null)
    ]);

    const pubData = pubSnap && pubSnap.exists ? pubSnap.data() : {};
    const userData = userSnap && userSnap.exists ? userSnap.data() : {};
    const merged = { ...userData, ...pubData };

    const candidateIds = Array.from(new Set([
      sellerId,
      decodedId,
      merged.id,
      merged.sellerId,
      merged.uid,
      merged.userUid
    ].filter(Boolean) as string[]));

    const candidateNames = Array.from(new Set([
      merged.shopName,
      merged.displayName,
      merged.storeName,
      merged.brand,
      decodedId
    ].filter(Boolean) as string[]));

    const productMap = new Map<string, Record<string, unknown>>();

    // Query products by candidate IDs across multiple field names
    for (const tid of candidateIds) {
      const fieldNames = ["sellerId", "sellerUid", "userId", "storeId", "shopId"];
      for (const f of fieldNames) {
        try {
          const snap = await db.collection("products").where(f, "==", tid).limit(100).get();
          snap.docs.forEach(doc => {
            productMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
        } catch {
          // Ignore individual field query errors
        }
      }
    }

    // Query products by candidate seller names if no products found by ID
    if (productMap.size === 0) {
      for (const sName of candidateNames) {
        const nameFields = ["sellerName", "storeName", "brand"];
        for (const nf of nameFields) {
          try {
            const snap = await db.collection("products").where(nf, "==", sName).limit(100).get();
            snap.docs.forEach(doc => {
              productMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
          } catch {
            // Ignore individual field query errors
          }
        }
      }
    }

    const products = Array.from(productMap.values());
    products.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const tA = (a.createdAt as { toDate?: () => Date })?.toDate ? (a.createdAt as { toDate: () => Date }).toDate().getTime() : new Date((a.createdAt as string | number) || 0).getTime();
      const tB = (b.createdAt as { toDate?: () => Date })?.toDate ? (b.createdAt as { toDate: () => Date }).toDate().getTime() : new Date((b.createdAt as string | number) || 0).getTime();
      return tB - tA;
    });

    return res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error: unknown) {
    safeLogger.error("Error fetching shop products", { sellerId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Erreur interne", products: [] });
  }
});

// GET explore top products
router.get("/api/v1/explore/products", async (req: Request, res: Response) => {
  try {
    const snap = await db.collection("products").where("status", "==", "active").limit(120).get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ products });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// --- Route API: Système de notifications internes (Acheteur <-> Vendeur) avec Traduction Gemini ---
router.post(
  "/api/v1/notifications/send",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      recipientId,
      title,
      message,
      type,
      orderId,
      productId,
      conversationId,
    } = req.body;
    const senderId = req.user?.uid || "";

    if (!recipientId || !title || !message) {
      return res
        .status(400)
        .json({ error: "recipientId, title, et message sont obligatoires." });
    }

    try {
      let translations = {
        title: {
          fr: title,
          en: `${title} (EN)`,
          ar: `${title} (AR)`,
        },
        message: {
          fr: message,
          en: `${message} (EN)`,
          ar: `${message} (AR)`,
        },
      };

      // Auto-translation using Gemini AI to FR, EN, and AR
      try {
        const prompt = `Vous êtes Mabrouk, l'expert traducteur e-commerce d'OLMART Algérie (58 wilayas).
Traduisez les chaînes de caractères e-commerce suivantes en Arabe d'Algérie littéraire (soigné, professionnel) et en Anglais :
1. Titre: "${title}"
2. Message: "${message}"

Format de retour JSON STRICT (sans markdown, uniquement le JSON):
{
  "title": {
    "fr": "${title.replace(/"/g, '\\"')}",
    "ar": "La traduction en Arabe",
    "en": "La traduction en Anglais"
  },
  "message": {
    "fr": "${message.replace(/"/g, '\\"')}",
    "ar": "La traduction du message en Arabe",
    "en": "La traduction du message en Anglais"
  }
}
Répondez uniquement avec le JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const resultText = response.text || "";
        const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
        const parsed = JSON.parse(jsonStr);
        if (parsed.title && parsed.message) {
          translations = parsed;
        }
      } catch (geminiErr: unknown) {
        safeLogger.warn(
          "Gemini automatic translation failed for notifications, using fallback suffixes",
          { err: geminiErr instanceof Error ? geminiErr.message : String(geminiErr) },
        );
      }

      const notificationPayload = {
        senderId,
        recipientId,
        title: translations.title,
        message: translations.message,
        type: type || "system",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(orderId && { orderId }),
        ...(productId && { productId }),
        ...(conversationId && { conversationId }),
      };

      const docRef = await db
        .collection("user_notifications")
        .add(notificationPayload);

      return res.status(201).json({
        success: true,
        notificationId: docRef.id,
        notification: {
          id: docRef.id,
          ...notificationPayload,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      safeLogger.error("Failed to register notification", { err: error instanceof Error ? error.message : String(error) });
      return res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Erreur lors de la création de la notification.",
        });
    }
  },
);

// GET order chat details
router.get("/api/v1/orders/:orderId/chat", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const docSnap = await db.collection("orders").doc(orderId).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderData = docSnap.data();
    
    // Get buyer name
    const buyerName = orderData?.shippingAddress?.fullName || orderData?.shippingAddress?.name || "Acheteur Olmart";
    
    // Get shop name
    let shopName = "Boutique Olmart";
    const sid = orderData?.sellerId || (orderData?.sellerIds && orderData?.sellerIds[0]);
    if (sid) {
      const shopSnap = await db.collection("publicProfiles").doc(sid).get();
      if (shopSnap.exists) {
        shopName = shopSnap.data()?.shopName || shopName;
      }
    }
    
    // Get messages
    const msgsSnap = await db.collection("orders").doc(orderId).collection("messages").orderBy("createdAt", "asc").get();
    const messages = msgsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get logs
    const logsSnap = await db.collection("orders").doc(orderId).collection("order_logs").orderBy("date", "asc").get();
    const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isLog: true }));
    
    return res.json({
      buyerName,
      shopName,
      messages,
      logs
    });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

export type { AuthenticatedRequest };
export default router;
