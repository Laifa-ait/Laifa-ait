import { Router, Response, Request } from 'express';
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
  BookingStatusUpdateSchema,
  PropertyVisitCreateSchema,
  PropertyVisitUpdateStatusSchema,
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

const SEED_REAL_ESTATE_PROPERTIES: Property[] = [
  {
    id: 'PROP-ALG-001',
    ownerId: 'owner_demo_oran_01',
    title: 'Villa Duplex Haute-Gamme avec Piscine Privée',
    description: 'Superbe villa moderne construite sur 3 niveaux avec piscine privée chauffée, garage 2 véhicules, cuisine équipée haut de gamme et vue dégagée.',
    propertyType: 'villa',
    listingType: 'sale',
    price: 45000000,
    contactPhone: '0550123456',
    areaSquareMeters: 280,
    rooms: 6,
    bathrooms: 3,
    features: ['Piscine', 'Garage', 'Jardin', 'Climatisation', 'Chauffage central', 'Acte et Livret Foncier'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 35.7081,
      lng: -0.5841,
      address: 'Résidence les Palmiers, Akid Lotfi / Bir El Djir',
      commune: 'Bir El Djir',
      wilaya: 'Oran',
      geohash: encodeGeohash(35.7081, -0.5841, 7),
    },
    status: 'active',
    viewsCount: 142,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-002',
    ownerId: 'owner_demo_oran_02',
    title: 'Appartement F4 Standing Vue Mer Panoramique',
    description: 'Grand F4 très lumineux avec grand balcon terrasse offrant une vue directe sur la baie d\'Oran. Immeuble sécurisé avec ascenseur et parking sous-sol.',
    propertyType: 'apartment',
    listingType: 'sale',
    price: 18500000,
    contactPhone: '0661987654',
    areaSquareMeters: 120,
    rooms: 4,
    bathrooms: 2,
    features: ['Vue sur mer', 'Ascenseur', 'Parking sous-sol', 'Balcon', 'Cuisine équipée'],
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 35.7198,
      lng: -0.5912,
      address: 'Boulevard Akid Lotfi',
      commune: 'Bir El Djir',
      wilaya: 'Oran',
      geohash: encodeGeohash(35.7198, -0.5912, 7),
    },
    status: 'active',
    viewsCount: 289,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-003',
    ownerId: 'owner_demo_oran_03',
    title: 'Studio Design Meublé Front de Mer',
    description: 'Charmant studio entièrement rénové et meublé avec goût pour vos séjours professionnels ou vacances. À 2 minutes du Front de Mer d\'Oran.',
    propertyType: 'studio',
    listingType: 'rent_short',
    price: 8500,
    pricePeriod: 'night',
    contactPhone: '0770112233',
    areaSquareMeters: 45,
    rooms: 1,
    bathrooms: 1,
    features: ['Wi-Fi Haut Débit', 'Climatisation', 'Télévision Smart', 'Meublé', 'Ascenseur'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 35.7052,
      lng: -0.6389,
      address: 'Boulevard de la Soummam / Front de Mer',
      commune: 'Oran',
      wilaya: 'Oran',
      geohash: encodeGeohash(35.7052, -0.6389, 7),
    },
    status: 'active',
    viewsCount: 310,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-004',
    ownerId: 'owner_demo_algiers_01',
    title: 'Superbe Villa Coloniale Réhabilitée avec Jardin',
    description: 'Demeure d\'exception au cœur d\'Hydra, grand jardin arboré, dépendance pour gardien, plusieurs suites master et finitions marbre.',
    propertyType: 'villa',
    listingType: 'sale',
    price: 120000000,
    contactPhone: '0550998877',
    areaSquareMeters: 350,
    rooms: 7,
    bathrooms: 4,
    features: ['Grand Jardin', 'Garage 3 voitures', 'Dépendance', 'Suite Parentale', 'Système Alarme'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 36.7455,
      lng: 3.0422,
      address: 'Quartier Résidentiel, Hydra',
      commune: 'Hydra',
      wilaya: 'Alger',
      geohash: encodeGeohash(36.7455, 3.0422, 7),
    },
    status: 'active',
    viewsCount: 512,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-005',
    ownerId: 'owner_demo_algiers_02',
    title: 'Appartement F3 Rénové Proche Université & Tram',
    description: 'F3 cosy et bien agencé au 2ème étage d\'une résidence calme. Proche des universités, des commerces et de la station de tramway.',
    propertyType: 'apartment',
    listingType: 'rent_long',
    price: 65000,
    pricePeriod: 'month',
    contactPhone: '0661445566',
    areaSquareMeters: 85,
    rooms: 3,
    bathrooms: 1,
    features: ['Résidence Fermée', 'Proche Tramway', 'Chauffage', 'Réservoir d\'eau avec bâche'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 36.7211,
      lng: 3.1833,
      address: 'Cité 8 Mai 1945, Bab Ezzouar',
      commune: 'Bab Ezzouar',
      wilaya: 'Alger',
      geohash: encodeGeohash(36.7211, 3.1833, 7),
    },
    status: 'active',
    viewsCount: 198,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-006',
    ownerId: 'owner_demo_bejaia_01',
    title: 'Duplex Balnéaire Bord de Mer Tichy',
    description: 'Superbe duplex vue mer imprenable pour vos vacances en famille. Accès direct à la plage à pied, terrasse panoramique de 30 m².',
    propertyType: 'apartment',
    listingType: 'rent_short',
    price: 12000,
    pricePeriod: 'night',
    contactPhone: '0770554433',
    areaSquareMeters: 140,
    rooms: 4,
    bathrooms: 2,
    features: ['Vue Mer Panoramique', 'Terrasse Privative', 'Barbecue', 'Accès Plage', 'Climatisation'],
    images: [
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 36.6711,
      lng: 5.1611,
      address: 'Route de la Plage, Tichy',
      commune: 'Tichy',
      wilaya: 'Béjaïa',
      geohash: encodeGeohash(36.6711, 5.1611, 7),
    },
    status: 'active',
    viewsCount: 420,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-007',
    ownerId: 'owner_demo_constantine_01',
    title: 'Appartement F4 Spacieux Résidence Sécurisée',
    description: 'F4 moderne avec acte et livret foncier individuel. Suite parentale, cuisine italienne équipée, ascenseur et parking en sous-sol.',
    propertyType: 'apartment',
    listingType: 'sale',
    price: 14200000,
    contactPhone: '0550332211',
    areaSquareMeters: 115,
    rooms: 4,
    bathrooms: 2,
    features: ['Acte et Livret Foncier', 'Ascenseur', 'Garage', 'Chauffage Central'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 36.2411,
      lng: 6.5711,
      address: 'UV 5, Nouvelle Ville Ali Mendjeli',
      commune: 'El Khroub',
      wilaya: 'Constantine',
      geohash: encodeGeohash(36.2411, 6.5711, 7),
    },
    status: 'active',
    viewsCount: 165,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-008',
    ownerId: 'owner_demo_tipaza_01',
    title: 'Villa Pieds dans l\'Eau avec Terrasse Panoramique',
    description: 'Propriété d\'exception nichée au pied du mont Chenoua. Accès crique privée, vue splendide sur la Méditerranée, jardin méditerranéen.',
    propertyType: 'villa',
    listingType: 'sale',
    price: 68000000,
    contactPhone: '0661223344',
    areaSquareMeters: 220,
    rooms: 5,
    bathrooms: 3,
    features: ['Pieds dans l\'eau', 'Terrasse', 'Vue Mer', 'Jardin', 'Garage'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    location: {
      lat: 36.5911,
      lng: 2.4211,
      address: 'Route de Chenoua Plage',
      commune: 'Tipaza',
      wilaya: 'Tipaza',
      geohash: encodeGeohash(36.5911, 2.4211, 7),
    },
    status: 'active',
    viewsCount: 388,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROP-ALG-009',
    ownerId: 'owner_demo_oran_04',
    title: 'Local Commercial Strategique Grand Boulevard Maraval',
    description: 'Local commercial de 75 m² avec vitrine de 8 mètres sur axe à fort passage. Idéal pour showroom, agence bancaire ou prêt-à-porter.',
    propertyType: 'commercial',
    listingType: 'rent_long',
    price: 95000,
    pricePeriod: 'month',
    contactPhone: '0770889900',
    areaSquareMeters: 75,
    rooms: 2,
    bathrooms: 1,
    features: ['Grand Axe Passerel', 'Vitrine Verre Securit', 'Rideau Électrique', 'Sanitaires'],
    images: [
      'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      lat: 35.6911,
      lng: -0.6211,
      address: 'Boulevard Principal Maraval',
      commune: 'Oran',
      wilaya: 'Oran',
      geohash: encodeGeohash(35.6911, -0.6211, 7),
    },
    status: 'active',
    viewsCount: 220,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function ensureInitialSeedProperties(firestore: FirebaseFirestore.Firestore) {
  try {
    const snap = await firestore.collection('real_estate_properties').limit(1).get();
    if (snap.empty) {
      console.log('[Firestore Core] ⚡ Seeding initial Olma Immo properties into Firestore...');
      const batch = firestore.batch();
      for (const p of SEED_REAL_ESTATE_PROPERTIES) {
        const ref = firestore.collection('real_estate_properties').doc(p.id);
        batch.set(ref, p);
      }
      await batch.commit();
      console.log('[Firestore Core] 🟢 Initial Olma Immo properties seeded successfully!');
    }
  } catch (err) {
    console.error('[Firestore Core] ❌ Error seeding initial Olma Immo properties:', err);
  }
}

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
      console.log('[DEBUG GET /properties] req.query:', req.query, 'db exists:', !!db);
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
        let fallback = SEED_REAL_ESTATE_PROPERTIES;
        if (listingType) fallback = fallback.filter((p) => p.listingType === listingType);
        if (propertyType) fallback = fallback.filter((p) => p.propertyType === propertyType);
        if (wilaya && typeof wilaya === 'string' && wilaya.trim()) {
          fallback = fallback.filter((p) => p.location.wilaya.toLowerCase().includes(wilaya.trim().toLowerCase()));
        }
        if (commune && typeof commune === 'string' && commune.trim()) {
          fallback = fallback.filter((p) => p.location.commune.toLowerCase().includes(commune.trim().toLowerCase()));
        }
        return res.json({
          success: true,
          data: fallback,
          total: fallback.length,
          page: Number(page),
          limit: Number(limit),
        });
      }

      await ensureInitialSeedProperties(db);

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

      if (!rawResultsMap.has('PROP-ALG-001')) {
        SEED_REAL_ESTATE_PROPERTIES.forEach((p) => {
          if (!rawResultsMap.has(p.id)) {
            rawResultsMap.set(p.id, p);
          }
        });
        try {
          const batch = db.batch();
          for (const p of SEED_REAL_ESTATE_PROPERTIES) {
            batch.set(db.collection('real_estate_properties').doc(p.id), p, { merge: true });
          }
          batch.commit().catch(() => {});
        } catch (seedErr) {
          console.error('[Firestore Core] ⚠️ Seed sync notice:', seedErr);
        }
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
        let fallback = SEED_REAL_ESTATE_PROPERTIES;
        if (listingType) fallback = fallback.filter((p) => p.listingType === listingType);
        if (propertyType) fallback = fallback.filter((p) => p.propertyType === propertyType);
        if (wilaya && typeof wilaya === 'string' && wilaya.trim()) {
          fallback = fallback.filter((p) => p.location.wilaya.toLowerCase().includes(wilaya.trim().toLowerCase()));
        }
        if (commune && typeof commune === 'string' && commune.trim()) {
          fallback = fallback.filter((p) => p.location.commune.toLowerCase().includes(commune.trim().toLowerCase()));
        }
        return res.json({ success: true, data: fallback.map(toPropertyMapResult) });
      }

      await ensureInitialSeedProperties(db);

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

      if (rawResultsMap.size === 0) {
        SEED_REAL_ESTATE_PROPERTIES.forEach((p) => {
          rawResultsMap.set(p.id, p);
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
      let property: Property | null = null;

      if (db) {
        const docRef = db.collection('real_estate_properties').doc(id);
        const snap = await docRef.get();
        if (snap.exists) {
          property = snap.data() as Property;
          property.id = snap.id;

          // Increment view count asynchronously only on public active properties and non-owner views
          if (property.status === 'active' && (!req.user || req.user.uid !== property.ownerId)) {
            docRef
              .update({
                viewsCount: admin.firestore.FieldValue.increment(1),
              })
              .catch(() => {});
            property.viewsCount = (property.viewsCount || 0) + 1;
          }
        }
      }

      // Fallback to seed properties if not found in db or db null
      if (!property) {
        const seedMatch = SEED_REAL_ESTATE_PROPERTIES.find((p) => p.id === id);
        if (seedMatch) {
          property = { ...seedMatch };
        }
      }

      if (!property) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

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

      return res.json({ success: true, data: property });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error fetching property detail:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'annonce.' });
    }
  }
);

// 2.2. GET /api/v1/real-estate/properties/:id/owner (Fetch public owner profile)
realEstateRouter.get(
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
      
      let property: Property | null = null;
      if (snap.exists) {
        property = snap.data() as Property;
      } else {
        const seedMatch = SEED_REAL_ESTATE_PROPERTIES.find((p) => p.id === id);
        if (seedMatch) {
          property = { ...seedMatch };
        }
      }

      if (!property) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      // Access control on non-public properties (draft, archived, pending)
      const nonPublicStatuses = ['draft', 'archived', 'pending'];
      if (nonPublicStatuses.includes(property.status)) {
        const callerUid = req.user?.uid;
        const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!callerUid || (callerUid !== property.ownerId && !isServerAdmin)) {
          console.warn(`[Security Alert] ❌ Unauthorized owner profile access attempt on non-public property ${id}`);
          return res.status(403).json({
            success: false,
            error: 'Cette annonce n\'est pas accessible au public. Profil du propriétaire indisponible.',
          });
        }
      }

      // Fetch user profile securely
      const userRef = db.collection('users').doc(property.ownerId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ success: false, error: 'Profil de l\'annonceur introuvable.' });
      }

      const userData = userSnap.data();

      // IMPORTANT: Only map allowed fields to prevent PII leakage (no email, phone, documents)
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
      console.error('[Firestore Core] ❌ Error fetching property owner profile:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération du profil.' });
    }
  }
);

// 2.5. GET /api/v1/real-estate/properties/:id/similar (Fetch similar properties in same Wilaya or listing type)
realEstateRouter.get(
  '/properties/:id/similar',
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });
    }

    try {
      let targetProp: Property | null = null;
      if (db) {
        const snap = await db.collection('real_estate_properties').doc(id).get();
        if (snap.exists) {
          targetProp = snap.data() as Property;
          targetProp.id = snap.id;
        }
      }
      if (!targetProp) {
        targetProp = SEED_REAL_ESTATE_PROPERTIES.find((p) => p.id === id) || null;
      }

      let candidates: Property[] = [];
      if (db) {
        let query = db.collection('real_estate_properties').where('status', '==', 'active');
        if (targetProp?.location?.wilaya) {
          query = query.where('location.wilaya', '==', targetProp.location.wilaya);
        }
        const snap = await query.limit(10).get();
        snap.forEach((doc) => {
          if (doc.id !== id) {
            candidates.push({ ...(doc.data() as Property), id: doc.id });
          }
        });
      }

      if (candidates.length === 0) {
        candidates = SEED_REAL_ESTATE_PROPERTIES.filter((p) => p.id !== id);
        if (targetProp) {
          const sameWilaya = candidates.filter((p) => p.location.wilaya === targetProp!.location.wilaya);
          if (sameWilaya.length >= 2) candidates = sameWilaya;
        }
      }

      const similarList = candidates.slice(0, 4);
      return res.json({ success: true, data: similarList });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error fetching similar properties:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la recherche d\'annonces similaires.' });
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

// 4.6.5. GET /api/v1/real-estate/owner/visits (Fetch visit requests for owner properties)
realEstateRouter.get(
  '/owner/visits',
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
        .collection('real_estate_visits')
        .where('ownerId', '==', ownerId)
        .get();

      const visits: PropertyVisit[] = [];
      snapshot.forEach((doc) => {
        visits.push({ ...(doc.data() as PropertyVisit), id: doc.id });
      });

      visits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({
        success: true,
        data: visits,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error fetching owner visit requests:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des demandes de visite.' });
    }
  }
);

// 4.6.6. POST /api/v1/real-estate/upload-image (Secure Base64/DataURL Property Image Handler)
realEstateRouter.post(
  '/upload-image',
  authenticateToken,
  authorizePropertyOwner,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ success: false, error: 'Données d\'image invalides ou manquantes.' });
    }

    // Validate MIME type & base64 encoding
    const validDataUrlRegex = /^data:image\/(jpeg|png|webp|avif);base64,/;
    const isValidDataUrl = validDataUrlRegex.test(imageData);
    const isHttpUrl = imageData.startsWith('http://') || imageData.startsWith('https://');

    if (!isValidDataUrl && !isHttpUrl) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'image non supporté. Formats acceptés : JPEG, PNG, WEBP, AVIF ou URL HTTP(S).',
      });
    }

    // Estimate file size if Data URL (Base64 length * 3/4)
    if (isValidDataUrl) {
      const base64Length = imageData.length - imageData.indexOf(',') - 1;
      const sizeInBytes = (base64Length * 3) / 4;
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

      if (sizeInBytes > maxSizeBytes) {
        return res.status(400).json({
          success: false,
          error: 'L\'image dépasse la taille maximale autorisée de 10 Mo.',
        });
      }
    }

    return res.json({
      success: true,
      data: {
        url: imageData, // Return validated image Data URL or HTTP URL
      },
    });
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

// 4.8. GET /api/v1/real-estate/pro-application (Fetch current user's pro/agency application status)
realEstateRouter.get(
  '/pro-application',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const uid = req.user.uid;

    try {
      if (!db) {
        return res.json({ success: true, data: null });
      }

      const appSnap = await db.collection('real_estate_pro_applications').doc(uid).get();
      if (!appSnap.exists) {
        return res.json({ success: true, data: null });
      }

      const data = appSnap.data();
      return res.json({
        success: true,
        data: {
          id: appSnap.id,
          ...data,
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error fetching pro application:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la candidature.' });
    }
  }
);

// 4.9. POST /api/v1/real-estate/pro-application (Submit or update pro/agency verification application)
realEstateRouter.post(
  '/pro-application',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const uid = req.user.uid;
    const {
      accountType,
      companyName,
      tradeRegisterNumber,
      agencyLicenseNumber,
      taxIdentificationNumber,
      contactPhone,
      wilaya,
      address,
      description,
    } = req.body;

    if (!accountType || !['pro', 'agency'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        error: 'Type de compte professionnel invalide (pro ou agence requis).',
      });
    }

    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return res.status(400).json({ success: false, error: 'Le nom de l\'entreprise ou de l\'agence est requis.' });
    }

    if (!tradeRegisterNumber || typeof tradeRegisterNumber !== 'string' || !tradeRegisterNumber.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro de Registre de Commerce (RC) est obligatoire.',
      });
    }

    if (accountType === 'agency' && (!agencyLicenseNumber || typeof agencyLicenseNumber !== 'string' || !agencyLicenseNumber.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro d\'agrément d\'agence immobilière est obligatoire pour les agences.',
      });
    }

    if (!contactPhone || typeof contactPhone !== 'string' || !contactPhone.trim()) {
      return res.status(400).json({ success: false, error: 'Le numéro de téléphone professionnel est requis.' });
    }

    if (!wilaya || typeof wilaya !== 'string' || !wilaya.trim()) {
      return res.status(400).json({ success: false, error: 'La wilaya d\'exercice est requise.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const now = new Date().toISOString();
      const applicationData = {
        userId: uid,
        accountType,
        companyName: companyName.trim(),
        tradeRegisterNumber: tradeRegisterNumber.trim(),
        agencyLicenseNumber: agencyLicenseNumber ? agencyLicenseNumber.trim() : '',
        taxIdentificationNumber: taxIdentificationNumber ? taxIdentificationNumber.trim() : '',
        contactPhone: contactPhone.trim(),
        wilaya: wilaya.trim(),
        address: address ? address.trim() : '',
        description: description ? description.trim() : '',
        status: 'pending',
        submittedAt: now,
        updatedAt: now,
      };

      const batch = db.batch();

      // 1. Store application document
      const appRef = db.collection('real_estate_pro_applications').doc(uid);
      batch.set(appRef, applicationData, { merge: true });

      // 2. Update user profile to reflect pending pro application & enable property_owner capability
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() || {} : {};
      const currentCapabilities: string[] = Array.isArray(userData.capabilities) ? userData.capabilities : [];
      const updatedCapabilities = currentCapabilities.includes('property_owner')
        ? currentCapabilities
        : [...currentCapabilities, 'property_owner'];

      batch.set(
        userRef,
        {
          immoAccountType: accountType,
          proVerificationStatus: 'pending',
          companyName: companyName.trim(),
          capabilities: updatedCapabilities,
          updatedAt: now,
        },
        { merge: true }
      );

      // 3. Notify internal moderation team
      const notifRef = db.collection('internal_notifications').doc();
      batch.set(notifRef, {
        type: 'REAL_ESTATE_PRO_APPLICATION',
        title: `Nouvelle demande compte ${accountType === 'agency' ? 'Agence' : 'Pro'} Immo`,
        message: `L'utilisateur "${companyName.trim()}" (RC: ${tradeRegisterNumber.trim()}) a soumis une demande de certification ${accountType}.`,
        userId: uid,
        createdAt: now,
        read: false,
      });

      await batch.commit();

      console.log(`[Firestore Core] 🟢 RealEstate Pro Application submitted for UID: ${uid} (Type: ${accountType})`);

      return res.status(201).json({
        success: true,
        message: 'Votre dossier de certification professionnelle a été soumis avec succès.',
        data: applicationData,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error submitting pro application:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la soumission de la candidature.' });
    }
  }
);

// 4.1. GET /api/v1/real-estate/properties/:id/availability (Get booked/blocked dates for property)
realEstateRouter.get('/properties/:id/availability', async (req: Request, res: Response) => {
  const propertyId = req.params.id;
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database unavailable.' });
    }

    const propSnap = await db.collection('real_estate_properties').doc(propertyId).get();
    if (!propSnap.exists) {
      return res.status(404).json({ success: false, error: 'Propriété introuvable.' });
    }

    const property = propSnap.data() as Property;

    // Fetch confirmed and pending bookings
    const bookingsSnap = await db
      .collection('real_estate_bookings')
      .where('propertyId', '==', propertyId)
      .where('status', 'in', ['confirmed', 'pending'])
      .get();

    const unavailableRanges = bookingsSnap.docs.map((doc) => {
      const data = doc.data() as BookingShort;
      return {
        id: doc.id,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status === 'confirmed' ? 'RESERVED' : 'PENDING',
      };
    });

    return res.json({
      success: true,
      propertyId,
      nightlyPrice: property.price || 0,
      listingType: property.listingType,
      cleaningFee: 10000,
      serviceFee: 5000,
      currency: 'DZD',
      unavailableRanges,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Firestore Core] ❌ Error fetching property availability:', errorMsg);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des disponibilités.' });
  }
});

// 5. POST /api/v1/real-estate/bookings (Short-term booking request with atomic collision check)
realEstateRouter.post(
  '/bookings',
  authenticateToken,
  validateRequest(BookingCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { propertyId, startDate, endDate, guests } = req.body;
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

        // Calculate nights and price breakdown strictly on the server
        const totalNights = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
        const nightlyPrice = propertyData.price || 0;
        const subtotal = totalNights * nightlyPrice;
        const cleaningFee = propertyData.cleaningFee ?? 0;
        const serviceFee = propertyData.serviceFee ?? 0;
        const totalPriceDZD = subtotal + cleaningFee + serviceFee;

        const bookingId = `BOOK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const now = new Date().toISOString();

        const booking: BookingShort = {
          id: bookingId,
          propertyId,
          propertyTitle: propertyData.title,
          propertyLocation: `${propertyData.location?.commune || ''}, ${propertyData.location?.wilaya || ''}`,
          propertyImage: propertyData.images?.[0] || '',
          ownerId: propertyData.ownerId,
          tenantId, // Server-side enforced
          startDate,
          endDate,
          checkIn: startDate,
          checkOut: endDate,
          guests: guests || { adults: 1, children: 0 },
          totalNights,
          nightlyPrice,
          subtotal,
          cleaningFee,
          serviceFee,
          totalPriceDZD,
          currency: 'DZD',
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

// 5.1. GET /api/v1/real-estate/bookings (List bookings with BOLA protection)
realEstateRouter.get('/bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const callerUid = req.user?.uid;
  if (!callerUid) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  const role = (req.query.role as string) || 'tenant';
  const statusFilter = req.query.status as string;

  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
    }

    let query: FirebaseFirestore.Query = db.collection('real_estate_bookings');

    if (role === 'owner') {
      query = query.where('ownerId', '==', callerUid);
    } else {
      query = query.where('tenantId', '==', callerUid);
    }

    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }

    const snap = await query.get();
    const bookings = snap.docs.map((doc) => doc.data() as BookingShort);

    // Sort in memory by createdAt desc
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: bookings,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Firestore Core] ❌ Error listing bookings:', errorMsg);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des réservations.' });
  }
});

// 5.2. GET /api/v1/real-estate/bookings/:id (Get single booking details with BOLA)
realEstateRouter.get('/bookings/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const callerUid = req.user?.uid;

  if (!callerUid) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
    }

    const snap = await db.collection('real_estate_bookings').doc(bookingId).get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
    }

    const booking = snap.data() as BookingShort;

    // BOLA Authorization Check: Tenant, Owner, or Admin
    if (booking.tenantId !== callerUid && booking.ownerId !== callerUid && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accès refusé. Vous n\'êtes pas autorisé à consulter cette réservation.' });
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Firestore Core] ❌ Error fetching booking:', errorMsg);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la réservation.' });
  }
});

// 5.3. PUT /api/v1/real-estate/bookings/:id/status (Update booking status with State Machine & BOLA)
realEstateRouter.put(
  '/bookings/:id/status',
  authenticateToken,
  validateRequest(BookingStatusUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const bookingId = req.params.id;
    const { status: targetStatus } = req.body;
    const callerUid = req.user?.uid;

    if (!callerUid) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      }

      const updatedBooking = await db.runTransaction(async (transaction) => {
        const docRef = db!.collection('real_estate_bookings').doc(bookingId);
        const snap = await transaction.get(docRef);

        if (!snap.exists) {
          throw new Error('BOOKING_NOT_FOUND');
        }

        const booking = snap.data() as BookingShort;
        const isOwner = booking.ownerId === callerUid;
        const isTenant = booking.tenantId === callerUid;
        const isAdmin = req.user?.role === 'admin';

        if (!isOwner && !isTenant && !isAdmin) {
          throw new Error('UNAUTHORIZED');
        }

        const currentStatus = booking.status;

        // State Machine validation rules
        if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
          throw new Error('INVALID_STATUS_TRANSITION');
        }

        if (currentStatus === 'completed' && targetStatus !== 'completed') {
          throw new Error('INVALID_STATUS_TRANSITION');
        }

        // Permissions for target status
        if (targetStatus === 'confirmed' || targetStatus === 'rejected') {
          if (!isOwner && !isAdmin) {
            throw new Error('ONLY_OWNER_CAN_CONFIRM_OR_REJECT');
          }
        }

        if (targetStatus === 'cancelled') {
          if (!isOwner && !isTenant && !isAdmin) {
            throw new Error('UNAUTHORIZED');
          }
        }

        const now = new Date().toISOString();
        const updated = {
          ...booking,
          status: targetStatus,
          updatedAt: now,
        };

        transaction.update(docRef, {
          status: targetStatus,
          updatedAt: now,
        });

        return updated;
      });

      console.log(`[Firestore Core] 🟢 Booking ${bookingId} status updated to ${targetStatus} by ${callerUid}`);

      return res.json({
        success: true,
        data: updatedBooking,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg === 'BOOKING_NOT_FOUND') {
        return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
      }
      if (errorMsg === 'UNAUTHORIZED' || errorMsg === 'ONLY_OWNER_CAN_CONFIRM_OR_REJECT') {
        return res.status(403).json({ success: false, error: 'Vous n\'êtes pas autorisé à modifier cette réservation.' });
      }
      if (errorMsg === 'INVALID_STATUS_TRANSITION') {
        return res.status(400).json({ success: false, error: 'Changement de statut non autorisé pour cette réservation.' });
      }
      console.error('[Firestore Core] ❌ Error updating booking status:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut de la réservation.' });
    }
  }
);

// 5.4. POST /api/v1/real-estate/bookings/:id/cancel (Cancel booking helper)
realEstateRouter.post('/bookings/:id/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const callerUid = req.user?.uid;

  if (!callerUid) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
    }

    const docRef = db.collection('real_estate_bookings').doc(bookingId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
    }

    const booking = snap.data() as BookingShort;
    const isOwner = booking.ownerId === callerUid;
    const isTenant = booking.tenantId === callerUid;

    if (!isOwner && !isTenant && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accès refusé.' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ success: false, error: 'La réservation ne peut plus être annulée.' });
    }

    const now = new Date().toISOString();
    await docRef.update({
      status: 'cancelled',
      updatedAt: now,
    });

    return res.json({
      success: true,
      data: {
        ...booking,
        status: 'cancelled',
        updatedAt: now,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Firestore Core] ❌ Error cancelling booking:', errorMsg);
    return res.status(500).json({ success: false, error: 'Erreur lors de l\'annulation de la réservation.' });
  }
});

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

// 6.1. PUT /api/v1/real-estate/visits/:id/status (Update visit request status)
realEstateRouter.put(
  '/visits/:id/status',
  authenticateToken,
  validateRequest(PropertyVisitUpdateStatusSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const visitId = req.params.id;
    const { status } = req.body;
    const callerUid = req.user?.uid;

    if (!callerUid) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      }

      const visitRef = db.collection('real_estate_visits').doc(visitId);
      const visitSnap = await visitRef.get();

      if (!visitSnap.exists) {
        return res.status(404).json({ success: false, error: 'Demande de visite introuvable.' });
      }

      const visitData = visitSnap.data() as PropertyVisit;

      // Ownership authorization check: only the property owner or the visitor can update
      const isOwner = visitData.ownerId === callerUid;
      const isVisitor = visitData.visitorId === callerUid;

      if (!isOwner && !isVisitor && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès refusé. Vous n\'êtes pas autorisé à modifier cette visite.' });
      }

      await visitRef.update({
        status,
        updatedAt: new Date().toISOString(),
      });

      console.log(`[Firestore Core] 🟢 Visit request ${visitId} status updated to: ${status} by ${callerUid}`);

      return res.json({
        success: true,
        data: {
          ...visitData,
          status,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[Firestore Core] ❌ Error updating visit status:', errorMsg);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut de la visite.' });
    }
  }
);

// 7. POST /api/v1/real-estate/seed (Admin/Dev Seed trigger)
realEstateRouter.post('/seed', async (_req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database unavailable.' });
    }
    const batch = db.batch();
    for (const p of SEED_REAL_ESTATE_PROPERTIES) {
      const ref = db.collection('real_estate_properties').doc(p.id);
      batch.set(ref, p);
    }
    await batch.commit();
    (global as unknown as { isSeedingCompleted?: boolean }).isSeedingCompleted = true;
    return res.json({ success: true, message: 'Seeded initial Olma Immo properties into Firestore', count: SEED_REAL_ESTATE_PROPERTIES.length });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: errorMsg });
  }
});

