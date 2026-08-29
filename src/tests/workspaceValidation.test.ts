import { describe, it, expect } from "vitest";
import { maskSensitiveCell, validateKycFileSignature } from "../domains/workspace/utils/workspaceValidation";

describe("Workspace Domain Validation & Security Suite", () => {
  describe("maskSensitiveCell - Universal Data Masking", () => {
    it("masks standard emails accurately", () => {
      const masked = maskSensitiveCell("laifa.ait@gmail.com");
      expect(masked).toBe("lai***@gmail.com");
    });

    it("masks short prefix emails accurately", () => {
      const masked = maskSensitiveCell("ab@olmart.dz");
      expect(masked).toBe("ab***@olmart.dz");
    });

    it("masks Algerian phone numbers in international format", () => {
      const masked = maskSensitiveCell("+213 555 123456");
      expect(masked).toContain("+213");
      expect(masked).toContain("***");
    });

    it("masks Algerian phone numbers in local format", () => {
      const masked = maskSensitiveCell("0555123456");
      expect(masked).toContain("05***");
    });

    it("passes non-string or non-sensitive values through unchanged", () => {
      expect(maskSensitiveCell(12345)).toBe(12345);
      expect(maskSensitiveCell("Commande N°987")).toBe("Commande N°987");
    });
  });

  describe("validateKycFileSignature - Magic Numbers Verification", () => {
    it("accepts valid PDF header (%PDF)", () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
      expect(validateKycFileSignature(pdfBuffer, "application/pdf")).toBe(true);
    });

    it("accepts valid PNG header", () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(validateKycFileSignature(pngBuffer, "image/png")).toBe(true);
    });

    it("accepts valid JPEG header (SOI 0xFFD8)", () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      expect(validateKycFileSignature(jpegBuffer, "image/jpeg")).toBe(true);
    });

    it("rejects malicious or spoofed files", () => {
      const maliciousBuffer = Buffer.from("MZ executables or text spoofed as pdf");
      expect(validateKycFileSignature(maliciousBuffer, "application/pdf")).toBe(false);
      expect(validateKycFileSignature(maliciousBuffer, "image/png")).toBe(false);
      expect(validateKycFileSignature(maliciousBuffer, "image/jpeg")).toBe(false);
    });
  });
});
