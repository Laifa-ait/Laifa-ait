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

export interface AttachmentPayload {
  type: 'image' | 'pdf';
  url: string;
  fileName: string;
  fileSizeBytes: number;
}

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
  referenceTitle: string;
  referenceImageUrl?: string;
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
export interface InitiateConversationDTO {
  type: ConversationType;
  recipientId: string;
  context: {
    propertyId?: string;
    orderId?: string;
    productId?: string;
    quoteRequestId?: string;
  };
  initialMessage: string;
}

export interface SendMessageDTO {
  text: string;
  attachments?: AttachmentPayload[];
}

export interface CreateNegotiationDTO {
  amountDZD: number;
  terms?: string;
}

export interface ResolveNegotiationDTO {
  offerId: string;
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';
  counterAmountDZD?: number;
}

export type ResolveNegotiationPayload = ResolveNegotiationDTO;

export interface ReportMessageDTO {
  reason: string;
  description?: string;
}

export interface MessagingApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  hasMore?: boolean;
}
