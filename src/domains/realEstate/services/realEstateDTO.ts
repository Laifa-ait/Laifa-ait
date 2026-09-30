import { StoredProperty, PublicPropertyDTO, LegalPaperType } from '../../../types/realEstate';
import { findDairaForCommune } from '../../../data/algerianCommunesDatabase';

export const ALLOWED_LEGAL_PAPERS: ReadonlySet<string> = new Set([
  'acte_notarie',
  'acte_notarie_individuel',
  'acte_dans_indivision',
  'livret_foncier',
  'permis_construire',
  'certificat_conformite',
  'decision_attribution',
  'promesse_vente',
  'papier_timbre',
]);

/**
 * Sanitizes a Property entity into a strict PublicPropertyDTO.
 * Strips sensitive/internal fields:
 * - ownerId / Firebase UID
 * - internal moderation notes / rejection reasons
 * - KYC documents and administrative data
 * - user private account data (email, phone, address)
 * - non-authorized contact details
 */
export function toPublicPropertyDTO(property: StoredProperty): PublicPropertyDTO {
  const sanitizedLegalPapers: LegalPaperType[] = Array.isArray(property.legalPapers)
    ? property.legalPapers.filter((item): item is LegalPaperType => typeof item === 'string' && ALLOWED_LEGAL_PAPERS.has(item))
    : [];

  const sanitizedLegalPaperType: LegalPaperType | undefined =
    typeof property.legalPaperType === 'string' && ALLOWED_LEGAL_PAPERS.has(property.legalPaperType)
      ? (property.legalPaperType as LegalPaperType)
      : undefined;

  return {
    id: property.id,
    title: property.title || '',
    description: property.description || '',
    propertyType: property.propertyType,
    listingType: property.listingType,
    price: property.price,
    pricePeriod: property.pricePeriod,
    isPriceNegotiable: property.isPriceNegotiable,
    paymentAdvanceMonths: property.paymentAdvanceMonths,
    securityDepositMonths: property.securityDepositMonths,
    utilityCharges: property.utilityCharges,
    cleaningFee: property.cleaningFee,
    serviceFee: property.serviceFee,
    deposit: property.deposit,
    areaSquareMeters: property.areaSquareMeters ?? property.area ?? 0,
    area: property.areaSquareMeters ?? property.area ?? 0,
    rooms: property.rooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    features: Array.isArray(property.features) ? property.features : [],
    images: Array.isArray(property.images) ? property.images : [],
    location: {
      lat: property.location?.lat,
      lng: property.location?.lng,
      geohash: property.location?.geohash,
      address: property.location?.address || '',
      daira:
        property.location?.daira ||
        (property.location?.wilaya && property.location?.commune
          ? (findDairaForCommune(property.location.wilaya, property.location.commune) || undefined)
          : undefined),
      commune: property.location?.commune || property.commune || '',
      wilaya: property.location?.wilaya || property.wilaya || '',
    },
    commune: property.location?.commune || property.commune || '',
    wilaya: property.location?.wilaya || property.wilaya || '',
    legalPapers: sanitizedLegalPapers,
    legalPaperType: sanitizedLegalPaperType,
    isLegalVerified: Boolean(property.isLegalVerified),
    // Contact phone: ONLY if explicitly set in the property listing as authorized public contact
    ...(typeof property.contactPhone === 'string' && property.contactPhone.trim()
      ? { contactPhone: property.contactPhone.trim() }
      : {}),
    status: property.status,
    viewsCount: property.viewsCount || 0,
    createdAt: property.createdAt || new Date().toISOString(),
    updatedAt: property.updatedAt || new Date().toISOString(),
  };
}
