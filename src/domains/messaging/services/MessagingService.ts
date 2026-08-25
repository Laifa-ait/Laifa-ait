import { admin, db } from "../../../config/firebase-admin";
import {
  ChatMessageDocument,
  ConversationDocument,
  ConversationParticipant,
  InitiateConversationDTO,
  SendMessageDTO
} from "../../../types/messaging";
import { MessageModerationService } from "./MessageModerationService";
import { PushNotificationService } from "../../notifications/services/PushNotificationService";

export interface PaginationOptions {
  limit?: number;
  before?: string;
  isArchived?: boolean;
}

export class MessagingService {
  private static readonly DEFAULT_PAGE_SIZE = 20;
  private static readonly MAX_PAGE_SIZE = 50;

  /**
   * Lists conversations for a given user with pagination.
   */
  public static async listConversations(
    callerUid: string,
    options: PaginationOptions = {}
  ): Promise<{ conversations: ConversationDocument[]; hasMore: boolean }> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    const pageSize = Math.min(
      Math.max(1, options.limit || this.DEFAULT_PAGE_SIZE),
      this.MAX_PAGE_SIZE
    );

    let query = db
      .collection("conversations")
      .where("participants", "array-contains", callerUid)
      .orderBy("updatedAt", "desc")
      .limit(pageSize + 1);

    if (options.before) {
      query = query.startAfter(options.before);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;

    const conversations: ConversationDocument[] = resultDocs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ConversationDocument, "id">)
    }));

    return { conversations, hasMore };
  }

  /**
   * Retrieves a single conversation by ID with strict IDOR verification.
   */
  public static async getConversation(
    callerUid: string,
    conversationId: string,
    isAdminUser = false
  ): Promise<ConversationDocument> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    const convRef = db.collection("conversations").doc(conversationId);
    const snap = await convRef.get();

    if (!snap.exists) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    const data = snap.data() as ConversationDocument;
    if (!isAdminUser && (!data.participants || !data.participants.includes(callerUid))) {
      throw new Error("FORBIDDEN_NOT_PARTICIPANT");
    }

    return {
      ...data,
      id: snap.id,
    };
  }

  /**
   * Initiates a conversation with strict server-side context and participant resolution.
   */
  public static async initiateConversation(
    callerUid: string,
    payload: InitiateConversationDTO
  ): Promise<{ conversation: ConversationDocument; initialMessage: ChatMessageDocument }> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    const { type, context, initialMessage } = payload;
    let verifiedRecipientId = payload.recipientId;
    let referenceTitle = "Conversation";
    let referenceImageUrl: string | undefined = undefined;

    // 1. Context validation against real Firestore records
    if (type === "REAL_ESTATE_INQUIRY") {
      if (!context.propertyId) {
        throw new Error("PROPERTY_ID_REQUIRED");
      }

      const propDoc = await db.collection("real_estate_properties").doc(context.propertyId).get();
      if (!propDoc.exists) {
        throw new Error("PROPERTY_NOT_FOUND");
      }

      const propData = propDoc.data() || {};
      verifiedRecipientId = propData.ownerId;
      referenceTitle = propData.title || "Annonce Immobilière";
      referenceImageUrl = Array.isArray(propData.images) && propData.images.length > 0 ? propData.images[0] : undefined;

      if (callerUid === verifiedRecipientId) {
        throw new Error("SELF_CONVERSATION_FORBIDDEN");
      }
    } else if (type === "ORDER_SUPPORT") {
      if (!context.orderId) {
        throw new Error("ORDER_ID_REQUIRED");
      }

      const orderDoc = await db.collection("orders").doc(context.orderId).get();
      if (!orderDoc.exists) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const orderData = orderDoc.data() || {};
      const buyerId = orderData.userId || orderData.buyerId;
      const sellerId = orderData.sellerId || (Array.isArray(orderData.sellerIds) ? orderData.sellerIds[0] : undefined);

      if (callerUid !== buyerId && callerUid !== sellerId) {
        throw new Error("FORBIDDEN_NOT_ORDER_PARTICIPANT");
      }

      verifiedRecipientId = callerUid === buyerId ? sellerId : buyerId;
      if (!verifiedRecipientId) {
        throw new Error("ORDER_RECIPIENT_NOT_FOUND");
      }
      referenceTitle = `Commande #${context.orderId.substring(0, 8)}`;
    } else if (type === "DIRECT_INQUIRY") {
      if (!context.productId) {
        throw new Error("PRODUCT_ID_REQUIRED");
      }

      const prodDoc = await db.collection("products").doc(context.productId).get();
      if (!prodDoc.exists) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const prodData = prodDoc.data() || {};
      verifiedRecipientId = prodData.sellerId;
      referenceTitle = prodData.title || prodData.name || "Produit";
      referenceImageUrl = Array.isArray(prodData.images) && prodData.images.length > 0 ? prodData.images[0] : undefined;

      if (callerUid === verifiedRecipientId) {
        throw new Error("SELF_CONVERSATION_FORBIDDEN");
      }
    } else if (type === "BRICOLAGE_QUOTE") {
      if (!context.quoteRequestId) {
        throw new Error("QUOTE_REQUEST_ID_REQUIRED");
      }

      const quoteDoc = await db.collection("bricolage_quote_requests").doc(context.quoteRequestId).get();
      if (!quoteDoc.exists) {
        throw new Error("QUOTE_REQUEST_NOT_FOUND");
      }

      const quoteData = quoteDoc.data() || {};
      const customerId = quoteData.customerId;
      const artisanId = quoteData.artisanId;

      if (callerUid !== customerId && callerUid !== artisanId) {
        throw new Error("FORBIDDEN_NOT_QUOTE_PARTICIPANT");
      }

      verifiedRecipientId = callerUid === customerId ? artisanId : customerId;
      referenceTitle = quoteData.categoryTitle || "Demande de devis";
    }

    if (callerUid === verifiedRecipientId) {
      throw new Error("SELF_CONVERSATION_FORBIDDEN");
    }

    const participants = [callerUid, verifiedRecipientId].sort();

    // 2. Check if a matching conversation already exists to prevent duplicate spam
    const existingSnap = await db
      .collection("conversations")
      .where("participants", "==", participants)
      .where("type", "==", type)
      .limit(5)
      .get();

    const matchedDoc = existingSnap.docs.find((doc) => {
      const c = (doc.data() as ConversationDocument).context;
      return (
        c.propertyId === context.propertyId &&
        c.orderId === context.orderId &&
        c.productId === context.productId &&
        c.quoteRequestId === context.quoteRequestId
      );
    });

    const nowIso = new Date().toISOString();

    let conversationDoc: ConversationDocument;
    let conversationId: string;

    if (matchedDoc) {
      conversationId = matchedDoc.id;
      conversationDoc = {
        id: conversationId,
        ...(matchedDoc.data() as Omit<ConversationDocument, "id">)
      };
    } else {
      // Create user details
      const [callerDoc, recipientDoc] = await Promise.all([
        db.collection("users").doc(callerUid).get(),
        db.collection("users").doc(verifiedRecipientId).get()
      ]);

      const callerData = callerDoc.data() || {};
      const recipientData = recipientDoc.data() || {};

      const participantDetails: Record<string, ConversationParticipant> = {
        [callerUid]: {
          uid: callerUid,
          role: (callerData.role as ConversationParticipant["role"]) || "buyer",
          displayName: callerData.displayName || callerData.name || "Utilisateur",
          avatarUrl: callerData.avatarUrl || undefined,
          lastReadAt: nowIso,
          unreadCount: 0
        },
        [verifiedRecipientId]: {
          uid: verifiedRecipientId,
          role: (recipientData.role as ConversationParticipant["role"]) || "seller",
          displayName: recipientData.displayName || recipientData.name || "Destinataire",
          avatarUrl: recipientData.avatarUrl || undefined,
          unreadCount: 1
        }
      };

      const newConvRef = db.collection("conversations").doc();
      conversationId = newConvRef.id;

      const newConvData: Omit<ConversationDocument, "id"> = {
        type,
        participants,
        participantDetails,
        context: {
          ...context,
          referenceTitle,
          referenceImageUrl
        },
        isArchived: false,
        isBlocked: false,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      await newConvRef.set(newConvData);

      conversationDoc = {
        id: conversationId,
        ...newConvData
      };
    }

    // 3. Moderate and send initial message
    const moderation = MessageModerationService.moderateText(initialMessage);
    if (moderation.violationDetected) {
      await MessageModerationService.recordDlpAlert(
        callerUid,
        conversationId,
        initialMessage,
        moderation.violationReasons
      );
    }

    const messageRef = db.collection("conversations").doc(conversationId).collection("messages").doc();
    const initialMsgData: ChatMessageDocument = {
      id: messageRef.id,
      conversationId,
      senderId: callerUid,
      recipientId: verifiedRecipientId,
      text: moderation.cleanText,
      violation: moderation.violationDetected,
      isSystem: false,
      readBy: [callerUid],
      createdAt: nowIso
    };

    await messageRef.set(initialMsgData);

    // Update conversation lastMessage
    await db.collection("conversations").doc(conversationId).update({
      lastMessage: {
        text: moderation.cleanText,
        senderId: callerUid,
        sentAt: nowIso,
        isSystem: false
      },
      [`participantDetails.${verifiedRecipientId}.unreadCount`]: admin.firestore.FieldValue.increment(1),
      updatedAt: nowIso
    });

    // Fire push notification asynchronously
    PushNotificationService.sendMessagingPush(conversationId, callerUid, verifiedRecipientId, {
      messageId: initialMsgData.id,
      text: moderation.cleanText,
      violationDetected: moderation.violationDetected
    }).catch(() => {});

    return {
      conversation: conversationDoc,
      initialMessage: initialMsgData
    };
  }

  /**
   * Lists messages in a conversation with pagination.
   */
  public static async listMessages(
    callerUid: string,
    conversationId: string,
    options: PaginationOptions = {},
    isAdminUser = false
  ): Promise<{ messages: ChatMessageDocument[]; hasMore: boolean }> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    // Ensure access to conversation
    await this.getConversation(callerUid, conversationId, isAdminUser);

    const pageSize = Math.min(
      Math.max(1, options.limit || this.DEFAULT_PAGE_SIZE),
      this.MAX_PAGE_SIZE
    );

    let query = db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(pageSize + 1);

    if (options.before) {
      query = query.startAfter(options.before);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;

    const messages: ChatMessageDocument[] = resultDocs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ChatMessageDocument, "id">)
    }));

    return { messages, hasMore };
  }

  /**
   * Sends a message with server-side identity attribution and DLP filtering.
   */
  public static async sendMessage(
    callerUid: string,
    conversationId: string,
    payload: SendMessageDTO
  ): Promise<ChatMessageDocument> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    const conv = await this.getConversation(callerUid, conversationId);

    if (conv.isBlocked) {
      throw new Error("CONVERSATION_BLOCKED");
    }
    if (conv.isArchived) {
      throw new Error("CONVERSATION_ARCHIVED");
    }

    // Validate attachments match conversation path in Storage
    if (payload.attachments && payload.attachments.length > 0) {
      const encodedPath = `chat_attachments%2F${conversationId}%2F`;
      const rawPath = `chat_attachments/${conversationId}/`;
      for (const att of payload.attachments) {
        if (!att.url.includes(encodedPath) && !att.url.includes(rawPath)) {
          throw new Error("INVALID_ATTACHMENT_CONVERSATION_MISMATCH");
        }
      }
    }

    const recipientId = conv.participants.find((uid) => uid !== callerUid);
    if (!recipientId) {
      throw new Error("RECIPIENT_NOT_FOUND");
    }

    // Moderate message
    const moderation = MessageModerationService.moderateText(payload.text);
    if (moderation.violationDetected) {
      await MessageModerationService.recordDlpAlert(
        callerUid,
        conversationId,
        payload.text,
        moderation.violationReasons
      );
    }

    const nowIso = new Date().toISOString();
    const msgRef = db.collection("conversations").doc(conversationId).collection("messages").doc();

    const messageDoc: ChatMessageDocument = {
      id: msgRef.id,
      conversationId,
      senderId: callerUid,
      recipientId,
      text: moderation.cleanText,
      attachments: payload.attachments || undefined,
      violation: moderation.violationDetected,
      isSystem: false,
      readBy: [callerUid],
      createdAt: nowIso
    };

    await msgRef.set(messageDoc);

    // Update conversation metadata
    await db.collection("conversations").doc(conversationId).update({
      lastMessage: {
        text: payload.attachments && payload.attachments.length > 0 ? `[Pièce jointe] ${moderation.cleanText}` : moderation.cleanText,
        senderId: callerUid,
        sentAt: nowIso,
        isSystem: false
      },
      [`participantDetails.${recipientId}.unreadCount`]: admin.firestore.FieldValue.increment(1),
      updatedAt: nowIso
    });

    // Fire push notification asynchronously
    PushNotificationService.sendMessagingPush(conversationId, callerUid, recipientId, {
      messageId: messageDoc.id,
      text: moderation.cleanText,
      violationDetected: moderation.violationDetected
    }).catch(() => {});

    return messageDoc;
  }

  /**
   * Marks a conversation as read for the caller.
   */
  public static async markConversationRead(callerUid: string, conversationId: string): Promise<void> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    await this.getConversation(callerUid, conversationId);
    const nowIso = new Date().toISOString();

    await db.collection("conversations").doc(conversationId).update({
      [`participantDetails.${callerUid}.unreadCount`]: 0,
      [`participantDetails.${callerUid}.lastReadAt`]: nowIso
    });
  }

  /**
   * Blocks a conversation.
   */
  public static async blockConversation(callerUid: string, conversationId: string): Promise<void> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    await this.getConversation(callerUid, conversationId);

    await db.collection("conversations").doc(conversationId).update({
      isBlocked: true,
      blockedBy: callerUid,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Reports a message to administrators.
   */
  public static async reportMessage(
    callerUid: string,
    messageId: string,
    reason: string,
    description?: string
  ): Promise<void> {
    if (!db) {
      throw new Error("Base de données Firestore non disponible");
    }

    await db.collection("admin_alerts").add({
      type: "MESSAGE_REPORT",
      reportedBy: callerUid,
      messageId,
      reason,
      description: description || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false
    });
  }
}
