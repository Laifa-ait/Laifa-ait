import { z } from "zod";
import {
  AttachmentSchema,
  InitiateConversationSchema,
  SendMessageSchema,
  CreateNegotiationSchema,
  ResolveNegotiationSchema,
  ReportMessageSchema
} from "../schemas/messaging";

export type ConversationType =
  | 'ORDER_SUPPORT'
  | 'REAL_ESTATE_INQUIRY'
  | 'BRICOLAGE_QUOTE'
  | 'DIRECT_INQUIRY';

export type NegotiationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COUNTERED'
  | 'EXPIRED'
  | 'CANCELLED';

export type ConversationParticipantRole =
  | 'buyer'
  | 'seller'
  | 'owner'
  | 'artisan'
  | 'admin';

export interface ConversationParticipant {
  uid: string;
  role: ConversationParticipantRole;
  displayName: string;
  avatarUrl?: string;
  lastReadAt?: string;
  unreadCount: number;
}

export type AttachmentPayload = z.infer<typeof AttachmentSchema>;

export interface NegotiationOfferPayload {
  offerId: string;
  amountDZD: number;
  initialPriceDZD: number;
  currency: 'DZD';
  status: NegotiationStatus;
  proposedByUid: string;
  targetUid: string;
  expiresAt: string; // ISO string
  counterOfferAmountDZD?: number;
  terms?: string;
  createdAt: string; // ISO string
  resolvedAt?: string; // ISO string
}

export interface ConversationContext {
  orderId?: string;
  propertyId?: string;
  productId?: string;
  quoteRequestId?: string;
  referenceTitle?: string;
  referenceImageUrl?: string;
  referenceImage?: string;
  referencePriceDZD?: number;
}

export interface ConversationDocument {
  id: string;
  type: ConversationType;
  participants: string[]; // List of UIDs for Firestore array-contains
  participantDetails: Record<string, ConversationParticipant>;
  context: ConversationContext;
  lastMessage?: {
    text: string;
    senderId: string;
    sentAt: string;
    isSystem: boolean;
  };
  activeNegotiation?: NegotiationOfferPayload | null;
  isArchived: boolean;
  isBlocked: boolean;
  blockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDocument {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  attachments?: AttachmentPayload[];
  negotiationOffer?: NegotiationOfferPayload;
  violation: boolean;
  isSystem: boolean;
  readBy: string[];
  createdAt: string;
}

// API DTO & Response interfaces
export type InitiateConversationDTO = z.infer<typeof InitiateConversationSchema>;
export type SendMessageDTO = z.infer<typeof SendMessageSchema>;
export type CreateNegotiationDTO = z.infer<typeof CreateNegotiationSchema>;
export type ResolveNegotiationDTO = z.infer<typeof ResolveNegotiationSchema>;
export type ResolveNegotiationPayload = ResolveNegotiationDTO;
export type ReportMessageDTO = z.infer<typeof ReportMessageSchema>;

export interface MessagingApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  hasMore?: boolean;
}
