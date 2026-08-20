import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, MockInstance } from "vitest";
import { admin, db } from "../config/firebase-admin";
import { Readable } from "stream";
import router, { validateSecureDisputeFilePath } from "../domains/dispute/controllers/DisputeController";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use("/api/v1/disputes", router);

describe("Dispute Attachment Security & IDOR Hardening Integration Suite (LOT P0.6.8)", () => {
  const buyerUid = "test_dispute_buyer_101";
  const sellerUid = "test_dispute_seller_101";
  const otherUserUid = "test_dispute_intruder_101";
  const adminUid = "test_dispute_admin_101";

  const disputeId = "dispute_test_sec_101";
  const otherDisputeId = "dispute_test_sec_other_102";

  // Valid PNG 1x1 base64
  const validPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  // Valid PDF magic bytes (%PDF-1.4 ...)
  const validPdfBase64 = Buffer.from("%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF").toString("base64");

  let verifyTokenSpy: MockInstance;
  let savedFiles: Record<string, { buffer: Buffer; options: Record<string, unknown> }> = {};

  beforeAll(async () => {
    // 1. Seed users
    await db.collection("users").doc(buyerUid).set({
      role: "buyer",
      email: "buyer@olmart.dz"
    });

    await db.collection("users").doc(sellerUid).set({
      role: "seller",
      email: "seller@olmart.dz"
    });

    await db.collection("users").doc(otherUserUid).set({
      role: "buyer",
      email: "intruder@olmart.dz"
    });

    await db.collection("users").doc(adminUid).set({
      role: "admin",
      email: "admin@olmart.dz"
    });

    // 2. Seed main dispute
    await db.collection("disputes").doc(disputeId).set({
      orderId: "ORD-SEC-001",
      buyerId: buyerUid,
      sellerId: sellerUid,
      status: "open",
      reason: "Colis endommagé",
      details: "L'écran est brisé à la réception.",
      frozenAmount: 5000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 3. Seed other dispute for mismatch testing
    await db.collection("disputes").doc(otherDisputeId).set({
      orderId: "ORD-SEC-002",
      buyerId: otherUserUid,
      sellerId: sellerUid,
      status: "open",
      reason: "Retard de livraison",
      details: "Non reçu",
      frozenAmount: 3000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 4. Spy on token verification
    verifyTokenSpy = vi.spyOn(admin.auth(), "verifyIdToken");

    // 5. Mock Storage
    savedFiles = {};
    const storageMock = {
      bucket: vi.fn().mockReturnValue({
        name: "test-storage-bucket",
        file: vi.fn().mockImplementation((filePath: string) => {
          return {
            name: filePath,
            save: vi.fn().mockImplementation(async (buf: Buffer, opts: Record<string, unknown>) => {
              savedFiles[filePath] = { buffer: buf, options: opts };
            }),
            exists: vi.fn().mockImplementation(async () => {
              return [Boolean(savedFiles[filePath])];
            }),
            delete: vi.fn().mockImplementation(async () => {
              delete savedFiles[filePath];
            }),
            createReadStream: vi.fn().mockImplementation(() => {
              const stream = new Readable();
              stream.push(savedFiles[filePath]?.buffer || Buffer.from("mock stream content"));
              stream.push(null);
              return stream;
            })
          };
        })
      })
    };
    vi.spyOn(admin, "storage").mockReturnValue(storageMock as unknown as admin.storage.Storage);
  });

  afterAll(async () => {
    // Cleanup seed records
    await db.collection("users").doc(buyerUid).delete();
    await db.collection("users").doc(sellerUid).delete();
    await db.collection("users").doc(otherUserUid).delete();
    await db.collection("users").doc(adminUid).delete();

    await db.collection("disputes").doc(disputeId).delete();
    await db.collection("disputes").doc(otherDisputeId).delete();

    const attachSnap = await db.collection("disputeAttachments").where("disputeId", "in", [disputeId, otherDisputeId]).get();
    for (const doc of attachSnap.docs) {
      await doc.ref.delete();
    }

    const msgsSnap = await db.collection("disputeMessages").where("disputeId", "in", [disputeId, otherDisputeId]).get();
    for (const doc of msgsSnap.docs) {
      await doc.ref.delete();
    }

    vi.restoreAllMocks();
  });

  // ==========================================
  // DISPUTE-ATT-01: Upload unauthenticated
  // ==========================================
  it("DISPUTE-ATT-01: Upload attachment without authentication returns 401", async () => {
    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .send({
        fileName: "evidence.png",
        mimeType: "image/png",
        base64Data: validPngBase64
      });

    expect(res.status).toBe(401);
  });

  // ==========================================
  // DISPUTE-ATT-02: Upload to non-existent dispute
  // ==========================================
  it("DISPUTE-ATT-02: Upload to non-existent dispute returns 404", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/api/v1/disputes/non_existent_dispute_999/upload")
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "evidence.png",
        mimeType: "image/png",
        base64Data: validPngBase64
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("introuvable");
  });

  // ==========================================
  // DISPUTE-ATT-03: Upload IDOR check
  // ==========================================
  it("DISPUTE-ATT-03: Upload to dispute by unauthorized user (intruder) returns 403", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: otherUserUid,
      email: "intruder@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "evidence.png",
        mimeType: "image/png",
        base64Data: validPngBase64
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Accès refusé");
  });

  // ==========================================
  // DISPUTE-ATT-04: Upload missing fields
  // ==========================================
  it("DISPUTE-ATT-04: Upload with missing fileName or mimeType returns 400", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "",
        mimeType: "image/png",
        base64Data: validPngBase64
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("manquants");
  });

  // ==========================================
  // DISPUTE-ATT-05: Upload invalid base64 data
  // ==========================================
  it("DISPUTE-ATT-05: Upload with invalid base64 format returns 400", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "corrupt.png",
        mimeType: "image/png",
        base64Data: "not-a-valid-base64-string!@#$"
      });

    expect(res.status).toBe(400);
  });

  // ==========================================
  // DISPUTE-ATT-06: Upload exceeding size limit (1MB)
  // ==========================================
  it("DISPUTE-ATT-06: Upload file exceeding 1MB returns 400", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    // Create 1.2MB payload
    const oversizedBuffer = Buffer.alloc(1.2 * 1024 * 1024, 0x41);
    const oversizedBase64 = oversizedBuffer.toString("base64");

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "huge.png",
        mimeType: "image/png",
        base64Data: oversizedBase64
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("1 Mo");
  });

  // ==========================================
  // DISPUTE-ATT-07: Upload forbidden mimeType
  // ==========================================
  it("DISPUTE-ATT-07: Upload forbidden executable MIME type returns 400", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "script.sh",
        mimeType: "application/x-sh",
        base64Data: Buffer.from("#!/bin/sh\necho hack").toString("base64")
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("non supporté");
  });

  // ==========================================
  // DISPUTE-ATT-08: Upload magic bytes mismatch
  // ==========================================
  it("DISPUTE-ATT-08: Upload with mimeType mismatch (declared image/png but payload is plaintext) returns 400", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const fakePngBase64 = Buffer.from("Hello this is plain text masquerading as PNG").toString("base64");

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "fake.png",
        mimeType: "image/png",
        base64Data: fakePngBase64
      });

    expect(res.status).toBe(400);
  });

  // ==========================================
  // DISPUTE-ATT-09: Upload successful by Buyer
  // ==========================================
  let buyerUploadedAttachmentId = "";
  let buyerUploadedFilePath = "";

  it("DISPUTE-ATT-09: Buyer uploads valid PNG -> 200, private storage, disputeAttachments doc created", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "damage_proof.png",
        mimeType: "image/png",
        base64Data: validPngBase64
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.attachmentId).toBeDefined();
    expect(res.body.fileUrl).toBe(`/api/v1/disputes/${disputeId}/attachments/${res.body.attachmentId}`);

    buyerUploadedAttachmentId = res.body.attachmentId;

    // Verify Firestore doc creation
    const attachDoc = await db.collection("disputeAttachments").doc(buyerUploadedAttachmentId).get();
    expect(attachDoc.exists).toBe(true);
    const data = attachDoc.data();
    expect(data?.disputeId).toBe(disputeId);
    expect(data?.userId).toBe(buyerUid);
    expect(data?.fileType).toBe("image/png");
    expect(data?.fileName).toBe("damage_proof.png");

    buyerUploadedFilePath = data?.filePath || "";
    expect(buyerUploadedFilePath).toBe(`disputes/${disputeId}/${buyerUploadedAttachmentId}/damage_proof.png`);

    // Verify Storage private upload (NO public: true)
    const savedFileRecord = savedFiles[buyerUploadedFilePath];
    expect(savedFileRecord).toBeDefined();
    expect(savedFileRecord.options.public).toBeUndefined(); // MUST NOT have public: true
  });

  // ==========================================
  // DISPUTE-ATT-10: Upload successful by Seller
  // ==========================================
  it("DISPUTE-ATT-10: Seller uploads valid PDF shipping receipt -> 200", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "shipping_slip.pdf",
        mimeType: "application/pdf",
        base64Data: validPdfBase64
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.attachmentId).toBeDefined();
  });

  // ==========================================
  // DISPUTE-ATT-11: Upload successful by Admin
  // ==========================================
  it("DISPUTE-ATT-11: Admin uploads mediation document -> 200", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: adminUid,
      email: "admin@olmart.dz",
      role: "admin",
      customClaims: { admin: true }
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/upload`)
      .set("Authorization", "Bearer valid-token")
      .send({
        fileName: "arbitration_notice.pdf",
        mimeType: "application/pdf",
        base64Data: validPdfBase64
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ==========================================
  // DISPUTE-ATT-12: Get attachment unauthenticated
  // ==========================================
  it("DISPUTE-ATT-12: Get attachment without authentication returns 401", async () => {
    const res = await request(app)
      .get(`/api/v1/disputes/${disputeId}/attachments/${buyerUploadedAttachmentId}`);

    expect(res.status).toBe(401);
  });

  // ==========================================
  // DISPUTE-ATT-13: Get attachment with non-existent dispute
  // ==========================================
  it("DISPUTE-ATT-13: Get attachment with non-existent dispute returns 404", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/disputes/non_existent_dispute/attachments/${buyerUploadedAttachmentId}`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(404);
  });

  // ==========================================
  // DISPUTE-ATT-14: Get attachment IDOR
  // ==========================================
  it("DISPUTE-ATT-14: Unauthorized user (intruder) requesting dispute attachment returns 403", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: otherUserUid,
      email: "intruder@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/disputes/${disputeId}/attachments/${buyerUploadedAttachmentId}`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  // ==========================================
  // DISPUTE-ATT-15: Get attachment disputeId mismatch
  // ==========================================
  it("DISPUTE-ATT-15: Requesting attachment via mismatched disputeId returns 400", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: otherUserUid, // owner of otherDisputeId
      email: "intruder@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/disputes/${otherDisputeId}/attachments/${buyerUploadedAttachmentId}`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("n'appartient pas");
  });

  // ==========================================
  // DISPUTE-ATT-16: Path traversal validation
  // ==========================================
  it("DISPUTE-ATT-16: validateSecureDisputeFilePath rejects path traversal attacks", () => {
    expect(validateSecureDisputeFilePath(`disputes/${disputeId}/${buyerUploadedAttachmentId}/file.png`, disputeId, buyerUploadedAttachmentId)).toBe(true);
    expect(validateSecureDisputeFilePath(`disputes/${disputeId}/${buyerUploadedAttachmentId}/../etc/passwd`, disputeId, buyerUploadedAttachmentId)).toBe(false);
    expect(validateSecureDisputeFilePath(`disputes/${disputeId}/other_id/file.png`, disputeId, buyerUploadedAttachmentId)).toBe(false);
    expect(validateSecureDisputeFilePath(`/disputes/${disputeId}/${buyerUploadedAttachmentId}/file.png`, disputeId, buyerUploadedAttachmentId)).toBe(false);
    expect(validateSecureDisputeFilePath(`disputes\\${disputeId}\\${buyerUploadedAttachmentId}\\file.png`, disputeId, buyerUploadedAttachmentId)).toBe(false);
    expect(validateSecureDisputeFilePath(`disputes/${disputeId}/${buyerUploadedAttachmentId}/file\x00.png`, disputeId, buyerUploadedAttachmentId)).toBe(false);
  });

  // ==========================================
  // DISPUTE-ATT-17: Stream attachment successfully
  // ==========================================
  it("DISPUTE-ATT-17: Buyer or Seller successfully retrieves stream with Content-Type and Disposition", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/disputes/${disputeId}/attachments/${buyerUploadedAttachmentId}`)
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/png");
    expect(res.headers["content-disposition"]).toContain("inline");
  });

  // ==========================================
  // DISPUTE-ATT-18: Post message with attachmentId inside transaction
  // ==========================================
  it("DISPUTE-ATT-18: Buyer posts message referencing attachmentId -> 200 with server-verified attachment metadata", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/messages`)
      .set("Authorization", "Bearer valid-token")
      .send({
        message: "Voici la photo du produit brisé.",
        attachmentId: buyerUploadedAttachmentId,
        // Attacker payload trying to override filePath or fileUrl
        fileUrl: "https://evil-site.com/hacked.jpg",
        sender: "admin"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBeDefined();

    // Verify server-side sanitized attributes
    const msg = res.body.message;
    expect(msg.senderRole).toBe("buyer");
    expect(msg.senderId).toBe(buyerUid);
    expect(msg.attachmentId).toBe(buyerUploadedAttachmentId);
    expect(msg.fileUrl).toBe(`/api/v1/disputes/${disputeId}/attachments/${buyerUploadedAttachmentId}`);
    expect(msg.fileName).toBe("damage_proof.png");
    expect(msg.fileType).toBe("image/png");
  });

  it("DISPUTE-ATT-18 (sub-case): Post message with non-existent attachmentId returns 404", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/disputes/${disputeId}/messages`)
      .set("Authorization", "Bearer valid-token")
      .send({
        message: "Photo jointe",
        attachmentId: "fake_attach_id_404"
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Pièce jointe introuvable");
  });
});
