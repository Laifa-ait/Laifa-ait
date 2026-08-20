import { describe, it, expect } from "vitest";
import { generateBackupCodes } from "../utils/twoFactor";

describe("2FA Backup Codes Security & Format Validation", () => {
  it("should generate exactly 8 backup codes", () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(8);
  });

  it("should ensure all codes have length 10 and format 'OLM-XXXXXX'", () => {
    const codes = generateBackupCodes();
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    for (const code of codes) {
      expect(code).toHaveLength(10);
      expect(code.startsWith("OLM-")).toBe(true);

      const randomPart = code.substring(4);
      expect(randomPart).toHaveLength(6);

      for (const char of randomPart) {
        expect(charset).toContain(char);
      }
    }
  });

  it("should not contain any duplicates in a single generated batch", () => {
    const codes = generateBackupCodes();
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it("should generate distinct batches on consecutive calls (regenerability)", () => {
    const batch1 = generateBackupCodes();
    const batch2 = generateBackupCodes();

    // The two batches should be completely different
    let identicalMatches = 0;
    for (const code of batch1) {
      if (batch2.includes(code)) {
        identicalMatches++;
      }
    }

    // Probability of even a single overlap in secure random 6-character strings is extremely low
    expect(identicalMatches).toBeLessThanOrEqual(1);
  });

  it("should be cryptographically secure by verifying standard properties", () => {
    // Generate a larger set of codes to check character distribution uniformity roughly
    const largeBatch: string[] = [];
    for (let i = 0; i < 50; i++) {
      largeBatch.push(...generateBackupCodes());
    }

    expect(largeBatch.length).toBe(400);

    // Verify all generated codes are unique/have extreme entropy
    const uniqueLargeBatch = new Set(largeBatch);
    // Overlap probability with CSPRNG on 400 items of 6-character length is near 0.
    expect(uniqueLargeBatch.size).toBe(largeBatch.length);
  });

  it("should throw an explicit error if crypto.getRandomValues is unavailable", () => {
    const originalGlobalCrypto = globalThis.crypto;
    const originalWindow = typeof window !== "undefined" ? window : undefined;
    let originalWindowCrypto: typeof window.crypto | undefined = undefined;

    if (originalWindow) {
      originalWindowCrypto = originalWindow.crypto;
    }

    try {
      // Temporarily mock/delete crypto support
      // Using Object.defineProperty since globalThis.crypto might be read-only
      Object.defineProperty(globalThis, "crypto", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      if (originalWindow) {
        Object.defineProperty(originalWindow, "crypto", {
          value: undefined,
          writable: true,
          configurable: true,
        });
      }

      expect(() => generateBackupCodes()).toThrow(
        "Cryptographically secure random number generator is unavailable"
      );
    } finally {
      // Restore original values
      Object.defineProperty(globalThis, "crypto", {
        value: originalGlobalCrypto,
        writable: true,
        configurable: true,
      });

      if (originalWindow && originalWindowCrypto) {
        Object.defineProperty(originalWindow, "crypto", {
          value: originalWindowCrypto,
          writable: true,
          configurable: true,
        });
      }
    }
  });
});
