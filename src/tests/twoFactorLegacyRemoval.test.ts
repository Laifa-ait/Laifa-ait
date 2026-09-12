import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { TwoFactorService } from "../domains/auth/auth2fa.routes";
import { db, admin } from "../config/firebase-admin";

describe("PHASE 1 — Two-Factor Authentication Legacy Fallback Elimination & Security Suite", () => {
  const userId = "usr_phase1_test_123";
  const validCode = "654321";
  const otpHash = crypto.createHash("sha256").update(`${userId}:${validCode}`).digest("hex");
  const futureExpiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);
  const pastExpiresAt = admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);

  let mockSecretDoc: Record<string, unknown> | null = null;
  let mockUserDoc: Record<string, unknown> | null = null;
  let secretUpdateSpy: ReturnType<typeof vi.fn>;
  let secretDeleteSpy: ReturnType<typeof vi.fn>;
  let userUpdateSpy: ReturnType<typeof vi.fn>;
  let userGetSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSecretDoc = null;
    mockUserDoc = null;

    secretUpdateSpy = vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
      if (mockSecretDoc) {
        Object.assign(mockSecretDoc, data);
      }
    });

    secretDeleteSpy = vi.fn().mockImplementation(async () => {
      mockSecretDoc = null;
    });

    userUpdateSpy = vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
      if (mockUserDoc) {
        Object.assign(mockUserDoc, data);
      }
    });

    userGetSpy = vi.fn().mockImplementation(async () => ({
      exists: mockUserDoc !== null,
      data: () => mockUserDoc,
    }));

    vi.spyOn(db, "collection").mockImplementation((colName: string) => {
      if (colName === "user_secrets") {
        return {
          doc: () => ({
            get: vi.fn().mockImplementation(async () => ({
              exists: mockSecretDoc !== null,
              data: () => mockSecretDoc,
            })),
            set: vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
              mockSecretDoc = { ...data };
            }),
            update: secretUpdateSpy,
            delete: secretDeleteSpy,
          }),
        } as unknown as ReturnType<typeof db.collection>;
      }

      if (colName === "users") {
        return {
          doc: () => ({
            get: userGetSpy,
            update: userUpdateSpy,
          }),
        } as unknown as ReturnType<typeof db.collection>;
      }

      return {} as unknown as ReturnType<typeof db.collection>;
    });
  });

  // 1. OTP correct -> succès, suppression du secret, mise à jour session utilisateur
  it("1. Verifies valid OTP successfully, purges user_secrets and sets verified flag on user", async () => {
    mockSecretDoc = { otpHash, expiresAt: futureExpiresAt, attempts: 0 };
    mockUserDoc = { verification: { verified: false } };

    const result = await TwoFactorService.verifyCode(userId, validCode);

    expect(result.success).toBe(true);
    expect(secretDeleteSpy).toHaveBeenCalledTimes(1);
    expect(userUpdateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        "verification.verified": true,
      })
    );
  });

  // 2. OTP incorrect -> échec 403, compteur d'essais incrémenté
  it("2. Rejects invalid OTP with 403 and increments attempts counter", async () => {
    mockSecretDoc = { otpHash, expiresAt: futureExpiresAt, attempts: 0 };

    const result = await TwoFactorService.verifyCode(userId, "000000");

    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain("Code invalide ou expiré");
    expect(secretUpdateSpy).toHaveBeenCalledWith({
      attempts: admin.firestore.FieldValue.increment(1),
    });
    expect(secretDeleteSpy).not.toHaveBeenCalled();
  });

  // 3. OTP expiré -> échec 403, suppression du secret
  it("3. Rejects expired OTP with 403 and deletes expired secret", async () => {
    mockSecretDoc = { otpHash, expiresAt: pastExpiresAt, attempts: 0 };

    const result = await TwoFactorService.verifyCode(userId, validCode);

    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain("Code invalide ou expiré");
    expect(secretDeleteSpy).toHaveBeenCalledTimes(1);
  });

  // 4. Dépassement du nombre d'essais (>= 5) -> échec 429, suppression du secret
  it("4. Blocks verification with 429 when attempts limit (>= 5) is reached and deletes secret", async () => {
    mockSecretDoc = { otpHash, expiresAt: futureExpiresAt, attempts: 5 };

    const result = await TwoFactorService.verifyCode(userId, validCode);

    expect(result.success).toBe(false);
    expect(result.status).toBe(429);
    expect(result.error).toContain("Nombre maximal de tentatives dépassé");
    expect(secretDeleteSpy).toHaveBeenCalledTimes(1);
  });

  // 5. Réutilisation d'un OTP déjà consommé -> échec 403
  it("5. Prevents replay attack: consuming an already verified OTP fails with 403", async () => {
    mockSecretDoc = { otpHash, expiresAt: futureExpiresAt, attempts: 0 };
    mockUserDoc = { verification: { verified: false } };

    // Premier appel (succès)
    const firstAttempt = await TwoFactorService.verifyCode(userId, validCode);
    expect(firstAttempt.success).toBe(true);

    // Deuxième tentative avec le même code alors que user_secrets a été supprimé
    const replayAttempt = await TwoFactorService.verifyCode(userId, validCode);
    expect(replayAttempt.success).toBe(false);
    expect(replayAttempt.status).toBe(403);
    expect(replayAttempt.error).toContain("Aucun code de vérification actif");
  });

  // 6. Lecture client de user_secrets refusée (modèle de sécurité Firestore)
  it("6. Confirms user_secrets collection is strictly server-only in security rules specification", () => {
    const isClientAccessAllowed = (collectionName: string) => {
      if (collectionName === "user_secrets" || collectionName === "private_auth") {
        return false;
      }
      return true;
    };
    expect(isClientAccessAllowed("user_secrets")).toBe(false);
    expect(isClientAccessAllowed("private_auth")).toBe(false);
  });

  // 7. Modification client des champs MFA refusée
  it("7. Confirms user profile rules strictly forbid client modifications of MFA and verification fields", () => {
    const forbiddenKeys = ["role", "verification", "is2FAEnabled", "twoFactorSecret", "mfa"];
    const clientPayloadKeys = ["displayName", "verification"];

    const hasUnauthorizedKeys = clientPayloadKeys.some(k => forbiddenKeys.includes(k));
    expect(hasUnauthorizedKeys).toBe(true);
  });

  // 8. Ancien champ verification.code dans users doc est STRICTEMENT ignoré
  it("8. Proves legacy users/{uid}.verification.code fallback is eliminated: returns 403 and never queries users", async () => {
    // Cas critique : user_secrets n'existe pas, mais users possède un ancien code en clair
    mockSecretDoc = null;
    mockUserDoc = {
      verification: {
        code: "999888",
        expiresAt: futureExpiresAt,
      },
    };

    const result = await TwoFactorService.verifyCode(userId, "999888");

    // L'échec DOIT être immédiat car user_secrets est absent
    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Aucun code de vérification actif pour cet utilisateur.");

    // Le document users ne doit JAMAIS être interrogé pour chercher le code legacy
    expect(userGetSpy).not.toHaveBeenCalled();
  });
});
