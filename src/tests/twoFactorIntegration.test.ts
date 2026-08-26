import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, MockInstance } from "vitest";
import { admin, db } from "../config/firebase-admin";
import router from "../routes/auth2fa";

const app = express();
app.use(express.json());
app.use(router);

describe("OLMART — Two-Factor Authentication Route Integration & Security Suite", () => {
  const testUserUid = "test_2fa_user_999";
  let verifyTokenSpy: MockInstance;

  beforeAll(async () => {
    // Initialize user in firestore database
    await db.collection("users").doc(testUserUid).set({
      role: "buyer",
      email: "test2fa@olmart.dz",
      displayName: "2FA Tester"
    });

    verifyTokenSpy = vi.spyOn(admin.auth(), "verifyIdToken");
  });

  afterAll(async () => {
    // Clean up
    await db.collection("users").doc(testUserUid).delete();
    vi.restoreAllMocks();
  });

  // TEST 1: Request 2FA code - Unauthenticated -> 401
  it("TEST 1: blocks /send-code for unauthenticated user with 401", async () => {
    const res = await request(app)
      .post("/api/v1/auth/2fa/send-code")
      .send();

    expect(res.status).toBe(401);
  });

  // TEST 2: Request 2FA code - Success & check database writes
  it("TEST 2: generates and saves 2FA code for authenticated user in Firestore", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      email: "test2fa@olmart.dz",
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/api/v1/auth/2fa/send-code")
      .set("Authorization", "Bearer token-valid-2fa")
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.method).toBe("email");

    // Verify stored data in Firestore database
    const userSnap = await db.collection("users").doc(testUserUid).get();
    const userData = userSnap.data();

    expect(userData?.verification).toBeDefined();
    expect(userData?.verification?.code).toBeDefined();
    expect(typeof userData?.verification?.code).toBe("string");
    expect(userData?.verification?.code).toMatch(/^\d{6}$/); // Exactly 6 digits
    expect(userData?.verification?.expiresAt).toBeDefined();
  });

  // TEST 3: Verify 2FA code - Unauthenticated -> 401
  it("TEST 3: blocks /verify for unauthenticated user with 401", async () => {
    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .send({ code: "123456" });

    expect(res.status).toBe(401);
  });

  // TEST 4: Verify 2FA code - Invalid request formats -> 400
  it("TEST 4: validates request parameters and rejects incorrect formats with 400", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const testFormats = [
      {},
      { code: 123456 }, // integer instead of string
      { code: "" },
      { code: "12345" }, // too short
      { code: "1234567" }, // too long
      { code: "123a56" }, // containing characters
      { code: "      " } // blank padding
    ];

    for (const payload of testFormats) {
      const res = await request(app)
        .post("/api/v1/auth/2fa/verify")
        .set("Authorization", "Bearer token-valid-2fa")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("format de 6 chiffres");
    }
  });

  // TEST 5: Verify 2FA code - Fails if no code active in DB
  it("TEST 5: rejects verification if no verification code is currently active on server", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    // Explicitly delete verification structure from Firestore first
    await db.collection("users").doc(testUserUid).update({
      verification: admin.firestore.FieldValue.delete()
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", "Bearer token-valid-2fa")
      .send({ code: "999999" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Aucun code de vérification actif");
  });

  // TEST 6: Verify 2FA code - Mismatch code -> 403
  it("TEST 6: rejects verification if code does not match the stored code in database", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    // Explicitly set code in DB
    await db.collection("users").doc(testUserUid).update({
      "verification.code": "888888",
      "verification.expiresAt": admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", "Bearer token-valid-2fa")
      .send({ code: "111111" }); // Incorrect code

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Code invalide ou expiré");
  });

  // TEST 7: Verify 2FA code - Expired code -> 403
  it("TEST 7: rejects verification if correct code is sent but is expired", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    // Set code in DB that expired 5 minutes ago
    await db.collection("users").doc(testUserUid).update({
      "verification.code": "777777",
      "verification.expiresAt": admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", "Bearer token-valid-2fa")
      .send({ code: "777777" }); // Correct but expired

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Code invalide ou expiré");
  });

  // TEST 8: Verify 2FA code - Bypass codes blocked completely -> 403
  it("TEST 8: strictly blocks hardcoded mock bypass codes such as 123456", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    // Set genuine code as "999888"
    await db.collection("users").doc(testUserUid).update({
      "verification.code": "999888",
      "verification.expiresAt": admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", "Bearer token-valid-2fa")
      .send({ code: "123456" }); // Bypass attempt

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Code invalide ou expiré");
  });

  // TEST 9: Verify 2FA code - Success and purge verified secrets
  it("TEST 9: completes verification successfully, writes session markers and purges secret code", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    // Set active valid code
    const correctCode = "555555";
    await db.collection("users").doc(testUserUid).update({
      "verification.code": correctCode,
      "verification.expiresAt": admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", "Bearer token-valid-2fa")
      .send({ code: correctCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Re-verify document state in Firestore
    const userSnap = await db.collection("users").doc(testUserUid).get();
    const userData = userSnap.data();

    expect(userData?.verification).toBeDefined();
    expect(userData?.verification?.verified).toBe(true);
    expect(userData?.verification?.verifiedAt).toBeDefined();
    // Critical: The secret code must have been deleted to avoid reuse replay attacks
    expect(userData?.verification?.code).toBeUndefined();
  });
});
