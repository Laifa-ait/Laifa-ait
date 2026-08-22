import { z } from "zod";

export const AttachmentSchema = z.object({
  type: z.enum(["image", "pdf"]),
  url: z.string().url("Format d'URL de pièce jointe invalide"),
  fileName: z.string().min(1).max(200),
  fileSizeBytes: z.number().int().positive().max(5 * 1024 * 1024, "Taille maximale autorisée : 5 Mo")
});

export const InitiateConversationSchema = z.object({
  type: z.enum([
    "ORDER_SUPPORT",
    "REAL_ESTATE_INQUIRY",
    "BRICOLAGE_QUOTE",
    "DIRECT_INQUIRY"
  ]),
  recipientId: z.string().min(1, "Identifiant du destinataire requis").max(128),
  context: z.object({
    propertyId: z.string().max(128).optional(),
    orderId: z.string().max(128).optional(),
    productId: z.string().max(128).optional(),
    quoteRequestId: z.string().max(128).optional()
  }),
  initialMessage: z.string().min(1, "Le message initial ne peut pas être vide").max(3000, "Message trop long (max 3000 caractères)")
});

export const SendMessageSchema = z.object({
  text: z.string().min(1, "Le texte du message est requis").max(3000, "Message trop long (max 3000 caractères)"),
  attachments: z.array(AttachmentSchema).max(5, "Maximum 5 pièces jointes autorisées").optional()
});

export const CreateNegotiationSchema = z.object({
  amountDZD: z.number().positive("Le montant doit être strictement supérieur à zéro").max(100_000_000_000, "Montant excessif"),
  terms: z.string().max(1000, "Conditions limitées à 1000 caractères").optional()
});

export const ResolveNegotiationSchema = z.object({
  offerId: z.string().min(1, "Identifiant de l'offre requis").max(128),
  action: z.enum(["ACCEPT", "REJECT", "COUNTER"]),
  counterAmountDZD: z.number().positive("Le montant de contre-offre doit être strictement supérieur à zéro").max(100_000_000_000, "Montant excessif").optional()
}).refine(
  (data) => {
    if (data.action === "COUNTER") {
      return typeof data.counterAmountDZD === "number" && data.counterAmountDZD > 0;
    }
    return true;
  },
  {
    message: "Le montant 'counterAmountDZD' est obligatoire pour l'action COUNTER",
    path: ["counterAmountDZD"]
  }
);

export const ReportMessageSchema = z.object({
  reason: z.string().min(1, "La raison du signalement est requise").max(200),
  description: z.string().max(2000).optional()
});
