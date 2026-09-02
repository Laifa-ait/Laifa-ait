import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, MockInstance } from "vitest";

// In-Memory Firebase Admin Mock for 2FA Integration Tests
const usersStore = new Map<string, Record<string, unknown>>();
const deleteValueMarker = { __isDelete: true };

const setNestedKey = (obj: Record<string, unknown>, keyPath: string, value: unknown) => {
  if (value === deleteValueMarker) {
    if (keyPath.includes(".")) {
      const parts = keyPath.split(".");
      let curr: Record<string, unknown> = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]] || typeof curr[parts[i]] !== "object") return;
        curr = curr[parts[i]] as Record<string, unknown>;
      }
      delete curr[parts[parts.length - 1]];
    } else {
      delete obj[keyPath];
    }
    return;
  }

  const isIncrement = value && typeof value === "object" && (value as Record<string, unknown>).__isIncrement;

  if (keyPath.includes(".")) {
    const parts = keyPath.split(".");
    let curr: Record<string, unknown> = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]] || typeof curr[parts[i]] !== "object") {
        curr[parts[i]] = {};
      }
      curr = curr[parts[i]] as Record<string, unknown>;
    }
    const lastKey = parts[parts.length - 1];
    if (isIncrement) {
      const incVal = Number((value as Record<string, unknown>).value || 0);
      curr[lastKey] = (Number(curr[lastKey]) || 0) + incVal;
    } else {
      curr[lastKey] = value;
    }
  } else {
    if (isIncrement) {
      const incVal = Number((value as Record<string, unknown>).value || 0);
      obj[keyPath] = (Number(obj[keyPath]) || 0) + incVal;
    } else {
      obj[keyPath] = value;
    }
  }
};

const mockVerifyIdToken = vi.fn();
const mockAuthObject = {
  verifyIdToken: mockVerifyIdToken,
};

const cloneData = (data: unknown): unknown => {
  if (data === null || data === undefined) return data;
  if (typeof data === "object" && "toMillis" in data) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(cloneData);
  }
  if (typeof data === "object") {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      copy[k] = cloneData(v);
    }
    return copy;
  }
  return data;
};

vi.mock("../config/firebase-admin", () => {
  const mockAdmin = {
    auth: () => mockAuthObject,
    firestore: {
      Timestamp: {
        fromMillis: (ms: number) => ({
          toMillis: () => ms,
        }),
      },
      FieldValue: {
        delete: () => deleteValueMarker,
        increment: (val: number) => ({ __isIncrement: true, value: val }),
      },
    },
  };

  const mockDb = {
    collection: (colName: string) => ({
      doc: (docId: string) => {
        const fullKey = `${colName}/${docId}`;
        return {
          id: docId,
          get: vi.fn(async () => {
            const data = usersStore.get(fullKey) ?? usersStore.get(docId);
            return {
              exists: !!data,
              data: () => (data ? (cloneData(data) as Record<string, unknown>) : undefined),
            };
          }),
          set: vi.fn(async (data: Record<string, unknown>) => {
            usersStore.set(fullKey, cloneData(data) as Record<string, unknown>);
          }),
          update: vi.fn(async (data: Record<string, unknown>) => {
            let existing = (usersStore.get(fullKey) ?? usersStore.get(docId) ?? {}) as Record<string, unknown>;
            existing = cloneData(existing) as Record<string, unknown>;
            for (const [key, value] of Object.entries(data)) {
              setNestedKey(existing, key, value);
            }
            usersStore.set(fullKey, existing);
          }),
          delete: vi.fn(async () => {
            usersStore.delete(fullKey);
            usersStore.delete(docId);
          }),
        };
      },
    }),
  };

  return {
    admin: mockAdmin,
    db: mockDb,
  };
});

import { admin, db } from "../config/firebase-admin";
import router from "../domains/auth/auth2fa.routes";

const app = express();
app.use(express.json());
app.use("/api/v1/auth/2fa", router);

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

    // Explicitly delete secrets and verification structure from Firestore first
    await db.collection("user_secrets").doc(testUserUid).delete();
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

    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:888888`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
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

    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:777777`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000)
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

    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:999888`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
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
    const secretSnap = await db.collection("user_secrets").doc(testUserUid).get();
    expect(secretSnap.exists).toBe(false);
    expect(userData?.verification?.code).toBeUndefined();
  });

  // TEST 10: Rate limiting after 5 failed attempts -> 429
  it("TEST 10: blocks verification with 429 if trial count exceeds maximum allowed attempts (5/5)", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: testUserUid,
      role: "buyer"
    } as unknown as admin.auth.DecodedIdToken);

    const crypto = await import("crypto");
    const otpHash = crypto.createHash("sha256").update(`${testUserUid}:111222`).digest("hex");

    await db.collection("user_secrets").doc(testUserUid).set({
      otpHash,
      attempts: 5, // Already reached maximum attempts
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/verify")
      .set("Authorization", "Bearer token-valid-2fa")
      .send({ code: "111222" });

    expect(res.status).toBe(429);
    expect(res.body.error).toContain("Trop de tentatives");
  });
});
