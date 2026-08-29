import { Request } from "express";

export interface AuthenticatedAdminRequest extends Request {
  user?: {
    uid?: string;
    role?: string;
    email?: string;
    [key: string]: unknown;
  };
}

export interface DisputeResolutionDTO {
  resolution: "refund" | "close" | string;
  refundAmount?: number;
}

export interface DocumentOcrDTO {
  documentUrl: string;
}

export interface WorkspaceSellerRecord {
  id: string;
  name: string;
  shopName: string;
  email: string;
}

export interface WorkspaceOrderRecord {
  id: string;
  sellerId?: string;
  sellerIds?: string[];
  status?: string;
  createdAt?: unknown;
  total?: number;
  sellerName?: string;
  sellerEmail?: string;
  [key: string]: unknown;
}
