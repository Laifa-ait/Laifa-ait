import { z } from "zod";

export const CreateEscrowSchema = z.object({
  orderId: z.string().min(1, "Identifiant de commande requis"),
  buyerId: z.string().min(1, "Identifiant acheteur requis"),
  sellerId: z.string().min(1, "Identifiant vendeur requis"),
  totalAmountDZD: z.number().positive("Le montant total doit être positif"),
  paymentMethod: z.enum(["CIB_EDAHABIA", "BARIDIMOB", "COD_AMAN", "WALLET"]),
  platformFeeRatePercent: z.number().min(0).max(50).default(5),
  autoReleaseDays: z.number().int().min(1).max(30).default(3),
});

export const ReleaseEscrowSchema = z.object({
  orderId: z.string().min(1, "Identifiant de commande requis"),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
});

export const RefundEscrowSchema = z.object({
  orderId: z.string().min(1, "Identifiant de commande requis"),
  refundAmountDZD: z.number().positive("Montant de remboursement positif requis"),
  reason: z.string().min(3, "Raison du remboursement requise"),
});

export const WithdrawalRequestSchema = z.object({
  amountDZD: z.number().min(1000, "Le montant minimum de retrait est de 1 000 DZD"),
  method: z.enum(["CCP_BARIDIMOB", "VIREMENT_BANCAIRE"]),
  accountDetails: z.string().min(8, "Numéro de compte / RIP / CCP invalide"),
  accountHolderName: z.string().min(3, "Nom du titulaire de compte requis"),
});

export const ProcessPayoutSchema = z.object({
  status: z.enum(["PROCESSING", "COMPLETED", "REJECTED"]),
  receiptUrl: z.string().url("URL de reçu invalide").optional(),
  adminNotes: z.string().max(500).optional(),
});
