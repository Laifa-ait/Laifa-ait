import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { realEstatePropertyRouter } from '../domains/realEstate/controllers/realEstateProperty.controller';
import { AuthenticatedRequest } from '../middlewares/auth';
import { StoredProperty } from '../types/realEstate';

// Global mocks
let currentUserRole = 'buyer';
let currentUserId = 'owner_123';
let mockExistingProperty: Partial<StoredProperty> | null = null;

const mockDocSet = vi.fn().mockResolvedValue({ writeTime: {} });
const mockDocUpdate = vi.fn().mockResolvedValue({ writeTime: {} });

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

const app = express();
app.use(express.json());
app.use('/', realEstatePropertyRouter);

describe('Real Estate Status Transitions & Security Matrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserRole = 'buyer';
    currentUserId = 'owner_123';
    mockExistingProperty = {
      id: 'PROP-100',
      ownerId: 'owner_123',
      title: 'Bel Appartement Alger',
      status: 'active',
      isLegalVerified: false,
    };
  });

  it('1. Owner can transition active property to paused', async () => {
    const res = await request(app)
      .put('/properties/PROP-100/status')
      .send({ status: 'paused' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('paused');
    expect(mockDocUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paused' })
    );
  });

  it('2. Owner CANNOT transition rejected property directly to active (requires admin moderation)', async () => {
    mockExistingProperty = {
      id: 'PROP-100',
      ownerId: 'owner_123',
      title: 'Bel Appartement Alger',
      status: 'rejected',
      isLegalVerified: false,
    };

    const res = await request(app)
      .put('/properties/PROP-100/status')
      .send({ status: 'active' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Transition de statut non autorisée');
    expect(mockDocUpdate).not.toHaveBeenCalled();
  });

  it('3. Owner can transition rejected property to pending for re-review', async () => {
    mockExistingProperty = {
      id: 'PROP-100',
      ownerId: 'owner_123',
      title: 'Bel Appartement Alger',
      status: 'rejected',
      isLegalVerified: false,
    };

    const res = await request(app)
      .put('/properties/PROP-100/status')
      .send({ status: 'pending' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('pending');
  });

  it('4. Admin can transition any property status (e.g. pending to active, or to rejected)', async () => {
    currentUserRole = 'admin';
    currentUserId = 'admin_999';
    mockExistingProperty = {
      id: 'PROP-100',
      ownerId: 'owner_123',
      title: 'Bel Appartement Alger',
      status: 'pending',
      isLegalVerified: false,
    };

    const res = await request(app)
      .put('/properties/PROP-100/status')
      .send({ status: 'active' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('active');
  });

  it('5. Non-owner cannot update property status (IDOR check)', async () => {
    currentUserId = 'attacker_456';
    currentUserRole = 'buyer';

    const res = await request(app)
      .put('/properties/PROP-100/status')
      .send({ status: 'archived' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Vous n'êtes pas le propriétaire");
    expect(mockDocUpdate).not.toHaveBeenCalled();
  });

  it('6. Status cannot be modified through general PUT /properties/:id update', async () => {
    mockExistingProperty = {
      id: 'PROP-100',
      ownerId: 'owner_123',
      title: 'Bel Appartement Alger',
      status: 'pending',
      isLegalVerified: false,
      price: 10000,
    };

    const res = await request(app)
      .put('/properties/PROP-100')
      .send({
        title: 'Updated Title',
        price: 12000,
        status: 'active', // Should be discarded/ignored
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockDocSet).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Title',
        price: 12000,
        status: 'pending', // Preserved from existing property
      }),
      { merge: true }
    );
  });
});
