import { apiGet, apiPost } from '../lib/api';
import {
  ChatMessageDocument,
  ConversationDocument,
  InitiateConversationDTO,
  NegotiationOfferPayload,
  ResolveNegotiationPayload,
  SendMessageDTO
} from '../types/messaging';

export interface ListConversationsParams {
  limit?: number;
  before?: string;
  isArchived?: boolean;
}

export interface ListConversationsResponse {
  success: boolean;
  data: ConversationDocument[];
  hasMore: boolean;
}

export interface ListMessagesParams {
  limit?: number;
  before?: string;
}

export interface ListMessagesResponse {
  success: boolean;
  data: ChatMessageDocument[];
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const messagingApi = {
  /**
   * List all conversations for authenticated user
   */
  async listConversations(params?: ListConversationsParams): Promise<ListConversationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.before) searchParams.set('before', params.before);
    if (params?.isArchived) searchParams.set('isArchived', 'true');

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiGet<ListConversationsResponse>(`/api/v1/messaging/conversations${queryStr}`);
  },

  /**
   * Initiate a conversation with contextual verification on backend
   */
  async initiateConversation(dto: InitiateConversationDTO): Promise<{ success: boolean; data: ConversationDocument }> {
    return apiPost<{ success: boolean; data: ConversationDocument }>(
      '/api/v1/messaging/conversations/initiate',
      dto
    );
  },

  /**
   * List paginated messages of a conversation
   */
  async listMessages(conversationId: string, params?: ListMessagesParams): Promise<ListMessagesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.before) searchParams.set('before', params.before);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiGet<ListMessagesResponse>(
      `/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/messages${queryStr}`
    );
  },

  /**
   * Send a new message in an existing conversation
   */
  async sendMessage(conversationId: string, dto: SendMessageDTO): Promise<{ success: boolean; data: ChatMessageDocument }> {
    return apiPost<{ success: boolean; data: ChatMessageDocument }>(
      `/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/messages`,
      dto
    );
  },

  /**
   * Propose a price negotiation offer
   */
  async createNegotiation(
    conversationId: string,
    amountDZD: number,
    terms?: string
  ): Promise<{ success: boolean; data: NegotiationOfferPayload }> {
    return apiPost<{ success: boolean; data: NegotiationOfferPayload }>(
      `/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/negotiate`,
      { amountDZD, terms }
    );
  },

  /**
   * Resolve an active negotiation offer (ACCEPT, REJECT, COUNTER)
   */
  async resolveNegotiation(
    conversationId: string,
    payload: ResolveNegotiationPayload
  ): Promise<{ success: boolean; data: NegotiationOfferPayload }> {
    return apiPost<{ success: boolean; data: NegotiationOfferPayload }>(
      `/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/negotiate/resolve`,
      payload
    );
  },

  /**
   * Cancel an active offer by the proposer
   */
  async cancelNegotiation(
    conversationId: string,
    offerId: string
  ): Promise<{ success: boolean; data: NegotiationOfferPayload }> {
    return apiPost<{ success: boolean; data: NegotiationOfferPayload }>(
      `/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/negotiate/cancel`,
      { offerId }
    );
  },

  /**
   * Mark conversation as read
   */
  async markConversationRead(conversationId: string): Promise<{ success: boolean; message: string }> {
    return apiPost<{ success: boolean; message: string }>(
      `/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/read`,
      {}
    );
  },

  /**
   * Block a conversation
   */
  async blockConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    return apiPost<{ success: boolean; message: string }>(
      `/api/v1/messaging/conversations/${encodeURIComponent(conversationId)}/block`,
      {}
    );
  },

  /**
   * Report a message for moderation
   */
  async reportMessage(
    messageId: string,
    reason: string,
    description?: string
  ): Promise<{ success: boolean; message: string }> {
    return apiPost<{ success: boolean; message: string }>(
      `/api/v1/messaging/messages/${encodeURIComponent(messageId)}/report`,
      { reason, description }
    );
  }
};
