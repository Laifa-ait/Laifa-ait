export {
  userProfileSchema,
  buyerProfileSchema,
  vendorProfileSchema,
  adminProfileSchema
} from "./user.schema";

import type { UserProfile as ZodUserProfile } from "./user.schema";

export interface UserAddress {
  id: string;
  wilaya: string;
  daira?: string;
  commune: string;
  codePostal?: string;
  rue?: string;
  street?: string;
  phone: string;
  isDefault: boolean;
  name?: string;
  isShipping?: boolean;
  isBilling?: boolean;
}

// Alias to maintain compatibility during migration
export type UserProfile = ZodUserProfile & {
  shippingAddresses?: UserAddress[];
  preferences?: {
    interests?: string[];
    [key: string]: unknown;
  };
} & Record<string, unknown>; // Temporarily allow extra fields to prevent build breaks
export type UserRole = "buyer" | "seller" | "admin" | "superadmin" | "moderator" | "support" | "guest" | "customer" | "artisan" | "property_owner";

export interface GuestUser {
  uid: string;
  isGuest: true;
  role: "guest";
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber?: string | null;
  isAnonymous?: boolean;
  tenantId?: string | null;
}

export type User = UserProfile;
