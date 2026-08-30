import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../../src/domains/home/services/settings.service", () => ({
  SettingsService: {
    getSettingById: vi.fn().mockImplementation(async (id: string) => {
      if (id === "megamenu") {
        return { categoriesData: [{ id: "cat1", title: "Électronique" }] };
      }
      return {};
    }),
    getCategoriesHierarchy: vi.fn().mockImplementation(async () => {
      return { "cat1": { subcategories: [] } };
    }),
  },
}));

vi.mock("../config/firebase-admin", () => {
  return {
    admin: {
      auth: () => ({
        verifyIdToken: vi.fn().mockImplementation(async (token: string) => {
          if (token === "valid-user-token") {
            return { uid: "user_bootstrap_123", email: "user@olmart.dz" };
          }
          throw new Error("Invalid token");
        }),
      }),
    },
    db: {
      collection: (collName: string) => {
        if (collName === "settings") {
          return {
            doc: (docId: string) => ({
              get: async () => ({
                exists: true,
                data: () => (docId === "megamenu" ? { categoriesData: [{ id: "cat1", title: "Électronique" }] } : { hierarchy: { "cat1": {} } }),
              }),
            }),
          };
        }
        if (collName === "products") {
          return {
            where: () => ({
              limit: () => ({
                get: async () => ({
                  docs: [
                    { id: "prod_1", data: () => ({ title: "Smartphone 5G", isPublished: true, price: 45000 }) },
                  ],
                }),
              }),
            }),
          };
        }
        if (collName === "users") {
          return {
            doc: (uid: string) => ({
              get: async () => ({
                exists: true,
                id: uid,
                data: () => ({ displayName: "Test User", email: "user@olmart.dz" }),
              }),
              collection: (subColl: string) => ({
                doc: (_subDoc: string) => ({
                  get: async () => ({
                    exists: true,
                    data: () => (subColl === "cart" ? { items: [{ id: "prod_1", quantity: 2 }] } : { items: ["prod_1"] }),
                  }),
                }),
              }),
            }),
          };
        }
        return {
          doc: () => ({ get: async () => ({ exists: false, data: () => null }) }),
        };
      },
    },
  };
});

import bootstrapRouter from "../domains/bootstrap/bootstrap.routes";

const testApp = express();
testApp.use(express.json());
testApp.use("/api/v1", bootstrapRouter);

describe("GET /api/v1/bootstrap Endpoint", () => {
  it("returns anonymous bootstrap data without authentication header", async () => {
    const res = await request(testApp).get("/api/v1/bootstrap");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.featuredProducts).toBeDefined();
    expect(res.body.data.profile).toBeNull();
    expect(res.body.data.cart).toEqual([]);
    expect(res.body.data.wishlist).toEqual([]);
  });

  it("returns user profile, cart, and wishlist when authenticated", async () => {
    const res = await request(testApp)
      .get("/api/v1/bootstrap")
      .set("Authorization", "Bearer valid-user-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile).toBeDefined();
    expect(res.body.data.profile.displayName).toBe("Test User");
    expect(res.body.data.cart).toEqual([{ id: "prod_1", quantity: 2 }]);
    expect(res.body.data.wishlist).toEqual(["prod_1"]);
  });
});

