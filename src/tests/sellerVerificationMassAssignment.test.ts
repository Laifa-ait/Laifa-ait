import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import sellerProfileRouter from "../domains/seller/controllers/SellerProfileController";
import { AuthenticatedRequest } from "../middlewares/auth";

// Mock Firebase Admin and DB
const mockSet = vi.fn().mockResolvedValue({ writeTime: {} });
const mockGet = vi.fn().mockResolvedValue({ exists: true, data: () => ({ role: "seller", status: "active" }) });
const mockDoc = vi.fn().mockReturnValue({ set: mockSet, get: mockGet });
const mockCollection = vi.fn().mockReturnValue({ doc: mockDoc, add: vi.fn().mockResolvedValue({ id: "notif_1" }) });

vi.mock("../config/firebase-admin", () => ({
  db: {
    collection: (col: string) => mockCollection(col),
  },
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => "MOCK_SERVER_TIMESTAMP",
      },
    },
  },
}));

// Mock authentication middlewares
vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    req.user = { uid: "test_seller_123", email: "seller@olmart.dz", role: "seller", status: "active" };
    next();
  },
  authorizeSeller: (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    next();
  },
  require2FA: (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
}));

describe("Finding 1 — Seller Verification Mass Assignment Defense", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(sellerProfileRouter);
    mockSet.mockClear();
    mockDoc.mockClear();
    mockCollection.mockClear();
  });

  it("1. Normal seller with valid verification payload succeeds and saves strictly whitelisted fields", async () => {
    const validPayload = {
      brandName: "Artisanat Dz",
      designStyle: "Moderne et Berbère",
      portfolioUrl: "https://example.com/portfolio",
      brandStory: "Histoire d'artisanat transmise depuis 3 générations",
      rcNumber: "16/00-1234567B16",
      nifNumber: "000116001234567",
      rib: "00799999000000123456",
      documents: {
        fileRC: "https://storage.olmart.dz/kyc/rc.pdf",
        fileId: "https://storage.olmart.dz/kyc/id.jpg",
        fileRib: "https://storage.olmart.dz/kyc/rib.pdf",
      },
    };

    const res = await request(app)
      .put("/api/v1/seller/profile/verification")
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    expect(mockCollection).toHaveBeenCalledWith("users");
    expect(mockDoc).toHaveBeenCalledWith("test_seller_123");

    const savedData = mockSet.mock.calls[0][0] as Record<string, unknown>;
    expect(savedData.status).toBe("pending_verification");
    expect(savedData.updatedAt).toBe("MOCK_SERVER_TIMESTAMP");
    expect(savedData.brandName).toBe("Artisanat Dz");
    expect(savedData.rcNumber).toBe("16/00-1234567B16");
    expect(savedData.nifNumber).toBe("000116001234567");
    expect(savedData.rib).toBe("00799999000000123456");
    expect((savedData.documents as Record<string, string>).fileRC).toBe("https://storage.olmart.dz/kyc/rc.pdf");
  });

  it("2. Rejects malicious payload attempting role elevation (role: admin) with 400 Bad Request", async () => {
    const maliciousPayload = {
      brandName: "Attacker Shop",
      role: "admin",
    };

    const res = await request(app)
      .put("/api/v1/seller/profile/verification")
      .send(maliciousPayload);

    expect(res.status).toBe(400);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("3. Rejects malicious payload attempting verification bypass (isVerified: true) with 400 Bad Request", async () => {
    const maliciousPayload = {
      brandName: "Attacker Shop",
      isVerified: true,
    };

    const res = await request(app)
      .put("/api/v1/seller/profile/verification")
      .send(maliciousPayload);

    expect(res.status).toBe(400);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("4. Rejects malicious payload attempting Custom Claims tampering with 400 Bad Request", async () => {
    const maliciousPayload = {
      brandName: "Attacker Shop",
      customClaims: { admin: true },
    };

    const res = await request(app)
      .put("/api/v1/seller/profile/verification")
      .send(maliciousPayload);

    expect(res.status).toBe(400);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("5. Rejects malicious payload attempting status manipulation (status: active) with 400 Bad Request", async () => {
    const maliciousPayload = {
      brandName: "Attacker Shop",
      status: "active",
    };

    const res = await request(app)
      .put("/api/v1/seller/profile/verification")
      .send(maliciousPayload);

    expect(res.status).toBe(400);
    expect(mockSet).not.toHaveBeenCalled();
  });
});
