import { z } from "zod";

const baseProfileSchema = z.object({
  uid: z.string().min(1, "UID requis"),
  email: z.string().email("Email invalide"),
  displayName: z.string().min(1, "Nom requis"),
  phone: z.string().optional(),
  wilaya: z.string().optional(),
  address: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal("")),
  createdAt: z.any().optional(), // ServerTimestamp or Date
  updatedAt: z.any().optional(),
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

export const userProfileSchema = z.discriminatedUnion("role", [
  buyerProfileSchema,
  vendorProfileSchema,
  adminProfileSchema,
]);

export type BuyerProfile = z.infer<typeof buyerProfileSchema>;
export type VendorProfile = z.infer<typeof vendorProfileSchema>;
export type AdminProfile = z.infer<typeof adminProfileSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
