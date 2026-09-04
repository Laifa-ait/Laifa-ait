import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";

// Current mock auth identity for testing
let currentMockUser: { uid: string; role: string; email?: string } | null = null;

// Mock middlewares/auth
vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser) {
      return res.status(401).json({ success: false, error: "Authentification requise" });
    }
    (req as unknown as { user: unknown }).user = currentMockUser;
    next();
  },
  authorizeSeller: (_req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser || (currentMockUser.role !== "seller" && currentMockUser.role !== "admin")) {
      return res.status(403).json({ success: false, error: "Accès réservé aux vendeurs" });
    }
    next();
  },
  authorizeAdmin: (_req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser || currentMockUser.role !== "admin") {
      return res.status(403).json({ success: false, error: "Accès administrateur requis" });
    }
    next();
  },
  requireAdmin: (_req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser || currentMockUser.role !== "admin") {
      return res.status(403).json({ success: false, error: "Accès administrateur requis" });
    }
    next();
  },
  requireRole: (allowedRoles: string[]) => (_req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser || !allowedRoles.includes(currentMockUser.role)) {
      return res.status(403).json({ success: false, error: "Rôle non autorisé" });
    }
    next();
  },
}));

// In-memory data structures
interface MockCampaignDoc {
  id: string;
  sellerId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productImage: string;
  placement: string;
  startAt: string;
  endAt: string;
  durationDays: number;
  priceAmount: number;
  currency: string;
  paymentStatus: "pending" | "paid";
  moderationStatus: "pending" | "approved" | "rejected" | "suspended";
  status: "pending" | "active" | "paused" | "completed" | "cancelled" | "rejected";
  paymentProofReference?: string;
  paymentProofNotes?: string;
  paymentProofUrl?: string;
  paymentProofSubmittedAt?: string;
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

const mockCampaignsDb = new Map<string, MockCampaignDoc>();
const mockProductsDb = new Map<string, Record<string, unknown>>();
const mockAuditLogs: Array<Record<string, unknown>> = [];
const mockWalletAccesses: string[] = [];

vi.mock("../config/firebase-admin", () => {
  const adminMock = {
    firestore: {
      FieldValue: {
        serverTimestamp: () => new Date().toISOString(),
        increment: (n: number) => n,
      },
    },
  };

  const dbMock = {
    collection: (colName: string) => {
      if (colName === "seller_wallets" || colName === "wallets") {
        mockWalletAccesses.push(colName);
        return {
          doc: () => ({
            get: async () => ({ exists: false, data: () => null }),
            update: async () => {},
          }),
        };
      }

      if (colName === "products") {
        return {
          doc: (id: string) => ({
            id,
            get: async () => ({
              exists: mockProductsDb.has(id),
              id,
              data: () => mockProductsDb.get(id),
            }),
          }),
        };
      }

      if (colName === "audit_logs") {
        return {
          doc: (id?: string) => ({
            id: id || `audit_${Date.now()}`,
            set: async (data: Record<string, unknown>) => {
              mockAuditLogs.push(data);
            },
          }),
          add: async (data: Record<string, unknown>) => {
            mockAuditLogs.push(data);
          },
        };
      }

      if (colName === "sponsored_campaigns") {
        return {
          doc: (id?: string) => {
            const docId = id || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            return {
              id: docId,
              get: async () => ({
                exists: mockCampaignsDb.has(docId),
                id: docId,
                data: () => mockCampaignsDb.get(docId),
              }),
              set: async (data: MockCampaignDoc) => {
                mockCampaignsDb.set(docId, data);
              },
              update: async (patch: Partial<MockCampaignDoc>) => {
                const cur = mockCampaignsDb.get(docId);
                if (cur) mockCampaignsDb.set(docId, { ...cur, ...patch });
              },
            };
          },
          where: (field: string, op: string, val: unknown) => {
            const filters: Array<{ field: string; op: string; val: unknown }> = [{ field, op, val }];
            const queryObj = {
              where: (f2: string, op2: string, v2: unknown) => {
                filters.push({ field: f2, op: op2, val: v2 });
                return queryObj;
              },
              limit: (limitCount: number) => ({
                get: async () => {
                  const all = Array.from(mockCampaignsDb.values()).filter((c) =>
                    filters.every((f) => {
                      if (f.field === "sellerId") return c.sellerId === f.val;
                      if (f.field === "status") return c.status === f.val;
                      if (f.field === "moderationStatus") return c.moderationStatus === f.val;
                      if (f.field === "paymentStatus") return c.paymentStatus === f.val;
                      if (f.field === "placement") return c.placement === f.val;
                      return true;
                    })
                  );
                  const docs = all.slice(0, limitCount).map((d) => ({
                    id: d.id,
                    data: () => d,
                  }));
                  return {
                    docs,
                    forEach: (fn: (item: { id: string; data: () => MockCampaignDoc }) => void) => docs.forEach(fn),
                  };
                },
              }),
              get: async () => {
                const all = Array.from(mockCampaignsDb.values()).filter((c) =>
                  filters.every((f) => {
                    if (f.field === "sellerId") return c.sellerId === f.val;
                    if (f.field === "status") return c.status === f.val;
                    if (f.field === "moderationStatus") return c.moderationStatus === f.val;
                    if (f.field === "paymentStatus") return c.paymentStatus === f.val;
                    if (f.field === "placement") return c.placement === f.val;
                    return true;
                  })
                );
                const docs = all.map((d) => ({
                  id: d.id,
                  data: () => d,
                }));
                return {
                  docs,
                  forEach: (fn: (item: { id: string; data: () => MockCampaignDoc }) => void) => docs.forEach(fn),
                };
              },
            };
            return queryObj;
          },
        };
      }

      if (colName === "sponsored_analytics_events") {
        return {
          add: async () => {},
        };
      }

      return {
        doc: (id?: string) => ({
          id: id || "doc",
          get: async () => ({ exists: false, data: () => null }),
          set: async () => {},
          update: async () => {},
        }),
      };
    },
    runTransaction: async (updateFunction: (transaction: unknown) => Promise<unknown>) => {
      const mockTx = {
        get: async (docRef: { id?: string }) => {
          const id = docRef.id || "";
          if (mockCampaignsDb.has(id)) {
            return {
              exists: true,
              id,
              data: () => mockCampaignsDb.get(id),
            };
          }
          return { exists: false, id, data: () => null };
        },
        update: (docRef: { id?: string }, data: Record<string, unknown>) => {
          const id = docRef.id || "";
          if (mockCampaignsDb.has(id)) {
            const cur = mockCampaignsDb.get(id)!;
            mockCampaignsDb.set(id, { ...cur, ...data } as MockCampaignDoc);
          }
        },
        set: (docRef: { id?: string }, data: Record<string, unknown>) => {
          const id = docRef?.id || `set_${Date.now()}`;
          if (data.placement && data.sellerId) {
            mockCampaignsDb.set(id, data as unknown as MockCampaignDoc);
          }
          if (data.action) {
            mockAuditLogs.push(data);
          }
        },
      };
      return updateFunction(mockTx);
    },
  };

  return {
    admin: adminMock,
    db: dbMock,
    getAdminFirestore: () => dbMock,
  };
});

describe("Supertest Suite: Sponsorship Routes, Security & Manual Payment", () => {
  let app: express.Express;

  beforeEach(async () => {
    mockCampaignsDb.clear();
    mockProductsDb.clear();
    mockAuditLogs.length = 0;
    mockWalletAccesses.length = 0;
    currentMockUser = null;

    // Seed test products
    mockProductsDb.set("prod_seller_a", {
      id: "prod_seller_a",
      sellerId: "seller_a",
      name: "Tapis A",
      price: 10000,
      category: "Maison",
      image: "https://example.com/a.jpg",
      status: "active",
    });

    mockProductsDb.set("prod_seller_b", {
      id: "prod_seller_b",
      sellerId: "seller_b",
      name: "Caftan B",
      price: 25000,
      category: "Mode",
      image: "https://example.com/b.jpg",
      status: "active",
    });

    // Create fresh Express app
    app = express();
    app.use(express.json());

    // Dynamically import and mount routes exactly as in production
    const sellerRouter = (await import("../domains/sponsorship/controllers/sellerSponsoredCampaign.controller")).default;
    const adminRouter = (await import("../domains/sponsorship/controllers/adminSponsoredCampaign.controller")).default;
    const publicRouter = (await import("../domains/sponsorship/controllers/publicSponsoredCampaign.controller")).default;

    app.use(sellerRouter);
    app.use("/api/v1", adminRouter);
    app.use("/api/v1/public/sponsored", publicRouter);
  });

  describe("1. Authentication Enforcement (401)", () => {
    it("should return 401 when unauthenticated user calls seller endpoints", async () => {
      currentMockUser = null;

      const resList = await request(app).get("/api/v1/seller/sponsored-campaigns");
      expect(resList.status).toBe(401);
      expect(resList.body.error).toContain("Authentification");

      const resCreate = await request(app)
        .post("/api/v1/seller/sponsored-campaigns")
        .send({ productId: "prod_seller_a", placement: "home", startAt: "2026-09-10", endAt: "2026-09-17" });
      expect(resCreate.status).toBe(401);
    });

    it("should return 401 when unauthenticated user calls admin endpoints", async () => {
      currentMockUser = null;

      const resAdminList = await request(app).get("/api/v1/admin/sponsored-campaigns");
      expect(resAdminList.status).toBe(401);
    });
  });

  describe("2. IDOR Protection & Ownership Validation (403)", () => {
    it("should prevent Seller A from creating a campaign for Seller B's product", async () => {
      currentMockUser = { uid: "seller_a", role: "seller" };

      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 86400000 * 7).toISOString();

      const res = await request(app)
        .post("/api/v1/seller/sponsored-campaigns")
        .send({
          productId: "prod_seller_b", // Belongs to seller_b
          placement: "home",
          startAt: start,
          endAt: end,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("autre vendeur");
    });

    it("should prevent Seller B from viewing Seller A's private campaign", async () => {
      // Seed Seller A campaign
      mockCampaignsDb.set("camp_a_1", {
        id: "camp_a_1",
        sellerId: "seller_a",
        productId: "prod_seller_a",
        productName: "Tapis A",
        productPrice: 10000,
        productCategory: "Maison",
        productImage: "https://example.com/a.jpg",
        placement: "home",
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 86400000).toISOString(),
        durationDays: 1,
        priceAmount: 800,
        currency: "DZD",
        paymentStatus: "pending",
        moderationStatus: "pending",
        status: "pending",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Seller B attempts to read Seller A's campaign
      currentMockUser = { uid: "seller_b", role: "seller" };

      const res = await request(app).get("/api/v1/seller/sponsored-campaigns/camp_a_1");
      expect(res.status).toBe(403);
      expect(res.body.error).toContain("propriétaire");
    });

    it("should prevent Seller B from submitting proof or cancelling Seller A's campaign", async () => {
      mockCampaignsDb.set("camp_a_2", {
        id: "camp_a_2",
        sellerId: "seller_a",
        productId: "prod_seller_a",
        productName: "Tapis A",
        productPrice: 10000,
        productCategory: "Maison",
        productImage: "https://example.com/a.jpg",
        placement: "home",
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 86400000).toISOString(),
        durationDays: 1,
        priceAmount: 800,
        currency: "DZD",
        paymentStatus: "pending",
        moderationStatus: "pending",
        status: "pending",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      currentMockUser = { uid: "seller_b", role: "seller" };

      const resProof = await request(app)
        .post("/api/v1/seller/sponsored-campaigns/camp_a_2/payment-proof")
        .send({ paymentProofReference: "HACK-123" });
      expect(resProof.status).toBe(403);

      const resCancel = await request(app).post("/api/v1/seller/sponsored-campaigns/camp_a_2/cancel");
      expect(resCancel.status).toBe(403);
    });
  });

  describe("3. Admin Role Protection (403 for non-admins)", () => {
    it("should prevent regular sellers from accessing admin endpoints", async () => {
      currentMockUser = { uid: "seller_a", role: "seller" };

      const resList = await request(app).get("/api/v1/admin/sponsored-campaigns");
      expect(resList.status).toBe(403);

      const resConfirm = await request(app)
        .post("/api/v1/admin/sponsored-campaigns/camp_123/confirm-payment")
        .send({ notes: "Unauthorized try" });
      expect(resConfirm.status).toBe(403);

      const resApprove = await request(app).post("/api/v1/admin/sponsored-campaigns/camp_123/approve");
      expect(resApprove.status).toBe(403);
    });
  });

  describe("4. End-to-End Manual Payment & Moderation Flow", () => {
    it("should complete campaign lifecycle with zero wallet access", async () => {
      // Step 1: Seller A creates a campaign
      currentMockUser = { uid: "seller_a", role: "seller" };
      const start = new Date(Date.now() + 86400000);
      const end = new Date(start.getTime() + 86400000 * 7);

      const createRes = await request(app)
        .post("/api/v1/seller/sponsored-campaigns")
        .send({
          productId: "prod_seller_a",
          placement: "home",
          startAt: start.toISOString(),
          endAt: end.toISOString(),
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      const campaign = createRes.body.data;
      expect(campaign.paymentStatus).toBe("pending");
      expect(campaign.moderationStatus).toBe("pending");
      expect(campaign.priceAmount).toBe(5600);

      // Verify absence of wallet access!
      expect(mockWalletAccesses.length).toBe(0);

      // Step 2: Seller transmits payment proof
      const proofRes = await request(app)
        .post(`/api/v1/seller/sponsored-campaigns/${campaign.id}/payment-proof`)
        .send({
          paymentProofReference: "CCP-VIR-998877",
          paymentProofNotes: "Envoyé par BaridiMob le 04/09",
        });

      expect(proofRes.status).toBe(200);
      expect(proofRes.body.data.paymentProofReference).toBe("CCP-VIR-998877");
      expect(proofRes.body.data.paymentProofNotes).toBe("Envoyé par BaridiMob le 04/09");

      // Step 3: Admin confirms payment
      currentMockUser = { uid: "admin_super", role: "admin" };

      const confirmRes = await request(app)
        .post(`/api/v1/admin/sponsored-campaigns/${campaign.id}/confirm-payment`)
        .send({ notes: "Reçu vérifié sur relevé compte Olmart" });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.paymentStatus).toBe("paid");
      expect(confirmRes.body.data.paymentConfirmedBy).toBe("admin_super");

      // Verify audit log written atomically
      expect(mockAuditLogs.some((log) => log.action === "CONFIRM_PAYMENT")).toBe(true);

      // Step 4: Admin approves campaign
      const approveRes = await request(app)
        .post(`/api/v1/admin/sponsored-campaigns/${campaign.id}/approve`)
        .send({});

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.moderationStatus).toBe("approved");

      // Step 5: Verify again zero wallet interactions occurred
      expect(mockWalletAccesses.length).toBe(0);
    });
  });

  describe("5. Public Filtering & DTO Security", () => {
    it("should never expose private fields or unpaid/unapproved campaigns publicly", async () => {
      const now = Date.now();

      // Campaign 1: Active, Paid, Approved -> Should appear
      mockCampaignsDb.set("camp_valid", {
        id: "camp_valid",
        sellerId: "seller_a",
        productId: "prod_seller_a",
        productName: "Tapis A",
        productPrice: 10000,
        productCategory: "Maison",
        productImage: "https://example.com/a.jpg",
        placement: "home",
        startAt: new Date(now - 10000).toISOString(),
        endAt: new Date(now + 86400000).toISOString(),
        durationDays: 1,
        priceAmount: 800,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "approved",
        status: "active",
        paymentProofReference: "SECRET_RECEIPT_12345",
        paymentProofNotes: "Confidential private notes",
        impressions: 15,
        clicks: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Campaign 2: Pending payment -> Should NOT appear
      mockCampaignsDb.set("camp_unpaid", {
        id: "camp_unpaid",
        sellerId: "seller_b",
        productId: "prod_seller_b",
        productName: "Caftan B",
        productPrice: 25000,
        productCategory: "Mode",
        productImage: "https://example.com/b.jpg",
        placement: "home",
        startAt: new Date(now - 10000).toISOString(),
        endAt: new Date(now + 86400000).toISOString(),
        durationDays: 1,
        priceAmount: 800,
        currency: "DZD",
        paymentStatus: "pending",
        moderationStatus: "approved",
        status: "pending",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Campaign 3: Pending moderation -> Should NOT appear
      mockCampaignsDb.set("camp_pending_mod", {
        id: "camp_pending_mod",
        sellerId: "seller_a",
        productId: "prod_seller_a",
        productName: "Tapis A",
        productPrice: 10000,
        productCategory: "Maison",
        productImage: "https://example.com/a.jpg",
        placement: "home",
        startAt: new Date(now - 10000).toISOString(),
        endAt: new Date(now + 86400000).toISOString(),
        durationDays: 1,
        priceAmount: 800,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "pending",
        status: "pending",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const res = await request(app).get("/api/v1/public/sponsored/products?placement=home");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);

      const item = res.body.data[0];
      expect(item.campaignId).toBe("camp_valid");
      expect(item.product.id).toBe("prod_seller_a");

      // CRITICAL DTO SECURITY: Verify no confidential/private fields are leaked to the public!
      expect((item as Record<string, unknown>).sellerId).toBeUndefined();
      expect((item as Record<string, unknown>).paymentProofReference).toBeUndefined();
      expect((item as Record<string, unknown>).paymentProofNotes).toBeUndefined();
      expect((item as Record<string, unknown>).paymentProofUrl).toBeUndefined();
      expect((item as Record<string, unknown>).priceAmount).toBeUndefined();
      expect((item as Record<string, unknown>).paymentConfirmedBy).toBeUndefined();
    });
  });

  describe("6. Analytics Event Ingestion & Anti-Fraud Deduplication", () => {
    it("should reject event if productId does not match campaign productId", async () => {
      mockCampaignsDb.set("camp_fraud_test", {
        id: "camp_fraud_test",
        sellerId: "seller_a",
        productId: "prod_seller_a",
        productName: "Tapis A",
        productPrice: 10000,
        productCategory: "Maison",
        productImage: "https://example.com/a.jpg",
        placement: "home",
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 86400000).toISOString(),
        durationDays: 1,
        priceAmount: 800,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "approved",
        status: "active",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const res = await request(app)
        .post("/api/v1/public/sponsored/events")
        .send({
          campaignId: "camp_fraud_test",
          eventType: "click",
          placement: "home",
          productId: "prod_spoofed", // Spoofed ID!
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Incohérence");
    });

    it("should record impression and deduplicate consecutive hits within window", async () => {
      mockCampaignsDb.set("camp_event_ok", {
        id: "camp_event_ok",
        sellerId: "seller_a",
        productId: "prod_seller_a",
        productName: "Tapis A",
        productPrice: 10000,
        productCategory: "Maison",
        productImage: "https://example.com/a.jpg",
        placement: "home",
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 86400000).toISOString(),
        durationDays: 1,
        priceAmount: 800,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "approved",
        status: "active",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const payload = {
        campaignId: "camp_event_ok",
        eventType: "impression",
        placement: "home",
        productId: "prod_seller_a",
        sessionId: "user_session_abc",
      };

      // Hit 1: Recorded
      const res1 = await request(app)
        .post("/api/v1/public/sponsored/events")
        .set("User-Agent", "Mozilla/5.0 Test")
        .send(payload);

      expect(res1.status).toBe(200);
      expect(res1.body.deduplicated).toBe(false);

      // Hit 2: Deduplicated
      const res2 = await request(app)
        .post("/api/v1/public/sponsored/events")
        .set("User-Agent", "Mozilla/5.0 Test")
        .send(payload);

      expect(res2.status).toBe(200);
      expect(res2.body.deduplicated).toBe(true);
    });
  });
});
