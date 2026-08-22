import { Router, Response } from 'express';
import { admin, db } from '../config/firebase-admin';
import {
  authenticateToken,
  optionalAuthenticateToken,
  authorizePropertyOwner,
  AuthenticatedRequest,
} from '../middlewares/auth';
import { validateRequest, validateQuery } from '../middlewares/validation';
import { z } from 'zod';
import {
  PropertyCreateSchema,
  PropertyUpdateSchema,
  PropertySearchQuerySchema,
  BookingCreateSchema,
  PropertyVisitCreateSchema,
} from '../schemas/realEstate';

type PropertySearchQuery = z.infer<typeof PropertySearchQuerySchema>;
import {
  Property,
  BookingShort,
  PropertyVisit,
  PropertyMapResult,
} from '../types/realEstate';
import {
  encodeGeohash,
  calculateHaversineDistanceKm,
  isWithinBoundingBox,
  getGeohashRangesForRadius,
  getGeohashRangesForBoundingBox,
} from '../services/realEstateGeo';

export const realEstateRouter = Router();

/**
 * Helper to transform full Property to lightweight public PropertyMapResult DTO
 */
function toPropertyMapResult(p: Property & { distanceKm?: number }): PropertyMapResult {
  return {
    id: p.id,
    title: p.title,
    propertyType: p.propertyType,
    listingType: p.listingType,
    price: p.price,
    pricePeriod: p.pricePeriod,
    lat: p.location.lat,
    lng: p.location.lng,
    commune: p.location.commune,
    wilaya: p.location.wilaya,
    mainImage: p.images && p.images.length > 0 ? p.images[0] : '',
    rooms: p.rooms,
    areaSquareMeters: p.areaSquareMeters,
    distanceKm: p.distanceKm,
  };
}

// 1. GET /api/v1/real-estate/properties (Multi-criteria geospatial search)
realEstateRouter.get(
  '/properties',
  optionalAuthenticateToken,
  validateQuery(PropertySearchQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        propertyType,
        listingType,
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
        return res.json({
          success: true,
          data: [],
          total: 0,
          page: Number(page),
          limit: Number(limit),
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
          // Standard users/owners only see their own non-public properties
          query = query.where('ownerId', '==', req.user.uid);
        }
        query = query.where('status', '==', status);
      } else if (status && (status as string) !== 'all') {
        query = query.where('status', '==', status);
      } else {
        // status is 'all' or unspecified
        if (!isServerAdmin) {
          // Anonymous or standard users only see active/public listings
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
        // Geospatial targeted query using Geohash ranges
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
        // Standard attribute query with scalable limit
        const fetchLimit = Math.min(500, Math.max(100, Number(page) * Number(limit) * 2));
        const snapshot = await query.limit(fetchLimit).get();
        snapshot.forEach((doc) => {
          const data = doc.data() as Property;
          rawResultsMap.set(doc.id, { ...data, id: doc.id });
        });
      }

      let results: Array<Property & { distanceKm?: number }> = Array.from(rawResultsMap.values());

      // In-memory range filters
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

      // Precise Radius Filtering (Haversine Distance)
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

      // Bounding Box Filtering
      if (bbox && typeof bbox === 'string') {
        const parts = bbox.split(',').map(Number);
        if (parts.length === 4 && !parts.some(isNaN)) {
          const bboxCoords: [number, number, number, number] = [parts[0], parts[1], parts[2], parts[3]];
          results = results.filter((p) => isWithinBoundingBox(p.location.lat, p.location.lng, bboxCoords));
        }
      }

      // Sorting
      if (sort === 'distance' && lat !== undefined && lng !== undefined) {
        results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      } else if (sort === 'price_asc') {
        results.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        results.sort((a, b) => b.price - a.price);
      } else if (sort === 'popularity') {
        results.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      } else {
        // 'recent'
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const total = results.length;
      const startIndex = (Number(page) - 1) * Number(limit);
      const paginatedResults = results.slice(startIndex, startIndex + Number(limit));

      // Map DTO transformation if requested
      const responseData = map
        ? paginatedResults.map(toPropertyMapResult)
        : paginatedResults;

      console.log(
        `[Firestore Core] 🟢 RealEstate Properties searched (${responseData.length}/${total}) by User: ${
          req.user?.uid || 'guest'
        } (Sort: ${sort}, Map: ${map})`
      );

      return res.json({
        success: true,
        data: responseData,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error searching real estate properties:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la recherche immobilière.' });
    }
  }
);

// Dedicated Map DTO Endpoint: GET /api/v1/real-estate/properties/map
realEstateRouter.get(
  '/properties/map',
  optionalAuthenticateToken,
  validateQuery(PropertySearchQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      req.query.map = 'true' as unknown as string;
      const {
        propertyType,
        listingType,
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
        return res.json({ success: true, data: [] });
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
        // Geospatial targeted query using Geohash ranges
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
        // Standard attribute query with controlled limit
        const fetchLimit = Math.min(500, Math.max(100, Number(limit) * 2));
        const snapshot = await query.limit(fetchLimit).get();
        snapshot.forEach((doc) => {
          const data = doc.data() as Property;
          rawResultsMap.set(doc.id, { ...data, id: doc.id });
        });
      }

      let results: Array<Property & { distanceKm?: number }> = Array.from(rawResultsMap.values());

      // Filters
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
      console.error('[Firestore Core] ❌ Error fetching property map data:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la carte.' });
    }
  }
);

// 2. GET /api/v1/real-estate/properties/:id (Public / Owner single property view with strict access control)
realEstateRouter.get(
  '/properties/:id',
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });
    }

    try {
      if (!db) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const property = snap.data() as Property;
      property.id = snap.id;

      // Access control on non-public properties (draft, archived, pending)
      const nonPublicStatuses = ['draft', 'archived', 'pending'];
      if (nonPublicStatuses.includes(property.status)) {
        const callerUid = req.user?.uid;
        const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

        if (!callerUid || (callerUid !== property.ownerId && !isServerAdmin)) {
          console.warn(
            `[Security Alert] ❌ Unauthorized access attempt on non-public property ${id} (status: ${property.status}) by User: ${
              callerUid || 'anonymous'
            }`
          );
          return res.status(403).json({
            success: false,
            error: 'Cette annonce n\'est pas accessible au public.',
          });
        }
      }

      // Increment view count asynchronously only on public active properties and non-owner views
      if (property.status === 'active' && (!req.user || req.user.uid !== property.ownerId)) {
        try {
          await docRef.update({
            viewsCount: admin.firestore.FieldValue.increment(1),
          });
          property.viewsCount = (property.viewsCount || 0) + 1;
        } catch {
          // Non-blocking
        }
      }

      return res.json({ success: true, data: property });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error fetching property detail:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'annonce.' });
    }
  }
);

// 3. POST /api/v1/real-estate/properties (Create property)
realEstateRouter.post(
  '/properties',
  authenticateToken,
  authorizePropertyOwner,
  validateRequest(PropertyCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    // SERVER-SIDE MANDATE: Force ownerId to authenticated user UID.
    // Discard any incoming ownerId from req.body to prevent BOLA/IDOR impersonation.
    const { ownerId: _incomingOwnerId, ...cleanBody } = req.body;
    void _incomingOwnerId;
    const ownerId = req.user.uid;

    const propertyId = `PROP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    const newProperty: Property = {
      ...cleanBody,
      id: propertyId,
      ownerId,
      viewsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // SERVER-SIDE MANDATE: Always recalculate Geohash on the server when lat/lng are provided
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
      }

      console.log(`[Firestore Core] 🟢 RealEstate Property created: ${propertyId} by Owner: ${ownerId}`);

      return res.status(201).json({
        success: true,
        data: newProperty,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error creating real estate property:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la création de l\'annonce.' });
    }
  }
);

// 4. PUT /api/v1/real-estate/properties/:id (Update property with strict IDOR ownership check)
realEstateRouter.put(
  '/properties/:id',
  authenticateToken,
  authorizePropertyOwner,
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

      // STRICT BOLA/IDOR CHECK: Must be owner or admin
      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        console.warn(`[Security Alert] ❌ IDOR attempt blocked on RealEstate Property: ${id} by User: ${callerUid}`);
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.',
        });
      }

      // Disallow overriding critical server-managed fields
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

      const updatedProperty: Property = {
        ...existingProperty,
        ...updatePayload,
        id,
        ownerId: existingProperty.ownerId, // Always preserve original ownerId
        updatedAt: new Date().toISOString(),
      };

      // SERVER-SIDE MANDATE: Always recalculate Geohash on the server when lat/lng are provided
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

      console.log(`[Firestore Core] 🟢 RealEstate Property updated: ${id} by Owner/Admin: ${callerUid}`);

      return res.json({
        success: true,
        data: updatedProperty,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error updating real estate property:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la modification de l\'annonce.' });
    }
  }
);

// 4.5. DELETE /api/v1/real-estate/properties/:id (Delete property with strict IDOR ownership check)
realEstateRouter.delete(
  '/properties/:id',
  authenticateToken,
  authorizePropertyOwner,
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

      // STRICT IDOR/BOLA CHECK: Must be owner or admin
      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        console.warn(`[Security Alert] ❌ IDOR deletion attempt blocked on RealEstate Property: ${id} by User: ${callerUid}`);
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.',
        });
      }

      await docRef.delete();
      console.log(`[Firestore Core] 🟢 RealEstate Property deleted: ${id} by Owner/Admin: ${callerUid}`);

      return res.json({
        success: true,
        message: 'Annonce supprimée avec succès.',
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error deleting real estate property:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'annonce.' });
    }
  }
);

// 4.6. GET /api/v1/real-estate/owner/properties (Fetch properties owned by authenticated owner)
realEstateRouter.get(
  '/owner/properties',
  authenticateToken,
  authorizePropertyOwner,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const ownerId = req.user.uid;

    try {
      if (!db) {
        return res.json({ success: true, data: [] });
      }

      const snapshot = await db
        .collection('real_estate_properties')
        .where('ownerId', '==', ownerId)
        .get();

      const ownerProperties: Property[] = [];
      snapshot.forEach((doc) => {
        ownerProperties.push({ ...(doc.data() as Property), id: doc.id });
      });

      ownerProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({
        success: true,
        data: ownerProperties,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error fetching owner properties:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de vos annonces.' });
    }
  }
);

// 4.7. POST /api/v1/real-estate/owner/enable (Enable property owner capability safely)
realEstateRouter.post(
  '/owner/enable',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const uid = req.user.uid;

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ success: false, error: 'Profil utilisateur introuvable.' });
      }

      const userData = userSnap.data() || {};
      const currentCapabilities: string[] = Array.isArray(userData.capabilities) ? userData.capabilities : [];

      if (!currentCapabilities.includes('property_owner')) {
        const updatedCapabilities = [...currentCapabilities, 'property_owner'];
        const updateData: Record<string, unknown> = {
          capabilities: updatedCapabilities,
          updatedAt: new Date().toISOString(),
        };

        // If user was a buyer, promote to property_owner role without touching admin or seller roles
        if (userData.role === 'buyer') {
          updateData.role = 'property_owner';
        }

        await userRef.update(updateData);
        console.log(`[Security] 🟢 Capability 'property_owner' enabled for UID: ${uid}`);
      } else {
        console.log(`[Security] ℹ️ Capability 'property_owner' already active for UID: ${uid}`);
      }

      return res.json({
        success: true,
        message: 'Rôle de propriétaire immobilier activé avec succès.',
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Security] ❌ Error enabling property owner role:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de l\'activation du rôle.' });
    }
  }
);

// 5. POST /api/v1/real-estate/bookings (Short-term booking request with atomic collision check)
realEstateRouter.post(
  '/bookings',
  authenticateToken,
  validateRequest(BookingCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { propertyId, startDate, endDate } = req.body;
    const tenantId = req.user.uid;

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      // Validate date ranges
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
        return res.status(400).json({
          success: false,
          error: 'La date de fin doit être postérieure à la date de début.',
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (startDate < todayStr) {
        return res.status(400).json({
          success: false,
          error: 'La date de début ne peut pas être dans le passé.',
        });
      }

      // Atomic Firestore Transaction guaranteeing property state, anti-self-booking and date collisions
      const createdBooking: BookingShort = await db.runTransaction(async (transaction) => {
        const propRef = db!.collection('real_estate_properties').doc(propertyId);
        const propSnap = await transaction.get(propRef);

        if (!propSnap.exists) {
          throw new Error('PROPERTY_NOT_FOUND');
        }

        const propertyData = propSnap.data() as Property;

        // ANTI-SELF-BOOKING MANDATE: Owner cannot book their own property
        if (propertyData.ownerId === tenantId) {
          throw new Error('SELF_BOOKING_FORBIDDEN');
        }

        if (propertyData.listingType !== 'rent_short') {
          throw new Error('NOT_SHORT_TERM_RENTAL');
        }

        if (propertyData.status !== 'active') {
          throw new Error('PROPERTY_NOT_AVAILABLE');
        }

        // Query existing active bookings for this property
        const existingBookingsQuery = await db!
          .collection('real_estate_bookings')
          .where('propertyId', '==', propertyId)
          .where('status', 'in', ['confirmed', 'pending'])
          .get();

        const hasOverlap = existingBookingsQuery.docs.some((doc) => {
          const b = doc.data() as BookingShort;
          // Overlap condition: startA < endB && endA > startB
          return b.startDate < endDate && b.endDate > startDate;
        });

        if (hasOverlap) {
          throw new Error('BOOKING_DATE_COLLISION');
        }

        // Calculate nights and price on the server
        const totalNights = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
        const totalPriceDZD = totalNights * (propertyData.price || 0);

        const bookingId = `BOOK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const now = new Date().toISOString();

        const booking: BookingShort = {
          id: bookingId,
          propertyId,
          ownerId: propertyData.ownerId,
          tenantId, // Server-side enforced
          startDate,
          endDate,
          totalNights,
          totalPriceDZD,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };

        const newBookingRef = db!.collection('real_estate_bookings').doc(bookingId);
        transaction.set(newBookingRef, booking);

        return booking;
      });

      console.log(
        `[Firestore Core] 🟢 RealEstate Booking created: ${createdBooking.id} for Property: ${propertyId} by Tenant: ${tenantId}`
      );

      return res.status(201).json({
        success: true,
        data: createdBooking,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg === 'PROPERTY_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Annonce immobilière introuvable pour la réservation.',
        });
      }
      if (errorMsg === 'SELF_BOOKING_FORBIDDEN') {
        return res.status(403).json({
          success: false,
          error: 'Vous ne pouvez pas réserver votre propre bien immobilier.',
        });
      }
      if (errorMsg === 'NOT_SHORT_TERM_RENTAL') {
        return res.status(400).json({
          success: false,
          error: 'Cette annonce n\'est pas disponible pour la location courte durée.',
        });
      }
      if (errorMsg === 'PROPERTY_NOT_AVAILABLE') {
        return res.status(400).json({
          success: false,
          error: 'Cette annonce n\'est pas disponible pour la réservation actuellement.',
        });
      }
      if (errorMsg === 'BOOKING_DATE_COLLISION') {
        return res.status(409).json({
          success: false,
          error: 'Ce bien est déjà réservé ou fait l\'objet d\'une demande pour les dates sélectionnées.',
        });
      }
      console.error('[Firestore Core] ❌ Error creating real estate booking:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la réservation.' });
    }
  }
);

// 6. POST /api/v1/real-estate/visits (Property visit request)
realEstateRouter.post(
  '/visits',
  optionalAuthenticateToken,
  validateRequest(PropertyVisitCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const { propertyId, visitorName, visitorPhone, preferredDate, timeSlot } = req.body;
    const visitorId = req.user?.uid || null;

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const propSnap = await db.collection('real_estate_properties').doc(propertyId).get();
      if (!propSnap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const propertyData = propSnap.data() as Property;
      const visitId = `VISIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const now = new Date().toISOString();

      const visit: PropertyVisit = {
        id: visitId,
        propertyId,
        ownerId: propertyData.ownerId,
        visitorId,
        visitorName,
        visitorPhone,
        preferredDate,
        timeSlot,
        status: 'pending',
        createdAt: now,
      };

      await db.collection('real_estate_visits').doc(visitId).set(visit);

      console.log(`[Firestore Core] 🟢 RealEstate Visit requested: ${visitId} for Property: ${propertyId}`);

      return res.status(201).json({
        success: true,
        data: visit,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error requesting property visit:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la demande de visite.' });
    }
  }
);
