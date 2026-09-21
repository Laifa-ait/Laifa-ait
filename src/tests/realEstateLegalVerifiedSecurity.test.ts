import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { realEstatePropertyRouter } from '../domains/realEstate/controllers/realEstateProperty.controller';
import { AuthenticatedRequest } from '../middlewares/auth';
import { StoredProperty } from '../types/realEstate';

// Global mocks
let currentUserRole = 'buyer';
let currentUserId = 'user_prop_owner_1';

const mockDocSet = vi.fn().mockResolvedValue({ writeTime: {} });
const mockDocUpdate = vi.fn().mockResolvedValue({ writeTime: {} });
let mockExistingProperty: Partial<StoredProperty> | null = null;

const mockDoc = vi.fn().mockImplementation((_docId: string) => ({
  set: mockDocSet,
  update: mockDocUpdate,
  get: vi.fn().mockImplementation(async () => ({
    exists: Boolean(mockExistingProperty),
    data: () => mockExistingProperty,
  })),
}));

const mockCollection = vi.fn().mockReturnValue({
  doc: mockDoc,
});

vi.mock('../config/firebase-admin', () => ({
  db: {
    collection: (name: string) => mockCollection(name),
  },
  admin: {
    firestore: {
      FieldValue: {
        arrayUnion: (val: unknown) => val,
        serverTimestamp: () => 'MOCK_TIMESTAMP',
      },
    },
  },
}));

vi.mock('../middlewares/auth', () => ({
  authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    req.user = {
      uid: currentUserId,
      email: `${currentUserId}@example.com`,
      role: currentUserRole,
      status: 'active',
    };
    next();
  },
  authorizeAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Accès réservé aux administrateurs.' });
    }
    next();
  },
  optionalAuthenticateToken: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

vi.mock('../middlewares/rateLimiters', () => ({
  strictLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe('Finding 2 — isLegalVerified Security Enforcement', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(realEstatePropertyRouter);
    currentUserRole = 'buyer';
    currentUserId = 'user_prop_owner_1';
    mockDocSet.mockClear();
    mockDocUpdate.mockClear();
    mockExistingProperty = null;
  });

  it('1. Creation by standard user forces isLegalVerified=false even if user supplies isLegalVerified=true', async () => {
    const propertyPayload = {
      title: 'Bel appartement F4 à Hydra',
      description: 'Superbe vue dégagée avec balcon spacieux',
      propertyType: 'apartment',
      listingType: 'sale',
      price: 25000000,
      areaSquareMeters: 120,
      rooms: 4,
      bathrooms: 2,
      images: ['https://storage.olmart.dz/immo/f4_hydra.jpg'],
      utilityCharges: { condoFees: true },
      location: {
        wilaya: 'Alger',
        commune: 'Hydra',
        lat: 36.75,
        lng: 3.05,
      },
      isLegalVerified: true, // Malicious attempt to self-verify
    };

    const res = await request(app)
      .post('/properties')
      .send(propertyPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const createdProperty = mockDocSet.mock.calls[0][0] as StoredProperty;
    expect(createdProperty.isLegalVerified).toBe(false);
    expect((res.body.data as StoredProperty).isLegalVerified).toBe(false);
  });

  it('2. Creation with isLegalVerified omitted defaults strictly to false', async () => {
    const propertyPayload = {
      title: 'Villa moderne à Chéraga',
      description: 'Villa contemporaine R+2',
      propertyType: 'villa',
      listingType: 'sale',
      price: 55000000,
      areaSquareMeters: 300,
      rooms: 6,
      bathrooms: 3,
      images: ['https://storage.olmart.dz/immo/villa_cheraga.jpg'],
      utilityCharges: { condoFees: false },
      location: {
        wilaya: 'Alger',
        commune: 'Cheraga',
        lat: 36.77,
        lng: 2.95,
      },
    };

    const res = await request(app)
      .post('/properties')
      .send(propertyPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const createdProperty = mockDocSet.mock.calls[0][0] as StoredProperty;
    expect(createdProperty.isLegalVerified).toBe(false);
  });

  it('3. Property owner cannot self-verify property on PUT /properties/:id', async () => {
    mockExistingProperty = {
      id: 'PROP-999',
      ownerId: 'user_prop_owner_1',
      title: 'Studio Alger Centre',
      isLegalVerified: false,
      propertyType: 'apartment',
      listingType: 'rent_long',
      price: 45000,
      areaSquareMeters: 40,
      rooms: 1,
      bathrooms: 1,
      images: ['https://storage.olmart.dz/immo/studio.jpg'],
      utilityCharges: { condoFees: true },
      location: { address: 'Didouche Mourad', wilaya: 'Alger', commune: 'Alger Centre', lat: 36.76, lng: 3.06 },
    };

    const res = await request(app)
      .put('/properties/PROP-999')
      .send({
        title: 'Studio Alger Centre Rénové',
        isLegalVerified: true, // Malicious attempt to escalate legal status
      });

    expect(res.status).toBe(200);
    const updatedProperty = mockDocSet.mock.calls[0][0] as StoredProperty;
    expect(updatedProperty.isLegalVerified).toBe(false);
  });

  it('4. Admin can update isLegalVerified via dedicated admin route PUT /properties/:id/verify-legal', async () => {
    currentUserRole = 'admin';
    mockExistingProperty = {
      id: 'PROP-999',
      ownerId: 'user_prop_owner_1',
      isLegalVerified: false,
    };

    const res = await request(app)
      .put('/properties/PROP-999/verify-legal')
      .send({ isLegalVerified: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockDocUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ isLegalVerified: true })
    );
  });

  it('5. Non-admin is blocked with 403 on PUT /properties/:id/verify-legal', async () => {
    currentUserRole = 'seller';
    mockExistingProperty = {
      id: 'PROP-999',
      ownerId: 'user_prop_owner_1',
      isLegalVerified: false,
    };

    const res = await request(app)
      .put('/properties/PROP-999/verify-legal')
      .send({ isLegalVerified: true });

    expect(res.status).toBe(403);
    expect(mockDocUpdate).not.toHaveBeenCalled();
  });
});
