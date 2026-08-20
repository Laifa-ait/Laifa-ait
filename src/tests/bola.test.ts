import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorizeAdmin, authorizeSeller } from "../middlewares/auth";
import { NextFunction, Response } from "express";

describe("BOLA and RBAC Authorization Security Policies", () => {
  let mockStatus: any;
  let mockJson: any;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
    };
    mockNext = vi.fn();
  });

  describe("authorizeAdmin Middleware Validation", () => {
    it("A. rejects unauthenticated user with 403 Forbidden", () => {
      const mockReq: any = {};
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("B. rejects buyer role with 403 Forbidden", () => {
      const mockReq: any = {
        user: {
          uid: "buyer123",
          email: "buyer@example.com",
          role: "buyer",
        },
      };
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("C. rejects seller role with 403 Forbidden", () => {
      const mockReq: any = {
        user: {
          uid: "seller123",
          email: "seller@example.com",
          role: "seller",
        },
      };
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("D. rejects authenticated user with missing/invalid admin claims with 403 Forbidden", () => {
      const mockReq: any = {
        user: {
          uid: "user123",
          email: "user@example.com",
          // no role or claims
        },
      };
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("E. allows authorized administrator through to the controller", () => {
      const mockReq: any = {
        user: {
          uid: "admin123",
          email: "admin@example.com",
          role: "admin",
        },
      };
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("F. allows authorized superadministrator through to the controller", () => {
      const mockReq: any = {
        user: {
          uid: "superadmin123",
          email: "super@example.com",
          role: "superadmin",
        },
      };
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("G. rejects whitelisted admin email if role claim/database role is buyer/absent with 403 Forbidden", () => {
      const mockReq: any = {
        user: {
          uid: "whitelisted123",
          email: "laifa.ait@gmail.com",
          role: "buyer",
        },
      };
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Privilèges Administrateur requis") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("H. blocks privilege escalation via manipulation of req.body client properties", () => {
      // Body-level role=admin or isAdmin=true must not be trusted
      const mockReq: any = {
        user: {
          uid: "attacker123",
          email: "attacker@example.com",
          role: "buyer",
        },
        body: {
          role: "admin",
          isAdmin: true,
        },
      };
      authorizeAdmin(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("authorizeSeller Middleware Validation", () => {
    it("rejects non-seller non-admin user with 403 Forbidden", () => {
      const mockReq: any = {
        user: {
          uid: "buyer123",
          email: "buyer@example.com",
          role: "buyer",
        },
      };
      authorizeSeller(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("allows seller user through", () => {
      const mockReq: any = {
        user: {
          uid: "seller123",
          email: "seller@example.com",
          role: "seller",
        },
      };
      authorizeSeller(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("allows admin user to access seller routes", () => {
      const mockReq: any = {
        user: {
          uid: "admin123",
          email: "admin@example.com",
          role: "admin",
        },
      };
      authorizeSeller(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
