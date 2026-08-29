import { Request } from "express";

export interface BuyerReturnRecord {
  id: string;
  userId?: string;
  returnRequest?: unknown;
  [key: string]: unknown;
}

export interface BuyerOrderRecord {
  id: string;
  userId?: string;
  createdAt?: unknown;
  [key: string]: unknown;
}

export interface BuyerFollowStoreDTO {
  sellerId: string;
  followPayload: Record<string, unknown>;
}

export interface BuyerUnfollowStoreDTO {
  sellerId: string;
}

export interface AuthenticatedBuyerRequest extends Request {
  user?: {
    uid?: string;
    role?: string;
    email?: string;
    [key: string]: unknown;
  };
}
