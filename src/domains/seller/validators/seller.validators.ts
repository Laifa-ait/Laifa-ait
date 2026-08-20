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
