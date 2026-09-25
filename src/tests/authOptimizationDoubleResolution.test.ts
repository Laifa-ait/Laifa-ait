import { describe, it, expect, vi, beforeEach } from "vitest";
import { admin, db } from "../config/firebase-admin";
import {
  authenticateToken,
  optionalAuthenticateToken,
  resolveAuthentication,
  AuthenticatedRequest,
} from "../middlewares/auth";
import { Response, NextFunction } from "express";
import { CollectionReference } from "firebase-admin/firestore";

describe("Architecture Optimization: Single Auth Resolution per Request", () => {
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus as unknown as (code: number) => Response,
      json: mockJson as unknown as (body: unknown) => Response,
    };
    mockNext = vi.fn();
  });

  it("1. guarantees exactly ONE verifyIdToken and ONE Firestore lookup when optionalAuthenticateToken is followed by authenticateToken", async () => {
    const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken").mockResolvedValue({
      uid: "user_buyer_123",
      email: "buyer@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ role: "buyer", status: "active" }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

    const req: AuthenticatedRequest = {
      headers: {
        authorization: "Bearer valid_jwt_token_olmart",
      },
    } as unknown as AuthenticatedRequest;

    // Step 1: Request passes through global optionalAuthenticateToken in app.ts
    await optionalAuthenticateToken(req, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user?.uid).toBe("user_buyer_123");
    expect(req.authContext?.status).toBe("authenticated");

    // Verify exactly 1 token check and 1 Firestore read so far
    expect(mockVerifyIdToken).toHaveBeenCalledTimes(1);
    expect(mockDocGet).toHaveBeenCalledTimes(1);

    // Step 2: Request enters protected route middleware authenticateToken
    mockNext = vi.fn();
    await authenticateToken(req, mockRes as Response, mockNext);

    // Assert: next() is called, user is still authenticated
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockStatus).not.toHaveBeenCalled();

    // CRITICAL ARCHITECTURAL PROOF:
    // Neither verifyIdToken nor Firestore doc.get was invoked a second time!
    expect(mockVerifyIdToken).toHaveBeenCalledTimes(1);
    expect(mockDocGet).toHaveBeenCalledTimes(1);

    // Step 3: Even if a nested router or handler invokes authenticateToken again:
    mockNext = vi.fn();
    await authenticateToken(req, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockVerifyIdToken).toHaveBeenCalledTimes(1);
    expect(mockDocGet).toHaveBeenCalledTimes(1);

    mockVerifyIdToken.mockRestore();
    mockCollection.mockRestore();
  });

  it("2. caches anonymous status when no token is present and blocks in authenticateToken without DB calls", async () => {
    const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken");
    const mockDoc = vi.fn();
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

    const req: AuthenticatedRequest = {
      headers: {},
    } as unknown as AuthenticatedRequest;

    // Global optional auth
    await optionalAuthenticateToken(req, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
    expect(req.authContext?.status).toBe("anonymous");

    // Route-level authenticateToken
    mockNext = vi.fn();
    await authenticateToken(req, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: "Authentification requise. Jeton manquant." });

    // Zero calls to Firebase Auth or Firestore
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
    expect(mockDoc).not.toHaveBeenCalled();

    mockVerifyIdToken.mockRestore();
    mockCollection.mockRestore();
  });

  it("3. handles revoked token in optional auth and prevents redundant re-verification in authenticateToken", async () => {
    const revokedError = new Error("Firebase ID token has been revoked.");
    (revokedError as unknown as { code: string }).code = "auth/id-token-revoked";

    const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken").mockRejectedValue(revokedError);
    const mockDoc = vi.fn();
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

    const req: AuthenticatedRequest = {
      headers: {
        authorization: "Bearer revoked_token_123",
      },
    } as unknown as AuthenticatedRequest;

    // Optional auth lets request continue anonymously
    await optionalAuthenticateToken(req, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
    expect(req.authContext?.status).toBe("error");
    expect(mockVerifyIdToken).toHaveBeenCalledTimes(1);

    // Protected route blocks with 401 using cached error without invoking verifyIdToken again
    mockNext = vi.fn();
    await authenticateToken(req, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: "Jeton révoqué. Veuillez vous reconnecter." });

    // Still only 1 call to verifyIdToken and 0 to Firestore
    expect(mockVerifyIdToken).toHaveBeenCalledTimes(1);
    expect(mockDoc).not.toHaveBeenCalled();

    mockVerifyIdToken.mockRestore();
    mockCollection.mockRestore();
  });

  it("4. resolveAuthentication returns identical instance for multiple calls", async () => {
    const mockVerifyIdToken = vi.spyOn(admin.auth(), "verifyIdToken").mockResolvedValue({
      uid: "seller_test_456",
      email: "seller@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ role: "seller", status: "active" }),
    });
    const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet });
    const mockCollection = vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

    const req: AuthenticatedRequest = {
      headers: {
        authorization: "Bearer seller_bearer_token",
      },
    } as unknown as AuthenticatedRequest;

    const res1 = await resolveAuthentication(req);
    const res2 = await resolveAuthentication(req);
    const res3 = await resolveAuthentication(req);

    expect(res1).toBe(res2);
    expect(res2).toBe(res3);
    expect(mockVerifyIdToken).toHaveBeenCalledTimes(1);
    expect(mockDocGet).toHaveBeenCalledTimes(1);

    mockVerifyIdToken.mockRestore();
    mockCollection.mockRestore();
  });
});
