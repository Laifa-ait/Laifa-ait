import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { Request, Response, NextFunction } from "express";
import adminSeedRouter from "../domains/admin/routes/adminSeed.routes";

// Mock middlewares
vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: Request & { user?: { uid: string; role: string } }, _res: Response, next: NextFunction) => {
    if (req.headers.authorization === "Bearer valid-admin-token") {
      req.user = { uid: "admin-seed-tester", role: "admin" };
      return next();
    }
    return _res.status(401).json({ error: "Unauthorized" });
  },
  authorizeAdmin: (req: Request & { user?: { uid: string; role: string } }, res: Response, next: NextFunction) => {
    if (req.user?.role === "admin") return next();
    return res.status(403).json({ error: "Forbidden" });
  },
  require2FA: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

const mockBatch = {
  set: vi.fn(),
  delete: vi.fn(),
  commit: vi.fn().mockResolvedValue(true),
};

const mockGet = vi.fn();

vi.mock("../config/firebase-admin", () => ({
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => "mock-timestamp",
      },
    },
  },
  db: {
    batch: () => mockBatch,
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        get: mockGet,
        where: vi.fn(() => ({
          get: mockGet,
        })),
      })),
      doc: vi.fn((id?: string) => ({ id: id || "generated-id" })),
      add: vi.fn().mockResolvedValue({ id: "audit-1" }),
    })),
  },
}));

describe("Admin Seed Routes Security & Logic", () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api/v1", adminSeedRouter);
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/admin/seed/status");
    expect(res.status).toBe(401);
  });

  it("returns seed status when authenticated as admin", async () => {
    mockGet.mockResolvedValueOnce({ docs: [{ id: "prod-1" }, { id: "prod-2" }] });
    mockGet.mockResolvedValueOnce({ docs: [{ id: "prod-2" }, { id: "prod-3" }] });

    const res = await request(app)
      .get("/api/v1/admin/seed/status")
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(3);
  });

  it("clears seed products in batches via Admin SDK", async () => {
    mockGet.mockResolvedValue({
      docs: [{ id: "seed-p1" }, { id: "seed-p2" }],
    });

    const res = await request(app)
      .post("/api/v1/admin/seed/clear")
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deletedCount).toBe(2);
    expect(mockBatch.delete).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalled();
  });
});
