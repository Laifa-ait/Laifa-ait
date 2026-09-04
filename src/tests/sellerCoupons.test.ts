import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";

// Mock user state for dynamic test identity
let currentMockUser: { uid: string; role: string; email?: string } | null = {
  uid: "seller_authenticated_123",
  role: "seller",
};

// 1. Mock authentication middleware before importing routers
vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    (req as unknown as { user: unknown }).user = currentMockUser;
    next();
  },
  authorizeSeller: (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
}));

// In-memory Firestore mock store for route testing
interface MockCouponDoc {
  id: string;
  code: string;
  sellerId: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  minOrderValue?: number;
  expiresAt?: unknown;
  expiryDate?: unknown;
  isActive: boolean;
  maxUses?: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  usageCount?: number;
  limitedToSellers?: string[];
  createdAt?: unknown;
}

const mockCouponsDb = new Map<string, MockCouponDoc>();
const mockCodeLocks = new Map<string, { couponId: string; sellerId: string }>();

vi.mock("../config/firebase-admin", () => {
  const adminMock = {
    firestore: {
      FieldValue: {
        serverTimestamp: () => ({ _type: "serverTimestamp" }),
      },
      Timestamp: {
        fromDate: (d: Date) => ({
          toDate: () => d,
          toISOString: () => d.toISOString(),
          seconds: Math.floor(d.getTime() / 1000),
        }),
      },
    },
  };

  const dbMock = {
    collection: (colName: string) => {
      if (colName === "coupon_codes") {
        return {
          doc: (code: string) => ({
            get: async () => ({
              exists: mockCodeLocks.has(code),
              data: () => mockCodeLocks.get(code),
            }),
            set: async (data: { couponId: string; sellerId: string }) => {
              mockCodeLocks.set(code, data);
            },
            delete: async () => {
              mockCodeLocks.delete(code);
            },
          }),
        };
      }

      if (colName === "coupons") {
        return {
          doc: (docId?: string) => {
            const id = docId || `coup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            return {
              id,
              get: async () => {
                const item = mockCouponsDb.get(id);
                return {
                  id,
                  exists: Boolean(item),
                  data: () => item,
                };
              },
              update: async (patch: Partial<MockCouponDoc>) => {
                const item = mockCouponsDb.get(id);
                if (item) {
                  mockCouponsDb.set(id, { ...item, ...patch });
                }
              },
              delete: async () => {
                mockCouponsDb.delete(id);
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
              limit: (_n: number) => queryObj,
              get: async () => {
                const docs = Array.from(mockCouponsDb.values()).filter((c) => {
                  return filters.every((filter) => {
                    if (filter.field === "sellerId") return c.sellerId === filter.val;
                    if (filter.field === "isActive") return c.isActive === filter.val;
                    if (filter.field === "code") return c.code === filter.val;
                    return true;
                  });
                });
                return {
                  empty: docs.length === 0,
                  docs: docs.map((d) => ({
                    id: d.id,
                    data: () => d,
                  })),
                };
              },
            };
            return queryObj;
          },
        };
      }

      return {
        doc: () => ({
          get: async () => ({ exists: false, data: () => ({}) }),
        }),
      };
    },
    runTransaction: async (updateFunction: (t: unknown) => Promise<unknown>) => {
      const transactionMock = {
        get: async (refOrQuery: { exists?: boolean; data?: () => unknown; get?: () => Promise<unknown> }) => {
          if (typeof refOrQuery.get === "function") {
            return refOrQuery.get();
          }
          return refOrQuery;
        },
        set: (ref: { id: string }, data: Record<string, unknown>) => {
          if (data.code && data.couponId) {
            // lock doc
            mockCodeLocks.set(data.code as string, {
              couponId: data.couponId as string,
              sellerId: data.sellerId as string,
            });
          } else {
            // coupon doc
            mockCouponsDb.set(ref.id, {
              id: ref.id,
              ...data,
            } as MockCouponDoc);
          }
        },
      };
      return updateFunction(transactionMock);
    },
    batch: () => ({
      delete: (ref: { id: string }) => {
        mockCouponsDb.delete(ref.id);
      },
      commit: async () => {
        return;
      },
    }),
  };

  return {
    admin: adminMock,
    db: dbMock,
  };
});

import sellerCouponRouter from "../domains/seller/controllers/SellerCouponController";
import shopPublicRouter from "../domains/seller/shopPublic.routes";
import { CouponService, ProductItemForCoupon } from "../domains/marketing/coupon.service";

describe("Seller Coupons Targeted Security & Routes Suite", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCouponsDb.clear();
    mockCodeLocks.clear();
    currentMockUser = {
      uid: "seller_authenticated_123",
      role: "seller",
    };

    app = express();
    app.use(express.json());
    app.use(sellerCouponRouter);
    app.use(shopPublicRouter);
  });

  // 1. ROUTE TESTS: REAL CONTROLLERS VIA SUPERTEST
  describe("1. Real Route Tests (Seller Coupon Controller & Public Shop)", () => {
    it("POST /api/v1/seller/coupons ignores sellerId in payload and strictly derives it from req.user.uid", async () => {
      const maliciousPayload = {
        code: "SUMMER20",
        discountType: "percentage",
        discountValue: 20,
        expiryDate: "2026-12-31T23:59:59.000Z",
        minOrderAmount: 1000,
        sellerId: "victim_seller_999", // Attempted spoofing
        createdBy: "victim_seller_999",
      };

      const res = await request(app)
        .post("/api/v1/seller/coupons")
        .send(maliciousPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.coupon.sellerId).toBe("seller_authenticated_123");
      expect(res.body.coupon.sellerId).not.toBe("victim_seller_999");
      expect(res.body.coupon.limitedToSellers).toEqual(["seller_authenticated_123"]);

      // Verify stored in DB
      const created = Array.from(mockCouponsDb.values()).find((c) => c.code === "SUMMER20");
      expect(created).toBeDefined();
      expect(created?.sellerId).toBe("seller_authenticated_123");
    });

    it("PUT /api/v1/seller/coupons/:id/status returns 403 when modifying another seller's coupon (IDOR guard)", async () => {
      mockCouponsDb.set("coup_other_seller", {
        id: "coup_other_seller",
        code: "OTHER20",
        sellerId: "other_seller_888", // Not seller_authenticated_123
        discountType: "percentage",
        discountValue: 20,
        isActive: true,
      });

      const res = await request(app)
        .put("/api/v1/seller/coupons/coup_other_seller/status")
        .send({ isActive: false });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("IDOR Guard");
      expect(mockCouponsDb.get("coup_other_seller")?.isActive).toBe(true);
    });

    it("DELETE /api/v1/seller/coupons/:id returns 403 when deleting another seller's coupon (IDOR guard)", async () => {
      mockCouponsDb.set("coup_victim_del", {
        id: "coup_victim_del",
        code: "VICTIM30",
        sellerId: "other_seller_888",
        discountType: "percentage",
        discountValue: 30,
        isActive: true,
      });

      const res = await request(app).delete("/api/v1/seller/coupons/coup_victim_del");

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("IDOR Guard");
      expect(mockCouponsDb.has("coup_victim_del")).toBe(true);
    });

    it("POST /api/v1/seller/coupons rejects duplicate code collision in coupon_codes lock collection", async () => {
      // Pre-populate code lock
      mockCodeLocks.set("DUPLICATE10", {
        couponId: "coup_existing",
        sellerId: "seller_first",
      });

      const res = await request(app)
        .post("/api/v1/seller/coupons")
        .send({
          code: "DUPLICATE10",
          discountType: "percentage",
          discountValue: 10,
          expiryDate: "2026-12-31T23:59:59.000Z",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Ce code promo existe déjà. Veuillez choisir un autre code.");
    });

    it("GET /api/v1/public/shops/:sellerId/coupons removes inactive, expired, and exhausted coupons, without returning createdAtMs", async () => {
      const sellerId = "shop_seller_456";
      const now = new Date();
      const futureDate = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
      const pastDate = new Date(now.getTime() - 2 * 24 * 3600 * 1000);

      // 1. Valid active coupon
      mockCouponsDb.set("c_valid", {
        id: "c_valid",
        code: "VALID15",
        sellerId,
        discountType: "percentage",
        discountValue: 15,
        isActive: true,
        expiresAt: { toDate: () => futureDate, toISOString: () => futureDate.toISOString() },
        maxUses: 100,
        usedCount: 5,
        createdAt: { toDate: () => new Date(now.getTime() - 1000) },
      });

      // 2. Inactive coupon
      mockCouponsDb.set("c_inactive", {
        id: "c_inactive",
        code: "INACTIVE50",
        sellerId,
        discountType: "percentage",
        discountValue: 50,
        isActive: false,
        expiresAt: { toDate: () => futureDate, toISOString: () => futureDate.toISOString() },
        createdAt: { toDate: () => new Date() },
      });

      // 3. Expired coupon
      mockCouponsDb.set("c_expired", {
        id: "c_expired",
        code: "EXPIRED10",
        sellerId,
        discountType: "percentage",
        discountValue: 10,
        isActive: true,
        expiresAt: { toDate: () => pastDate, toISOString: () => pastDate.toISOString() },
        createdAt: { toDate: () => new Date() },
      });

      // 4. Exhausted coupon (usedCount >= maxUses)
      mockCouponsDb.set("c_exhausted", {
        id: "c_exhausted",
        code: "EXHAUSTED25",
        sellerId,
        discountType: "percentage",
        discountValue: 25,
        isActive: true,
        expiresAt: { toDate: () => futureDate, toISOString: () => futureDate.toISOString() },
        maxUses: 10,
        usedCount: 10,
        createdAt: { toDate: () => new Date() },
      });

      const res = await request(app).get(`/api/v1/public/shops/${sellerId}/coupons`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.coupons).toHaveLength(1);
      expect(res.body.coupons[0].code).toBe("VALID15");

      // Verify createdAtMs is NOT leaked in the public DTO
      expect(res.body.coupons[0].createdAtMs).toBeUndefined();
    });
  });

  // 2. REAL SERVICE CODE TESTS: COUPON SERVICE RESTRICTIONS AT CHECKOUT
  describe("2. Real CouponService item restriction & subtotal calculation", () => {
    const cartItems: ProductItemForCoupon[] = [
      {
        productId: "prod_artisanal_carpet",
        price: 15000,
        quantity: 1,
        sellerId: "seller_artisan_ghardaia",
        category: "Maison & Décoration",
      },
      {
        productId: "prod_leather_bag",
        price: 8000,
        quantity: 1,
        sellerId: "seller_artisan_ghardaia",
        category: "Maroquinerie",
      },
      {
        productId: "prod_tech_phone",
        price: 45000,
        quantity: 1,
        sellerId: "seller_tech_algiers", // Different seller
        category: "Électronique",
      },
    ];

    it("should only apply seller percentage discount to items belonging to that seller", () => {
      const sellerCoupon = {
        code: "GHARDAIA10",
        discountType: "percentage",
        discountValue: 10,
        sellerId: "seller_artisan_ghardaia",
        limitedToSellers: ["seller_artisan_ghardaia"],
        minOrderValue: 5000,
        isActive: true,
      };

      const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
        sellerCoupon,
        cartItems
      );

      expect(hasRestrictions).toBe(true);
      expect(eligibleItems).toHaveLength(2);
      expect(eligibleItems.map((i) => i.productId)).toEqual(["prod_artisanal_carpet", "prod_leather_bag"]);
      expect(eligibleSubtotal).toBe(23000); // 15000 + 8000

      // Calculate discount on eligible subtotal
      const discountResult = CouponService.calculateDiscountAmount(sellerCoupon, eligibleSubtotal);

      expect(discountResult.error).toBeUndefined();
      // 10% of 23000 (only eligible seller items), NOT 10% of 68000
      expect(discountResult.discountAmount).toBe(2300);
      expect(discountResult.discountAmount).not.toBe(6800);
    });

    it("should reject seller coupon if cart contains no items from that seller", () => {
      const sellerCoupon = {
        code: "ORAN_FASHION20",
        discountType: "percentage",
        discountValue: 20,
        sellerId: "seller_fashion_oran", // Not in cart
        limitedToSellers: ["seller_fashion_oran"],
        minOrderValue: 2000,
        isActive: true,
      };

      const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
        sellerCoupon,
        cartItems
      );

      expect(hasRestrictions).toBe(true);
      expect(eligibleItems).toHaveLength(0);
      expect(eligibleSubtotal).toBe(0);

      const discountResult = CouponService.calculateDiscountAmount(sellerCoupon, eligibleSubtotal);
      expect(discountResult.discountAmount).toBe(0);
      expect(discountResult.error).toBeDefined();
    });

    it("should enforce minOrderAmount against only the seller's eligible items subtotal", () => {
      const sellerCouponHighMin = {
        code: "BIG_GHARDAIA",
        discountType: "fixed",
        discountValue: 2000,
        sellerId: "seller_artisan_ghardaia",
        limitedToSellers: ["seller_artisan_ghardaia"],
        minOrderValue: 30000, // Higher than Ghardaia items subtotal (23000), but lower than cart total (68000)
        isActive: true,
      };

      const { eligibleSubtotal } = CouponService.filterEligibleItems(sellerCouponHighMin, cartItems);
      expect(eligibleSubtotal).toBe(23000);

      const discountResult = CouponService.calculateDiscountAmount(sellerCouponHighMin, eligibleSubtotal);
      // Even though total cart is 68000 >= 30000, the seller's eligible items total is only 23000 < 30000
      expect(discountResult.discountAmount).toBe(0);
      expect(discountResult.error).toContain("minimum d'achat éligible de 30000 DA");
    });
  });
});
