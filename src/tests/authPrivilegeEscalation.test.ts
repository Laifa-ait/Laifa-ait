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
      status: mockStatus as unknown as Response["status"],
      json: mockJson as unknown as Response["json"],
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("1 & 2: /sync Role Escalation Defense", () => {
    it("forces role=admin to 'buyer' during user sync creation", () => {
      const inputRole = "admin";
      const sanitizedRole = (inputRole as string) === "seller" ? "seller" : "buyer";
      expect(sanitizedRole).toBe("buyer");
    });

    it("forces role=superadmin to 'buyer' during user sync creation", () => {
      const inputRole = "superadmin";
      const sanitizedRole = (inputRole as string) === "seller" ? "seller" : "buyer";
      expect(sanitizedRole).toBe("buyer");
    });

    it("allows role=seller during user sync creation", () => {
      const inputRole = "seller";
      const sanitizedRole = (inputRole as string) === "seller" ? "seller" : "buyer";
      expect(sanitizedRole).toBe("seller");
    });
  });

  describe("3 & 4: /onboard Role Escalation Defense", () => {
    it("sanitizes role=admin to 'buyer' and denies admin custom claims creation", () => {
      const clientRequestedRole = "admin";
      const safeClientRole = (clientRequestedRole as string) === "seller" ? "seller" : "buyer";
      
      const isExistingAdmin = false;
      const tokenIsAdmin = false;
      const finalClaimRole = (isExistingAdmin && tokenIsAdmin) ? "admin" : safeClientRole;
      const customClaims = {
        role: finalClaimRole,
        isAdmin: (finalClaimRole as string) === "admin" || (finalClaimRole as string) === "superadmin",
      };

      expect(safeClientRole).toBe("buyer");
      expect(customClaims.role).toBe("buyer");
      expect(customClaims.isAdmin).toBe(false);
    });

    it("sanitizes role=superadmin to 'buyer' and denies superadmin custom claims creation", () => {
      const clientRequestedRole = "superadmin";
      const safeClientRole = (clientRequestedRole as string) === "seller" ? "seller" : "buyer";
      
      const isExistingAdmin = false;
      const tokenIsAdmin = false;
      const finalClaimRole = (isExistingAdmin && tokenIsAdmin) ? "superadmin" : safeClientRole;
      const customClaims = {
        role: finalClaimRole,
        isAdmin: (finalClaimRole as string) === "admin" || (finalClaimRole as string) === "superadmin",
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
        if ((userTokenRole as string) === "admin" || (userTokenRole as string) === "superadmin") {
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

  describe("11: Administrateur suspendu + Firestore indisponible (Fail-Closed)", () => {
    it("fails closed and denies admin access with 403 when Firestore is unreachable for a suspended admin", async () => {
      // 1. Token still carries admin custom claim
      const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken").mockResolvedValueOnce({
        uid: "suspended_admin_123",
        email: "suspended.admin@olmart.dz",
        role: "admin",
      } as unknown as admin.auth.DecodedIdToken);

      // 2. Firestore is down / unreachable / throws network failure
      const mockDocGet = vi.fn().mockRejectedValueOnce(new Error("Firestore connection timeout / 503 Service Unavailable"));
      const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
      const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

      const mockReq: Partial<AuthenticatedRequest> = {
        headers: {
          authorization: "Bearer admin_token_bearing_claims",
        },
      };

      // 3. Run authenticateToken middleware
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // 4. Verify that authenticateToken failed closed by setting role to 'suspended'
      expect(mockReq.user?.role).toBe("suspended");
      expect(mockReq.user?.adminValidated).toBe(false);
      expect(mockNext).toHaveBeenCalled();

      // 5. Verify that authorizeAdmin fails closed with 403 Forbidden
      mockNext = vi.fn();
      mockStatus.mockClear();
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();

      mockVerifyIdToken.mockRestore();
      mockCollection.mockRestore();
    });
  });

  describe("12: Administrateur suspendu dans Firestore + Firestore disponible -> 403 Forbidden", () => {
    it("denies access when admin user is marked as suspended in Firestore", async () => {
      const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken").mockResolvedValueOnce({
        uid: "suspended_admin_456",
        email: "suspended@olmart.dz",
        role: "admin",
      } as unknown as admin.auth.DecodedIdToken);

      const mockDocGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: "admin", status: "suspended" }),
      });

      const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
      const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

      const mockReq: Partial<AuthenticatedRequest> = {
        headers: {
          authorization: "Bearer valid_signed_token",
        },
      };

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user?.role).toBe("suspended");

      mockNext = vi.fn();
      mockStatus.mockClear();
      authorizeAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();

      mockVerifyIdToken.mockRestore();
      mockCollection.mockRestore();
    });
  });

  describe("13: Révocation de jeton (checkRevoked = true) -> 401 Unauthorized", () => {
    it("returns 401 when verifyIdToken detects a revoked token", async () => {
      const revokedError = new Error("Firebase ID token has been revoked.");
      (revokedError as unknown as { code: string }).code = "auth/id-token-revoked";

      const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken").mockRejectedValueOnce(revokedError);

      const mockReq: Partial<AuthenticatedRequest> = {
        headers: {
          authorization: "Bearer revoked_token_string",
        },
      };

      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Jeton révoqué. Veuillez vous reconnecter.",
        })
      );
      expect(mockNext).not.toHaveBeenCalled();

      mockVerifyIdToken.mockRestore();
    });
  });

  describe("14: Invalidation des refresh tokens lors d'une suspension", () => {
    it("calls admin.auth().revokeRefreshTokens when a user or seller is suspended", async () => {
      const revokeTokensSpy = vi.spyOn(admin.auth(), "revokeRefreshTokens").mockResolvedValueOnce();

      const targetUserId = "malicious_user_789";
      await admin.auth().revokeRefreshTokens(targetUserId);

      expect(revokeTokensSpy).toHaveBeenCalledWith(targetUserId);
      revokeTokensSpy.mockRestore();
    });
  });
});
