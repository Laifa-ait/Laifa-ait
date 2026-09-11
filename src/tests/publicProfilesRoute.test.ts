import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// In-memory Firestore store for tests
const mockUsersDb = new Map<string, Record<string, unknown>>();
const mockPublicProfilesDb = new Map<string, Record<string, unknown>>();
let firestoreShouldThrow = false;

interface WhereFilter {
  field: string;
  op: string;
  val: unknown;
}

vi.mock("../config/firebase-admin", () => {
  const getQueryDocs = (colName: string, filters: WhereFilter[], limitCount?: number) => {
    if (firestoreShouldThrow) {
      throw new Error("Firestore connection failure");
    }
    const store = colName === "users" ? mockUsersDb : mockPublicProfilesDb;
    let entries = Array.from(store.entries());

    for (const filter of filters) {
      if (filter.op === "==") {
        entries = entries.filter(([, data]) => data[filter.field] === filter.val);
      } else if (filter.op === "in" && Array.isArray(filter.val)) {
        entries = entries.filter(([, data]) => filter.val.includes(data[filter.field]));
      }
    }

    if (typeof limitCount === "number") {
      entries = entries.slice(0, limitCount);
    }

    return {
      empty: entries.length === 0,
      docs: entries.map(([id, data]) => ({
        id,
        exists: true,
        data: () => data,
      })),
    };
  };

  const createQueryObj = (colName: string, filters: WhereFilter[] = []) => ({
    where: (field: string, op: string, val: unknown) => {
      return createQueryObj(colName, [...filters, { field, op, val }]);
    },
    limit: (n: number) => ({
      get: async () => getQueryDocs(colName, filters, n),
    }),
    get: async () => getQueryDocs(colName, filters),
  });

  const dbMock = {
    collection: (colName: string) => {
      return {
        doc: (docId: string) => ({
          get: async () => {
            if (firestoreShouldThrow) {
              throw new Error("Firestore connection failure");
            }
            if (colName === "users") {
              const data = mockUsersDb.get(docId);
              return {
                id: docId,
                exists: Boolean(data),
                data: () => data,
              };
            }
            if (colName === "publicProfiles") {
              const data = mockPublicProfilesDb.get(docId);
              return {
                id: docId,
                exists: Boolean(data),
                data: () => data,
              };
            }
            return {
              id: docId,
              exists: false,
              data: () => undefined,
            };
          },
        }),
        ...createQueryObj(colName),
      };
    },
  };

  return {
    db: dbMock,
    admin: {
      firestore: {
        FieldValue: {
          serverTimestamp: () => new Date(),
        },
      },
    },
  };
});

// Mock services used by public.routes.ts so only the route under test is isolated
vi.mock("../services/CoreService", () => ({
  CoreService: {
    getHomeData: vi.fn(),
    getPublicSettings: vi.fn(),
    logError: vi.fn(),
  },
}));

vi.mock("../services/TrendingSearchesService", () => ({
  TrendingSearchesService: {
    getTrendingSearches: vi.fn().mockResolvedValue([]),
  },
}));

import publicRouter from "../domains/home/public.routes";

const app = express();
app.use(express.json());
app.use(publicRouter);

describe("GET /api/v1/public-profiles - Authoritative Projection, RBAC & Strict Whitelist", () => {
  beforeEach(() => {
    mockUsersDb.clear();
    mockPublicProfilesDb.clear();
    firestoreShouldThrow = false;
  });

  it("Scenario 1: returns 200 with whitelisted fields for active approved sellers", async () => {
    const sellerId = "seller_valid_01";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Artisanale Alger",
      displayName: "Karim Artisan",
      wilaya: "16 - Alger",
      commune: "Bab El Oued",
      isVerified: true,
      sellerTrustScore: 92,
      email: "secret_seller@olmart.dz",
      phone: "+213555123456",
      rib: "00799999000123456789",
      rcNumber: "16/00-1234567B18",
      nifNumber: "000116001234567",
      kycStatus: "approved",
      isAdmin: false,
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Artisanale Alger",
      slogan: "L'artisanat authentique algérien",
      description: "Des créations uniques faites à la main.",
      logoUrl: "https://storage.olmart.dz/shops/logo1.jpg",
      bannerUrl: "https://storage.olmart.dz/shops/banner1.jpg",
      categories: ["Artisanat", "Décoration"],
      // Attacker attempts to spoof authoritative scores in public profile
      isVerified: true,
      sellerTrustScore: 100,
    });

    const res = await request(app).get("/api/v1/public-profiles");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.profiles)).toBe(true);
    expect(res.body.profiles).toHaveLength(1);

    const profile = res.body.profiles[0];
    expect(profile.id).toBe(sellerId);
    expect(profile.shopName).toBe("Boutique Artisanale Alger");
    expect(profile.isVerified).toBe(true);
    expect(profile.sellerTrustScore).toBe(92);
    expect(profile.badge).toBe("Vendeur Vérifié");
    expect(profile.categories).toEqual(["Artisanat", "Décoration"]);

    // Strict non-leakage verification of sensitive fields
    expect(profile).not.toHaveProperty("email");
    expect(profile).not.toHaveProperty("phone");
    expect(profile).not.toHaveProperty("phoneNumber");
    expect(profile).not.toHaveProperty("rib");
    expect(profile).not.toHaveProperty("rcNumber");
    expect(profile).not.toHaveProperty("nifNumber");
    expect(profile).not.toHaveProperty("kycStatus");
    expect(profile).not.toHaveProperty("isAdmin");
    expect(profile).not.toHaveProperty("role");
  });

  it("Scenario 2: rejects unverified spoofing in publicProfiles", async () => {
    const sellerId = "unverified_seller_02";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Sans Badge",
      isVerified: false,
      sellerTrustScore: 35,
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Sans Badge",
      // Attacker claims to be verified and 100 trust score
      isVerified: true,
      sellerTrustScore: 100,
      badge: "Super Vendeur",
    });

    const res = await request(app).get("/api/v1/public-profiles");

    expect(res.status).toBe(200);
    const profile = res.body.profiles[0];
    expect(profile.isVerified).toBe(false);
    expect(profile.sellerTrustScore).toBe(35);
    expect(profile.badge).toBe("");
  });

  it("Scenario 3: excludes non-seller users (e.g. buyers, admins) from public profiles", async () => {
    mockUsersDb.set("buyer_user_1", {
      role: "buyer",
      status: "active",
      displayName: "Client Ordinaire",
    });
    mockUsersDb.set("admin_user_1", {
      role: "admin",
      status: "active",
      displayName: "Administrateur Système",
    });

    const res = await request(app).get("/api/v1/public-profiles");

    expect(res.status).toBe(200);
    expect(res.body.profiles).toEqual([]);
  });

  it("Scenario 4: excludes suspended or inactive sellers", async () => {
    mockUsersDb.set("suspended_seller", {
      role: "seller",
      status: "suspended",
      shopName: "Boutique Suspendue",
    });

    mockUsersDb.set("pending_seller", {
      role: "seller",
      status: "pending",
      shopName: "Boutique En Attente",
    });

    const res = await request(app).get("/api/v1/public-profiles");

    expect(res.status).toBe(200);
    expect(res.body.profiles).toEqual([]);
  });

  it("Scenario 5 (Targeted): orphan publicProfiles preceding sellers do not disrupt loading valid profiles", async () => {
    // 5 orphan public profiles inserted first without corresponding users
    for (let i = 1; i <= 5; i++) {
      mockPublicProfilesDb.set(`orphan_profile_${i}`, {
        shopName: `Orphan Shop ${i}`,
        description: `Orphan description ${i}`,
      });
    }

    // A valid active seller with their public profile
    const validSellerId = "seller_real_valid";
    mockUsersDb.set(validSellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Authentique",
      isVerified: true,
      sellerTrustScore: 95,
    });
    mockPublicProfilesDb.set(validSellerId, {
      shopName: "Boutique Authentique",
      description: "Véritable boutique",
    });

    const res = await request(app).get("/api/v1/public-profiles");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Exactly 1 valid profile loaded, orphans completely ignored
    expect(res.body.profiles).toHaveLength(1);
    expect(res.body.profiles[0].id).toBe(validSellerId);
    expect(res.body.profiles[0].shopName).toBe("Boutique Authentique");
    expect(res.body.profiles[0].isVerified).toBe(true);
  });

  it("Scenario 6 (Targeted): inactive sellers preceding active ones do not consume eligible slots", async () => {
    // 150 inactive or pending sellers created first
    for (let i = 1; i <= 150; i++) {
      mockUsersDb.set(`inactive_seller_${i}`, {
        role: "seller",
        status: i % 2 === 0 ? "suspended" : "pending",
        shopName: `Inactive Shop ${i}`,
      });
    }

    // 10 active sellers created after the 150 inactive ones
    for (let i = 1; i <= 10; i++) {
      mockUsersDb.set(`active_seller_${i}`, {
        role: "seller",
        status: "active",
        shopName: `Active Shop ${i}`,
        isVerified: true,
      });
      mockPublicProfilesDb.set(`active_seller_${i}`, {
        shopName: `Active Shop ${i}`,
      });
    }

    const res = await request(app).get("/api/v1/public-profiles");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // All 10 active sellers are selected; the 150 inactive sellers did not consume admissible slots
    expect(res.body.profiles).toHaveLength(10);
    for (let i = 1; i <= 10; i++) {
      const found = res.body.profiles.find((p: { id: string }) => p.id === `active_seller_${i}`);
      expect(found).toBeDefined();
      expect(found?.shopName).toBe(`Active Shop ${i}`);
    }
  });

  it("Scenario 7: returns 500 when Firestore fails", async () => {
    firestoreShouldThrow = true;
    const res = await request(app).get("/api/v1/public-profiles");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Erreur lors de la récupération des profils publics");
  });
});
