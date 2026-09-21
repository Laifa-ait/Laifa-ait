import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import orderTrackingRouter from "../domains/order/controllers/OrderTrackingController";

// Mocks
vi.mock("../config/firebase-admin", () => ({
  db: {
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
        update: vi.fn().mockResolvedValue({}),
      }),
    }),
  },
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => "MOCK_TIMESTAMP",
      },
    },
  },
}));

vi.mock("../middlewares/auth", () => ({
  authenticateToken: (_req: Request, _res: Response, next: NextFunction) => next(),
  authorizeSeller: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Finding 3 — Cron Secret Fail-Closed Security Tests", () => {
  let app: express.Express;
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(orderTrackingRouter);
  });

  afterEach(() => {
    if (originalCronSecret !== undefined) {
      process.env.CRON_SECRET = originalCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  it("1. Rejects with 401 if CRON_SECRET is unconfigured / undefined in environment (Fail-Closed)", async () => {
    delete process.env.CRON_SECRET;

    const res = await request(app)
      .post("/cron/sync-tracking")
      .set("x-cron-secret", "some-attempted-secret");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized cron access");
  });

  const TEST_CRON_SECRET = "TEST_ONLY_super_secret_cron_key_9988_32bytes";

  it("2. Rejects with 401 if no secret header or query param is provided", async () => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;

    const res = await request(app)
      .post("/cron/sync-tracking")
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized cron access");
  });

  it("3. Rejects with 401 if an invalid secret is provided", async () => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;

    const res = await request(app)
      .post("/cron/sync-tracking")
      .set("x-cron-secret", "TEST_ONLY_wrong_secret_token");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized cron access");
  });

  it("4. Accepts with 200 when valid secret is provided in x-cron-secret header", async () => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;

    const res = await request(app)
      .post("/cron/sync-tracking")
      .set("x-cron-secret", TEST_CRON_SECRET);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tracking sync complete");
  });

  it("5. Accepts with 200 when valid secret is provided via query parameter", async () => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;

    const res = await request(app)
      .post(`/cron/sync-tracking?secret=${TEST_CRON_SECRET}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
