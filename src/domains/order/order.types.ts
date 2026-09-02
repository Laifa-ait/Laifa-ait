import { AppTimestamp } from "../../utils/date";

export interface Address {
  id: string;
  name: string;
  fullName?: string;
  phone: string;
  wilaya: string;
  commune: string;
  street: string;
  isDefault: boolean;
  address?: string;
  postalCode?: string;
}

export type OrderStatus =
  | "NEW"
  | "new"
  | "PENDING"
  | "pending"
  | "CONFIRMED"
  | "confirmed"
  | "PROCESSING"
  | "processing"
  | "PREPARING"
  | "preparing"
  | "PICKED_UP"
  | "picked_up"
  | "IN_TRANSIT"
  | "in_transit"
  | "SHIPPED"
  | "shipped"
  | "DELIVERED"
  | "delivered"
  | "CANCELED"
  | "canceled"
  | "cancelled"
  | "cancelled_by_client"
  | "RETURN_REQUESTED"
  | "return_requested"
  | "RETURN_APPROVED"
  | "return_approved"
  | "RETURN_REJECTED"
  | "return_rejected"
  | "RETURNING"
  | "returning"
  | "RETURNED"
  | "returned"
  | "REFUNDED"
  | "refunded"
  | "DISPUTE_OPEN"
  | "dispute_open"
  | "DISPUTE_RESOLVED"
  | "dispute_resolved";

export interface CarrierTrackingEvent {
  event_id: string;
  status_key: string;
  raw_status: string;
  severity: "normal" | "success" | "warning" | "error" | string;
  timestamp: AppTimestamp; // Can be string, number, or Firestore Timestamp
  location: string;
  reason: string;
}

export interface ReturnRequest {
  id: string;
  reason: string;
  details?: string;
  status: "pending" | "approved" | "rejected" | "received" | "completed";
  photos?: string[];
  refundMethod?: string;
  createdAt: AppTimestamp;
}

export interface OrderItem {
  productId: string;
  variantName?: string;
  quantity: number;
  price: number;
  sellerId: string;
  productName: string;
  name?: string;
  productImage: string;
  selectedVariant?: string;
}

export interface Order {
  id: string;
  userId: string;
  sellerIds: string[];
  deliveryBoyId?: string;
  deliveryBoyName?: string;

  // Break down items per seller for multi-seller orders
  items: OrderItem[];

  shippingAddress: Address;
  subtotal: number;
  discountAmount?: number;
  shippingTotal?: number;
  disputeId?: string;
  unreadBuyerMessages?: number;
  shippingCost: number;
  total: number;

  status: OrderStatus;
  paymentStatus?: string;

  // Optional return/dispute data
  returnRequest?: ReturnRequest;
  reviewsSubmitted?: Record<string, { rating: number; comment: string; createdAt: string; }>;
  disputeRequest?: {
    reason: string;
    details: string;
    createdAt: AppTimestamp;
  };

  // Logistics API reference
  trackingNumber?: string;
  trackingId?: string;
  trackingLink?: string;
  carrier_tracking_events?: CarrierTrackingEvent[];
  deliveryProvider?: 'Livraison Directe' | 'Maystro' | 'KaziTour' | 'Autre';
  shippingLabelUrl?: string;

  createdAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
}

import type { Transaction, DocumentReference } from 'firebase-admin/firestore';

export interface OrderTransactionContext {
  transaction: Transaction;
  orderRef: DocumentReference;
}

export interface StockUpdatePayload {
  productId: string;
  variantName?: string;
  quantityToDeduct: number;
}

export interface OrderSnapshot {
  id: string;
  data: Order;
  ref: DocumentReference;
}
