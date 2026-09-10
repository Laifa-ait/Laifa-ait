import { AppTimestamp } from "../../utils/date";

export type ShopStatus =
  | "pending"
  | "pending_verification"
  | "active"
  | "suspended"
  | "rejected";

export interface Shop {
  id: string; // usually same as seller uid
  sellerId: string;
  shopName: string;
  slogan?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;

  // Settings & Support
  supportPhone?: string;
  phone?: string;
  email?: string;
  displayName?: string;
  internalNotes?: string;
  address?: { wilaya?: string; commune?: string; street?: string };
  avgPreparationTime?: string; // e.g. "24h", "48h", "3-5 j"
  returnPolicy?: string;

  // Legal & Verification (KYC)
  legalStatus?: string; // e.g., "Entreprise Individuelle", "EURL", "SARL"
  rcNumber?: string; // Registre de Commerce
  nifNumber?: string; // NIF
  rib?: string; // Compte bancaire ou CCP

  documents?: {
    rcDocument?: string;
    idDocument?: string;
    ribDocument?: string;
    fileRC?: string;
    fileId?: string;
    fileRib?: string;
  };

  status: ShopStatus;
  rejectionReason?: string; // if REJECTED
  rejectionReasons?: string[];
  rejectionComment?: string;

  // Logistics
  wilaya: string;
  shippingTariffs?: Record<string, number>;

  // Finance
  commissionRate: number; // e.g., 0.10 for 10%

  createdAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
}

// Kept for backward compatibility if used elsewhere
export interface SellerProfile extends Shop {
  uid: string;
}

export interface PublicShopDTO {
  id: string;
  sellerId: string;
  shopName: string;
  slogan: string;
  description: string;
  shopDescription: string;
  logoUrl: string;
  bannerUrl: string;
  coverImage?: string;
  wilaya: string;
  commune: string;
  category: string;
  categories: string[];
  rating: number | null;
  reviewsCount: number;
  sellerTrustScore: number | null;
  productsCount: number;
  isVerified: boolean;
  status: string;
  avgPreparationTime: string;
  returnPolicy: string;
  legalStatus: string;
  followersCount: number;
  badge: string;
}

export interface PublicShopResponse {
  success: boolean;
  shop?: PublicShopDTO;
  error?: string;
}

