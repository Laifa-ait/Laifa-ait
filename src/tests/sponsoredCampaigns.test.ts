import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SPONSORED_DAILY_RATES,
  calculateCampaignPrice,
} from "../config/sponsoredPricing";
import { SponsoredPlacement } from "../types/sponsoredCampaign";

// In-memory mocks for Firestore testing
interface MockProduct {
  id: string;
  sellerId: string;
  name: string;
  price: number;
  category: string;
  image: string;
  status: string;
}

interface MockCampaign {
  id: string;
  sellerId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productImage: string;
  placement: SponsoredPlacement;
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
  paidAt?: string;
  paymentConfirmedBy?: string;
  impressions: number;
  clicks: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const mockProducts = new Map<string, MockProduct>();
const mockCampaigns = new Map<string, MockCampaign>();
const mockAuditLogs: Array<{ action?: string; targetId?: string; adminId?: string; details?: unknown }> = [];

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
      if (colName === "products") {
        return {
          doc: (id: string) => ({
            id,
            get: async () => ({
              exists: mockProducts.has(id),
              id,
              data: () => mockProducts.get(id),
            }),
          }),
        };
      }

      if (colName === "sponsored_campaigns") {
        return {
          doc: (id?: string) => {
            const docId = id || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            return {
              id: docId,
              get: async () => ({
                exists: mockCampaigns.has(docId),
                id: docId,
                data: () => mockCampaigns.get(docId),
              }),
              set: async (data: MockCampaign) => {
                mockCampaigns.set(docId, data);
              },
              update: async (patch: Partial<MockCampaign>) => {
                const current = mockCampaigns.get(docId);
                if (current) {
                  mockCampaigns.set(docId, { ...current, ...patch });
                }
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
                  const all = Array.from(mockCampaigns.values()).filter((c) => {
                    return filters.every((f) => {
                      if (f.field === "sellerId") return c.sellerId === f.val;
                      if (f.field === "status") return c.status === f.val;
                      if (f.field === "moderationStatus") return c.moderationStatus === f.val;
                      if (f.field === "paymentStatus") return c.paymentStatus === f.val;
                      if (f.field === "placement") return c.placement === f.val;
                      return true;
                    });
                  });
                  const docs = all.slice(0, limitCount).map((item) => ({
                    id: item.id,
                    data: () => item,
                  }));
                  return {
                    docs,
                    forEach: (fn: (d: { id: string; data: () => MockCampaign }) => void) => docs.forEach(fn),
                  };
                },
              }),
              get: async () => {
                const all = Array.from(mockCampaigns.values()).filter((c) => {
                  return filters.every((f) => {
                    if (f.field === "sellerId") return c.sellerId === f.val;
                    if (f.field === "status") return c.status === f.val;
                    if (f.field === "moderationStatus") return c.moderationStatus === f.val;
                    if (f.field === "paymentStatus") return c.paymentStatus === f.val;
                    if (f.field === "placement") return c.placement === f.val;
                    return true;
                  });
                });
                const docs = all.map((item) => ({
                  id: item.id,
                  data: () => item,
                }));
                return {
                  docs,
                  forEach: (fn: (d: { id: string; data: () => MockCampaign }) => void) => docs.forEach(fn),
                };
              },
            };
            return queryObj;
          },
        };
      }

      if (colName === "audit_logs") {
        return {
          doc: (id?: string) => ({
            id: id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            set: async (logData: { action?: string; targetId?: string; adminId?: string; details?: unknown }) => {
              mockAuditLogs.push(logData);
            },
          }),
          add: async (log: { action?: string; targetId?: string; adminId?: string; details?: unknown }) => {
            mockAuditLogs.push(log);
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
          id: id || "mock_doc",
          get: async () => ({ exists: false, data: () => null }),
          set: async () => {},
          update: async () => {},
        }),
        add: async () => {},
      };
    },
    runTransaction: async (updateFunction: (transaction: unknown) => Promise<unknown>) => {
      const mockTx = {
        get: async (docRef: { id?: string }) => {
          const id = docRef.id || "";
          if (mockCampaigns.has(id)) {
            return {
              exists: true,
              id,
              data: () => mockCampaigns.get(id),
            };
          }
          return { exists: false, id, data: () => null };
        },
        update: (docRef: { id?: string }, data: Record<string, unknown>) => {
          const id = docRef.id || "";
          if (mockCampaigns.has(id)) {
            const current = mockCampaigns.get(id)!;
            mockCampaigns.set(id, { ...current, ...data } as MockCampaign);
          }
        },
        set: (docRef: { id?: string }, data: Record<string, unknown>) => {
          const id = docRef?.id || `set_${Date.now()}`;
          if (data.placement && data.sellerId) {
            mockCampaigns.set(id, data as unknown as MockCampaign);
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

describe("Sponsored Campaigns System", () => {
  beforeEach(() => {
    mockProducts.clear();
    mockCampaigns.clear();
    mockAuditLogs.length = 0;

    // Seed test product
    mockProducts.set("prod_1", {
      id: "prod_1",
      sellerId: "seller_1",
      name: "Tapis Berbère Authentique",
      price: 15000,
      category: "Artisanat",
      image: "https://example.com/tapis.jpg",
      status: "active",
    });

    // Seed another seller's product
    mockProducts.set("prod_other", {
      id: "prod_other",
      sellerId: "seller_other",
      name: "Robe Kabyle Broderie",
      price: 8000,
      category: "Mode",
      image: "https://example.com/robe.jpg",
      status: "active",
    });
  });

  describe("1. Pricing & Date Rules", () => {
    it("should calculate correct prices for placements", () => {
      const now = new Date();
      const start = new Date(now.getTime() + 86400000);
      const end7 = new Date(start.getTime() + 86400000 * 7);

      const homeRes = calculateCampaignPrice("home", start.toISOString(), end7.toISOString());
      expect(homeRes.valid).toBe(true);
      if (homeRes.valid) {
        expect(homeRes.data.durationDays).toBe(7);
        expect(homeRes.data.priceAmount).toBe(7 * SPONSORED_DAILY_RATES.home); // 7 * 800 = 5600
      }

      const catRes = calculateCampaignPrice("category", start.toISOString(), end7.toISOString());
      expect(catRes.valid).toBe(true);
      if (catRes.valid) {
        expect(catRes.data.priceAmount).toBe(7 * SPONSORED_DAILY_RATES.category); // 7 * 500 = 3500
      }

      const searchRes = calculateCampaignPrice("search", start.toISOString(), end7.toISOString());
      expect(searchRes.valid).toBe(true);
      if (searchRes.valid) {
        expect(searchRes.data.priceAmount).toBe(7 * SPONSORED_DAILY_RATES.search); // 7 * 400 = 2800
      }
    });

    it("should reject campaign with invalid duration (> 30 days)", () => {
      const start = new Date(Date.now() + 86400000);
      const end = new Date(start.getTime() + 86400000 * 35); // 35 days

      const res = calculateCampaignPrice("home", start.toISOString(), end.toISOString());
      expect(res.valid).toBe(false);
      if (!res.valid) {
        expect(res.error).toContain("30 jours");
      }
    });

    it("should reject campaign where end date is before start date", () => {
      const start = new Date(Date.now() + 86400000 * 5);
      const end = new Date(Date.now() + 86400000 * 2);

      const res = calculateCampaignPrice("home", start.toISOString(), end.toISOString());
      expect(res.valid).toBe(false);
      if (!res.valid) {
        expect(res.error).toContain("postérieure");
      }
    });
  });

  describe("2. Service Layer Operations (Decoupled from Wallet)", () => {
    it("should create a campaign and enforce IDOR when seller does not own product", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      const start = new Date(Date.now() + 86400000);
      const end = new Date(start.getTime() + 86400000 * 7);

      await expect(
        SponsoredCampaignService.createCampaign("seller_1", {
          productId: "prod_other", // Owned by seller_other
          placement: "home",
          startAt: start.toISOString(),
          endAt: end.toISOString(),
        })
      ).rejects.toThrow("Vous ne pouvez pas sponsoriser un produit appartenant à un autre vendeur.");
    });

    it("should create campaign with paymentStatus: 'pending' without touching wallet", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      const start = new Date(Date.now() + 86400000);
      const end = new Date(start.getTime() + 86400000 * 7);

      const campaign = await SponsoredCampaignService.createCampaign("seller_1", {
        productId: "prod_1",
        placement: "home",
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });

      expect(campaign.sellerId).toBe("seller_1");
      expect(campaign.productId).toBe("prod_1");
      expect(campaign.placement).toBe("home");
      expect(campaign.durationDays).toBe(7);
      expect(campaign.priceAmount).toBe(7 * 800);
      // Decoupled from wallet: payment status is pending
      expect(campaign.paymentStatus).toBe("pending");
      expect(campaign.moderationStatus).toBe("pending");
      expect(campaign.status).toBe("pending");
    });

    it("should allow seller to submit payment proof for their pending campaign", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      // Seed campaign
      mockCampaigns.set("camp_pending_proof", {
        id: "camp_pending_proof",
        sellerId: "seller_1",
        productId: "prod_1",
        productName: "Tapis",
        productPrice: 15000,
        productCategory: "Artisanat",
        productImage: "https://example.com/tapis.jpg",
        placement: "home",
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        durationDays: 7,
        priceAmount: 5600,
        currency: "DZD",
        paymentStatus: "pending",
        moderationStatus: "pending",
        status: "pending",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Another seller fails (IDOR protection)
      await expect(
        SponsoredCampaignService.submitPaymentProof("seller_other", "camp_pending_proof", {
          paymentProofReference: "REC-987654",
          paymentProofNotes: "Virement BaridiMob",
        })
      ).rejects.toThrow("Accès refusé");

      // Owner submits successfully
      const updated = await SponsoredCampaignService.submitPaymentProof("seller_1", "camp_pending_proof", {
        paymentProofReference: "REC-987654",
        paymentProofNotes: "Virement BaridiMob",
      });
      expect(updated.paymentProofReference).toBe("REC-987654");
      expect(updated.paymentProofNotes).toBe("Virement BaridiMob");
    });

    it("should allow admin to confirm manual payment with atomic audit log", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      mockCampaigns.set("camp_confirm_pay", {
        id: "camp_confirm_pay",
        sellerId: "seller_1",
        productId: "prod_1",
        productName: "Tapis",
        productPrice: 15000,
        productCategory: "Artisanat",
        productImage: "https://example.com/tapis.jpg",
        placement: "home",
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        durationDays: 7,
        priceAmount: 5600,
        currency: "DZD",
        paymentStatus: "pending",
        moderationStatus: "pending",
        status: "pending",
        paymentProofReference: "REC-12345",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const confirmed = await SponsoredCampaignService.adminConfirmPayment(
        "admin_123",
        "camp_confirm_pay",
        "Vérification effectuée sur relevé CCP"
      );

      expect(confirmed.paymentStatus).toBe("paid");
      expect(confirmed.paymentConfirmedBy).toBe("admin_123");
      expect(mockAuditLogs.some((l) => l.action === "CONFIRM_PAYMENT")).toBe(true);
    });

    it("should allow seller to cancel their campaign with IDOR verification", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      // Seed campaign
      mockCampaigns.set("camp_test", {
        id: "camp_test",
        sellerId: "seller_1",
        productId: "prod_1",
        productName: "Tapis",
        productPrice: 15000,
        productCategory: "Artisanat",
        productImage: "https://example.com/tapis.jpg",
        placement: "home",
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        durationDays: 5,
        priceAmount: 4000,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "pending",
        status: "pending",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Seller other tries to cancel -> IDOR 403 error
      await expect(
        SponsoredCampaignService.cancelSellerCampaign("seller_other", "camp_test")
      ).rejects.toThrow("Accès refusé : vous n'êtes pas le propriétaire de cette campagne.");

      // Seller 1 cancels -> success
      const cancelled = await SponsoredCampaignService.cancelSellerCampaign("seller_1", "camp_test");
      expect(cancelled.status).toBe("cancelled");
    });

    it("should handle admin moderation actions with audit logs", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      const now = new Date();
      const past = new Date(now.getTime() - 3600000);
      const future = new Date(now.getTime() + 86400000 * 5);

      mockCampaigns.set("camp_admin_test", {
        id: "camp_admin_test",
        sellerId: "seller_1",
        productId: "prod_1",
        productName: "Tapis",
        productPrice: 15000,
        productCategory: "Artisanat",
        productImage: "https://example.com/tapis.jpg",
        placement: "home",
        startAt: past.toISOString(),
        endAt: future.toISOString(),
        durationDays: 5,
        priceAmount: 4000,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "pending",
        status: "pending",
        impressions: 0,
        clicks: 0,
        createdAt: past.toISOString(),
        updatedAt: past.toISOString(),
      });

      // Admin approves
      const approved = await SponsoredCampaignService.adminApproveCampaign("admin_super", "camp_admin_test");
      expect(approved.moderationStatus).toBe("approved");
      expect(approved.status).toBe("active"); // because paid and currently within date range

      // Check audit log
      expect(mockAuditLogs.some((l) => l.action === "APPROVE_CAMPAIGN")).toBe(true);

      // Admin suspends
      const suspended = await SponsoredCampaignService.adminSuspendCampaign("admin_super", "camp_admin_test", "Contrôle qualité");
      expect(suspended.moderationStatus).toBe("suspended");
      expect(suspended.status).toBe("paused");
      expect(mockAuditLogs.some((l) => l.action === "SUSPEND_CAMPAIGN")).toBe(true);

      // Admin rejects
      const rejected = await SponsoredCampaignService.adminRejectCampaign("admin_super", "camp_admin_test", "Non conforme");
      expect(rejected.moderationStatus).toBe("rejected");
      expect(rejected.rejectionReason).toBe("Non conforme");
      expect(mockAuditLogs.some((l) => l.action === "REJECT_CAMPAIGN")).toBe(true);
    });

    it("should retrieve active sponsored products publicly without mocks", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      mockCampaigns.set("camp_public_1", {
        id: "camp_public_1",
        sellerId: "seller_1",
        productId: "prod_1",
        productName: "Tapis Berbère",
        productPrice: 15000,
        productCategory: "Artisanat",
        productImage: "https://example.com/tapis.jpg",
        placement: "home",
        startAt: new Date(Date.now() - 10000).toISOString(),
        endAt: new Date(Date.now() + 1000000).toISOString(),
        durationDays: 5,
        priceAmount: 4000,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "approved",
        status: "active",
        impressions: 10,
        clicks: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const products = await SponsoredCampaignService.getPublicSponsoredProducts({
        placement: "home",
        limit: 5,
      });

      expect(products.length).toBe(1);
      expect(products[0].campaignId).toBe("camp_public_1");
      expect(products[0].product.name).toBe("Tapis Berbère Authentique");
      expect(products[0].product.isSponsored).toBe(true);
    });

    it("should track events and enforce deduplication", async () => {
      const { SponsoredCampaignService } = await import("../domains/sponsorship/sponsoredCampaign.service");

      mockCampaigns.set("camp_event_test", {
        id: "camp_event_test",
        sellerId: "seller_1",
        productId: "prod_1",
        productName: "Tapis",
        productPrice: 15000,
        productCategory: "Artisanat",
        productImage: "https://example.com/tapis.jpg",
        placement: "home",
        startAt: new Date(Date.now() - 10000).toISOString(),
        endAt: new Date(Date.now() + 1000000).toISOString(),
        durationDays: 5,
        priceAmount: 4000,
        currency: "DZD",
        paymentStatus: "paid",
        moderationStatus: "approved",
        status: "active",
        impressions: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const eventPayload = {
        campaignId: "camp_event_test",
        eventType: "impression" as const,
        placement: "home" as const,
        productId: "prod_1",
        sessionId: "sess_123",
      };

      const firstTrack = await SponsoredCampaignService.recordAnalyticsEvent(eventPayload);
      expect(firstTrack.success).toBe(true);
      expect(firstTrack.deduplicated).toBe(false);

      // Immediate duplicate from same session within 30s window
      const duplicateTrack = await SponsoredCampaignService.recordAnalyticsEvent(eventPayload);
      expect(duplicateTrack.success).toBe(true);
      expect(duplicateTrack.deduplicated).toBe(true);
    });
  });
});
