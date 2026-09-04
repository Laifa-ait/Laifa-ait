import { SponsoredPlacement } from "../types/sponsoredCampaign";

export const SPONSORED_DAILY_RATES: Record<SponsoredPlacement, number> = {
  home: 800,
  category: 500,
  search: 400,
};

export const SPONSORED_RULES = {
  MIN_DAYS: 1,
  MAX_DAYS: 30,
  CURRENCY: "DZD" as const,
};

export interface PricingCalculationResult {
  durationDays: number;
  priceAmount: number;
  currency: "DZD";
  dailyRate: number;
}

/**
 * Calculates duration in full or partial calendar days and returns the total price.
 * Rejects invalid date inputs, past dates, end <= start, or duration > 30 days.
 */
export function calculateCampaignPrice(
  placement: SponsoredPlacement,
  startAtStr: string,
  endAtStr: string
): { valid: true; data: PricingCalculationResult } | { valid: false; error: string } {
  if (!SPONSORED_DAILY_RATES[placement]) {
    return { valid: false, error: "Emplacement de sponsorisation invalide." };
  }

  const startDate = new Date(startAtStr);
  const endDate = new Date(endAtStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { valid: false, error: "Les dates fournies sont invalides." };
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs <= 0) {
    return { valid: false, error: "La date de fin doit être strictement postérieure à la date de début." };
  }

  // Calculate days rounded up to nearest day
  const durationDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (durationDays < SPONSORED_RULES.MIN_DAYS) {
    return { valid: false, error: `La durée minimale est de ${SPONSORED_RULES.MIN_DAYS} jour(s).` };
  }

  if (durationDays > SPONSORED_RULES.MAX_DAYS) {
    return { valid: false, error: `La durée maximale autorisée pour une campagne est de ${SPONSORED_RULES.MAX_DAYS} jours.` };
  }

  const dailyRate = SPONSORED_DAILY_RATES[placement];
  const priceAmount = durationDays * dailyRate;

  return {
    valid: true,
    data: {
      durationDays,
      priceAmount,
      currency: SPONSORED_RULES.CURRENCY,
      dailyRate,
    },
  };
}
