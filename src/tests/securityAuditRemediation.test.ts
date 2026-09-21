import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../middlewares/auth";
import { admin, db } from "../config/firebase-admin";
import { corsOptions } from "../middlewares/security";
import { sanitizeHTML } from "../utils/sanitization";
import { Response, NextFunction } from "express";
import { CollectionReference } from "firebase-admin/firestore";

describe("Security Audit Remediation Verification Suite (F-1 to F-6)", () => {
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockImplementation(() => mockRes as Response);
    mockRes = {
      status: mockStatus as unknown as Response["status"],
      json: mockJson as unknown as Response["json"],
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("F-1: Admin Cookie Authentication (admin_session)", () => {
    it("successfully authenticates admin when idToken is passed via admin_session httpOnly cookie", async () => {
      const mockDecodedToken = {
        uid: "admin_user_1",
        email: "admin@olmart.dz",
        role: "admin",
      };

      vi.spyOn(admin.auth(), "verifyIdToken").mockResolvedValue(mockDecodedToken as unknown as admin.auth.DecodedIdToken);
      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ role: "admin", status: "active" }),
          }),
        }),
      } as unknown as CollectionReference);

      const req = {
        headers: {},
        cookies: {
          admin_session: "valid_admin_jwt_cookie_token",
        },
      } as unknown as AuthenticatedRequest;

      await authenticateToken(req, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user?.uid).toBe("admin_user_1");
      expect(req.user?.role).toBe("admin");
      expect(req.user?.adminValidated).toBe(true);
    });

    it("rejects request with 401 when neither Authorization header nor admin_session cookie is present", async () => {
      const req = {
        headers: {},
        cookies: {},
      } as unknown as AuthenticatedRequest;

      await authenticateToken(req, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("Authentification requise") }));
    });
  });

  describe("F-2: Video Stream CORS Wildcard Remediation", () => {
    it("corsOptions rejects unauthorized arbitrary origins", () => {
      let allowed: boolean | undefined = undefined;
      const testOrigin = "https://malicious-attacker.com";

      if (typeof corsOptions.origin === "function") {
        corsOptions.origin(testOrigin, (err: Error | null, allow?: boolean) => {
          expect(err).toBeNull();
          allowed = allow;
        });
      }

      expect(allowed).toBe(false);
    });

    it("corsOptions allows legitimate production olmart origins", () => {
      let allowed: boolean | undefined = undefined;
      const validOrigin = "https://olmart.dz";

      if (typeof corsOptions.origin === "function") {
        corsOptions.origin(validOrigin, (err: Error | null, allow?: boolean) => {
          expect(err).toBeNull();
          allowed = allow;
        });
      }

      expect(allowed).toBe(true);
    });
  });

  describe("F-3: dangerouslySetInnerHTML Sanitization", () => {
    it("DOMPurify strips malicious XSS payload including onerror handlers and javascript URLs", () => {
      const dirtyHtml = '<p>Order review</p><img src="x" onerror="alert(document.domain)" /><a href="javascript:void(0)">Link</a>';
      const cleanHtml = sanitizeHTML(dirtyHtml);

      expect(cleanHtml).not.toContain("onerror");
      expect(cleanHtml).not.toContain("alert");
      expect(cleanHtml).not.toContain("javascript:");
      expect(cleanHtml).toContain("<p>Order review</p>");
    });
  });

  describe("F-6: Production Swagger Documentation Protection", () => {
    it("requires administrator privileges for sensitive endpoints", () => {
      const req = {
        user: {
          uid: "buyer_1",
          role: "buyer",
          adminValidated: false,
        },
      } as unknown as AuthenticatedRequest;

      authorizeAdmin(req, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(403);
    });
  });
});
