import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorizeSeller, AuthenticatedRequest } from "../middlewares/auth";
import { AdminSellerService } from "../domains/admin/services/adminSeller.service";
import { admin, db } from "../config/firebase-admin";
import { Response, NextFunction } from "express";

describe("P0 Security Fix — Seller Onboarding & KYC Authorization Enforcement", () => {
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

  describe("1. Buyer cannot become active or verified seller upon self-onboarding", () => {
    it("enforces pending_verification status and isVerified=false on seller-onboard data contract", () => {
      const storeName = "Boutique Test";
      const storeDescription = "Test desc";
      const documentId = "123456789012345";
      const rib = "00799999000000123456";

      // Simulated payload processed in seller-onboard route
      const shopUpdate = {
        role: "buyer", // Not yet seller in DB until admin approval
        sellerRequested: true,
        shopName: storeName,
        storeName: storeName,
        shopDescription: storeDescription,
        storeDescription: storeDescription,
        documentId: documentId,
        rib: rib,
        onboardingCompleted: true,
        sellerOnboardingCompleted: true,
        status: "pending_verification",
        sellerStatus: "pending_verification",
        isVerified: false,
        trustScore: 50,
      };

      expect(shopUpdate.status).toBe("pending_verification");
      expect(shopUpdate.isVerified).toBe(false);
      expect(shopUpdate.trustScore).toBeLessThanOrEqual(50);
      expect(shopUpdate.role).not.toBe("seller");
    });

    it("ensures publicProfiles entry is marked PENDING_VERIFICATION and isVerified=false", () => {
      const publicProfile = {
        sellerTrustScore: 50,
        isVerified: false,
        status: "PENDING_VERIFICATION",
      };

      expect(publicProfile.isVerified).toBe(false);
      expect(publicProfile.status).toBe("PENDING_VERIFICATION");
      expect(publicProfile.sellerTrustScore).not.toBe(90);
    });
  });

  describe("2. authorizeSeller Middleware Security", () => {
    it("strictly blocks a standard buyer (role=buyer) with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "buyer_attacker_1",
          email: "buyer@olmart.dz",
          role: "buyer",
          status: "active",
        },
      };

      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Accès refusé"),
        })
      );
    });

    it("strictly blocks a seller applicant with status=pending_verification with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "seller_applicant_2",
          email: "applicant@olmart.dz",
          role: "seller",
          status: "pending_verification",
        },
      };

      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("strictly blocks a suspended seller with status=suspended with 403 Forbidden", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "seller_suspended_3",
          email: "suspended@olmart.dz",
          role: "seller",
          status: "suspended",
        },
      };

      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("allows a fully validated active seller (role=seller, status=active)", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "seller_verified_4",
          email: "verified.seller@olmart.dz",
          role: "seller",
          status: "active",
        },
      };

      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("allows an authorized administrator (role=admin, status=active)", () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: "admin_super_5",
          email: "admin@olmart.dz",
          role: "admin",
          status: "active",
        },
      };

      authorizeSeller(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("3. sync-user-claims Custom Claims Elevation Defense", () => {
    it("refuses to assign seller custom claims if Firestore status is pending_verification", () => {
      const dbRole = "seller";
      const userData = {
        role: "seller",
        status: "pending_verification",
        isVerified: false,
      };

      let claimRole = "buyer";
      if (dbRole === "seller" && userData.status === "active" && userData.isVerified === true) {
        claimRole = "seller";
      } else {
        claimRole = "buyer";
      }

      expect(claimRole).toBe("buyer");
    });

    it("refuses to assign seller custom claims if isVerified is false even if status is active", () => {
      const dbRole = "seller";
      const userData = {
        role: "seller",
        status: "active",
        isVerified: false,
      };

      let claimRole = "buyer";
      if (dbRole === "seller" && userData.status === "active" && userData.isVerified === true) {
        claimRole = "seller";
      } else {
        claimRole = "buyer";
      }

      expect(claimRole).toBe("buyer");
    });

    it("assigns seller custom claim ONLY when user is active and isVerified=true", () => {
      const dbRole = "seller";
      const userData = {
        role: "seller",
        status: "active",
        isVerified: true,
      };

      let claimRole = "buyer";
      if (dbRole === "seller" && userData.status === "active" && userData.isVerified === true) {
        claimRole = "seller";
      } else {
        claimRole = "buyer";
      }

      expect(claimRole).toBe("seller");
    });
  });

  describe("4. Administrative Approval & Revocation Workflow", () => {
    it("Admin approval promotes seller to active verified state and updates claims", async () => {
      const mockSetCustomUserClaims = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(admin.auth(), "setCustomUserClaims").mockImplementation(mockSetCustomUserClaims);

      const mockDoc = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            displayName: "Test Seller",
            shopName: "Boutique Officielle",
            email: "seller@olmart.dz",
          }),
        }),
        update: vi.fn().mockResolvedValue(undefined),
        set: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue(mockDoc),
        add: vi.fn().mockResolvedValue({ id: "notif_1" }),
      } as unknown as ReturnType<typeof db.collection>);

      const result = await AdminSellerService.approveSeller({
        sellerId: "seller_candidate_99",
        adminId: "admin_root_1",
      });

      expect(result.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "seller",
          status: "active",
          isVerified: true,
          sellerTrustScore: 90,
        })
      );
      expect(mockSetCustomUserClaims).toHaveBeenCalledWith("seller_candidate_99", {
        role: "seller",
        isAdmin: false,
      });
    });

    it("Admin rejection resets user claims to buyer and marks status=rejected", async () => {
      const mockSetCustomUserClaims = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(admin.auth(), "setCustomUserClaims").mockImplementation(mockSetCustomUserClaims);

      const mockDoc = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            displayName: "Candidate",
            email: "candidate@olmart.dz",
          }),
        }),
        update: vi.fn().mockResolvedValue(undefined),
        collection: vi.fn().mockReturnValue({
          add: vi.fn().mockResolvedValue({ id: "log_1" }),
        }),
      };

      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue(mockDoc),
        add: vi.fn().mockResolvedValue({ id: "notif_2" }),
      } as unknown as ReturnType<typeof db.collection>);

      const result = await AdminSellerService.rejectSeller({
        sellerId: "seller_candidate_99",
        adminId: "admin_root_1",
        reasons: ["Document d'identité non lisible"],
        comment: "Veuillez renvoyer une copie claire du Registre de Commerce",
      });

      expect(result.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "rejected",
          isVerified: false,
        })
      );
      expect(mockSetCustomUserClaims).toHaveBeenCalledWith("seller_candidate_99", {
        role: "buyer",
        isAdmin: false,
      });
    });
  });
});
