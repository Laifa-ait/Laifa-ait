import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorizeAdmin, authorizeSeller, AuthenticatedRequest } from "../middlewares/auth";
import { NextFunction, Response } from "express";

describe("OLMART — BOLA and RBAC Authorization Security Policies", () => {
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
  });

  describe("authorizeAdmin Middleware Validation", () => {
    it("A. rejects unauthenticated user with 403 Forbidden", () => {
      const mockReq = {} as Partial<AuthenticatedRequest>;
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("B. rejects buyer role with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "buyer123",
          email: "client.buyer@olmart.dz",
          role: "buyer",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("C. rejects seller role with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "seller123",
          email: "seller.standard@olmart.dz",
          role: "seller",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("D. rejects authenticated user with missing/invalid admin claims with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "user123",
          email: "client.standard@olmart.dz",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("E. allows authorized administrator through to the controller", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "admin123",
          email: "admin.manager@olmart.dz",
          role: "admin",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("F. allows authorized superadministrator through to the controller", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "superadmin123",
          email: "admin.super@olmart.dz",
          role: "superadmin",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("G. rejects whitelisted admin email if role claim/database role is buyer/absent with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "whitelisted123",
          email: "laifa.ait@olmart.dz",
          role: "buyer",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("H. blocks privilege escalation via manipulation of req.body client properties", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "attacker123",
          email: "security.attacker@olmart.dz",
          role: "buyer",
          auth_time: Math.floor(Date.now() / 1000),
        },
        body: {
          role: "admin",
          isAdmin: true,
        },
      };
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("authorizeSeller Middleware Validation", () => {
    it("rejects non-seller non-admin user with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "buyer123",
          email: "client.buyer@olmart.dz",
          role: "buyer",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("allows active seller user through", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "seller123",
          email: "seller.standard@olmart.dz",
          role: "seller",
          status: "active",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("rejects pending_verification seller with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "seller_pending_123",
          email: "seller.pending@olmart.dz",
          role: "seller",
          status: "pending_verification",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("rejects suspended seller with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "seller_suspended_123",
          email: "seller.suspended@olmart.dz",
          role: "seller",
          status: "suspended",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("allows admin user to access seller routes", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "admin123",
          email: "admin.manager@olmart.dz",
          role: "admin",
          status: "active",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };
      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
