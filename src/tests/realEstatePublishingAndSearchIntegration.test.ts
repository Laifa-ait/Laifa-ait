import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

type FirestoreDocRecord = Record<string, unknown>;

interface MockFilter {
  field: string;
  op: string;
  value: unknown;
}

// Mock Firebase Admin Authentication & Firestore
vi.mock('../config/firebase-admin', () => {
  const store = new Map<string, FirestoreDocRecord>();

  const createQueryMock = (collectionName: string) => {
    const filters: MockFilter[] = [];
    let startAtVal: string | null = null;
    let endAtVal: string | null = null;
    let limitVal = 50;

    const queryMock = {
      where: vi.fn((field: string, op: string, value: unknown) => {
        filters.push({ field, op, value });
        return queryMock;
      }),
      orderBy: vi.fn(() => queryMock),
      startAt: vi.fn((val: string) => {
        startAtVal = val;
        return queryMock;
      }),
      endAt: vi.fn((val: string) => {
        endAtVal = val;
        return queryMock;
      }),
      limit: vi.fn((n: number) => {
        limitVal = n;
        return queryMock;
      }),
      get: vi.fn(async () => {
        const docs: Array<{ id: string; exists: boolean; data: () => FirestoreDocRecord }> = [];
        for (const [key, val] of store.entries()) {
          if (!key.startsWith(`${collectionName}/`)) continue;
          let match = true;
          for (const f of filters) {
            const propVal = f.field.split('.').reduce<unknown>((acc, part) => {
              if (acc && typeof acc === 'object') {
                return (acc as Record<string, unknown>)[part];
              }
              return undefined;
            }, val);
            if (f.op === '==' && propVal !== f.value) match = false;
          }
          const loc = val.location as { geohash?: string } | undefined;
          if (startAtVal && endAtVal && loc?.geohash) {
            if (loc.geohash < startAtVal || loc.geohash > endAtVal) {
              match = false;
            }
          }
          if (match) {
            docs.push({
              id: key.replace(`${collectionName}/`, ''),
              exists: true,
              data: () => ({ ...val }),
            });
          }
        }
        return {
          empty: docs.length === 0,
          size: docs.length,
          docs: docs.slice(0, limitVal),
          forEach: (fn: (doc: { id: string; exists: boolean; data: () => FirestoreDocRecord }) => void) =>
            docs.slice(0, limitVal).forEach(fn),
        };
      }),
    };

    return queryMock;
  };

  const dbMock = {
    collection: vi.fn((name: string) => ({
      ...createQueryMock(name),
      doc: vi.fn((id: string) => {
        const fullKey = `${name}/${id}`;
        return {
          id,
          get: vi.fn(async () => ({
            exists: store.has(fullKey),
            id,
            data: () => store.get(fullKey),
          })),
          set: vi.fn(async (data: FirestoreDocRecord, options?: { merge?: boolean }) => {
            if (options?.merge && store.has(fullKey)) {
              store.set(fullKey, { ...store.get(fullKey), ...data });
            } else {
              store.set(fullKey, { ...data, id });
            }
            return { writeTime: new Date().toISOString() };
          }),
          update: vi.fn(async (data: FirestoreDocRecord) => {
            if (!store.has(fullKey)) throw new Error('Not found');
            store.set(fullKey, { ...store.get(fullKey), ...data });
            return { writeTime: new Date().toISOString() };
          }),
          delete: vi.fn(async () => {
            store.delete(fullKey);
            return { writeTime: new Date().toISOString() };
          }),
        };
      }),
    })),
    __store: store,
  };

  return {
    admin: {
      auth: vi.fn(() => ({
        verifyIdToken: vi.fn(async (token: string) => {
          if (token === 'valid_seller_token') {
            return { uid: 'seller_uid_456', email: 'seller@olmart.dz', role: 'seller' };
          }
          if (token === 'valid_admin_token') {
            return { uid: 'admin_uid_999', email: 'admin@olmart.dz', role: 'admin' };
          }
          if (token === 'valid_other_user_token') {
            return { uid: 'intruder_uid_111', email: 'other@olmart.dz', role: 'buyer' };
          }
          throw new Error('Token verification failed');
        }),
      })),
      firestore: {
        FieldValue: {
          increment: (n: number) => n,
        },
      },
    },
    db: dbMock,
  };
});

async function getTestStore(): Promise<Map<string, FirestoreDocRecord>> {
  const { db } = await import('../config/firebase-admin');
  return (db as unknown as { __store: Map<string, FirestoreDocRecord> }).__store;
}

describe('PHASE 2.7 — Real Estate Integration Test Suite (Publishing & Geospatial Search)', () => {
  beforeEach(async () => {
    const store = await getTestStore();
    store.clear();

    // Seed server-verified user records
    store.set('users/admin_uid_999', {
      uid: 'admin_uid_999',
      role: 'admin',
      status: 'active',
    });
    store.set('users/seller_uid_456', {
      uid: 'seller_uid_456',
      role: 'seller',
      status: 'active',
    });
    store.set('users/intruder_uid_111', {
      uid: 'intruder_uid_111',
      role: 'buyer',
      status: 'active',
    });
  });

  describe('1. Real Estate Publishing Flow (POST /api/v1/real-estate/properties)', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/real-estate/properties')
        .send({
          title: 'Villa Moderne avec vue mer',
          propertyType: 'villa',
          listingType: 'sale',
          price: 45000000,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('creates property with automated Geohash, Daïra resolution, and forced isLegalVerified=false', async () => {
      const payload = {
        title: 'Superbe Appartement F4 Bab Ezzouar',
        description: 'Appartement spacieux refait à neuf proche tramway',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 18500000,
        areaSquareMeters: 110,
        rooms: 4,
        bathrooms: 1,
        images: ['https://olmart.dz/images/apt1.jpg'],
        legalPapers: ['acte_notarie', 'livret_foncier'],
        legalPaperType: 'acte_notarie',
        isLegalVerified: true, // Malicious attempt to self-verify
        ownerId: 'spoofed_id', // Malicious attempt to spoof ownerId
        location: {
          wilaya: 'Alger',
          commune: 'Bab Ezzouar',
          lat: 36.7214,
          lng: 3.1829,
          address: 'Cité 5 Juillet, Bâtiment 12',
        },
      };

      const res = await request(app)
        .post('/api/v1/real-estate/properties')
        .set('Authorization', 'Bearer valid_seller_token')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const created = res.body.data;
      expect(created.id).toMatch(/^PROP-/);
      // Verify security guarantees
      expect(created.ownerId).toBe('seller_uid_456'); // Server authoritative
      expect(created.isLegalVerified).toBe(false); // Tamper-proof
      expect(created.location.geohash).toBeDefined(); // Automated geospatial encoding
      expect(created.location.geohash.length).toBe(7);
      expect(created.location.daira).toBe('Dar El Beïda'); // Automated Daïra mapping from database
    });
  });

  describe('2. Real Estate Mutation & IDOR Protection Flow', () => {
    it('blocks foreign user attempting to modify another user property with 403 Forbidden', async () => {
      const store = await getTestStore();
      store.set('real_estate_properties/PROP-101', {
        id: 'PROP-101',
        title: 'Terrain Constructible Tipaza',
        ownerId: 'seller_uid_456',
        price: 8000000,
        status: 'active',
      });

      const res = await request(app)
        .put('/api/v1/real-estate/properties/PROP-101')
        .set('Authorization', 'Bearer valid_other_user_token')
        .send({
          title: 'Hacked Title',
          price: 1000,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Accès refusé');
    });

    it('allows owner to update their own property details', async () => {
      const store = await getTestStore();
      store.set('real_estate_properties/PROP-202', {
        id: 'PROP-202',
        title: 'Villa avec Piscine Zéralda',
        ownerId: 'seller_uid_456',
        price: 55000000,
        status: 'active',
        location: {
          wilaya: 'Alger',
          commune: 'Zeralda',
          lat: 36.7135,
          lng: 2.8421,
        },
      });

      const res = await request(app)
        .put('/api/v1/real-estate/properties/PROP-202')
        .set('Authorization', 'Bearer valid_seller_token')
        .send({
          price: 52000000,
          description: 'Prix revu à la baisse pour vente rapide',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(52000000);
    });

    it('restricts legal verification status updates to admin only', async () => {
      const store = await getTestStore();
      store.set('real_estate_properties/PROP-303', {
        id: 'PROP-303',
        title: 'Appartement Hydra',
        ownerId: 'seller_uid_456',
        isLegalVerified: false,
      });

      // Seller attempts to verify
      const sellerRes = await request(app)
        .put('/api/v1/real-estate/properties/PROP-303/verify-legal')
        .set('Authorization', 'Bearer valid_seller_token')
        .send({ isLegalVerified: true });
      expect(sellerRes.status).toBe(403);

      // Admin verifies
      const adminRes = await request(app)
        .put('/api/v1/real-estate/properties/PROP-303/verify-legal')
        .set('Authorization', 'Bearer valid_admin_token')
        .send({ isLegalVerified: true });
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.isLegalVerified).toBe(true);
    });
  });

  describe('3. Multi-Criteria Geospatial Search Flow (GET /api/v1/real-estate/properties)', () => {
    beforeEach(async () => {
      const store = await getTestStore();
      // Seed two properties: one in Algiers (Hydra), one in Oran (Bir El Djir)
      store.set('real_estate_properties/PROP-ALGIERS', {
        id: 'PROP-ALGIERS',
        title: 'Duplex Haut Standing Hydra',
        propertyType: 'duplex',
        listingType: 'sale',
        price: 32000000,
        rooms: 5,
        areaSquareMeters: 220,
        status: 'active',
        legalPapers: ['acte_notarie', 'livret_foncier'],
        isLegalVerified: true,
        ownerId: 'seller_uid_456',
        location: {
          wilaya: 'Alger',
          commune: 'Hydra',
          daira: 'Bir Mourad Raïs',
          lat: 36.7441,
          lng: 3.0422,
          geohash: 'sn7x2k1',
        },
        createdAt: '2026-09-01T10:00:00Z',
      });

      store.set('real_estate_properties/PROP-ORAN', {
        id: 'PROP-ORAN',
        title: 'Bel F3 Bir El Djir',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 12500000,
        rooms: 3,
        areaSquareMeters: 85,
        status: 'active',
        legalPapers: ['decision_attribution'],
        isLegalVerified: false,
        ownerId: 'seller_uid_456',
        location: {
          wilaya: 'Oran',
          commune: 'Bir El Djir',
          daira: 'Bir El Djir',
          lat: 35.7194,
          lng: -0.5841,
          geohash: 'ey7s8m2',
        },
        createdAt: '2026-09-02T10:00:00Z',
      });
    });

    it('filters properties by Wilaya correctly', async () => {
      const res = await request(app)
        .get('/api/v1/real-estate/properties?wilaya=Alger');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe('PROP-ALGIERS');
      // Ensure strict public DTO sanitization: ownerId is omitted
      expect(res.body.data[0].ownerId).toBeUndefined();
    });

    it('filters properties by legal papers criteria (hasLivretFoncier)', async () => {
      const res = await request(app)
        .get('/api/v1/real-estate/properties?hasLivretFoncier=true');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe('PROP-ALGIERS');
    });

    it('returns geospatial map format when map=true is queried', async () => {
      const res = await request(app)
        .get('/api/v1/real-estate/properties?map=true');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item.id).toBeDefined();
        expect(item.price).toBeDefined();
        expect(item.lat).toBeDefined();
        expect(item.lng).toBeDefined();
      }
    });
  });
});
