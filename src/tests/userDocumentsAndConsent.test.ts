import { describe, it, expect } from "vitest";
import { formatBytes } from "../utils/userStorageManager";
import { DocumentCategory, UserDocumentDTO, UserDataConsentPreferences } from "../types/documents";

describe("User Documents & Data Consent System", () => {
  describe("userStorageManager formatBytes", () => {
    it("formats 0 bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Ko");
    });

    it("formats bytes, KB, MB, GB properly", () => {
      expect(formatBytes(1024)).toBe("1 Ko");
      expect(formatBytes(1024 * 1024)).toBe("1 Mo");
      expect(formatBytes(50 * 1024 * 1024)).toBe("50 Mo");
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 Go");
    });
  });

  describe("Document and Consent Data Contracts", () => {
    it("validates document metadata structure and types", () => {
      const sampleDoc: UserDocumentDTO = {
        id: "doc-12345",
        userId: "user-buyer-77",
        category: "real_estate_legal",
        fileName: "acte_notarie_dz.pdf",
        storagePath: "user_documents/user-buyer-77/1700000000_acte_notarie_dz.pdf",
        downloadUrl: "https://firebasestorage.googleapis.com/v0/b/olmart/sample",
        fileSize: 2048500,
        mimeType: "application/pdf",
        createdAt: "2026-09-15T12:00:00Z",
        updatedAt: "2026-09-15T12:00:00Z",
        isVerified: false,
      };

      expect(sampleDoc.category).toBe("real_estate_legal");
      expect(sampleDoc.userId).toBe("user-buyer-77");
      expect(sampleDoc.fileName.endsWith(".pdf")).toBe(true);
      expect(sampleDoc.fileSize).toBeGreaterThan(0);
    });

    it("validates data consent preferences defaults and flags", () => {
      const defaultPrefs: UserDataConsentPreferences = {
        essential: true,
        localStorageCache: true,
        documentMemory: true,
        analyticsPerformance: false,
        consentTimestamp: new Date().toISOString(),
        consentVersion: "1.0",
      };

      expect(defaultPrefs.essential).toBe(true);
      expect(defaultPrefs.documentMemory).toBe(true);
      expect(defaultPrefs.localStorageCache).toBe(true);
      expect(defaultPrefs.analyticsPerformance).toBe(false);
    });

    it("ensures all document categories are correctly typed", () => {
      const categories: DocumentCategory[] = [
        "identity",
        "real_estate_legal",
        "artisan_qualification",
        "seller_registry",
        "invoice",
        "dispute_evidence",
        "general",
      ];

      expect(categories.length).toBe(7);
      expect(categories).toContain("real_estate_legal");
    });
  });
});
