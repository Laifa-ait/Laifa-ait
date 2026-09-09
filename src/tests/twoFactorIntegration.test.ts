import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { admin, db } from "../config/firebase-admin";
import { getTestAuthHeader } from "./helpers/firebaseAuthHelper";
import router from "../domains/auth/auth2fa.routes";

const app = express();
app.use(express.json());
app.use("/api/v1/auth/2fa", router);

const hasEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);

describe.skipIf(!hasEmulator)("OLMART — Two-Factor Authentication Route Integration & Security Suite", () => {
  const testUserUid = "test_2fa_user_999";
  let userAuthHeader: string;

  beforeAll(async () => {
    userAuthHeader = await getTestAuthHeader({
      uid: testUserUid,
      email: "test2fa@olmart.dz",
      role: "buyer"
    });

    // Initialize user in firestore database
    await db.collection("users").doc(testUserUid).set({
      role: "buyer",
      email: "test2fa@olmart.dz",
      displayName: "2FA Tester"
    });
  });

  afterAll(async () => {
    // Clean up
    await db.collection("users").doc(testUserUid).delete().catch(() => null);
    await db.collection("user_secrets").doc(testUserUid).delete().catch(() => null);
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
    const res = await request(app)
      .post("/api/v1/auth/2fa/send-code")
      .set("Authorization", userAuthHeader)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.method).toBe("email");

    // Verify stored data in private user_secrets collection
    const secretSnap = await db.collection("user_secrets").doc(testUserUid).get();
    const secretData = secretSnap.data();

    expect(secretData).toBeDefined();
    expect(secretData?.otpHash).toBeDefined();
    expect(typeof secretData?.otpHash).toBe("string");
    expect(secretData?.otpHash).toHaveLength(64); // SHA-256 hex string length
    expect(secretData?.attempts).toBe(0);
    expect(secretData?.expiresAt).toBeDefined();

    // Verify public/user document does NOT contain plaintext code
    const userSnap = await db.collection("users").doc(testUserUid).get();
    const userData = userSnap.data();
    expect(userData?.verification?.code).toBeUndefined();
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
        .set("Authorization", userAuthHeader)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("format de 6 chiffres");
    }
  });

  // TEST 5: Verify 2FA code - Fails if no code active in DB
  it("TEST 5: rejects verification if no verification code is currently active on server", async () => {
    // Explicitly delete secrets and verification structure from Firestore first
    await db.collection("user_secrets").doc(testUserUid).delete();
    await db.collection("users").doc(testUserUid).update({
      verification: admin.firestore.FieldValue.delete()
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", userAuthHeader)
      .send({ code: "999999" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Aucun code de vérification actif");
  });

  // TEST 6: Verify 2FA code - Mismatch code -> 403
  it("TEST 6: rejects verification if code does not match the stored code in database", async () => {
    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:888888`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", userAuthHeader)
      .send({ code: "111111" }); // Incorrect code

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Code invalide ou expiré");
  });

  // TEST 7: Verify 2FA code - Expired code -> 403
  it("TEST 7: rejects verification if correct code is sent but is expired", async () => {
    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:777777`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", userAuthHeader)
      .send({ code: "777777" }); // Correct but expired

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Code invalide ou expiré");
  });

  // TEST 8: Verify 2FA code - Bypass codes blocked completely -> 403
  it("TEST 8: strictly blocks hardcoded mock bypass codes such as 123456", async () => {
    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:999888`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", userAuthHeader)
      .send({ code: "123456" }); // Bypass attempt

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Code invalide ou expiré");
  });

  // TEST 9: Verify 2FA code - Success and purge verified secrets
  it("TEST 9: completes verification successfully, writes session markers and purges secret code", async () => {
    const correctCode = "555555";
    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:${correctCode}`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", userAuthHeader)
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
    const secretSnap = await db.collection("user_secrets").doc(testUserUid).get();
    expect(secretSnap.exists).toBe(false);
    expect(userData?.verification?.code).toBeUndefined();
  });

  // TEST 10: Rate limiting after 5 failed attempts -> 429
  it("TEST 10: blocks verification with 429 if trial count exceeds maximum allowed attempts (5/5)", async () => {
    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:111222`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 5, // Already reached maximum attempts
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", userAuthHeader)
      .send({ code: "111222" });

    expect(res.status).toBe(429);
    expect(res.body.error).toContain("Trop de tentatives");
  });
});

