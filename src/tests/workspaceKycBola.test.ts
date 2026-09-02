import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, MockInstance } from "vitest";

// In-Memory Firebase Store
const { memoryStore, mockAuth } = vi.hoisted(() => {
  const memStore = new Map<string, Record<string, unknown>>();
  const verifyFn = vi.fn();
  const authObj = {
    verifyIdToken: verifyFn,
  };
  return { memoryStore: memStore, mockAuth: authObj };
});

vi.mock("../config/firebase-admin", () => {
  const mockDb = {
    collection: (colName: string) => {
      const chain = {
        doc: (docId: string) => {
          const key = `${colName}/${docId}`;
          return {
            id: docId,
            get: vi.fn(async () => {
              const data = memoryStore.get(key);
              return {
                id: docId,
                exists: !!data,
                data: () => data,
              };
            }),
            set: vi.fn(async (data: Record<string, unknown>) => {
              memoryStore.set(key, data);
            }),
            delete: vi.fn(async () => {
              memoryStore.delete(key);
            }),
          };
        },
      };
      return chain;
    },
  };

  return {
    admin: {
      auth: () => mockAuth,
      firestore: {
        FieldValue: {
          serverTimestamp: vi.fn(() => new Date().toISOString()),
          increment: vi.fn((n: number) => n),
        },
      },
    },
    db: mockDb,
    auth: mockAuth,
  };
});

import { admin, db } from "../config/firebase-admin";
import workspaceRouter from "../domains/workspace/workspace.routes";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use("/api/v1/workspace", workspaceRouter);

describe("Workspace Drive System Upload KYC BOLA/IDOR Security Suite (P1-01)", () => {
  const sellerAUid = "seller_a_kyc_uid_101";
  const sellerBUid = "seller_b_kyc_uid_202";
  const adminUid = "admin_kyc_uid_999";

  let verifyTokenSpy: MockInstance;

  beforeAll(async () => {
    // Seed user records in Firestore so db.collection("users").doc().get() returns their roles
    if (db) {
      await db.collection("users").doc(sellerAUid).set({
        role: "seller",
        email: "sellerA@olmart.dz",
      });
      await db.collection("users").doc(sellerBUid).set({
        role: "seller",
        email: "sellerB@olmart.dz",
      });
      await db.collection("users").doc(adminUid).set({
        role: "admin",
        email: "admin@olmart.dz",
      });
    }

    verifyTokenSpy = vi.spyOn(admin.auth(), "verifyIdToken");
  });

  afterAll(async () => {
    if (db) {
      await db.collection("users").doc(sellerAUid).delete();
      await db.collection("users").doc(sellerBUid).delete();
      await db.collection("users").doc(adminUid).delete();
    }
    vi.restoreAllMocks();
  });

  it("ADVERSARIAL SCENARIO: sellerA attempts to upload KYC for sellerB -> HTTP 403 Forbidden (BOLA Blocked)", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: sellerAUid,
      email: "sellerA@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    // Dummy PDF base64 (%PDF-1.4 header)
    const validPdfBase64 = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF").toString("base64");

    const res = await request(app)
      .post("/api/v1/workspace/drive/system-upload-kyc")
      .set("Authorization", "Bearer token-seller-a")
      .send({
        fileName: "carte_identite.pdf",
        mimeType: "application/pdf",
        base64Data: validPdfBase64,
        sellerId: sellerBUid, // Attacker sellerA specifies sellerB's ID!
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain("Accès refusé");
    expect(res.body.error).toContain("Vous ne pouvez uploader un document KYC que pour votre propre compte");
  });

  it("AUTHORIZED SCENARIO: sellerA uploads KYC for sellerA (own account) -> Passes BOLA check", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: sellerAUid,
      email: "sellerA@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const validPdfBase64 = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF").toString("base64");

    const res = await request(app)
      .post("/api/v1/workspace/drive/system-upload-kyc")
      .set("Authorization", "Bearer token-seller-a")
      .send({
        fileName: "carte_identite_a.pdf",
        mimeType: "application/pdf",
        base64Data: validPdfBase64,
        sellerId: sellerAUid, // Legitimate match!
      });

    // Should NOT be HTTP 403 BOLA Forbidden
    expect(res.status).not.toBe(403);
  });

  it("ADMIN SCENARIO: admin uploads KYC on behalf of sellerB -> Allowed by admin role bypass", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: adminUid,
      email: "admin@olmart.dz",
      role: "admin",
    } as unknown as admin.auth.DecodedIdToken);

    const validPdfBase64 = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF").toString("base64");

    const res = await request(app)
      .post("/api/v1/workspace/drive/system-upload-kyc")
      .set("Authorization", "Bearer token-admin")
      .send({
        fileName: "carte_identite_b.pdf",
        mimeType: "application/pdf",
        base64Data: validPdfBase64,
        sellerId: sellerBUid, // Admin managing sellerB
      });

    // Should NOT be HTTP 403 BOLA Forbidden
    expect(res.status).not.toBe(403);
  });
});
