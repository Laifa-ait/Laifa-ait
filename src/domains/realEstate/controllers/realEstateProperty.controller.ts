import { Router, Response } from 'express';
import { admin, db } from '../../../config/firebase-admin';
import {
  authenticateToken,
  optionalAuthenticateToken,
  AuthenticatedRequest,
} from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { validateRequest, validateQuery } from '../../../middlewares/validation';
import { z } from 'zod';
import {
  PropertyCreateSchema,
  PropertyUpdateSchema,
  PropertySearchQuerySchema,
} from '../../../schemas/realEstate';
import {
  Property,
  PropertyMapResult,
  LegalPaperType,
} from '../../../types/realEstate';
import {
  encodeGeohash,
  calculateHaversineDistanceKm,
  isWithinBoundingBox,
  getGeohashRangesForRadius,
  getGeohashRangesForBoundingBox,
} from '../../../services/realEstateGeo';
import { safeLogger } from '../../../utils/logger';
import { toPropertyMapResult } from '../data/realEstateSeed';

type PropertySearchQuery = z.infer<typeof PropertySearchQuerySchema>;

export const realEstatePropertyRouter = Router();

// 1. GET /properties (Multi-criteria geospatial search)
realEstatePropertyRouter.get(
  '/properties',
  optionalAuthenticateToken,
  validateQuery(PropertySearchQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        propertyType,
        listingType,
        legalPaperType,
        legalPapers,
        hasActeNotarie,
        hasLivretFoncier,
        isLegalVerified,
        wilaya,
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
      } = req.query as unknown as PropertySearchQuery;

      if (!db) {
        return res.status(503).json({
          success: false,
          error: 'Base de données Firestore temporairement indisponible.',
        });
      }

      let query: FirebaseFirestore.Query = db.collection('real_estate_properties');

      const nonPublicStatuses = ['draft', 'pending', 'archived'];
      const isNonPublicStatus = typeof status === 'string' && nonPublicStatuses.includes(status);
      const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

      if (isNonPublicStatus) {
        if (!req.user) {
          return res.status(403).json({
            success: false,
            error: 'Accès refusé. Authentification requise pour consulter les annonces non publiques.',
          });
        }
        if (!isServerAdmin) {
          query = query.where('ownerId', '==', req.user.uid);
        }
        query = query.where('status', '==', status);
      } else if (status && (status as string) !== 'all') {
        query = query.where('status', '==', status);
      } else {
        if (!isServerAdmin) {
          query = query.where('status', '==', 'active');
        }
      }

      if (propertyType) {
        query = query.where('propertyType', '==', propertyType);
      }
      if (listingType) {
        query = query.where('listingType', '==', listingType);
      }
      if (wilaya && typeof wilaya === 'string' && wilaya.trim()) {
        query = query.where('location.wilaya', '==', wilaya.trim());
      }
      if (commune && typeof commune === 'string' && commune.trim()) {
        query = query.where('location.commune', '==', commune.trim());
      }

      const rawResultsMap = new Map<string, Property>();
      const hasCoordinates = lat !== undefined && lng !== undefined;
      const hasBbox = typeof bbox === 'string' && bbox.trim().length > 0;

      if (hasCoordinates || hasBbox) {
        let ranges: Array<{ start: string; end: string; prefix: string }> = [];

        if (hasCoordinates) {
          ranges = getGeohashRangesForRadius(Number(lat), Number(lng), Number(radius));
        } else if (hasBbox) {
          const parts = (bbox as string).split(',').map(Number);
          if (parts.length === 4 && !parts.some(isNaN)) {
            const bboxCoords: [number, number, number, number] = [parts[0], parts[1], parts[2], parts[3]];
            ranges = getGeohashRangesForBoundingBox(bboxCoords);
          }
        }

        if (ranges.length > 0) {
          const perRangeLimit = Math.min(500, Math.max(100, Number(page) * Number(limit) * 2));
          const queries = ranges.map((r) =>
            query
              .where('location.geohash', '>=', r.start)
              .where('location.geohash', '<=', r.end)
              .limit(perRangeLimit)
              .get()
          );

          const snapshots = await Promise.all(queries);
          snapshots.forEach((snap) => {
            snap.forEach((doc) => {
              const data = doc.data() as Property;
              rawResultsMap.set(doc.id, { ...data, id: doc.id });
            });
          });
        }
      } else {
        const fetchLimit = Math.min(500, Math.max(100, Number(page) * Number(limit) * 2));
        const snapshot = await query.limit(fetchLimit).get();
        snapshot.forEach((doc) => {
          const data = doc.data() as Property;
          rawResultsMap.set(doc.id, { ...data, id: doc.id });
        });
      }

      let results: Array<Property & { distanceKm?: number }> = Array.from(rawResultsMap.values());

      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        results = results.filter((p) => p.price >= Number(minPrice));
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        results = results.filter((p) => p.price <= Number(maxPrice));
      }
      if (minRooms !== undefined && !isNaN(Number(minRooms))) {
        results = results.filter((p) => (p.rooms || 0) >= Number(minRooms));
      }
      if (minArea !== undefined && !isNaN(Number(minArea))) {
        results = results.filter((p) => (p.areaSquareMeters || 0) >= Number(minArea));
      }
      if (legalPaperType && (legalPaperType as string) !== 'all') {
        results = results.filter((p) => {
          const inArray = Array.isArray(p.legalPapers) && p.legalPapers.includes(legalPaperType as LegalPaperType);
          const matchesSingle = p.legalPaperType === legalPaperType;
          return inArray || matchesSingle;
        });
      }
      if (legalPapers) {
        const requiredPapers = Array.isArray(legalPapers) ? legalPapers : [legalPapers];
        results = results.filter((p) => {
          return requiredPapers.some((paper) => {
            const inArray = Array.isArray(p.legalPapers) && p.legalPapers.includes(paper as LegalPaperType);
            const matchesSingle = p.legalPaperType === paper;
            return inArray || matchesSingle;
          });
        });
      }
      if (hasActeNotarie) {
        results = results.filter((p) => {
          const docs: LegalPaperType[] = Array.isArray(p.legalPapers) && p.legalPapers.length > 0
            ? p.legalPapers
            : (p.legalPaperType ? [p.legalPaperType] : []);
          return docs.some((doc) => doc === 'acte_notarie_individuel' || doc === 'acte_dans_indivision' || doc === 'acte_notarie');
        });
      }
      if (hasLivretFoncier) {
        results = results.filter((p) => {
          const docs: LegalPaperType[] = Array.isArray(p.legalPapers) && p.legalPapers.length > 0
            ? p.legalPapers
            : (p.legalPaperType ? [p.legalPaperType] : []);
          return docs.some((doc) => doc === 'livret_foncier');
        });
      }
      if (isLegalVerified !== undefined) {
        results = results.filter((p) => Boolean(p.isLegalVerified) === Boolean(isLegalVerified));
      }
      if (req.query.isPriceNegotiable !== undefined) {
        const isNeg = req.query.isPriceNegotiable === 'true' || req.query.isPriceNegotiable === true;
        results = results.filter((p) => Boolean(p.isPriceNegotiable) === isNeg);
      }
      if (req.query.paymentAdvanceMonths !== undefined) {
        const maxAdvance = Number(req.query.paymentAdvanceMonths);
        if (!isNaN(maxAdvance)) {
          results = results.filter((p) => p.paymentAdvanceMonths !== undefined && p.paymentAdvanceMonths <= maxAdvance);
        }
      }

      if (lat !== undefined && lng !== undefined) {
        const centerLat = Number(lat);
        const centerLng = Number(lng);
        const maxDistKm = Number(radius);

        results = results
          .map((p) => {
            const distanceKm = calculateHaversineDistanceKm(
              centerLat,
              centerLng,
              p.location.lat,
              p.location.lng
            );
            return { ...p, distanceKm };
          })
          .filter((p) => p.distanceKm! <= maxDistKm);
      }

      if (bbox && typeof bbox === 'string') {
        const parts = bbox.split(',').map(Number);
        if (parts.length === 4 && !parts.some(isNaN)) {
          const bboxCoords: [number, number, number, number] = [parts[0], parts[1], parts[2], parts[3]];
          results = results.filter((p) => isWithinBoundingBox(p.location.lat, p.location.lng, bboxCoords));
        }
      }

      if (sort === 'distance' && lat !== undefined && lng !== undefined) {
        results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      } else if (sort === 'price_asc') {
        results.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        results.sort((a, b) => b.price - a.price);
      } else if (sort === 'popularity') {
        results.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      } else {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const total = results.length;
      const startIndex = (Number(page) - 1) * Number(limit);
      const paginatedResults = results.slice(startIndex, startIndex + Number(limit));

      const responseData = map
        ? paginatedResults.map(toPropertyMapResult)
        : paginatedResults;

      safeLogger.info('RealEstate Properties searched', {
        resultCount: responseData.length,
        total,
        userId: req.user?.uid || 'guest',
        sort: typeof sort === 'string' ? sort : undefined,
        map: Boolean(map),
      });

      return res.json({
        success: true,
        data: responseData,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error searching real estate properties', { err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la recherche immobilière.' });
    }
  }
);

// Map DTO Endpoint: GET /properties/map
realEstatePropertyRouter.get(
  '/properties/map',
  optionalAuthenticateToken,
  validateQuery(PropertySearchQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      req.query.map = 'true' as unknown as string;
      const {
        propertyType,
        listingType,
        legalPaperType,
        legalPapers,
        hasActeNotarie,
        hasLivretFoncier,
        isLegalVerified,
        wilaya,
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
        limit = 100,
      } = req.query as unknown as PropertySearchQuery;

      if (!db) {
        return res.status(503).json({ success: false, error: 'Base de données Firestore temporairement indisponible.' });
      }

      let query: FirebaseFirestore.Query = db.collection('real_estate_properties');

      const nonPublicStatuses = ['draft', 'pending', 'archived'];
      const isNonPublicStatus = typeof status === 'string' && nonPublicStatuses.includes(status);
      const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

      if (isNonPublicStatus) {
        if (!req.user) {
          return res.status(403).json({
            success: false,
            error: 'Accès refusé. Authentification requise pour consulter les annonces non publiques.',
          });
        }
        if (!isServerAdmin) {
          query = query.where('ownerId', '==', req.user.uid);
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

      const rawResultsMap = new Map<string, Property>();
      const hasCoordinates = lat !== undefined && lng !== undefined;
      const hasBbox = typeof bbox === 'string' && bbox.trim().length > 0;

      if (hasCoordinates || hasBbox) {
        let ranges: Array<{ start: string; end: string; prefix: string }> = [];

        if (hasCoordinates) {
          ranges = getGeohashRangesForRadius(Number(lat), Number(lng), Number(radius));
        } else if (hasBbox) {
          const parts = (bbox as string).split(',').map(Number);
          if (parts.length === 4 && !parts.some(isNaN)) {
            const bboxCoords: [number, number, number, number] = [parts[0], parts[1], parts[2], parts[3]];
            ranges = getGeohashRangesForBoundingBox(bboxCoords);
          }
        }

        if (ranges.length > 0) {
          const perRangeLimit = Math.min(500, Math.max(100, Number(limit) * 2));
          const queries = ranges.map((r) =>
            query
              .where('location.geohash', '>=', r.start)
              .where('location.geohash', '<=', r.end)
              .limit(perRangeLimit)
              .get()
          );

          const snapshots = await Promise.all(queries);
          snapshots.forEach((snap) => {
            snap.forEach((doc) => {
              const data = doc.data() as Property;
              rawResultsMap.set(doc.id, { ...data, id: doc.id });
            });
          });
        }
      } else {
        const fetchLimit = Math.min(500, Math.max(100, Number(limit) * 2));
        const snapshot = await query.limit(fetchLimit).get();
        snapshot.forEach((doc) => {
          const data = doc.data() as Property;
          rawResultsMap.set(doc.id, { ...data, id: doc.id });
        });
      }

      let results: Array<Property & { distanceKm?: number }> = Array.from(rawResultsMap.values());

      if (minPrice !== undefined && !isNaN(Number(minPrice))) results = results.filter((p) => p.price >= Number(minPrice));
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) results = results.filter((p) => p.price <= Number(maxPrice));
      if (minRooms !== undefined && !isNaN(Number(minRooms))) results = results.filter((p) => (p.rooms || 0) >= Number(minRooms));
      if (minArea !== undefined && !isNaN(Number(minArea))) results = results.filter((p) => (p.areaSquareMeters || 0) >= Number(minArea));
      if (legalPaperType && (legalPaperType as string) !== 'all') {
        results = results.filter((p) => {
          const inArray = Array.isArray(p.legalPapers) && p.legalPapers.includes(legalPaperType as LegalPaperType);
          const matchesSingle = p.legalPaperType === legalPaperType;
          return inArray || matchesSingle;
        });
      }
      if (legalPapers) {
        const requiredPapers = Array.isArray(legalPapers) ? legalPapers : [legalPapers];
        results = results.filter((p) => {
          return requiredPapers.some((paper) => {
            const inArray = Array.isArray(p.legalPapers) && p.legalPapers.includes(paper as LegalPaperType);
            const matchesSingle = p.legalPaperType === paper;
            return inArray || matchesSingle;
          });
        });
      }
      if (hasActeNotarie) {
        results = results.filter((p) => {
          const docs: LegalPaperType[] = Array.isArray(p.legalPapers) && p.legalPapers.length > 0
            ? p.legalPapers
            : (p.legalPaperType ? [p.legalPaperType] : []);
          return docs.some((doc) => doc === 'acte_notarie_individuel' || doc === 'acte_dans_indivision' || doc === 'acte_notarie');
        });
      }
      if (hasLivretFoncier) {
        results = results.filter((p) => {
          const docs: LegalPaperType[] = Array.isArray(p.legalPapers) && p.legalPapers.length > 0
            ? p.legalPapers
            : (p.legalPaperType ? [p.legalPaperType] : []);
          return docs.some((doc) => doc === 'livret_foncier');
        });
      }
      if (isLegalVerified !== undefined) {
        results = results.filter((p) => Boolean(p.isLegalVerified) === Boolean(isLegalVerified));
      }
      if (req.query.isPriceNegotiable !== undefined) {
        const isNeg = req.query.isPriceNegotiable === 'true' || req.query.isPriceNegotiable === true;
        results = results.filter((p) => Boolean(p.isPriceNegotiable) === isNeg);
      }
      if (req.query.paymentAdvanceMonths !== undefined) {
        const maxAdvance = Number(req.query.paymentAdvanceMonths);
        if (!isNaN(maxAdvance)) {
          results = results.filter((p) => p.paymentAdvanceMonths !== undefined && p.paymentAdvanceMonths <= maxAdvance);
        }
      }

      if (lat !== undefined && lng !== undefined) {
        const centerLat = Number(lat);
        const centerLng = Number(lng);
        const maxDistKm = Number(radius);

        results = results
          .map((p) => ({
            ...p,
            distanceKm: calculateHaversineDistanceKm(centerLat, centerLng, p.location.lat, p.location.lng),
          }))
          .filter((p) => (p.distanceKm || 0) <= maxDistKm);
      }

      if (bbox && typeof bbox === 'string') {
        const parts = bbox.split(',').map(Number);
        if (parts.length === 4 && !parts.some(isNaN)) {
          const bboxCoords: [number, number, number, number] = [parts[0], parts[1], parts[2], parts[3]];
          results = results.filter((p) => isWithinBoundingBox(p.location.lat, p.location.lng, bboxCoords));
        }
      }

      const mapData: PropertyMapResult[] = results
        .slice(0, Number(limit))
        .map(toPropertyMapResult);

      return res.json({ success: true, data: mapData });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching property map data', { err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la carte.' });
    }
  }
);

// GET /properties/:id
realEstatePropertyRouter.get(
  '/properties/:id',
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });
    }

    try {
      let property: Property | null = null;

      if (db) {
        const docRef = db.collection('real_estate_properties').doc(id);
        const snap = await docRef.get();
        if (snap.exists) {
          property = snap.data() as Property;
          property.id = snap.id;

          if (property.status === 'active' && (!req.user || req.user.uid !== property.ownerId)) {
            docRef
              .update({
                viewsCount: admin.firestore.FieldValue.increment(1),
              })
              .catch((err: unknown) => {
                console.warn('[OlmaImmo Views] Failed to increment view count:', err);
              });
            property.viewsCount = (property.viewsCount || 0) + 1;
          }
        }
      }

      if (!property) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const nonPublicStatuses = ['draft', 'archived', 'pending'];
      if (nonPublicStatuses.includes(property.status)) {
        const callerUid = req.user?.uid;
        const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

        if (!callerUid || (callerUid !== property.ownerId && !isServerAdmin)) {
          safeLogger.warn('Unauthorized access attempt on non-public property', {
            propertyId: id,
            status: property.status,
            callerUid: callerUid || 'anonymous',
          });
          return res.status(403).json({
            success: false,
            error: 'Cette annonce n\'est pas accessible au public.',
          });
        }
      }

      return res.json({ success: true, data: property });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching property detail', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'annonce.' });
    }
  }
);

// GET /properties/:id/owner
realEstatePropertyRouter.get(
  '/properties/:id/owner',
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      }

      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();
      
      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const property = snap.data() as Property;

      const nonPublicStatuses = ['draft', 'archived', 'pending'];
      if (nonPublicStatuses.includes(property.status)) {
        const callerUid = req.user?.uid;
        const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!callerUid || (callerUid !== property.ownerId && !isServerAdmin)) {
          safeLogger.warn('Unauthorized owner profile access attempt on non-public property', { propertyId: id });
          return res.status(403).json({
            success: false,
            error: 'Cette annonce n\'est pas accessible au public. Profil du propriétaire indisponible.',
          });
        }
      }

      const userRef = db.collection('users').doc(property.ownerId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ success: false, error: 'Profil de l\'annonceur introuvable.' });
      }

      const userData = userSnap.data();

      const publicProfile: {
        uid: string;
        displayName: string;
        photoURL: string;
        role: string;
        shopName?: string;
        sellerType?: string;
        verificationStatus: string;
        joinedAt?: string;
      } = {
        uid: property.ownerId,
        displayName: userData?.displayName || 'Propriétaire Anonyme',
        photoURL: userData?.photoURL || '',
        role: userData?.role || 'buyer',
        shopName: userData?.shopName,
        sellerType: userData?.sellerType,
        verificationStatus: userData?.verificationStatus || 'unverified',
      };

      if (userData?.createdAt) {
         if (typeof userData.createdAt === 'string') {
           publicProfile.joinedAt = userData.createdAt;
         } else if (userData.createdAt.toDate) {
           publicProfile.joinedAt = userData.createdAt.toDate().toISOString();
         }
      }

      return res.json({ success: true, data: publicProfile });

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching property owner profile', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération du profil.' });
    }
  }
);

// GET /properties/:id/similar
realEstatePropertyRouter.get(
  '/properties/:id/similar',
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      }

      const snap = await db.collection('real_estate_properties').doc(id).get();
      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce introuvable.' });
      }

      const targetProp = snap.data() as Property;
      targetProp.id = snap.id;

      const candidates: Property[] = [];
      let query = db.collection('real_estate_properties').where('status', '==', 'active');
      if (targetProp?.location?.wilaya) {
        query = query.where('location.wilaya', '==', targetProp.location.wilaya);
      }
      const listSnap = await query.limit(10).get();
      listSnap.forEach((doc) => {
        if (doc.id !== id) {
          candidates.push({ ...(doc.data() as Property), id: doc.id });
        }
      });

      const similarList = candidates.slice(0, 4);
      return res.json({ success: true, data: similarList });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching similar properties', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la recherche d\'annonces similaires.' });
    }
  }
);

// POST /properties (Create property)
realEstatePropertyRouter.post(
  '/properties',
  strictLimiter,
  authenticateToken,
  validateRequest(PropertyCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { ownerId: _incomingOwnerId, ...cleanBody } = req.body;
    void _incomingOwnerId;
    const ownerId = req.user.uid;

    const propertyId = `PROP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    const legalPapersList: LegalPaperType[] = Array.isArray(cleanBody.legalPapers) && cleanBody.legalPapers.length > 0
      ? cleanBody.legalPapers
      : (cleanBody.legalPaperType ? [cleanBody.legalPaperType as LegalPaperType] : []);

    const primaryLegalPaper: LegalPaperType | undefined = cleanBody.legalPaperType || (legalPapersList.length > 0 ? legalPapersList[0] : undefined);

    const newProperty: Property = {
      ...cleanBody,
      legalPapers: legalPapersList,
      legalPaperType: primaryLegalPaper,
      isLegalVerified: cleanBody.isLegalVerified ?? false,
      id: propertyId,
      ownerId,
      viewsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (
      newProperty.location &&
      typeof newProperty.location.lat === 'number' &&
      typeof newProperty.location.lng === 'number'
    ) {
      newProperty.location.geohash = encodeGeohash(
        newProperty.location.lat,
        newProperty.location.lng,
        7
      );
    }

    try {
      if (db) {
        await db.collection('real_estate_properties').doc(propertyId).set(newProperty);
        await db.collection('users').doc(ownerId).set({
          capabilities: admin.firestore.FieldValue.arrayUnion('property_owner'),
        }, { merge: true }).catch(() => {});
      }

      safeLogger.info('RealEstate Property created', { propertyId, ownerId });

      return res.status(201).json({
        success: true,
        data: newProperty,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error creating real estate property', { propertyId, ownerId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la création de l\'annonce.' });
    }
  }
);

// PUT /properties/:id (Update property)
realEstatePropertyRouter.put(
  '/properties/:id',
  strictLimiter,
  authenticateToken,
  validateRequest(PropertyUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { id } = req.params;
    const callerUid = req.user.uid;
    const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!id) {
      return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const existingProperty = snap.data() as Property;

      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        safeLogger.warn('IDOR attempt blocked on RealEstate Property', { propertyId: id, callerUid });
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.',
        });
      }

      const {
        ownerId: _discardOwnerId,
        id: _discardId,
        viewsCount: _discardViews,
        createdAt: _discardCreatedAt,
        ...updatePayload
      } = req.body;
      void _discardOwnerId;
      void _discardId;
      void _discardViews;
      void _discardCreatedAt;

      const incomingPapers: LegalPaperType[] = Array.isArray(updatePayload.legalPapers)
        ? updatePayload.legalPapers
        : (updatePayload.legalPaperType ? [updatePayload.legalPaperType as LegalPaperType] : existingProperty.legalPapers || []);

      const incomingPaperType: LegalPaperType | undefined = updatePayload.legalPaperType || (incomingPapers.length > 0 ? incomingPapers[0] : existingProperty.legalPaperType);

      const updatedProperty: Property = {
        ...existingProperty,
        ...updatePayload,
        legalPapers: incomingPapers,
        legalPaperType: incomingPaperType,
        id,
        ownerId: existingProperty.ownerId,
        updatedAt: new Date().toISOString(),
      };

      if (
        updatedProperty.location &&
        typeof updatedProperty.location.lat === 'number' &&
        typeof updatedProperty.location.lng === 'number'
      ) {
        updatedProperty.location.geohash = encodeGeohash(
          updatedProperty.location.lat,
          updatedProperty.location.lng,
          7
        );
      }

      await docRef.set(updatedProperty, { merge: true });

      safeLogger.info('RealEstate Property updated', { propertyId: id, callerUid });

      return res.json({
        success: true,
        data: updatedProperty,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error updating real estate property', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la modification de l\'annonce.' });
    }
  }
);

// PUT /properties/:id/status (Update property status)
realEstatePropertyRouter.put(
  '/properties/:id/status',
  strictLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { id } = req.params;
    const { status } = req.body;
    const callerUid = req.user.uid;
    const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'Identifiant et statut requis.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const existingProperty = snap.data() as Property;

      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.',
        });
      }

      await docRef.update({
        status,
        updatedAt: new Date().toISOString(),
      });

      return res.json({ success: true, message: 'Statut mis à jour avec succès.' });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error updating property status', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut.' });
    }
  }
);

// DELETE /properties/:id
realEstatePropertyRouter.delete(
  '/properties/:id',
  strictLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { id } = req.params;
    const callerUid = req.user.uid;
    const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!id) {
      return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const existingProperty = snap.data() as Property;

      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        safeLogger.warn('IDOR deletion attempt blocked on RealEstate Property', { propertyId: id, callerUid });
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.',
        });
      }

      await docRef.delete();
      safeLogger.info('RealEstate Property deleted', { propertyId: id, callerUid });

      return res.json({
        success: true,
        message: 'Annonce supprimée avec succès.',
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error deleting real estate property', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'annonce.' });
    }
  }
);
