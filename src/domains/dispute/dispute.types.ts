import { AppTimestamp } from '../../utils/date';

export type DisputeStatus = 'open' | 'mediation' | 'resolved' | 'closed';

export interface Dispute {
  id?: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  details: string;
  photos: string[];
  status: DisputeStatus;
  frozenAmount: number;
  resolution?: 'buyer_refunded' | 'seller_paid' | 'split';
  resolvedAt?: AppTimestamp;
  createdAt: AppTimestamp;
  updatedAt: AppTimestamp;
  aiSummary?: string;
}

export interface DisputeMessage {
  id?: string;
  disputeId: string;
  senderId: string;
  senderRole: 'buyer' | 'seller' | 'admin';
  message: string;
  attachments?: string[];
  createdAt: AppTimestamp;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}
