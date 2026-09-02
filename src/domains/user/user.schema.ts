import { z } from "zod";

const baseProfileSchema = z.object({
  uid: z.string().min(1, "UID requis"),
  email: z.string().email("Email invalide"),
  displayName: z.string().min(1, "Nom requis"),
  phone: z.string().optional(),
  wilaya: z.string().optional(),
  address: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal("")),
  createdAt: z.unknown().optional(), // ServerTimestamp or Date
  updatedAt: z.unknown().optional(),
  onboardingCompleted: z.boolean().default(false),
});

export const buyerProfileSchema = baseProfileSchema.extend({
  role: z.literal("buyer"),
  interests: z.array(z.string()).optional(),
});

export const vendorProfileSchema = baseProfileSchema.extend({
  role: z.literal("seller"),
  shopName: z.string().min(2, "Nom de boutique requis").max(100),
  shopDescription: z.string().optional(),
  sellerType: z.enum(["individual", "professional"]).default("individual"),
  nif: z.string().optional(),
  rc: z.string().optional(),
  nrc: z.string().optional(),
  rib: z.string().optional(),
  idCardUrl: z.string().optional(),
  rcUrl: z.string().optional(),
  bankStatementUrl: z.string().optional(),
  verificationStatus: z.enum(["pending", "approved", "rejected", "action_required"]).default("pending"),
  verificationMessage: z.string().optional(),
  salesCount: z.number().nonnegative().default(0),
  commissionRate: z.number().optional(),
  rating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().nonnegative().default(0),
});

export const adminProfileSchema = baseProfileSchema.extend({
  role: z.literal("admin").or(z.literal("superadmin")).or(z.literal("moderator")).or(z.literal("support")),
});

export const artisanProfileSchema = baseProfileSchema.extend({
  role: z.literal("artisan"),
});

export const propertyOwnerProfileSchema = baseProfileSchema.extend({
  role: z.literal("property_owner"),
});

export const userProfileSchema = z.discriminatedUnion("role", [
  buyerProfileSchema,
  vendorProfileSchema,
  adminProfileSchema,
  artisanProfileSchema,
  propertyOwnerProfileSchema,
]);

export type BuyerProfile = z.infer<typeof buyerProfileSchema>;
export type VendorProfile = z.infer<typeof vendorProfileSchema>;
export type AdminProfile = z.infer<typeof adminProfileSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Allowlist strict Zod schema for client-initiated profile updates (POST /api/v1/auth/profile).
 * Prevents mass assignment attacks by rejecting any attempt to inject privileged or authorization fields
 * (e.g. capabilities, role, status, verification, soldes, permissions, isAdmin, etc.).
 */
export const profileUpdateSchema = z
  .object({
    uid: z.string().optional(),
    displayName: z.string().max(100).optional(),
    name: z.string().max(100).optional(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    fullName: z.string().max(100).optional(),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    photoURL: z.string().optional().or(z.literal("")),
    avatar: z.string().optional(),
    avatarUrl: z.string().optional(),
    coverUrl: z.string().optional(),
    phone: z.string().max(30).optional(),
    phoneNumber: z.string().max(30).optional(),
    address: z.string().max(300).optional(),
    wilaya: z.string().max(100).optional(),
    commune: z.string().max(100).optional(),
    daira: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    bio: z.string().max(1000).optional(),
    description: z.string().max(1000).optional(),
    theme: z.string().max(30).optional(),
    language: z.string().max(10).optional(),
    preferences: z.record(z.string(), z.unknown()).optional(),
    shippingAddresses: z.array(z.record(z.string(), z.unknown())).optional(),
    shopName: z.string().max(100).optional(),
    shopDescription: z.string().max(1000).optional(),
    shopLogo: z.string().optional(),
    shopBanner: z.string().optional(),
    shopAddress: z.string().max(300).optional(),
    shopPhone: z.string().max(30).optional(),
    shopWilaya: z.string().max(100).optional(),
    shopCommune: z.string().max(100).optional(),
    documents: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).optional(),
    fcmToken: z.string().optional(),
    fcmTokens: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
    notificationsEnabled: z.boolean().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
    website: z.string().optional().or(z.literal("")),
    commercialRegister: z.string().optional(),
    nif: z.string().optional(),
    nis: z.string().optional(),
    rc: z.string().optional(),
    nrc: z.string().optional(),
    rib: z.string().optional(),
    artisanCardNumber: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    experienceYears: z.number().min(0).max(100).optional(),
    portfolio: z.array(z.unknown()).optional(),
    workingHours: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    services: z.array(z.unknown()).optional(),
    categories: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    cart: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
    wishlist: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
    searchHistory: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
    interests: z.array(z.string()).optional(),
    onboardingCompleted: z.boolean().optional(),
    isGuest: z.boolean().optional(),
  })
  .strict();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

