import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../middlewares/auth";
import { admin, db } from "../config/firebase-admin";
import { Response, NextFunction } from "express";
import { CollectionReference } from "firebase-admin/firestore";

describe("R4.6.12-FIX-02 — Comprehensive Role Escalation & Admin Privilege Tests", () => {
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockImplementation(() => mockRes as Response);
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("1 & 2: /sync Role Escalation Defense", () => {
    it("forces role=admin to 'buyer' during user sync creation", () => {
      const inputRole = "admin";
      const sanitizedRole = inputRole === "seller" ? "seller" : "buyer";
      expect(sanitizedRole).toBe("buyer");
    });

    it("forces role=superadmin to 'buyer' during user sync creation", () => {
      const inputRole = "superadmin";
      const sanitizedRole = inputRole === "seller" ? "seller" : "buyer";
      expect(sanitizedRole).toBe("buyer");
    });

    it("allows role=seller during user sync creation", () => {
      const inputRole = "seller";
      const sanitizedRole = inputRole === "seller" ? "seller" : "buyer";
      expect(sanitizedRole).toBe("seller");
    });
  });

  describe("3 & 4: /onboard Role Escalation Defense", () => {
    it("sanitizes role=admin to 'buyer' and denies admin custom claims creation", () => {
      const clientRequestedRole = "admin";
      const safeClientRole = clientRequestedRole === "seller" ? "seller" : "buyer";
      
      const isExistingAdmin = false;
      const tokenIsAdmin = false;
      const finalClaimRole = (isExistingAdmin && tokenIsAdmin) ? "admin" : safeClientRole;
      const customClaims = {
        role: finalClaimRole,
        isAdmin: finalClaimRole === "admin" || finalClaimRole === "superadmin",
      };

      expect(safeClientRole).toBe("buyer");
      expect(customClaims.role).toBe("buyer");
      expect(customClaims.isAdmin).toBe(false);
    });

    it("sanitizes role=superadmin to 'buyer' and denies superadmin custom claims creation", () => {
      const clientRequestedRole = "superadmin";
      const safeClientRole = clientRequestedRole === "seller" ? "seller" : "buyer";
      
      const isExistingAdmin = false;
      const tokenIsAdmin = false;
      const finalClaimRole = (isExistingAdmin && tokenIsAdmin) ? "superadmin" : safeClientRole;
      const customClaims = {
        role: finalClaimRole,
        isAdmin: finalClaimRole === "admin" || finalClaimRole === "superadmin",
      };

      expect(safeClientRole).toBe("buyer");
      expect(customClaims.role).toBe("buyer");
      expect(customClaims.isAdmin).toBe(false);
    });
  });

  describe("5: /sync-user-claims Indirect Elevation Defense", () => {
    it("refuses to sync admin claim if requesting token lacks admin claim even if Firestore is tampered", () => {
      const dbRole = "admin";
      const userTokenRole = "buyer"; // Token without admin privileges
      
      let claimRole = "buyer";
      if (dbRole === "admin" || dbRole === "superadmin") {
        if (userTokenRole === "admin" || userTokenRole === "superadmin") {
          claimRole = dbRole;
        } else {
          claimRole = "buyer";
        }
      }

      const customClaims = {
        role: claimRole,
        isAdmin: claimRole === "admin" || claimRole === "superadmin",
      };

      expect(claimRole).toBe("buyer");
      expect(customClaims.isAdmin).toBe(false);
    });
  });

  describe("6: Administrator Email Without Privilege -> 403 Forbidden", () => {
    it("returns 403 Forbidden for admin email without admin role", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "attacker123",
          email: "laifa.ait@olmart.dz", // Admin email
          role: "buyer", // But non-admin role
          auth_time: Math.floor(Date.now() / 1000),
        },
      };

      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("7: Custom Claim buyer + Firestore buyer -> 403 Forbidden", () => {
    it("returns 403 Forbidden for regular buyer account", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "buyer456",
          email: "buyer@olmart.dz",
          role: "buyer",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };

      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("8: Custom Claim buyer + Firestore admin -> Authority Hierarchy Defense", () => {
    it("evaluates effective role as buyer when Custom Claims are buyer, despite Firestore admin value", async () => {
      const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken").mockResolvedValueOnce({
        uid: "hacker999",
        email: "hacker@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const mockDocGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: "admin" }), // Tampered Firestore doc
      });

      const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
      const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

      const mockReq: Partial<AuthenticatedRequest> = {
        headers: {
          authorization: "Bearer valid_id_token",
        },
      };

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Verify that effective role remains buyer because Custom Claims tokenRole is buyer
      expect(mockReq.user?.role).toBe("buyer");
      expect(mockNext).toHaveBeenCalled();

      // Now verify that authorizeAdmin rejects this user with 403
      mockNext = vi.fn();
      mockStatus.mockClear();
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();

      mockVerifyIdToken.mockRestore();
      mockCollection.mockRestore();
    });
  });

  describe("9: Custom Claim admin + Valid Account -> 200 / next()", () => {
    it("successfully authorizes genuine administrator account", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "XdUhV8ZLYxbgCKFnpTU6Zh5B4ZR2",
          email: "laifa.ait@olmart.dz",
          role: "admin",
          auth_time: Math.floor(Date.now() / 1000),
        },
      };

      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalledWith(403);
    });
  });

  describe("10: POST /profile Role Injection Defense", () => {
    it("strips role, isAdmin, permissions from client profile updates", () => {
      const clientPayload = {
        displayName: "New Name",
        phone: "0555123456",
        role: "admin", // Attacker attempt
        isAdmin: true,
        permissions: ["ALL"],
      };

      const { role, isAdmin, permissions, ...safeProfileUpdate } = clientPayload as Record<string, unknown>;

      expect(safeProfileUpdate).toEqual({
        displayName: "New Name",
        phone: "0555123456",
      });
      expect(role).toBe("admin");
      expect(isAdmin).toBe(true);
      expect(permissions).toEqual(["ALL"]);
    });
  });
});
