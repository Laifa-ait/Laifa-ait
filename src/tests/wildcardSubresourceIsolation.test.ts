import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock Firebase Admin so routing can be tested without a real Firestore instance
vi.mock("../config/firebase-admin", () => {
  return {
    admin: {
      auth: () => ({
        verifyIdToken: vi.fn(),
      }),
    },
    db: {
      collection: vi.fn().mockImplementation((colName: string) => ({
        doc: vi.fn().mockImplementation((docId: string) => ({
          get: vi.fn().mockResolvedValue({
            exists: true,
            id: docId,
            data: () => ({ activeUsers: 4200, collection: colName }),
          }),
          set: vi.fn().mockResolvedValue({}),
        })),
      })),
    },
  };
});

import coreRouter from "../domains/core.routes";

describe("Settings & Platform-Stats Wildcard Route Encapsulation Integration", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(coreRouter);
  });

  it("should forward /api/v1/platform-stats/trending_searches to public router and NOT treat it as document ID", async () => {
    const res = await request(app).get("/api/v1/platform-stats/trending_searches");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("terms");
    expect(Array.isArray(res.body.terms)).toBe(true);
  });

  it("should fetch legitimate platform-stats documents through wildcard route", async () => {
    const res = await request(app).get("/api/v1/platform-stats/december_stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("activeUsers", 4200);
  });

  it("should reject malicious paths or injection attempts on wildcard routes with 400 Bad Request", async () => {
    const res = await request(app).get("/api/v1/platform-stats/id;DROP_TABLE");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Format d'identifiant de ressource invalide");

    const resSettings = await request(app).get("/api/v1/settings/id%3Cscript%3E");
    expect(resSettings.status).toBe(400);
    expect(resSettings.body.error).toBe("Format d'identifiant de ressource invalide");
  });
});
