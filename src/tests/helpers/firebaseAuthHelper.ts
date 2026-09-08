import { admin } from "../../config/firebase-admin";

interface TestUserOptions {
  uid: string;
  email?: string;
  role?: "admin" | "seller" | "buyer";
  claims?: Record<string, unknown>;
}

/**
 * Creates or updates a test user in Firebase Auth Emulator and returns a valid Firebase ID token.
 * This token is fully signed and verified by admin.auth().verifyIdToken(token, true).
 */
export async function getTestAuthToken(options: TestUserOptions | string): Promise<string> {
  const opts: TestUserOptions = typeof options === "string" ? { uid: options } : options;
  const uid = opts.uid;
  const email = opts.email || `${uid}@olmart.dz`;
  const role = opts.role || (uid.includes("admin") ? "admin" : uid.includes("seller") ? "seller" : "buyer");
  
  const customClaims = {
    role,
    admin: role === "admin",
    ...(role === "admin" ? { admin: true } : {}),
    ...(opts.claims || {}),
  };

  // 1. If a user exists with this email but different UID, delete them to avoid email conflict
  try {
    const existingByEmail = await admin.auth().getUserByEmail(email);
    if (existingByEmail && existingByEmail.uid !== uid) {
      await admin.auth().deleteUser(existingByEmail.uid);
    }
  } catch {
    // Email not found
  }

  // 2. Ensure user exists for uid or create new user
  try {
    await admin.auth().getUser(uid);
    await admin.auth().updateUser(uid, { email });
  } catch {
    await admin.auth().createUser({
      uid,
      email,
      emailVerified: true,
    });
  }

  // Assign custom claims
  await admin.auth().setCustomUserClaims(uid, customClaims);

  // Generate a custom token
  const customToken = await admin.auth().createCustomToken(uid, customClaims);

  // Exchange custom token for a real ID token using Auth Emulator REST API
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
  const apiKey = process.env.VITE_FIREBASE_API_KEY || "test-api-key";
  const url = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: customToken,
      returnSecureToken: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange custom token with Auth Emulator: ${response.status} - ${errorText}`);
  }

  const result = (await response.json()) as { idToken: string };
  return result.idToken;
}

/**
 * Helper to get an Authorization header ready for supertest / fetch.
 */
export async function getTestAuthHeader(options: TestUserOptions | string): Promise<string> {
  const token = await getTestAuthToken(options);
  return `Bearer ${token}`;
}
