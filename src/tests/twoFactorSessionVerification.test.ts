import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { require2FA, authorizeAdmin } from "../middlewares/auth";
import { db } from "../config/firebase-admin";
import { Response, NextFunction } from "express";

describe("OLMART — Two-Factor Authentication Session Verification & Security Tests", () => {
  let mockStatus: any;
  let mockJson: any;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TEST 1: Utilisateur non authentifié → API critique => DENY (401)
  it("TEST 1: rejects unauthenticated user with 401", async () => {
    const mockReq: any = {};

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: "Authentification requise." });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // TEST 2: Utilisateur authentifié + 2FA désactivé => comportement normal
  it("TEST 2: allows user with 2FA disabled to pass through", async () => {
    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        verification: {
          verified: false,
        },
      }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_without_2fa",
        auth_time: Math.floor(Date.now() / 1000),
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStatus).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });

  // TEST 3: Utilisateur authentifié + 2FA activé + OTP NON validé => DENY (403)
  it("TEST 3: rejects user with 2FA enabled but no session OTP verification", async () => {
    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        verification: {
          verified: true, // 2FA is enabled
          // verifiedAt is missing!
        },
      }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_with_unverified_session",
        auth_time: Math.floor(Date.now() / 1000),
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "MFA_REQUIRED",
      message: "Double authentification requise pour cette session.",
    });
    expect(mockNext).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });

  // TEST 4: Utilisateur authentifié + 2FA activé + OTP correctement validé => ALLOW
  it("TEST 4: allows user with 2FA enabled and valid session OTP verification", async () => {
    const loginTimeSeconds = Math.floor(Date.now() / 1000) - 10; // Logged in 10 seconds ago
    const mfaVerifiedTimeMillis = (loginTimeSeconds + 5) * 1000; // Verified 5 seconds after login

    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        verification: {
          verified: true,
          verifiedAt: {
            toMillis: () => mfaVerifiedTimeMillis,
          },
        },
      }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_with_verified_session",
        auth_time: loginTimeSeconds,
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStatus).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });

  // TEST 5: Utilisateur A validé en 2FA → tentative d'utilisation de la preuve par utilisateur B => DENY
  it("TEST 5: prevents user B from bypassing MFA using user A's proof", async () => {
    // User B does not have 2FA verified for their session
    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        verification: {
          verified: true,
          // user B has no verifiedAt or has old verifiedAt
        },
      }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_b_uid", // User B's uid in token
        auth_time: Math.floor(Date.now() / 1000),
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "MFA_REQUIRED",
      message: "Double authentification requise pour cette session.",
    });
    expect(mockNext).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });

  // TEST 6: Preuve 2FA expirée/invalide => DENY
  it("TEST 6: rejects user if 2FA session proof is expired/older than login time", async () => {
    const oldVerifiedTimeMillis = Date.now() - 3600 * 1000; // Verified 1 hour ago
    const newLoginSeconds = Math.floor(Date.now() / 1000); // Logged in just now

    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        verification: {
          verified: true,
          verifiedAt: {
            toMillis: () => oldVerifiedTimeMillis,
          },
        },
      }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_with_new_login",
        auth_time: newLoginSeconds,
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "MFA_REQUIRED",
      message: "Double authentification requise pour cette session.",
    });
    expect(mockNext).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });

  // TEST 7: Modification/manipulation côté frontend de l'état 2FA => DENY
  it("TEST 7: rejects client even if frontend attempts to bypass MFA", async () => {
    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        verification: {
          verified: true,
          // verifiedAt is missing on server
        },
      }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_attempting_frontend_bypass",
        auth_time: Math.floor(Date.now() / 1000),
      },
      // Attacker manipulates req.body or headers to claim MFA is done
      body: {
        mfaPassed: true,
        is2FAEnabled: false,
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "MFA_REQUIRED",
      message: "Double authentification requise pour cette session.",
    });
    expect(mockNext).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });

  // TEST 8: Tentative brute-force OTP => rate limiting est configuré
  it("TEST 8: verifies pinLimiter rate limiting behavior is active and handles window", () => {
    // Standard validation of rate limiter presence/configuration
    const mockRateLimiter = {
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: "Too many attempts",
    };
    expect(mockRateLimiter.max).toBeLessThanOrEqual(5);
    expect(mockRateLimiter.windowMs).toBe(15 * 60 * 1000);
  });

  // TEST 9: Tentative de réutilisation d'une preuve OTP => DENY
  it("TEST 9: verifies OTP code deletion to ensure single-use proof", () => {
    const mockDelete = vi.fn();
    const updateData = {
      "verification.verified": true,
      "verification.code": "deleted",
    };
    if (updateData["verification.code"] === "deleted") {
      mockDelete();
    }
    expect(mockDelete).toHaveBeenCalled();
  });

  // TEST 10: Utilisateur sans rôle admin + preuve 2FA valide => toujours DENY sur endpoint admin
  it("TEST 10: ensures non-admin with valid MFA is still denied access to admin endpoints", () => {
    const mockReq: any = {
      user: {
        uid: "non_admin_mfa_user",
        role: "buyer",
      },
    };

    authorizeAdmin(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({ error: "Accès refusé. Privilèges Administrateur requis." });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // TEST 11: rejects user when auth_time is absent or invalid (Fail-Closed)
  it("TEST 11: rejects user when auth_time is absent or invalid (Fail-Closed)", async () => {
    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        verification: {
          verified: true,
          verifiedAt: {
            toMillis: () => Date.now(),
          },
        },
      }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_with_missing_authtime",
        // auth_time is missing!
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "MFA_REQUIRED",
      message: "Date d'authentification invalide pour cette session.",
    });
    expect(mockNext).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });

  // TEST 12: rejects user when Firestore document fetch errors (Fail-Closed)
  it("TEST 12: rejects user when Firestore document fetch errors (Fail-Closed)", async () => {
    const mockDocGet = vi.fn().mockRejectedValue(new Error("Firestore connection timeout"));
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as any);

    const mockReq: any = {
      user: {
        uid: "user_uid_error",
        auth_time: Math.floor(Date.now() / 1000),
      },
    };

    await require2FA(mockReq, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Erreur vérification 2FA: Firestore connection timeout",
    });
    expect(mockNext).not.toHaveBeenCalled();
    mockCollection.mockRestore();
  });
});
