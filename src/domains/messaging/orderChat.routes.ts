import { Router, Response } from "express";
import { db, admin } from "../../config/firebase-admin";
import { authenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { chatLimiter } from "../../middlewares/rateLimiters";
import { hasExternalChannel, maskSensitiveData } from "../../utils/masking";

const router = Router();

// Internal Messaging & DLP (Data Loss Prevention)
router.post("/api/v1/messages/send", authenticateToken, chatLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, text, imageUrl } = req.body;
  const senderId = req.user?.uid || "";

  if (!orderId || (!text && !imageUrl)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (text && typeof text === "string" && text.length > 2000) {
    return res.status(400).json({ error: "Message trop long (maximum 2000 caractères)" });
  }

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

    let secureText = text || "";
    let violationDetected = false;

    if (text && hasExternalChannel(text)) {
      violationDetected = true;
      secureText = maskSensitiveData(text);
    }

    const messageObj: Record<string, unknown> = {
      orderId,
      senderId,
      recipientId,
      text: secureText,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      violation: violationDetected,
      read: false,
    };

    if (imageUrl) {
      if (typeof imageUrl !== "string") {
        return res.status(400).json({ error: "Format d'image invalide" });
      }
      const isAllowedStorageHost = imageUrl.startsWith("https://firebasestorage.googleapis.com/") ||
        imageUrl.startsWith("https://storage.googleapis.com/") ||
        imageUrl.startsWith("data:image/");
      if (!isAllowedStorageHost) {
        return res.status(400).json({ error: "Image non autorisée : les images doivent être hébergées sur le stockage sécurisé Olmart" });
      }
      messageObj.imageUrl = imageUrl;
    }

    await db.collection("orders").doc(orderId).collection("messages").add(messageObj);

    const isSenderBuyer = senderId === buyerId;
    await db.collection("orders").doc(orderId).update({
      lastMessageText: imageUrl ? "[Image]" : secureText,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageSenderId: senderId,
      unreadBuyerMessages: !isSenderBuyer,
      unreadSellerMessages: isSenderBuyer,
    });

    if (violationDetected) {
      await db.collection("admin_alerts").add({
        type: "DLP_VIOLATION",
        userId: senderId,
        orderId: orderId,
        originalText: text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        resolved: false,
      });

      const userRef = db.collection("users").doc(senderId);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentViolations = (userData?.dlpViolations || 0) + 1;
        const updates: Record<string, unknown> = {
          dlpViolations: admin.firestore.FieldValue.increment(1),
          lastDlpViolationAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (userData?.role === "seller") {
          const currentScore = userData?.trustScore || 50;
          updates.trustScore = Math.max(0, currentScore - 10);

          if (currentViolations >= 3) {
            updates.visibilityRestricted = true;
            updates.moderationStatus = "review_required";
          }
        }

        await userRef.update(updates);

        await db.collection("notifications").add({
          userId: senderId,
          title: "Avertissement de sécurité : Message modéré",
          message: "Votre message a été modéré pour partage de coordonnées externes. Vos violations répétées peuvent entraîner la restriction de visibilité de votre boutique.",
          type: "ALERT",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    await db.collection("user_notifications").add({
      recipientId: recipientId,
      title: {
        fr: "Nouveau message",
        ar: "رسالة جديدة",
        en: "New message",
      },
      message: {
        fr: `Vous avez reçu un nouveau message pour la commande #${orderId.substring(0, 8)}.`,
        ar: `تلقيت رسالة جديدة للطلب #${orderId.substring(0, 8)}.`,
        en: `You received a new message for order #${orderId.substring(0, 8)}.`,
      },
      type: "new_message",
      orderId: orderId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      masked: violationDetected,
      deliveredText: secureText,
    });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// Mark messages as read
router.post("/api/v1/messages/mark-read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
    await orderRef.update({
      [isBuyer ? "unreadBuyerMessages" : "unreadSellerMessages"]: false,
    });

    // Mark unread messages sent by other participant as read
    const unreadSnap = await orderRef.collection("messages")
      .where("senderId", "!=", userId)
      .where("read", "==", false)
      .get();

    if (!unreadSnap.empty) {
      const batch = db.batch();
      unreadSnap.docs.forEach((d) => {
        batch.update(d.ref, {
          read: true,
          readAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }

    return res.json({ success: true });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// Report inappropriate message
router.post("/api/v1/messages/report", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
});

// GET order chat details
router.get("/api/v1/orders/:orderId/chat", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const callerUid = req.user?.uid || "";
    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";

    const docSnap = await db.collection("orders").doc(orderId).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderData = docSnap.data();
    const buyerId = orderData?.userId || orderData?.buyerId;
    const sellerId = orderData?.sellerId || (orderData?.sellerIds && orderData?.sellerIds[0]);

    if (!isAdmin && callerUid !== buyerId && callerUid !== sellerId) {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant de cette commande." });
    }

    const buyerName = orderData?.shippingAddress?.fullName || orderData?.shippingAddress?.name || "Acheteur Olmart";
    let shopName = "Boutique Olmart";
    const sid = orderData?.sellerId || (orderData?.sellerIds && orderData?.sellerIds[0]);
    if (sid) {
      const shopSnap = await db.collection("publicProfiles").doc(sid).get();
      if (shopSnap.exists) {
        shopName = shopSnap.data()?.shopName || shopName;
      }
    }

    const [msgsSnap, logsSnap] = await Promise.all([
      db.collection("orders").doc(orderId).collection("messages").orderBy("createdAt", "asc").get(),
      db.collection("orders").doc(orderId).collection("order_logs").orderBy("date", "asc").get(),
    ]);

    const messages = msgsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isLog: true }));

    return res.json({ buyerName, shopName, messages, logs });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

export default router;
