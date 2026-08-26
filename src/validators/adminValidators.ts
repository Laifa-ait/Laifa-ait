import { z } from 'zod';

// Category Schemas
export const CategoryUpdateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
  slug: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  parentId: z.string().nullable().optional(),
});

export const CategoryCreateSchema = CategoryUpdateSchema.extend({
  name: z.string().min(2, "Le nom est requis"),
  slug: z.string().min(2, "Le slug est requis"),
});

// Seller Moderation Schemas
export const SellerApprovalSchema = z.object({
  adminNotes: z.string().optional(),
});

export const SellerRejectionSchema = z.object({
  reasons: z.array(z.string()).min(1, "Au moins une raison de rejet est requise"),
  comment: z.string().optional(),
});

export const SellerSuspensionSchema = z.object({
  reason: z.string().optional(),
});

export const SellerDetailsUpdateSchema = z.object({
  internalNotes: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

// Banner Schemas
export const BannerUpdateSchema = z.object({
  title: z.string().optional(),
  title_color: z.string().optional(),
  subtitle: z.string().optional(),
  subtitle_color: z.string().optional(),
  button_text: z.string().optional(),
  btn_bg_color: z.string().optional(),
  btn_text_color: z.string().optional(),
  desktop_image: z.string().optional(),
  mobile_image: z.string().optional(),
  tag_id: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  featured_products: z.array(z.string()).optional(),
});

export const BannerCreateSchema = BannerUpdateSchema.extend({
  title: z.string().min(1, "Le titre est requis"),
  desktop_image: z.string().min(1, "L'image desktop est requise"),
});

export const ProductApprovalSchema = z.object({
  adminNotes: z.string().optional(),
});

export const ProductRejectionSchema = z.object({
  rejectionReasons: z.array(z.string()).min(1, "Au moins une raison de rejet est requise"),
  comment: z.string().optional(),
});

export const ProductRejectSchema = z.object({
  reason: z.string().min(5, "La raison du rejet doit contenir au moins 5 caractères"),
  notifySeller: z.boolean().optional().default(true)
});

export const TagCreateSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  slug: z.string().min(2, "Slug trop court")
});

export const BannerReorderSchema = z.object({
  orders: z.array(z.object({
    id: z.string(),
    sort_order: z.number().int()
  }))
});

export const DangerZoneWipeSchema = z.object({
  confirmWipe: z.string().min(1, "Code de confirmation requis"),
  mfaToken: z.string().optional()
});

export const SaveTranslationSchema = z.object({
  key: z.string().min(1, "Clé requise"),
  fr: z.string().min(1, "Traduction FR requise"),
  ar: z.string().optional(),
  en: z.string().optional()
});

export const HomepageSectionSchema = z.record(z.string(), z.unknown());
export const HomepageBannerSchema = z.record(z.string(), z.unknown());

export const HomepageSectionCreateSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["products", "categories", "custom", "banners"]).optional(),
  orderIndex: z.number().int().optional(),
  items: z.array(z.unknown()).optional(),
  config: z.record(z.string(), z.unknown()).optional()
}).catchall(z.unknown());

export const HomepageSectionUpdateSchema = HomepageSectionCreateSchema.partial();

export const SendNewsletterSchema = z.object({
  subject: z.string().min(1, "Sujet requis"),
  blocks: z.array(z.unknown())
});

export const CampaignCreateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Titre requis"),
  subject: z.string().min(1, "Sujet requis"),
  targeting: z.record(z.string(), z.unknown()).optional(),
  blocks: z.array(z.unknown())
});

export const NewsletterSettingsSchema = z.record(z.string(), z.unknown());

// Admin Users Schemas
export const AdminUsersListQuerySchema = z.object({
  role: z.string().optional().default("all"),
  wilaya: z.string().optional().default("all"),
  status: z.string().optional().default("all"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  lastDocId: z.string().optional(),
  sortBy: z.enum(["createdAt_desc", "createdAt_asc", "orders_desc", "orders_asc"]).optional().default("createdAt_desc"),
});

export const AdminUserStatusUpdateSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
});

export const AdminUserClientTypeUpdateSchema = z.object({
  clientType: z.string().min(1, "Type client requis"),
});

export const AdminUsersBulkStatusSchema = z.object({
  userIds: z.array(z.string()).min(1, "Au moins un utilisateur requis"),
  status: z.enum(["active", "inactive", "suspended"]),
});

export const AdminUsersBulkDeleteSchema = z.object({
  userIds: z.array(z.string()).min(1, "Au moins un utilisateur requis"),
});

// Admin Audit Logs Schemas
export const AdminAuditLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
  lastDocId: z.string().optional(),
  action: z.string().optional(),
});

// Admin Reports Export Schemas
export const AdminReportExportQuerySchema = z.object({
  type: z.enum(["financial", "orders", "sellers", "Rapport Financier", "Export Commandes", "Performance Vendeurs"]),
  limit: z.coerce.number().int().min(1).max(500).optional().default(250),
});

// Admin Search Config Schemas
export const AdminSearchConfigUpdateSchema = z.object({
  selectedFormat: z.enum(["algolia", "typesense", "elasticsearch"]).optional(),
  algoliaAppId: z.string().optional(),
  algoliaAdminKey: z.string().optional(),
  algoliaIndexName: z.string().optional(),
  typesenseHost: z.string().optional(),
  typesenseApiKey: z.string().optional(),
  typesenseCollection: z.string().optional(),
});

// Admin Coupon / Promotions Schemas
export const AdminCouponCreateSchema = z.object({
  code: z.string().min(2, "Code promo requis").max(30).transform(val => val.trim().toUpperCase()),
  discountType: z.enum(["percentage", "percent", "fixed"]),
  discountValue: z.number().positive("La remise doit être supérieure à 0").refine(
    (val) => !isNaN(val) && isFinite(val),
    "Valeur de remise invalide"
  ),
  minOrderValue: z.number().min(0, "Le minimum d'achat ne peut pas être négatif").optional(),
  minOrderAmount: z.number().min(0, "Le minimum d'achat ne peut pas être négatif").optional(),
  maxDiscountAmount: z.number().positive("Le plafond de remise doit être positif").nullable().optional(),
  maxDiscount: z.number().positive("Le plafond de remise doit être positif").nullable().optional(),
  expiresAt: z.union([z.string(), z.number(), z.date()]).nullable().optional(),
  expiryDate: z.union([z.string(), z.number(), z.date()]).nullable().optional(),
  startAt: z.union([z.string(), z.number(), z.date()]).nullable().optional(),
  startsAt: z.union([z.string(), z.number(), z.date()]).nullable().optional(),
  usageLimit: z.number().int().positive("La limite d'utilisation doit être positive").nullable().optional(),
  maxUses: z.number().int().positive("La limite d'utilisation doit être positive").nullable().optional(),
  maxUsesPerUser: z.number().int().positive("La limite d'utilisation par utilisateur doit être positive").nullable().optional(),
  limitedToCategories: z.array(z.string()).optional().default([]),
  limitedToSellers: z.array(z.string()).optional().default([]),
  sellerId: z.string().optional(),
  singleUsePerClient: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
}).superRefine((data, ctx) => {
  if ((data.discountType === "percentage" || data.discountType === "percent") && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le pourcentage de remise ne peut pas dépasser 100%",
      path: ["discountValue"]
    });
  }

  const parseDate = (val: unknown): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === "string" || typeof val === "number") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const rawStart = data.startAt ?? data.startsAt;
  const rawExpiry = data.expiresAt ?? data.expiryDate;

  if (rawStart !== undefined && rawStart !== null && rawStart !== "") {
    const dStart = parseDate(rawStart);
    if (!dStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date de début invalide",
        path: ["startAt"]
      });
    }
  }

  if (rawExpiry !== undefined && rawExpiry !== null && rawExpiry !== "") {
    const dExpiry = parseDate(rawExpiry);
    if (!dExpiry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date d'expiration invalide",
        path: ["expiresAt"]
      });
    }
  }

  if (rawStart && rawExpiry) {
    const dStart = parseDate(rawStart);
    const dExpiry = parseDate(rawExpiry);
    if (dStart && dExpiry && dStart >= dExpiry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La date de début doit être antérieure à la date d'expiration",
        path: ["expiresAt"]
      });
    }
  }
});

export const AdminCouponStatusUpdateSchema = z.object({
  isActive: z.boolean(),
});

