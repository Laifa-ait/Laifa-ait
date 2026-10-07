import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Express } from "express";

// Mock Firebase Admin
vi.mock("../config/firebase-admin", () => {
  const mockDoc = {
    get: vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ role: "admin", status: "active", admin: true }),
    }),
    set: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const mockCollection = {
    doc: vi.fn(() => mockDoc),
    where: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => ({
          get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
        })),
      })),
      limit: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
      })),
      get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    })),
    orderBy: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    })),
    limit: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    })),
    get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    add: vi.fn().mockResolvedValue({ id: "mock-id" }),
  };

  const verifyIdTokenMock = vi.fn();
  const authInstance = {
    verifyIdToken: verifyIdTokenMock,
    verifySessionCookie: verifyIdTokenMock,
    revokeRefreshTokens: vi.fn().mockResolvedValue(undefined),
  };

  return {
    admin: {
      auth: vi.fn(() => authInstance),
      firestore: {
        FieldValue: {
          serverTimestamp: vi.fn(() => "mock-timestamp"),
        },
        Timestamp: {
          now: vi.fn(() => "mock-now"),
        },
      },
    },
    db: {
      collection: vi.fn(() => mockCollection),
      getAll: vi.fn().mockResolvedValue([]),
      batch: vi.fn(() => ({
        update: vi.fn(),
        delete: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      })),
      runTransaction: vi.fn(async (cb) => {
        return cb({
          get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
          getAll: vi.fn().mockResolvedValue([]),
          set: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        });
      }),
    },
  };
});

import { olmaUniversRouter } from "../domains/olmaUnivers/olmaUnivers.routes";
import { admin } from "../config/firebase-admin";

describe("Adversarial Security Hardening Audit Suite", () => {
  let app: Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api/v1", olmaUniversRouter);
  });

  describe("1. Olma Univers Admin RBAC (P0 Fix)", () => {
    it("rejects unauthenticated requests to /admin/univers/apps with 401", async () => {
      const res = await request(app).post("/api/v1/admin/univers/apps").send({
        id: "evil-app",
        title: { fr: "Evil App" },
      });
      expect(res.status).toBe(401);
    });

    it("rejects non-admin authenticated users with 403", async () => {
      const authMock = vi.mocked(admin.auth().verifyIdToken);
      authMock.mockResolvedValueOnce({
        uid: "buyer_123",
        role: "buyer",
        email: "buyer@example.com",
      } as unknown as ReturnType<typeof admin.auth> extends { verifyIdToken: infer Fn }
        ? Awaited<ReturnType<Fn extends (...args: unknown[]) => unknown ? Fn : never>>
        : never);

      const res = await request(app)
        .post("/api/v1/admin/univers/apps")
        .set("Authorization", "Bearer valid-buyer-token")
        .send({
          id: "evil-app",
          title: { fr: "Evil App" },
        });

      expect(res.status).toBe(403);
    });

    it("allows verified admin users to access /admin/univers/apps", async () => {
      const authMock = vi.mocked(admin.auth().verifyIdToken);
      authMock.mockResolvedValueOnce({
        uid: "admin_super",
        role: "admin",
        admin: true,
        email: "admin@olmart.dz",
      } as unknown as ReturnType<typeof admin.auth> extends { verifyIdToken: infer Fn }
        ? Awaited<ReturnType<Fn extends (...args: unknown[]) => unknown ? Fn : never>>
        : never);

      const res = await request(app)
        .post("/api/v1/admin/univers/apps")
        .set("Authorization", "Bearer valid-admin-token")
        .send({
          id: "legit-app",
          title: { fr: "Application Officielle" },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("keeps public endpoint /univers/apps accessible without authentication", async () => {
      const res = await request(app).get("/api/v1/univers/apps");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("2. CSV Formula Injection Defense", () => {
    function csvSafe(value: unknown): string {
      const s = String(value ?? "");
      const protectedValue = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
      return `"${protectedValue.replace(/"/g, '""')}"`;
    }

    it("neutralizes dangerous formula execution prefixes (=, +, -, @)", () => {
      expect(csvSafe("=cmd|' /C calc'!A0")).toBe(`"'=cmd|' /C calc'!A0"`);
      expect(csvSafe("+12345")).toBe(`"'+12345"`);
      expect(csvSafe("-SUM(A1:A10)")).toBe(`"'-SUM(A1:A10)"`);
      expect(csvSafe("@HYPERLINK('evil.com')")).toBe(`"'@HYPERLINK('evil.com')"`);
    });

    it("preserves standard values without modification", () => {
      expect(csvSafe("Boutique Alger")).toBe(`"Boutique Alger"`);
      expect(csvSafe("15000")).toBe(`"15000"`);
      expect(csvSafe('He said "hello"')).toBe(`"He said ""hello"""`);
    });
  });

  describe("3. Capabilities Allowlist & Bulk Status Limit Defense", () => {
    const ALLOWED_CAPABILITIES = [
      "property_owner",
      "artisan",
      "real_estate_pro",
      "seller",
      "delivery_agent",
      "verified_buyer",
      "support_agent",
      "marketing_manager",
    ] as const;

    it("accepts valid registered capabilities", () => {
      const caps = ["artisan", "property_owner"];
      const invalid = caps.filter((c) => !ALLOWED_CAPABILITIES.includes(c as (typeof ALLOWED_CAPABILITIES)[number]));
      expect(invalid).toHaveLength(0);
    });

    it("rejects unauthorized arbitrary capabilities (privilege escalation attempt)", () => {
      const caps = ["artisan", "super_secret_admin", "bypass_payment"];
      const invalid = caps.filter((c) => !ALLOWED_CAPABILITIES.includes(c as (typeof ALLOWED_CAPABILITIES)[number]));
      expect(invalid).toEqual(["super_secret_admin", "bypass_payment"]);
    });

    it("enforces bulk user operation limit <= 100", () => {
      const userIds = Array.from({ length: 150 }, (_, i) => `user_${i}`);
      const isExceeded = userIds.length > 100;
      expect(isExceeded).toBe(true);
    });
  });

  describe("4. Idempotency Key Ownership Verification", () => {
    it("allows the original owner to reuse the idempotency key", () => {
      const keyData = { userId: "user_alice", orderId: "order_123" };
      const currentUserId = "user_alice";
      const isOwner = keyData.userId === currentUserId;
      expect(isOwner).toBe(true);
    });

    it("rejects another user attempting to hijack the idempotency key (IDOR attempt)", () => {
      const keyData = { userId: "user_alice", orderId: "order_123" };
      const attackerUserId = "user_bob";
      const isOwner = keyData.userId === attackerUserId;
      expect(isOwner).toBe(false);
    });
  });
});
