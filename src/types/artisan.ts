export type ArtisanStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "blocked";

export interface ArtisanTrade {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  specialties: string[];
  popular?: boolean;
  active: boolean;
}

export interface ArtisanService {
  id: string;
  artisanId: string;
  title: string;
  categoryId?: string;
  description: string;
  priceStartingFrom?: number;
  priceUnit?: "heure" | "jour" | "prestation" | "m2" | "forfait";
  estimatedDuration?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ArtisanPortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  date?: string;
}

export interface ArtisanDocument {
  name: string;
  type: "id_card" | "trade_register" | "diploma" | "certificate" | "other";
  url: string;
  uploadedAt: string;
  verified?: boolean;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  professionalName?: string;
  phone: string;
  whatsapp?: string;
  avatarUrl?: string;
  companyLogoUrl?: string;
  bio: string;
  tradeId: string;
  tradeName: string;
  specialties: string[];
  services: ArtisanService[];
  portfolio: ArtisanPortfolioItem[];
  yearsOfExperience: number;
  wilaya: string;
  wilayaCode: string;
  commune: string;
  serviceArea?: string[];
  address?: string;
  isAvailable: boolean;
  status: ArtisanStatus;
  statusReason?: string;
  rating: number;
  reviewCount: number;
  viewsCount: number;
  quoteRequestsCount: number;
  verifiedAt?: string;
  documents?: ArtisanDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanApplicationPayload {
  fullName: string;
  professionalName?: string;
  phone: string;
  whatsapp?: string;
  bio: string;
  tradeId: string;
  tradeName: string;
  specialties: string[];
  yearsOfExperience: number;
  wilaya: string;
  wilayaCode: string;
  commune: string;
  serviceArea?: string[];
  address?: string;
  documents?: Array<{
    name: string;
    type: "id_card" | "trade_register" | "diploma" | "certificate" | "other";
    url: string;
  }>;
}

export interface ArtisanQuoteRequest {
  id: string;
  artisanId: string;
  artisanName?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  tradeId: string;
  tradeName?: string;
  serviceTitle?: string;
  title: string;
  description: string;
  wilaya: string;
  commune: string;
  address?: string;
  urgency: "urgent" | "standard" | "flexible";
  preferredDate?: string;
  status: "pending" | "responded" | "accepted" | "declined" | "completed";
  artisanResponse?: string;
  estimatedBudget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanReview {
  id: string;
  artisanId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  serviceTitle?: string;
  wilaya?: string;
  createdAt: string;
}

export interface ArtisanAdminAuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: "approve" | "reject" | "suspend" | "block" | "reactivate" | "update_profile" | "create_trade" | "update_trade" | "delete_trade";
  targetId: string;
  targetType: "artisan" | "trade" | "service";
  targetName?: string;
  details: string;
  timestamp: string;
}

export interface ArtisanStatsSummary {
  totalArtisans: number;
  approvedCount: number;
  pendingCount: number;
  underReviewCount: number;
  rejectedCount: number;
  suspendedCount: number;
  totalQuoteRequests: number;
  totalTrades: number;
}
