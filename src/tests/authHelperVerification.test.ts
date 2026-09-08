import { describe, it, expect } from "vitest";
import { getTestAuthToken, getTestAuthHeader } from "./helpers/firebaseAuthHelper";
import { admin } from "../config/firebase-admin";

describe("Firebase Auth Emulator Token Helper", () => {
  it("generates a real valid Firebase ID token verifiable by admin.auth()", async () => {
    const token = await getTestAuthToken({
      uid: "test-admin-uid",
      email: "admin@olmart.dz",
      role: "admin",
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    // Verify token directly using firebase-admin SDK
    const decoded = await admin.auth().verifyIdToken(token, true);
    expect(decoded.uid).toBe("test-admin-uid");
    expect(decoded.email).toBe("admin@olmart.dz");
    expect(decoded.role).toBe("admin");
    expect(decoded.admin).toBe(true);
  });

  it("generates a real valid seller token with seller claims", async () => {
    const header = await getTestAuthHeader({
      uid: "test-seller-uid",
      role: "seller",
    });

    expect(header).toMatch(/^Bearer eyJ/);
    const rawToken = header.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(rawToken, true);
    expect(decoded.uid).toBe("test-seller-uid");
    expect(decoded.role).toBe("seller");
  });
});
