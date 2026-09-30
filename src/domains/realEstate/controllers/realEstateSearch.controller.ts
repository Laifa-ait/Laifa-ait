import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { validateQuery } from '../../../middlewares/validation';
import { z } from 'zod';
import { PropertySearchQuerySchema } from '../../../schemas/realEstate';
import { StoredProperty, LegalPaperType } from '../../../types/realEstate';
import {
  calculateHaversineDistanceKm,
  isWithinBoundingBox,
  getGeohashRangesForRadius,
  getGeohashRangesForBoundingBox,
} from '../../../services/realEstateGeo';
import { safeLogger } from '../../../utils/logger';
import { toPropertyMapResult } from '../data/realEstateSeed';
import { toPublicPropertyDTO } from '../services/realEstateDTO';

type PropertySearchQuery = z.infer<typeof PropertySearchQuerySchema>;

export const realEstateSearchRouter = Router();

async function executePropertySearch(reqQuery: PropertySearchQuery, user: AuthenticatedRequest['user']) {
  const {
    propertyType,
    listingType,
    legalPaperType,
    legalPapers,
    hasActeNotarie,
    hasLivretFoncier,
    isLegalVerified,
    wilaya,
    daira,
    commune,
    minPrice,
    maxPrice,
    minRooms,
    minArea,
    status = 'active',
    lat,
    lng,
    radius = 50,
    bbox,
    sort = 'recent',
    map = false,
    page = 1,
    limit = 20,
  } = reqQuery;

  if (!db) {
    throw new Error('Base de données Firestore temporairement indisponible.');
  }

  let query: FirebaseFirestore.Query = db.collection('real_estate_properties');

  const nonPublicStatuses = ['draft', 'pending', 'archived', 'rejected'];
  const isNonPublicStatus = typeof status === 'string' && nonPublicStatuses.includes(status);
  const isServerAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (isNonPublicStatus) {
    if (!user) {
      const err = new Error('Accès refusé. Authentification requise pour consulter les annonces non publiques.');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }
    if (!isServerAdmin) {
      query = query.where('ownerId', '==', user.uid);
    }
    query = query.where('status', '==', status);
  } else if (status && (status as string) !== 'all') {
    query = query.where('status', '==', status);
  } else {
    if (!isServerAdmin) {
      query = query.where('status', '==', 'active');
    }
  }

  if (propertyType) query = query.where('propertyType', '==', propertyType);
  if (listingType) query = query.where('listingType', '==', listingType);
  if (wilaya && typeof wilaya === 'string' && wilaya.trim()) query = query.where('location.wilaya', '==', wilaya.trim());
  if (commune && typeof commune === 'string' && commune.trim()) query = query.where('location.commune', '==', commune.trim());

  const rawResultsMap = new Map<string, StoredProperty>();
  const hasCoordinates = lat !== undefined && lng !== undefined;
  const hasBbox = typeof bbox === 'string' && bbox.trim().length > 0;

  if (hasCoordinates || hasBbox) {
    let geohashRanges: Array<{ start: string; end: string }> = [];
    if (hasBbox) {
      const parts = (bbox as string).split(',').map((p) => parseFloat(p.trim()));
      if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
        geohashRanges = getGeohashRangesForBoundingBox([parts[0], parts[1], parts[2], parts[3]]);
      }
    } else if (hasCoordinates) {
      geohashRanges = getGeohashRangesForRadius(Number(lat), Number(lng), Number(radius));
    }

    if (geohashRanges.length > 0) {
      const queryPromises = geohashRanges.slice(0, 9).map((range) => {
        const subQ = query.orderBy('location.geohash').startAt(range.start).endAt(range.end);
        return subQ.limit(50).get().catch(() => null);
      });
      const snapshots = await Promise.all(queryPromises);
      for (const snap of snapshots) {
        if (!snap) continue;
        snap.forEach((doc) => {
          rawResultsMap.set(doc.id, { ...(doc.data() as StoredProperty), id: doc.id });
        });
      }
    }
  }

  if (rawResultsMap.size === 0) {
    const fallbackSnap = await query.limit(100).get();
    fallbackSnap.forEach((doc) => {
      rawResultsMap.set(doc.id, { ...(doc.data() as StoredProperty), id: doc.id });
    });
  }

  let filtered = Array.from(rawResultsMap.values());

  if (daira && typeof daira === 'string' && daira.trim()) {
    const targetDaira = daira.trim().toLowerCase();
    filtered = filtered.filter((p) => p.location?.daira && p.location.daira.toLowerCase().includes(targetDaira));
  }
  if (minPrice !== undefined) filtered = filtered.filter((p) => p.price >= Number(minPrice));
  if (maxPrice !== undefined) filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  if (minRooms !== undefined) filtered = filtered.filter((p) => (p.rooms || 0) >= Number(minRooms));
  if (minArea !== undefined) filtered = filtered.filter((p) => ((p.areaSquareMeters ?? p.area) || 0) >= Number(minArea));

  const targetLegalPapers: LegalPaperType[] = [];
  if (legalPapers) {
    const arr = Array.isArray(legalPapers) ? legalPapers : [legalPapers];
    arr.forEach((item) => { if (typeof item === 'string') targetLegalPapers.push(item as LegalPaperType); });
  } else if (legalPaperType) {
    targetLegalPapers.push(legalPaperType as LegalPaperType);
  }
  if (hasActeNotarie) {
    if (!targetLegalPapers.includes('acte_notarie')) targetLegalPapers.push('acte_notarie');
  }
  if (hasLivretFoncier) {
    if (!targetLegalPapers.includes('livret_foncier')) targetLegalPapers.push('livret_foncier');
  }

  if (targetLegalPapers.length > 0) {
    filtered = filtered.filter((p) => {
      const pPapers: string[] = Array.isArray(p.legalPapers) ? p.legalPapers : (p.legalPaperType ? [p.legalPaperType] : []);
      return targetLegalPapers.some((requiredPaper) => pPapers.includes(requiredPaper));
    });
  }

  if (isLegalVerified) {
    filtered = filtered.filter((p) => Boolean(p.isLegalVerified));
  }

  if (hasCoordinates) {
    const centerLat = Number(lat);
    const centerLng = Number(lng);
    const maxDistanceKm = Number(radius);
    filtered = filtered.filter((p) => {
      if (typeof p.location?.lat !== 'number' || typeof p.location?.lng !== 'number') return false;
      const distance = calculateHaversineDistanceKm(centerLat, centerLng, p.location.lat, p.location.lng);
      return distance <= maxDistanceKm;
    });
  }

  if (hasBbox) {
    const parts = (bbox as string).split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      const boxTuple: [number, number, number, number] = [parts[0], parts[1], parts[2], parts[3]];
      filtered = filtered.filter((p) => {
        if (typeof p.location?.lat !== 'number' || typeof p.location?.lng !== 'number') return false;
        return isWithinBoundingBox(p.location.lat, p.location.lng, boxTuple);
      });
    }
  }

  // Sorting
  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'area_desc') filtered.sort((a, b) => ((b.areaSquareMeters ?? b.area) || 0) - ((a.areaSquareMeters ?? a.area) || 0));
  else filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const total = filtered.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedResults = filtered.slice(startIndex, startIndex + limitNum);

  const responseData = map
    ? paginatedResults.map(toPropertyMapResult)
    : paginatedResults.map(toPublicPropertyDTO);

  return { responseData, total, page: pageNum, limit: limitNum, map: Boolean(map) };
}

// 1. GET /properties (Multi-criteria search)
realEstateSearchRouter.get(
  '/properties',
  optionalAuthenticateToken,
  validateQuery(PropertySearchQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await executePropertySearch(req.query as unknown as PropertySearchQuery, req.user);
      return res.json({
        success: true,
        data: result.responseData,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number })?.statusCode || 500;
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error searching real estate properties', { err: errorMsg });
      return res.status(statusCode).json({ success: false, error: errorMsg || 'Erreur lors de la recherche immobilière.' });
    }
  }
);

// 2. GET /properties/map
realEstateSearchRouter.get(
  '/properties/map',
  optionalAuthenticateToken,
  validateQuery(PropertySearchQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = { ...(req.query as unknown as PropertySearchQuery), map: true };
      const result = await executePropertySearch(query, req.user);
      return res.json({ success: true, data: result.responseData });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching property map data', { err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la carte.' });
    }
  }
);
