import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { realEstateRouter } from '../routes/realEstate';
import * as auth from '../middlewares/auth';
import { db } from '../config/firebase-admin';

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
// Inject mock auth middleware
app.use((req, res, next) => {
  if (req.headers.authorization === 'Bearer VALID_TOKEN_BUYER') {
    (req as any).user = { uid: 'buyer123', role: 'buyer' };
  } else if (req.headers.authorization === 'Bearer VALID_TOKEN_OWNER') {
    (req as any).user = { uid: 'owner123', role: 'seller' };
  } else if (req.headers.authorization === 'Bearer VALID_TOKEN_ADMIN') {
    (req as any).user = { uid: 'admin123', role: 'admin' };
  }
  next();
});
app.use('/api/v1/real-estate', realEstateRouter);

describe('GET /api/v1/real-estate/properties/:id/owner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 404 if property does not exist', async () => {
    const mockPropertyDoc = { exists: false };
    (db.collection as any).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue(mockPropertyDoc)
      })
    });

    const res = await request(app).get('/api/v1/real-estate/properties/nonexistent/owner');
    expect(res.status).toBe(404);
  });

  it('should return 403 for non-public property if caller is not owner or admin', async () => {
    const mockPropertyDoc = {
      exists: true,
      data: () => ({ status: 'draft', ownerId: 'owner123' })
    };
    (db.collection as any).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue(mockPropertyDoc)
      })
    });

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

    (db.collection as any).mockImplementation((collName: string) => ({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockImplementation(() => {
          if (collName === 'real_estate_properties') return Promise.resolve(mockPropertyDoc);
          if (collName === 'users') return Promise.resolve(mockUserDoc);
          return Promise.resolve({ exists: false });
        })
      })
    }));

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
        email: 'private@email.com',
        phone: '0550123456',
        address: 'Secret Address 123',
        idCardUrl: 'https://secret.com/card.jpg'
      })
    };

    (db.collection as any).mockImplementation((collName: string) => ({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockImplementation(() => {
          if (collName === 'real_estate_properties') return Promise.resolve(mockPropertyDoc);
          if (collName === 'users') return Promise.resolve(mockUserDoc);
          return Promise.resolve({ exists: false });
        })
      })
    }));

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
