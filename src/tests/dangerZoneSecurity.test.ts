import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express, { Express, Request, Response, NextFunction } from "express";

let mockAuthUser: { uid: string; role: string } | null = null;

// Mock middlewares/auth to test route-level and auth-level behavior reliably
vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: Request, res: Response, next: NextFunction) => {
    if (!mockAuthUser) {
      return res.status(401).json({ error: "Authentification requise. Jeton manquant." });
    }
    (req as unknown as { user: { uid: string; role: string } }).user = mockAuthUser;
    next();
  },
  authorizeAdmin: (req: Request, res: Response, next: NextFunction) => {
    const user = (req as unknown as { user?: { uid: string; role: string } }).user;
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ error: "Accès refusé. Privilèges Administrateur requis." });
    }
    next();
  },
  require2FA: (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
}));

// Create mock database references for non-destructive security testing
vi.mock("../config/firebase-admin", () => {
  const auditLogsAddMock = vi.fn().mockResolvedValue({ id: "mock_audit_log_id" });
  const dangerZoneGetMock = vi.fn().mockResolvedValue({
    exists: false,
    data: () => null,
  });

  return {
    admin: {
      firestore: {
        FieldValue: {
          serverTimestamp: () => new Date(),
        },
      },
    },
    db: {
      collection: (name: string) => {
        return {
          add: auditLogsAddMock,
          get: vi.fn().mockResolvedValue({ docs: [] }),
          doc: (docName: string) => ({
            get: docName === "danger_zone" ? dangerZoneGetMock : vi.fn().mockResolvedValue({ exists: false }),
          }),
        };
      },
      batch: () => ({
        delete: vi.fn(),
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue([]),
      }),
    },
  };
});

import adminSystemRouter from "../domains/admin/routes/adminSystem.routes";

describe("DANGER_ZONE_WIPE Security Suite (P1-02 Verification)", () => {
  let app: Express;
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.DANGER_ZONE_SECRET;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1", adminSystemRouter);
    mockAuthUser = null;
    process.env.NODE_ENV = "test";
    process.env.DANGER_ZONE_SECRET = "TEST_SECRET_KEY_DZ_SECURE_987";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.DANGER_ZONE_SECRET = originalSecret;
    mockAuthUser = null;
    vi.clearAllMocks();
  });

  it("blocks unauthenticated requests with HTTP 401", async () => {
    mockAuthUser = null;
    const res = await request(app)
      .post("/api/v1/admin/danger-zone-wipe")
      .send({ confirmationCode: "TEST_SECRET_KEY_DZ_SECURE_987" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Authentification requise/);
  });

  it("blocks non-admin users with HTTP 403", async () => {
    mockAuthUser = { uid: "buyer_456", role: "buyer" };
    const res = await request(app)
      .post("/api/v1/admin/danger-zone-wipe")
      .send({ confirmationCode: "TEST_SECRET_KEY_DZ_SECURE_987" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Privilèges Administrateur requis/);
  });

  it("strictly blocks requests in production environment with HTTP 403", async () => {
    process.env.NODE_ENV = "production";
    mockAuthUser = { uid: "admin_uid_123", role: "admin" };

    const res = await request(app)
      .post("/api/v1/admin/danger-zone-wipe")
      .send({ confirmationCode: "TEST_SECRET_KEY_DZ_SECURE_987" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/désactivée en environnement de production/);
  });

  it("blocks requests when DANGER_ZONE_SECRET is not configured on the server", async () => {
    delete process.env.DANGER_ZONE_SECRET;
    mockAuthUser = { uid: "admin_uid_123", role: "admin" };

    const res = await request(app)
      .post("/api/v1/admin/danger-zone-wipe")
      .send({ confirmationCode: "ANY_SECRET" });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/DANGER_ZONE_SECRET non configuré/);
  });

  it("rejects requests with invalid or incorrect confirmation code", async () => {
    mockAuthUser = { uid: "admin_uid_123", role: "admin" };

    const res = await request(app)
      .post("/api/v1/admin/danger-zone-wipe")
      .send({ confirmationCode: "WRONG_CONFIRMATION_CODE" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Code de confirmation de sécurité invalide/);
  });

  it("rejects legacy hardcoded confirmation string WIPE_ALL_DATA_CONFIRM_DZ_2026", async () => {
    mockAuthUser = { uid: "admin_uid_123", role: "admin" };

    const res = await request(app)
      .post("/api/v1/admin/danger-zone-wipe")
      .send({ confirmationCode: "WIPE_ALL_DATA_CONFIRM_DZ_2026" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Code de confirmation de sécurité invalide/);
  });

  it("allows safe operation execution in non-production when all criteria are met", async () => {
    mockAuthUser = { uid: "admin_uid_123", role: "admin" };

    const res = await request(app)
      .post("/api/v1/admin/danger-zone-wipe")
      .send({ confirmationCode: "TEST_SECRET_KEY_DZ_SECURE_987" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Réinitialisation des données de test effectuée avec succès/);
  });
});
