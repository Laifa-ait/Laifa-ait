export function isCampaignTimeActive(startAt: string, endAt: string, nowMs: number = Date.now()): boolean {
  if (!startAt || !endAt) {
    return false;
  }
  const s = new Date(startAt).getTime();
  const e = new Date(endAt).getTime();
  if (isNaN(s) || isNaN(e)) {
    return false;
  }
  return s <= nowMs && e > nowMs;
}

export interface PaymentProofValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePaymentProofInput(input?: {
  paymentProofReference?: unknown;
  paymentProofUrl?: unknown;
  paymentProofNotes?: unknown;
  paymentNotes?: unknown;
}): PaymentProofValidationResult {
  if (!input) {
    return { isValid: true };
  }

  const { paymentProofReference, paymentProofUrl, paymentProofNotes, paymentNotes } = input;
  const effectiveNotes = paymentProofNotes ?? paymentNotes;

  // 1. Reference validation
  if (paymentProofReference !== undefined && paymentProofReference !== null) {
    if (typeof paymentProofReference !== "string") {
      return {
        isValid: false,
        error: "La référence du justificatif de paiement doit être une chaîne de caractères.",
      };
    }
    const trimmed = paymentProofReference.trim();
    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: "La référence du justificatif de paiement ne peut pas être vide.",
      };
    }
    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: "La référence du justificatif ne doit pas dépasser 100 caractères.",
      };
    }
  }

  // 2. URL validation
  if (paymentProofUrl !== undefined && paymentProofUrl !== null) {
    if (typeof paymentProofUrl !== "string") {
      return {
        isValid: false,
        error: "L'URL du justificatif de paiement doit être une chaîne de caractères.",
      };
    }
    const trimmed = paymentProofUrl.trim();
    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: "L'URL du justificatif de paiement ne peut pas être vide.",
      };
    }
    if (trimmed.length > 500) {
      return {
        isValid: false,
        error: "L'URL du justificatif ne doit pas dépasser 500 caractères.",
      };
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") {
        return {
          isValid: false,
          error: "L'URL du justificatif doit utiliser le protocole sécurisé HTTPS.",
        };
      }
    } catch {
      return {
        isValid: false,
        error: "L'URL du justificatif fournie n'est pas une URL valide.",
      };
    }
  }

  // 3. Notes validation
  if (effectiveNotes !== undefined && effectiveNotes !== null) {
    if (typeof effectiveNotes !== "string") {
      return {
        isValid: false,
        error: "Les notes du justificatif de paiement doivent être une chaîne de caractères.",
      };
    }
    if (effectiveNotes.length > 500) {
      return {
        isValid: false,
        error: "Les notes associées au justificatif ne doivent pas dépasser 500 caractères.",
      };
    }
  }

  return { isValid: true };
}
