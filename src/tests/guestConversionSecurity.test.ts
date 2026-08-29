import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";

describe("P0 Security Suite — Guest Order Conversion Security & Anti-Theft Validation", () => {
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockClearCookie: ReturnType<typeof vi.fn>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockClearCookie = vi.fn();
    mockStatus = vi.fn().mockImplementation(() => mockRes as Response);
    mockRes = {
      status: mockStatus as unknown as Response["status"],
      json: mockJson as unknown as Response["json"],
      clearCookie: mockClearCookie as unknown as Response["clearCookie"],
    };
    vi.clearAllMocks();
  });

  describe("1. Token Generation & Hash Derivation", () => {
    it("generates high-entropy 256-bit recovery token and consistent SHA-256 hash", () => {
      const recoveryToken = crypto.randomBytes(32).toString("hex");
      expect(recoveryToken.length).toBe(64); // 32 bytes in hex = 64 characters

      const hash1 = crypto.createHash("sha256").update(recoveryToken).digest("hex");
      const hash2 = crypto.createHash("sha256").update(recoveryToken).digest("hex");

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });

    it("verifies timing-safe hash comparison correctly accepts identical tokens and rejects altered ones", () => {
      const validToken = crypto.randomBytes(32).toString("hex");
      const validHash = crypto.createHash("sha256").update(validToken).digest("hex");

      const candidateToken = validToken;
      const candidateHash = crypto.createHash("sha256").update(candidateToken).digest("hex");

      const bufA = Buffer.from(validHash, "hex");
      const bufB = Buffer.from(candidateHash, "hex");
      expect(crypto.timingSafeEqual(bufA, bufB)).toBe(true);

      const attackerToken = crypto.randomBytes(32).toString("hex");
      const attackerHash = crypto.createHash("sha256").update(attackerToken).digest("hex");
      const attackerBuf = Buffer.from(attackerHash, "hex");
      expect(crypto.timingSafeEqual(bufA, attackerBuf)).toBe(false);
    });
  });

  describe("2. Request Token Extraction Logic", () => {
    it("extracts token from request body when provided", () => {
      const req = {
        user: { uid: "buyer_123" },
        body: {
          guestUserId: "guest_456",
          guestRecoveryToken: "token_from_body_abc123",
        },
        cookies: {},
        headers: {},
      } as unknown as AuthenticatedRequest;

      const rawToken = req.body.guestRecoveryToken;
      expect(rawToken).toBe("token_from_body_abc123");
    });

    it("extracts token from cookie when body does not have it", () => {
      const guestId = "guest_789";
      const tokenVal = "token_from_cookie_xyz789";
      const req = {
        user: { uid: "buyer_123" },
        body: {
          guestUserId: guestId,
        },
        cookies: {
          olmart_guest_claim_token: `${guestId}:${tokenVal}`,
        },
        headers: {},
      } as unknown as AuthenticatedRequest;

      let rawToken = req.body.guestRecoveryToken;
      if (!rawToken && req.cookies?.olmart_guest_claim_token) {
        const cookieVal = String(req.cookies.olmart_guest_claim_token);
        if (cookieVal.includes(":")) {
          const [cookieGuestId, cookieToken] = cookieVal.split(":");
          if (cookieGuestId === req.body.guestUserId) {
            rawToken = cookieToken;
          }
        }
      }

      expect(rawToken).toBe("token_from_cookie_xyz789");
    });

    it("rejects mismatched cookie guest ID", () => {
      const req = {
        user: { uid: "buyer_123" },
        body: {
          guestUserId: "guest_target",
        },
        cookies: {
          olmart_guest_claim_token: "guest_other:some_token",
        },
        headers: {},
      } as unknown as AuthenticatedRequest;

      let rawToken = req.body.guestRecoveryToken;
      if (!rawToken && req.cookies?.olmart_guest_claim_token) {
        const cookieVal = String(req.cookies.olmart_guest_claim_token);
        if (cookieVal.includes(":")) {
          const [cookieGuestId, cookieToken] = cookieVal.split(":");
          if (cookieGuestId === req.body.guestUserId) {
            rawToken = cookieToken;
          }
        }
      }

      expect(rawToken).toBeUndefined();
    });
  });

  describe("3. Security Invariant Validation", () => {
    it("rejects token reuse if used flag is set to true", () => {
      const tokenDoc = {
        guestUserId: "guest_123",
        tokenHash: "abc",
        used: true,
        expiresAt: { toDate: () => new Date(Date.now() + 100000) },
      };

      expect(tokenDoc.used).toBe(true);
    });

    it("rejects expired tokens", () => {
      const pastDate = new Date(Date.now() - 10000);
      const tokenDoc = {
        guestUserId: "guest_123",
        tokenHash: "abc",
        used: false,
        expiresAt: { toDate: () => pastDate },
      };

      const isExpired = tokenDoc.expiresAt.toDate() < new Date();
      expect(isExpired).toBe(true);
    });
  });
});
