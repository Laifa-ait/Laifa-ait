import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { realEstateRouter } from '../domains/realEstate/realEstate.routes';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../config/firebase-admin';
import { toPublicPropertyDTO } from '../domains/realEstate/controllers/realEstateProperty.controller';
import { StoredProperty } from '../types/realEstate';

vi.mock('../config/firebase-admin', () => ({
  db: {
    collection: vi.fn(),
  },
  admin: {
    firestore: {
      FieldValue: {
        increment: vi.fn(),
      },
    },
  },
}));

const app = express();
app.use(express.json());

// Inject mock auth middleware based on Authorization header
app.use((req, _res, next) => {
  const authReq = req as unknown as AuthenticatedRequest;
  if (req.headers.authorization === 'Bearer VALID_TOKEN_BUYER') {
    authReq.user = {
      uid: 'buyer_uid_123',
      role: 'buyer',
      email: 'buyer@olmart.dz',
      auth_time: Math.floor(Date.now() / 1000),
    };
  } else if (req.headers.authorization === 'Bearer VALID_TOKEN_OWNER') {
    authReq.user = {
      uid: 'owner_uid_999',
      role: 'seller',
      email: 'owner@olmart.dz',
      auth_time: Math.floor(Date.now() / 1000),
    };
  } else if (req.headers.authorization === 'Bearer VALID_TOKEN_ADMIN') {
    authReq.user = {
      uid: 'admin_uid_777',
      role: 'admin',
      email: 'admin@olmart.dz',
      auth_time: Math.floor(Date.now() / 1000),
    };
  }
  next();
});

app.use('/api/v1/real-estate', realEstateRouter);

describe('Olma Immo — Public Property DTO & Contact Security Suite', () => {
  const collectionSpy = vi.spyOn(db, 'collection');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. toPublicPropertyDTO — Unit Level Data Sanitization', () => {
    it('should cleanly strip ownerId, private emails, phones, moderation notes and KYC docs', () => {
      const rawPropertyDocument: StoredProperty & Record<string, unknown> = {
        id: 'prop_sensible_001',
        ownerId: 'secret_firebase_uid_888',
        title: 'Villa Moderne avec Piscine',
        description: 'Magnifique villa sur les hauteurs',
        propertyType: 'villa',
        listingType: 'sale',
        price: 85000000,
        pricePeriod: 'total',
        isPriceNegotiable: true,
        areaSquareMeters: 350,
        rooms: 6,
        bathrooms: 3,
        features: ['piscine', 'jardin', 'garage'],
        images: ['https://olmart.dz/img1.jpg'],
        location: {
          address: 'Chemin Djenane El Malik',
          commune: 'Hydra',
          wilaya: 'Alger',
          lat: 36.74,
          lng: 3.03,
          geohash: 'snx2h',
        },
        legalPapers: ['acte_notarie', 'livret_foncier'],
        legalPaperType: 'acte_notarie',
        isLegalVerified: true,
        status: 'active',
        viewsCount: 42,
        createdAt: '2026-03-01T12:00:00Z',
        updatedAt: '2026-03-01T12:00:00Z',
        contactPhone: '0555123456',
        // Injected sensitive/internal properties that must NEVER pass to the public DTO
        ownerEmail: 'real_owner_private@gmail.com',
        userEmail: 'real_owner_private@gmail.com',
        ownerPhone: '0661998877',
        userPhone: '0661998877',
        kycStatus: 'verified_tier_2',
        idCardUrl: 'https://storage.googleapis.com/private_kyc/cin_owner.pdf',
        actUrl: 'https://storage.googleapis.com/private_legal/acte_secret.pdf',
        moderationNotes: 'Annonce inspectée par l’agent Ahmed. Titre valide.',
        rejectionReason: 'Raison interne confidentielle',
        internalNotes: 'Attention client VIP',
        reviewedBy: 'moderator_uid_44',
      };

      const sanitized = toPublicPropertyDTO(rawPropertyDocument as StoredProperty);

      // Public data presence check
      expect(sanitized.id).toBe('prop_sensible_001');
      expect(sanitized.title).toBe('Villa Moderne avec Piscine');
      expect(sanitized.price).toBe(85000000);
      expect(sanitized.contactPhone).toBe('0555123456');
      expect(sanitized.isLegalVerified).toBe(true);
      expect(sanitized.features).toEqual(['piscine', 'jardin', 'garage']);

      // Private and internal data stripping check
      const rawOutput = sanitized as unknown as Record<string, unknown>;
      expect(rawOutput.ownerId).toBeUndefined();
      expect(rawOutput.ownerEmail).toBeUndefined();
      expect(rawOutput.userEmail).toBeUndefined();
      expect(rawOutput.ownerPhone).toBeUndefined();
      expect(rawOutput.userPhone).toBeUndefined();
      expect(rawOutput.kycStatus).toBeUndefined();
      expect(rawOutput.idCardUrl).toBeUndefined();
      expect(rawOutput.actUrl).toBeUndefined();
      expect(rawOutput.moderationNotes).toBeUndefined();
      expect(rawOutput.rejectionReason).toBeUndefined();
      expect(rawOutput.internalNotes).toBeUndefined();
      expect(rawOutput.reviewedBy).toBeUndefined();
    });

    it('should omit contactPhone if empty or whitespace only', () => {
      const propWithEmptyPhone: StoredProperty = {
        id: 'prop_no_phone',
        ownerId: 'owner_123',
        title: 'Appartement F3',
        description: 'Proche métro',
        propertyType: 'apartment',
        listingType: 'rent_long',
        price: 70000,
        areaSquareMeters: 85,
        rooms: 3,
        bathrooms: 1,
        features: [],
        images: [],
        location: {
          address: 'Rue Didouche',
          commune: 'Alger Centre',
          wilaya: 'Alger',
          lat: 36.77,
          lng: 3.06,
        },
        legalPapers: [],
        status: 'active',
        viewsCount: 10,
        createdAt: '2026-03-01T12:00:00Z',
        updatedAt: '2026-03-01T12:00:00Z',
        contactPhone: '   ',
      };

      const sanitized = toPublicPropertyDTO(propWithEmptyPhone);
      expect(sanitized.contactPhone).toBeUndefined();
    });
  });

  describe('2. GET /api/v1/real-estate/properties/:id — Public Endpoint Security', () => {
    it('should return 404 for nonexistent property', async () => {
      collectionSpy.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ exists: false }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const res = await request(app).get('/api/v1/real-estate/properties/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 with sanitized PublicPropertyDTO for active property', async () => {
      const mockRawDoc = {
        id: 'prop_active_123',
        ownerId: 'owner_uid_999',
        title: 'Duplex F5 Hydra',
        description: 'Superbe duplex standing',
        propertyType: 'duplex',
        listingType: 'sale',
        price: 52000000,
        pricePeriod: 'total',
        areaSquareMeters: 210,
        rooms: 5,
        bathrooms: 2,
        features: ['terrasse', 'vue_degagee'],
        images: ['https://olmart.dz/duplex.jpg'],
        location: {
          address: 'Rue des Frères Bouadou',
          commune: 'Bir Mourad Raïs',
          wilaya: 'Alger',
        },
        legalPapers: ['acte_notarie'],
        legalPaperType: 'acte_notarie',
        isLegalVerified: true,
        status: 'active',
        viewsCount: 15,
        createdAt: '2026-03-02T10:00:00Z',
        updatedAt: '2026-03-02T10:00:00Z',
        contactPhone: '0550112233',
        // Internal fields in Firestore
        ownerEmail: 'secret_owner@olmart.dz',
        moderationNotes: 'Vérifié OK',
        kycStatus: 'approved',
      };

      collectionSpy.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'prop_active_123',
            data: () => ({ ...mockRawDoc }),
          }),
          update: vi.fn().mockResolvedValue({}),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const res = await request(app).get('/api/v1/real-estate/properties/prop_active_123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('prop_active_123');
      expect(res.body.data.title).toBe('Duplex F5 Hydra');
      expect(res.body.data.price).toBe(52000000);
      expect(res.body.data.contactPhone).toBe('0550112233');

      // Assert that sensitive fields are completely absent from API response
      expect(res.body.data.ownerId).toBeUndefined();
      expect(res.body.data.ownerEmail).toBeUndefined();
      expect(res.body.data.moderationNotes).toBeUndefined();
      expect(res.body.data.kycStatus).toBeUndefined();
    });

    it('should block anonymous visitor from viewing draft or rejected property (403)', async () => {
      const mockRejectedDoc = {
        id: 'prop_rejected_456',
        ownerId: 'owner_uid_999',
        title: 'Terrain Litigieux',
        status: 'rejected',
        rejectionReason: 'Défaut d’acte notarié',
      };

      collectionSpy.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'prop_rejected_456',
            data: () => ({ ...mockRejectedDoc }),
          }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const res = await request(app).get('/api/v1/real-estate/properties/prop_rejected_456');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Cette annonce n'est pas accessible au public");
    });

    it('should block other logged-in user from viewing pending property (403)', async () => {
      const mockPendingDoc = {
        id: 'prop_pending_789',
        ownerId: 'owner_uid_999',
        title: 'Appartement En Attente',
        status: 'pending',
      };

      collectionSpy.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'prop_pending_789',
            data: () => ({ ...mockPendingDoc }),
          }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const res = await request(app)
        .get('/api/v1/real-estate/properties/prop_pending_789')
        .set('Authorization', 'Bearer VALID_TOKEN_BUYER');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow legitimate owner to access their own draft/pending property with sanitized DTO', async () => {
      const mockOwnerDraftDoc = {
        id: 'prop_draft_mine',
        ownerId: 'owner_uid_999',
        title: 'Mon Brouillon En Cours',
        status: 'draft',
        price: 15000000,
        propertyType: 'apartment',
        listingType: 'sale',
        areaSquareMeters: 90,
        rooms: 3,
        bathrooms: 1,
        features: [],
        images: [],
        location: { address: 'Kouba', commune: 'Kouba', wilaya: 'Alger' },
        legalPapers: [],
        viewsCount: 0,
        createdAt: '2026-03-02T10:00:00Z',
        updatedAt: '2026-03-02T10:00:00Z',
        internalNotes: 'A relire ce soir',
      };

      collectionSpy.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'prop_draft_mine',
            data: () => ({ ...mockOwnerDraftDoc }),
          }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const res = await request(app)
        .get('/api/v1/real-estate/properties/prop_draft_mine')
        .set('Authorization', 'Bearer VALID_TOKEN_OWNER');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('prop_draft_mine');
      expect(res.body.data.internalNotes).toBeUndefined();
    });

    it('should allow platform administrator to access non-public property', async () => {
      const mockPendingDoc = {
        id: 'prop_to_review',
        ownerId: 'some_seller_uid',
        title: 'Annonce à valider',
        status: 'pending',
        price: 28000000,
        propertyType: 'apartment',
        listingType: 'sale',
        areaSquareMeters: 110,
        rooms: 4,
        bathrooms: 1,
        features: [],
        images: [],
        location: { address: 'Oran', commune: 'Oran', wilaya: 'Oran' },
        legalPapers: [],
        viewsCount: 0,
        createdAt: '2026-03-02T10:00:00Z',
        updatedAt: '2026-03-02T10:00:00Z',
      };

      collectionSpy.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'prop_to_review',
            data: () => ({ ...mockPendingDoc }),
          }),
        }),
      } as unknown as ReturnType<typeof db.collection>);

      const res = await request(app)
        .get('/api/v1/real-estate/properties/prop_to_review')
        .set('Authorization', 'Bearer VALID_TOKEN_ADMIN');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('prop_to_review');
    });
  });

  describe('3. GET /api/v1/real-estate/properties/:id/similar — DTO Sanitization', () => {
    it('should return similar properties sanitized with toPublicPropertyDTO', async () => {
      const mockTarget = {
        id: 'prop_target',
        ownerId: 'owner_uid_999',
        location: { wilaya: 'Alger' },
        status: 'active',
      };

      const mockSimilar1 = {
        id: 'prop_sim_1',
        ownerId: 'secret_owner_2',
        title: 'Appartement Similaire 1',
        status: 'active',
        price: 20000000,
        propertyType: 'apartment',
        listingType: 'sale',
        areaSquareMeters: 100,
        rooms: 3,
        bathrooms: 1,
        features: [],
        images: [],
        location: { address: 'Bab Ezzouar', commune: 'Bab Ezzouar', wilaya: 'Alger' },
        legalPapers: [],
        viewsCount: 5,
        createdAt: '2026-03-02T10:00:00Z',
        updatedAt: '2026-03-02T10:00:00Z',
        internalNotes: 'Note privée similaire',
      };

      const mockQuery: Record<string, unknown> = {};
      mockQuery.where = vi.fn().mockReturnValue(mockQuery);
      mockQuery.limit = vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue([
          { id: 'prop_sim_1', data: () => ({ ...mockSimilar1 }) },
        ]),
      });

      collectionSpy.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: 'prop_target',
            data: () => ({ ...mockTarget }),
          }),
        }),
        where: mockQuery.where,
      } as unknown as ReturnType<typeof db.collection>);

      const res = await request(app).get('/api/v1/real-estate/properties/prop_target/similar');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe('prop_sim_1');
      expect(res.body.data[0].title).toBe('Appartement Similaire 1');

      // Verify sanitization on similar property
      expect(res.body.data[0].ownerId).toBeUndefined();
      expect(res.body.data[0].internalNotes).toBeUndefined();
    });
  });

  describe('4. Legal Papers Allowlist Sanitization', () => {
    it('should only keep recognized legal papers and discard arbitrary or sensitive strings', () => {
      const propWithBogusLegalPapers = {
        id: 'prop_legal_test',
        title: 'Terrain',
        propertyType: 'land' as const,
        listingType: 'sale' as const,
        price: 10000000,
        legalPapers: ['acte_notarie', 'hacked_document', 'compromis_confidentiel', 'livret_foncier'],
        legalPaperType: 'internal_secret_cert',
        status: 'active' as const,
      };

      const sanitized = toPublicPropertyDTO(propWithBogusLegalPapers as unknown as StoredProperty);
      expect(sanitized.legalPapers).toEqual(['acte_notarie', 'livret_foncier']);
      expect(sanitized.legalPaperType).toBeUndefined();
    });
  });

  describe('5. GET /api/v1/real-estate/properties (List) — DTO Sanitization', () => {
    it('should return list items sanitized with toPublicPropertyDTO and no ownerId', async () => {
      const mockRawDoc1 = {
        id: 'prop_list_1',
        ownerId: 'owner_uid_private_1',
        title: 'Studio Alger Centre',
        status: 'active',
        price: 45000,
        propertyType: 'apartment',
        listingType: 'rent',
        areaSquareMeters: 40,
        rooms: 1,
        bathrooms: 1,
        features: [],
        images: [],
        location: { commune: 'Alger Centre', wilaya: 'Alger' },
        createdAt: '2026-03-01T00:00:00Z',
        moderationNotes: 'Note secrète',
      };

      const mockQuery: Record<string, unknown> = {};
      mockQuery.where = vi.fn().mockReturnValue(mockQuery);
      mockQuery.limit = vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue([
          { id: 'prop_list_1', data: () => ({ ...mockRawDoc1 }) },
        ]),
      });

      collectionSpy.mockReturnValue(mockQuery as unknown as ReturnType<typeof db.collection>);

      const res = await request(app).get('/api/v1/real-estate/properties');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe('prop_list_1');
      expect(res.body.data[0].ownerId).toBeUndefined();
      expect(res.body.data[0].moderationNotes).toBeUndefined();
    });
  });
});
