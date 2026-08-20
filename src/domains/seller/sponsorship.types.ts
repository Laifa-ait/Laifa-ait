import { AppTimestamp } from "../../utils/date";

export type SponsorshipTier = "bronze" | "silver" | "gold";

export interface SponsorshipPackConfig {
  id: SponsorshipTier;
  name: string;
  badgeLabel: string;
  boostMultiplier: number;
  description: string;
  pricing: Record<number, number>; // Duration days (7, 14, 30) -> Price in DZD
  features: string[];
  popular?: boolean;
}

export interface SponsorshipRequest {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  status: "pending" | "approved" | "rejected" | "expired";
  tier: SponsorshipTier;
  durationDays: number;
  price: number;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending";
  impressionsCount: number;
  clicksCount: number;
  salesCount: number;
  revenueGenerated: number;
  ctr?: number;
  requestDate: AppTimestamp | string;
  startDate?: AppTimestamp | string;
  endDate?: AppTimestamp | string;
  updatedAt?: AppTimestamp | string;
}

export interface SponsorshipAnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  totalSales: number;
  totalRevenue: number;
  activeSponsorshipsCount: number;
}

export const DEFAULT_SPONSORSHIP_PACKS: Record<SponsorshipTier, SponsorshipPackConfig> = {
  bronze: {
    id: "bronze",
    name: "Bronze Boost",
    badgeLabel: "Sponsorisé",
    boostMultiplier: 1.5,
    description: "Placement prioritaire dans les résultats de recherche et la catégorie.",
    pricing: { 7: 1500, 14: 2500, 30: 4500 },
    features: [
      "Priorité 1.5x dans l'algorithme",
      "Badge Sponsorisé Standard",
      "Rapport d'impressions et de clics"
    ]
  },
  silver: {
    id: "silver",
    name: "Silver Premium",
    badgeLabel: "Sponsorisé Silver",
    boostMultiplier: 3.0,
    description: "Mise en avant rayon + positionnement haut de liste catégorie.",
    pricing: { 7: 3000, 14: 5000, 30: 9000 },
    features: [
      "Priorité 3x dans l'algorithme",
      "Badge Silver Lumineux",
      "Mise en avant rayon & catégorie",
      "Analytics Ventes & CTR en temps réel"
    ],
    popular: true
  },
  gold: {
    id: "gold",
    name: "Gold Ultra",
    badgeLabel: "Sponsorisé Gold",
    boostMultiplier: 5.0,
    description: "Visibilité maximale : Carrousel d'accueil + Pole Position globale.",
    pricing: { 7: 6000, 14: 10000, 30: 18000 },
    features: [
      "Priorité Absolue 5x",
      "Affichage En-Tête & Carrousel Accueil",
      "Badge Gold Ultra Premium",
      "Analytics complètes & conversion",
      "Support vendeur prioritaire 24/7"
    ]
  }
};
