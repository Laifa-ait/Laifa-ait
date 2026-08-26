import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { realEstateRouter } from '../routes/realEstate';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../config/firebase-admin';
import { CollectionReference } from 'firebase-admin/firestore';

vi.mock('../config/firebase-admin', () => ({
  db: {
    collection: vi.fn(),
  },
  admin: {
    firestore: {
      FieldValue: {
        increment: vi.fn(),
      }
    }
  }
}));

const app = express();
app.use(express.json());

// Inject mock auth middleware with proper type casting
app.use((req, _res, next) => {
  const authReq = req as unknown as AuthenticatedRequest;
  if (req.headers.authorization === 'Bearer VALID_TOKEN_BUYER') {
    authReq.user = { uid: 'buyer123', role: 'buyer', email: 'buyer@olmart.dz', auth_time: Math.floor(Date.now() / 1000) };
  } else if (req.headers.authorization === 'Bearer VALID_TOKEN_OWNER') {
    authReq.user = { uid: 'owner123', role: 'seller', email: 'owner@olmart.dz', auth_time: Math.floor(Date.now() / 1000) };
  } else if (req.headers.authorization === 'Bearer VALID_TOKEN_ADMIN') {
    authReq.user = { uid: 'admin123', role: 'admin', email: 'admin@olmart.dz', auth_time: Math.floor(Date.now() / 1000) };
  }
  next();
});

app.use('/api/v1/real-estate', realEstateRouter);

describe('GET /api/v1/real-estate/properties/:id/owner', () => {
  const collectionSpy = vi.spyOn(db, 'collection');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 404 if property does not exist', async () => {
    const mockPropertyDoc = { exists: false };
    collectionSpy.mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue(mockPropertyDoc)
      })
    } as unknown as CollectionReference);

    const res = await request(app).get('/api/v1/real-estate/properties/nonexistent/owner');
    expect(res.status).toBe(404);
  });

  it('should return 403 for non-public property if caller is not owner or admin', async () => {
    const mockPropertyDoc = {
      exists: true,
      data: () => ({ status: 'draft', ownerId: 'owner123' })
    };
    collectionSpy.mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue(mockPropertyDoc)
      })
    } as unknown as CollectionReference);

    // Request as buyer (not owner)
    const res = await request(app)
      .get('/api/v1/real-estate/properties/prop1/owner')
      .set('Authorization', 'Bearer VALID_TOKEN_BUYER');
    
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('accessible au public');
  });

  it('should return 200 for non-public property if caller is owner', async () => {
    const mockPropertyDoc = {
      exists: true,
      data: () => ({ status: 'draft', ownerId: 'owner123' })
    };
    const mockUserDoc = {
      exists: true,
      data: () => ({
        uid: 'owner123',
        displayName: 'Test Owner',
        verificationStatus: 'approved'
      })
    };

    collectionSpy.mockImplementation(((collName: string) => ({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockImplementation(() => {
          if (collName === 'real_estate_properties') return Promise.resolve(mockPropertyDoc);
          if (collName === 'users') return Promise.resolve(mockUserDoc);
          return Promise.resolve({ exists: false });
        })
      })
    })) as unknown as (collectionPath: string) => CollectionReference);

    const res = await request(app)
      .get('/api/v1/real-estate/properties/prop1/owner')
      .set('Authorization', 'Bearer VALID_TOKEN_OWNER');
    
    expect(res.status).toBe(200);
  });

  it('should strip PII (email, phone, address, etc.) and only return allowlisted fields', async () => {
    const mockPropertyDoc = {
      exists: true,
      data: () => ({ status: 'active', ownerId: 'owner123' })
    };
    const mockUserDoc = {
      exists: true,
      data: () => ({
        uid: 'owner123',
        displayName: 'Test Owner',
        verificationStatus: 'approved',
        email: 'private@olmart.dz',
        phone: '0550123456',
        address: 'Secret Address 123',
        idCardUrl: 'https://secret.com/card.jpg'
      })
    };

    collectionSpy.mockImplementation(((collName: string) => ({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockImplementation(() => {
          if (collName === 'real_estate_properties') return Promise.resolve(mockPropertyDoc);
          if (collName === 'users') return Promise.resolve(mockUserDoc);
          return Promise.resolve({ exists: false });
        })
      })
    })) as unknown as (collectionPath: string) => CollectionReference);

    const res = await request(app).get('/api/v1/real-estate/properties/prop1/owner');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    const profile = res.body.data;
    expect(profile.displayName).toBe('Test Owner');
    expect(profile.verificationStatus).toBe('approved');
    
    // Check that PII is NOT present
    expect(profile).not.toHaveProperty('email');
    expect(profile).not.toHaveProperty('phone');
    expect(profile).not.toHaveProperty('address');
    expect(profile).not.toHaveProperty('idCardUrl');
  });
});
