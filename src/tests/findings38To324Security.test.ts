import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Response, NextFunction } from 'express';
import { validateExternalUrl } from '../utils/security';
import { AttachmentSchema } from '../schemas/messaging';
import { AuthenticatedRequest } from '../middlewares/auth';
import orderChatRouter from '../domains/messaging/orderChat.routes';
import { OrderStatusService } from '../domains/order/services/orderStatus.service';

// Mock DB and Admin for Express Router Tests
let mockOrderData: Record<string, unknown> | null = null;
let currentCallerUid = 'user_buyer_1';
let currentCallerRole = 'buyer';

const mockDoc = vi.fn().mockImplementation((_docId: string) => ({
  get: vi.fn().mockImplementation(async () => ({
    exists: Boolean(mockOrderData),
    data: () => mockOrderData,
  })),
  collection: vi.fn().mockReturnValue({
    orderBy: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({ docs: [] }),
    }),
  }),
  set: vi.fn().mockResolvedValue({ writeTime: {} }),
  update: vi.fn().mockResolvedValue({ writeTime: {} }),
}));

const mockCollection = vi.fn().mockReturnValue({
  doc: mockDoc,
  add: vi.fn().mockResolvedValue({ id: 'mock_doc_id' }),
});

vi.mock('../config/firebase-admin', () => ({
  db: {
    collection: (name: string) => mockCollection(name),
  },
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => 'MOCK_TIMESTAMP',
        increment: (n: number) => n,
      },
      Timestamp: {
        now: () => 'MOCK_NOW',
      },
    },
  },
}));

vi.mock('../middlewares/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../middlewares/auth')>();
  return {
    ...actual,
    authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      req.user = {
        uid: currentCallerUid,
        email: `${currentCallerUid}@example.com`,
        role: currentCallerRole,
        status: 'active',
      };
      next();
    },
  };
});

describe('Findings 3.8 à 3.24 — Security & Integrity Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentCallerUid = 'user_buyer_1';
    currentCallerRole = 'buyer';
    mockOrderData = {
      userId: 'user_buyer_1',
      sellerId: 'user_seller_1',
      shippingAddress: { fullName: 'Buyer Name' },
    };
  });

  describe('Finding 3.13 & 3.14: SSRF Protection (validateExternalUrl)', () => {
    it('rejects unencrypted HTTP URLs by default', () => {
      expect(() => validateExternalUrl('http://example.com/image.jpg')).toThrow();
    });

    it('rejects AWS/GCP cloud metadata endpoints', () => {
      expect(() => validateExternalUrl('https://169.254.169.254/latest/meta-data/')).toThrow(/SSRF protection/);
      expect(() => validateExternalUrl('https://metadata.google.internal/computeMetadata/v1/')).toThrow(/SSRF protection/);
    });

    it('rejects localhost, loopback, and private IPv4 ranges', () => {
      expect(() => validateExternalUrl('https://localhost:3000/api')).toThrow(/SSRF protection/);
      expect(() => validateExternalUrl('https://127.0.0.1:8080/data')).toThrow(/SSRF protection/);
      expect(() => validateExternalUrl('https://10.0.0.5/secret')).toThrow(/SSRF protection/);
      expect(() => validateExternalUrl('https://192.168.1.1/admin')).toThrow(/SSRF protection/);
      expect(() => validateExternalUrl('https://172.16.0.1/status')).toThrow(/SSRF protection/);
    });

    it('allows legitimate public HTTPS URLs', () => {
      const parsed = validateExternalUrl('https://firebasestorage.googleapis.com/v0/b/app/image.png');
      expect(parsed.hostname).toBe('firebasestorage.googleapis.com');
      expect(parsed.protocol).toBe('https:');
    });
  });

  describe('Finding 3.18: Messaging Attachment URL Schema', () => {
    it('rejects HTTP and non-URL attachment links', () => {
      const invalidAttachment = {
        type: 'image',
        url: 'http://insecure-host.com/photo.jpg',
        fileName: 'photo.jpg',
        fileSizeBytes: 1024,
      };
      const res = AttachmentSchema.safeParse(invalidAttachment);
      expect(res.success).toBe(false);
    });

    it('accepts valid HTTPS attachment links', () => {
      const validAttachment = {
        type: 'image',
        url: 'https://firebasestorage.googleapis.com/v0/b/olmart/photo.jpg',
        fileName: 'photo.jpg',
        fileSizeBytes: 2048,
      };
      const res = AttachmentSchema.safeParse(validAttachment);
      expect(res.success).toBe(true);
    });
  });

  describe('Finding 3.17: Order Chat IDOR Protection', () => {
    const app = express();
    app.use(express.json());
    app.use(orderChatRouter);

    it('allows the order buyer to view order chat details', async () => {
      currentCallerUid = 'user_buyer_1';
      currentCallerRole = 'buyer';

      const res = await request(app).get('/api/v1/orders/ORD_100/chat');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('buyerName');
    });

    it('allows the order seller to view order chat details', async () => {
      currentCallerUid = 'user_seller_1';
      currentCallerRole = 'seller';

      const res = await request(app).get('/api/v1/orders/ORD_100/chat');
      expect(res.status).toBe(200);
    });

    it('allows an administrator to view order chat details', async () => {
      currentCallerUid = 'user_admin_99';
      currentCallerRole = 'admin';

      const res = await request(app).get('/api/v1/orders/ORD_100/chat');
      expect(res.status).toBe(200);
    });

    it('strictly blocks an unauthorized third-party user (IDOR prevention)', async () => {
      currentCallerUid = 'unrelated_attacker_99';
      currentCallerRole = 'buyer';

      const res = await request(app).get('/api/v1/orders/ORD_100/chat');
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Accès refusé');
    });
  });

  describe('Finding 3.15: Delivery Confirmation User ID Integrity', () => {
    it('sets userId strictly to authenticated authUid if logged in', async () => {
      const regId = await OrderStatusService.confirmDelivery({
        id: 'DELIV_001',
        fullName: 'Client Test',
        email: 'test@example.com',
        phone: '0555123456',
        wilaya: 'Alger',
        commune: 'Bab El Oued',
        address: 'Rue 123',
        deliveryMethod: 'home',
        items: [{ productId: 'p1', quantity: 1 }],
        total: 2500,
        authUid: 'authenticated_uid_777',
        userId: 'spoofed_victim_uid',
      });

      expect(regId).toBe('DELIV_001');
      expect(mockDoc).toHaveBeenCalledWith('DELIV_001');
    });

    it('sets userId strictly to guest if not authenticated, ignoring client-supplied userId', async () => {
      let savedPayload: Record<string, unknown> | null = null;
      mockDoc.mockImplementationOnce(() => ({
        set: vi.fn().mockImplementation((payload) => {
          savedPayload = payload;
          return Promise.resolve({ writeTime: {} });
        }),
      }));

      await OrderStatusService.confirmDelivery({
        id: 'DELIV_002',
        fullName: 'Guest User',
        email: 'guest@example.com',
        phone: '0555123456',
        wilaya: 'Oran',
        commune: 'Centre',
        address: 'Rue Principale',
        deliveryMethod: 'desk',
        items: [{ productId: 'p2', quantity: 2 }],
        total: 5000,
        authUid: undefined,
        userId: 'spoofed_victim_uid',
      });

      expect(savedPayload).not.toBeNull();
      expect((savedPayload as unknown as { userId: string })?.userId).toBe('guest');
    });
  });
});
