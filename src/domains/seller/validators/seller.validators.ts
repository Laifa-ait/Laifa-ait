import { z } from "zod";

export const shippingTariffsSchema = z.object({
  shippingTariffs: z.record(
    z.string().min(1).max(100),
    z.union([
      z.object({
        desk: z.number().min(0).max(100000).optional(),
        home: z.number().min(0).max(100000).optional(),
        enabled: z.boolean().optional(),
        estimatedDays: z.number().min(0).max(60).optional()
      }),
      z.number().min(0).max(100000)
    ])
  ).or(
    z.array(
      z.object({
        wilayaId: z.string().min(1).max(10),
        wilayaName: z.string().optional(),
        desk: z.number().min(0).max(100000).optional(),
        home: z.number().min(0).max(100000).optional(),
        enabled: z.boolean().optional()
      })
    )
  )
});

export const sellerSettingsSchema = z.object({
  shopName: z.string().min(2).max(100).optional(),
  shopDescription: z.string().max(2000).optional(),
  logoUrl: z.string().max(2000).optional(),
  bannerUrl: z.string().max(2000).optional(),
  wilaya: z.string().max(50).optional()
});

export const sellerSponsorshipRequestSchema = z.object({
  productId: z.string().min(1, "L'ID du produit est requis."),
  tier: z.enum(["bronze", "silver", "gold"]).default("bronze"),
  durationDays: z.union([z.literal(7), z.literal(14), z.literal(30), z.literal("7"), z.literal("14"), z.literal("30")]).default(7)
});

export const sellerCouponCreateSchema = z.object({
  code: z
    .string()
    .min(4, "Le code doit comporter au moins 4 caractères.")
    .max(20, "Le code ne peut pas dépasser 20 caractères.")
    .regex(/^[A-Z0-9]+$/, "Le code doit être composé uniquement de lettres majuscules et de chiffres (ex: PROMO10)."),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("La réduction doit être une valeur positive."),
  expiryDate: z.string().min(1, "La date d'expiration est requise."),
  minOrderAmount: z.number().min(0, "Le montant minimum ne peut pas être négatif.").optional(),
  maxUses: z.number().int().positive("La limite d'utilisation doit être un entier positif.").optional(),
}).refine(
  (data) => {
    if (data.discountType === "percentage") {
      return data.discountValue >= 1 && data.discountValue <= 70;
    }
    if (data.discountType === "fixed") {
      return data.discountValue >= 100 && data.discountValue <= 50000;
    }
    return true;
  },
  {
    message: "Pour un pourcentage : entre 1% et 70%. Pour un montant fixe : entre 100 DZD et 50 000 DZD.",
    path: ["discountValue"],
  }
).refine(
  (data) => {
    const exp = new Date(data.expiryDate);
    return !isNaN(exp.getTime()) && exp.getTime() > Date.now();
  },
  {
    message: "La date d'expiration doit être une date valide et future.",
    path: ["expiryDate"],
  }
);

export const sellerCouponStatusSchema = z.object({
  isActive: z.boolean(),
});

