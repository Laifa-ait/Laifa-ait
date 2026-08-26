import crypto from "crypto";
import { admin, db } from "../../../config/firebase-admin";

export interface PushTokenRecord {
  token: string;
  uid: string;
  deviceType: string;
  updatedAt: admin.firestore.FieldValue;
}

export class PushNotificationService {
  /**
   * Helper to compute a stable document ID for a raw FCM token string
   */
  private static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Registers or refreshes an FCM push token for an authenticated user.
   */
  public static async registerPushToken(
    callerUid: string,
    token: string,
    deviceType = "web"
  ): Promise<void> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      throw new Error("INVALID_PUSH_TOKEN");
    }

    const tokenHash = this.hashToken(token.trim());
    const tokenRef = db.collection("users").doc(callerUid).collection("pushTokens").doc(tokenHash);

    await tokenRef.set({
      token: token.trim(),
      uid: callerUid,
      deviceType,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Unregisters an FCM push token for an authenticated user.
   */
  public static async unregisterPushToken(callerUid: string, token: string): Promise<void> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }
    if (!token || typeof token !== "string") {
      throw new Error("INVALID_PUSH_TOKEN");
    }

    const tokenHash = this.hashToken(token.trim());
    const tokenRef = db.collection("users").doc(callerUid).collection("pushTokens").doc(tokenHash);

    await tokenRef.delete();
  }

  /**
   * Triggers a push notification for a new chat message.
   * Runs asynchronously and silently handles errors so message delivery is never blocked.
   */
  public static async sendMessagingPush(
    conversationId: string,
    senderId: string,
    recipientId: string,
    messageData: { messageId: string; text: string; violationDetected: boolean }
  ): Promise<void> {
    try {
      if (!db) return;

      // Check if conversation is blocked
      const convSnap = await db.collection("conversations").doc(conversationId).get();
      if (!convSnap || !convSnap.exists || convSnap.data?.()?.isBlocked) {
        return;
      }

      // Idempotency / Deduplication check
      const logId = `${conversationId}_${messageData.messageId}`;
      const logRef = db.collection("push_logs").doc(logId);
      const logSnap = await logRef.get();
      if (logSnap && logSnap.exists) {
        return; // Already sent
      }

      // Fetch recipient push tokens
      const tokensSnap = await db
        .collection("users")
        .doc(recipientId)
        .collection("pushTokens")
        .get();

      if (tokensSnap.empty) {
        await logRef.set({ sentAt: admin.firestore.FieldValue.serverTimestamp(), recipientId, status: "NO_TOKENS" });
        return;
      }

      const tokens: string[] = [];
      const tokenDocIds: string[] = [];
      tokensSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data && typeof data.token === "string" && data.token) {
          tokens.push(data.token);
          tokenDocIds.push(doc.id);
        }
      });

      if (tokens.length === 0) {
        await logRef.set({ sentAt: admin.firestore.FieldValue.serverTimestamp(), recipientId, status: "NO_VALID_TOKENS" });
        return;
      }

      const truncatedText = messageData.violationDetected
        ? "[Message modéré]"
        : messageData.text.length > 60
        ? messageData.text.substring(0, 60) + "..."
        : messageData.text;

      const payload = {
        notification: {
          title: "Nouveau message Olmart 💬",
          body: truncatedText
        },
        data: {
          type: "NEW_MESSAGE",
          conversationId,
          messageId: messageData.messageId
        },
        tokens
      };

      let successCount = 0;
      let failureCount = 0;

      if (typeof admin.messaging === "function") {
        try {
          const response = await admin.messaging().sendEachForMulticast(payload);
          successCount = response.successCount;
          failureCount = response.failureCount;

          // Prune stale/invalid tokens
          if (response.failureCount > 0) {
            response.responses.forEach((res, idx) => {
              if (!res.success && res.error) {
                const code = res.error.code;
                if (
                  code === "messaging/invalid-registration-token" ||
                  code === "messaging/registration-token-not-registered"
                ) {
                  const invalidDocId = tokenDocIds[idx];
                  if (invalidDocId) {
                    db.collection("users").doc(recipientId).collection("pushTokens").doc(invalidDocId).delete().catch(() => {});
                  }
                }
              }
            });
          }
        } catch (messagingErr) {
          console.warn("[PushNotificationService] FCM multicast failed:", messagingErr);
        }
      }

      await logRef.set({
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        recipientId,
        successCount,
        failureCount,
        status: "SENT"
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[PushNotificationService] ❌ Failed to send messaging push:", errorMsg);
    }
  }

  /**
   * Triggers a push notification for a negotiation offer update.
   * Runs asynchronously and silently handles errors so negotiation transitions are never blocked.
   */
  public static async sendNegotiationPush(
    conversationId: string,
    senderId: string,
    recipientId: string,
    offerData: {
      offerId: string;
      amountDZD: number;
      action: "NEW_OFFER" | "ACCEPTED" | "REJECTED" | "COUNTERED" | "CANCELLED";
    }
  ): Promise<void> {
    try {
      if (!db) return;

      // Check if conversation is blocked
      const convSnap = await db.collection("conversations").doc(conversationId).get();
      if (!convSnap || !convSnap.exists || convSnap.data?.()?.isBlocked) {
        return;
      }

      // Idempotency / Deduplication check
      const logId = `${conversationId}_${offerData.offerId}_${offerData.action}`;
      const logRef = db.collection("push_logs").doc(logId);
      const logSnap = await logRef.get();
      if (logSnap && logSnap.exists) {
        return; // Already sent
      }

      // Fetch recipient push tokens
      const tokensSnap = await db
        .collection("users")
        .doc(recipientId)
        .collection("pushTokens")
        .get();

      if (tokensSnap.empty) {
        await logRef.set({ sentAt: admin.firestore.FieldValue.serverTimestamp(), recipientId, status: "NO_TOKENS" });
        return;
      }

      const tokens: string[] = [];
      const tokenDocIds: string[] = [];
      tokensSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data && typeof data.token === "string" && data.token) {
          tokens.push(data.token);
          tokenDocIds.push(doc.id);
        }
      });

      if (tokens.length === 0) {
        await logRef.set({ sentAt: admin.firestore.FieldValue.serverTimestamp(), recipientId, status: "NO_VALID_TOKENS" });
        return;
      }

      let title = "Mise à jour de négociation";
      let body = `Mise à jour pour l'offre (${offerData.amountDZD} DZD).`;

      switch (offerData.action) {
        case "NEW_OFFER":
          title = "Nouvelle offre de négociation 🤝";
          body = `Une offre de ${offerData.amountDZD} DZD a été proposée.`;
          break;
        case "ACCEPTED":
          title = "Offre acceptée ! 🎉";
          body = `L'offre de ${offerData.amountDZD} DZD a été acceptée.`;
          break;
        case "REJECTED":
          title = "Offre refusée";
          body = `L'offre de ${offerData.amountDZD} DZD a été refusée.`;
          break;
        case "COUNTERED":
          title = "Contre-offre reçue 🔄";
          body = `Une contre-offre de ${offerData.amountDZD} DZD a été proposée.`;
          break;
        case "CANCELLED":
          title = "Offre annulée";
          body = `L'offre de négociation a été annulée.`;
          break;
      }

      const payload = {
        notification: {
          title,
          body
        },
        data: {
          type: "NEGOTIATION_UPDATE",
          conversationId,
          offerId: offerData.offerId,
          action: offerData.action
        },
        tokens
      };

      let successCount = 0;
      let failureCount = 0;

      if (typeof admin.messaging === "function") {
        try {
          const response = await admin.messaging().sendEachForMulticast(payload);
          successCount = response.successCount;
          failureCount = response.failureCount;

          if (response.failureCount > 0) {
            response.responses.forEach((res, idx) => {
              if (!res.success && res.error) {
                const code = res.error.code;
                if (
                  code === "messaging/invalid-registration-token" ||
                  code === "messaging/registration-token-not-registered"
                ) {
                  const invalidDocId = tokenDocIds[idx];
                  if (invalidDocId) {
                    db.collection("users").doc(recipientId).collection("pushTokens").doc(invalidDocId).delete().catch(() => {});
                  }
                }
              }
            });
          }
        } catch (messagingErr) {
          console.warn("[PushNotificationService] FCM multicast failed:", messagingErr);
        }
      }

      await logRef.set({
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        recipientId,
        successCount,
        failureCount,
        status: "SENT"
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[PushNotificationService] ❌ Failed to send negotiation push:", errorMsg);
    }
  }
}
