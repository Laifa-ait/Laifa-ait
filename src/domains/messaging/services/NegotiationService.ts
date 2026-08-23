import { db } from "../../../config/firebase-admin";
import {
  ConversationDocument,
  NegotiationOfferPayload,
  ResolveNegotiationDTO
} from "../../../types/messaging";
import { PushNotificationService } from "../../notifications/services/PushNotificationService";

export interface CreateNegotiationParams {
  callerUid: string;
  conversationId: string;
  amountDZD: number;
  terms?: string;
}

export interface ResolveNegotiationParams {
  callerUid: string;
  conversationId: string;
  payload: ResolveNegotiationDTO;
}

export class NegotiationService {
  private static readonly OFFER_VALIDITY_HOURS = 48;

  /**
   * Creates a new negotiation offer inside a Firestore ACID transaction.
   */
  public static async createOffer(params: CreateNegotiationParams): Promise<NegotiationOfferPayload> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    const { callerUid, conversationId, amountDZD, terms } = params;
    const conversationRef = db.collection("conversations").doc(conversationId);
    const messagesCollRef = conversationRef.collection("messages");

    const result = await db.runTransaction(async (transaction) => {
      const convSnap = await transaction.get(conversationRef);
      if (!convSnap.exists) {
        throw new Error("CONVERSATION_NOT_FOUND");
      }

      const convData = convSnap.data() as ConversationDocument;

      // 1. Participant check
      if (!convData.participants || !convData.participants.includes(callerUid)) {
        throw new Error("FORBIDDEN_NOT_PARTICIPANT");
      }

      // 2. State checks
      if (convData.isBlocked) {
        throw new Error("CONVERSATION_BLOCKED");
      }
      if (convData.isArchived) {
        throw new Error("CONVERSATION_ARCHIVED");
      }

      const now = new Date();
      const nowIso = now.toISOString();

      // 3. Active negotiation check
      if (convData.activeNegotiation && convData.activeNegotiation.status === "PENDING") {
        const expiresTime = new Date(convData.activeNegotiation.expiresAt).getTime();
        if (expiresTime > now.getTime()) {
          throw new Error("ACTIVE_OFFER_ALREADY_EXISTS");
        }
      }

      // 4. Determine target UID (the opposing participant)
      const targetUid = convData.participants.find((uid) => uid !== callerUid);
      if (!targetUid) {
        throw new Error("OPPOSING_PARTICIPANT_NOT_FOUND");
      }

      const expiresAt = new Date(now.getTime() + this.OFFER_VALIDITY_HOURS * 60 * 60 * 1000).toISOString();
      const offerId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const newOffer: NegotiationOfferPayload = {
        offerId,
        amountDZD,
        initialPriceDZD: convData.activeNegotiation?.initialPriceDZD || amountDZD,
        currency: "DZD",
        status: "PENDING",
        proposedByUid: callerUid,
        targetUid,
        expiresAt,
        terms: terms || undefined,
        createdAt: nowIso
      };

      const systemMsgText = `Nouvelle offre de négociation proposée : ${amountDZD.toLocaleString("fr-DZ")} DZD.`;

      // Update conversation
      transaction.update(conversationRef, {
        activeNegotiation: newOffer,
        lastMessage: {
          text: systemMsgText,
          senderId: callerUid,
          sentAt: nowIso,
          isSystem: true
        },
        updatedAt: nowIso
      });

      // Append system message in subcollection
      const msgRef = messagesCollRef.doc();
      transaction.set(msgRef, {
        id: msgRef.id,
        conversationId,
        senderId: callerUid,
        recipientId: targetUid,
        text: systemMsgText,
        negotiationOffer: newOffer,
        violation: false,
        isSystem: true,
        readBy: [callerUid],
        createdAt: nowIso
      });

      return newOffer;
    });

    PushNotificationService.sendNegotiationPush(conversationId, result.proposedByUid, result.targetUid, {
      offerId: result.offerId,
      amountDZD: result.amountDZD,
      action: "NEW_OFFER"
    }).catch(() => {});

    return result;
  }

  /**
   * Resolves or counters an active negotiation inside a Firestore ACID transaction.
   */
  public static async resolveOffer(params: ResolveNegotiationParams): Promise<NegotiationOfferPayload> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    const { callerUid, conversationId, payload } = params;
    const conversationRef = db.collection("conversations").doc(conversationId);
    const messagesCollRef = conversationRef.collection("messages");

    const result = await db.runTransaction(async (transaction) => {
      const convSnap = await transaction.get(conversationRef);
      if (!convSnap.exists) {
        throw new Error("CONVERSATION_NOT_FOUND");
      }

      const convData = convSnap.data() as ConversationDocument;

      // 1. Participant check
      if (!convData.participants || !convData.participants.includes(callerUid)) {
        throw new Error("FORBIDDEN_NOT_PARTICIPANT");
      }

      const activeOffer = convData.activeNegotiation;
      if (!activeOffer || activeOffer.offerId !== payload.offerId) {
        throw new Error("OFFER_NOT_FOUND_OR_MISMATCH");
      }

      if (activeOffer.status !== "PENDING") {
        throw new Error(`CANNOT_TRANSITION_FROM_${activeOffer.status}`);
      }

      const now = new Date();
      const nowIso = now.toISOString();

      // Check expiration
      if (new Date(activeOffer.expiresAt).getTime() <= now.getTime()) {
        const expiredOffer: NegotiationOfferPayload = {
          ...activeOffer,
          status: "EXPIRED",
          resolvedAt: nowIso
        };
        transaction.update(conversationRef, {
          activeNegotiation: expiredOffer,
          updatedAt: nowIso
        });
        throw new Error("OFFER_EXPIRED");
      }

      // 2. Authority check: only targetUid can ACCEPT, REJECT, or COUNTER
      if (activeOffer.targetUid !== callerUid) {
        throw new Error("UNAUTHORIZED_OFFER_RESOLUTION");
      }

      let updatedOffer: NegotiationOfferPayload;
      let systemMsgText = "";

      if (payload.action === "ACCEPT") {
        updatedOffer = {
          ...activeOffer,
          status: "ACCEPTED",
          resolvedAt: nowIso
        };
        systemMsgText = `Offre de négociation acceptée pour ${activeOffer.amountDZD.toLocaleString("fr-DZ")} DZD.`;

        transaction.update(conversationRef, {
          activeNegotiation: updatedOffer,
          lastMessage: {
            text: systemMsgText,
            senderId: callerUid,
            sentAt: nowIso,
            isSystem: true
          },
          updatedAt: nowIso
        });
      } else if (payload.action === "REJECT") {
        updatedOffer = {
          ...activeOffer,
          status: "REJECTED",
          resolvedAt: nowIso
        };
        systemMsgText = `Offre de négociation refusée (${activeOffer.amountDZD.toLocaleString("fr-DZ")} DZD).`;

        transaction.update(conversationRef, {
          activeNegotiation: updatedOffer,
          lastMessage: {
            text: systemMsgText,
            senderId: callerUid,
            sentAt: nowIso,
            isSystem: true
          },
          updatedAt: nowIso
        });
      } else if (payload.action === "COUNTER") {
        if (!payload.counterAmountDZD || payload.counterAmountDZD <= 0) {
          throw new Error("INVALID_COUNTER_AMOUNT");
        }

        const counterOfferId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const expiresAt = new Date(now.getTime() + this.OFFER_VALIDITY_HOURS * 60 * 60 * 1000).toISOString();

        updatedOffer = {
          offerId: counterOfferId,
          amountDZD: payload.counterAmountDZD,
          initialPriceDZD: activeOffer.initialPriceDZD,
          currency: "DZD",
          status: "PENDING",
          proposedByUid: callerUid,
          targetUid: activeOffer.proposedByUid,
          expiresAt,
          createdAt: nowIso
        };

        systemMsgText = `Contre-offre proposée : ${payload.counterAmountDZD.toLocaleString("fr-DZ")} DZD.`;

        transaction.update(conversationRef, {
          activeNegotiation: updatedOffer,
          lastMessage: {
            text: systemMsgText,
            senderId: callerUid,
            sentAt: nowIso,
            isSystem: true
          },
          updatedAt: nowIso
        });
      } else {
        throw new Error("UNKNOWN_ACTION");
      }

      // Record message in subcollection
      const msgRef = messagesCollRef.doc();
      transaction.set(msgRef, {
        id: msgRef.id,
        conversationId,
        senderId: callerUid,
        recipientId: activeOffer.proposedByUid,
        text: systemMsgText,
        negotiationOffer: updatedOffer,
        violation: false,
        isSystem: true,
        readBy: [callerUid],
        createdAt: nowIso
      });

      return updatedOffer;
    });

    const actionMap: Record<string, "ACCEPTED" | "REJECTED" | "COUNTERED"> = {
      ACCEPT: "ACCEPTED",
      REJECT: "REJECTED",
      COUNTER: "COUNTERED"
    };
    const recipientId = result.proposedByUid === callerUid ? result.targetUid : result.proposedByUid;
    PushNotificationService.sendNegotiationPush(conversationId, callerUid, recipientId, {
      offerId: result.offerId,
      amountDZD: result.amountDZD,
      action: actionMap[payload.action] || "NEW_OFFER"
    }).catch(() => {});

    return result;
  }

  /**
   * Cancels a pending offer by its author inside a Firestore ACID transaction.
   */
  public static async cancelOffer(callerUid: string, conversationId: string, offerId: string): Promise<NegotiationOfferPayload> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    const conversationRef = db.collection("conversations").doc(conversationId);
    const messagesCollRef = conversationRef.collection("messages");

    const result = await db.runTransaction(async (transaction) => {
      const convSnap = await transaction.get(conversationRef);
      if (!convSnap.exists) {
        throw new Error("CONVERSATION_NOT_FOUND");
      }

      const convData = convSnap.data() as ConversationDocument;
      const activeOffer = convData.activeNegotiation;

      if (!activeOffer || activeOffer.offerId !== offerId) {
        throw new Error("OFFER_NOT_FOUND_OR_MISMATCH");
      }

      if (activeOffer.status !== "PENDING") {
        throw new Error(`CANNOT_CANCEL_${activeOffer.status}_OFFER`);
      }

      // Only proposer can cancel
      if (activeOffer.proposedByUid !== callerUid) {
        throw new Error("UNAUTHORIZED_OFFER_CANCELLATION");
      }

      const now = new Date();
      const nowIso = now.toISOString();

      const updatedOffer: NegotiationOfferPayload = {
        ...activeOffer,
        status: "CANCELLED",
        resolvedAt: nowIso
      };

      const systemMsgText = `Offre de négociation annulée par l'émetteur.`;

      transaction.update(conversationRef, {
        activeNegotiation: updatedOffer,
        lastMessage: {
          text: systemMsgText,
          senderId: callerUid,
          sentAt: nowIso,
          isSystem: true
        },
        updatedAt: nowIso
      });

      const msgRef = messagesCollRef.doc();
      transaction.set(msgRef, {
        id: msgRef.id,
        conversationId,
        senderId: callerUid,
        recipientId: activeOffer.targetUid,
        text: systemMsgText,
        negotiationOffer: updatedOffer,
        violation: false,
        isSystem: true,
        readBy: [callerUid],
        createdAt: nowIso
      });

      return updatedOffer;
    });

    PushNotificationService.sendNegotiationPush(conversationId, callerUid, result.targetUid, {
      offerId: result.offerId,
      amountDZD: result.amountDZD,
      action: "CANCELLED"
    }).catch(() => {});

    return result;
  }
}
