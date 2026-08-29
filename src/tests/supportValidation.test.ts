import { describe, it, expect } from "vitest";
import { validateSecureFilePath } from "../domains/support/utils/supportValidation";

describe("Support Domain - Secure File Path Validation", () => {
  const ticketId = "ticket_123_abc";
  const attachmentId = "att_456_def";

  it("accepts valid structured paths", () => {
    const validPath = `support/${ticketId}/${attachmentId}/document.pdf`;
    expect(validateSecureFilePath(validPath, ticketId, attachmentId)).toBe(true);
  });

  it("rejects path traversal attempts with ..", () => {
    const maliciousPath = `support/${ticketId}/${attachmentId}/../../../etc/passwd`;
    expect(validateSecureFilePath(maliciousPath, ticketId, attachmentId)).toBe(false);
  });

  it("rejects backslash path traversal attempts", () => {
    const maliciousPath = `support/${ticketId}/${attachmentId}\\..\\..\\secret.txt`;
    expect(validateSecureFilePath(maliciousPath, ticketId, attachmentId)).toBe(false);
  });

  it("rejects leading absolute slash", () => {
    const maliciousPath = `/support/${ticketId}/${attachmentId}/document.pdf`;
    expect(validateSecureFilePath(maliciousPath, ticketId, attachmentId)).toBe(false);
  });

  it("rejects mismatched ticketId or attachmentId prefix", () => {
    const wrongTicketPath = `support/different_ticket/${attachmentId}/document.pdf`;
    expect(validateSecureFilePath(wrongTicketPath, ticketId, attachmentId)).toBe(false);

    const wrongAttPath = `support/${ticketId}/different_att/document.pdf`;
    expect(validateSecureFilePath(wrongAttPath, ticketId, attachmentId)).toBe(false);
  });

  it("rejects control characters in filePath", () => {
    const controlCharPath = `support/${ticketId}/${attachmentId}/bad\x00file.png`;
    expect(validateSecureFilePath(controlCharPath, ticketId, attachmentId)).toBe(false);
  });

  it("rejects empty or null filePaths", () => {
    expect(validateSecureFilePath("", ticketId, attachmentId)).toBe(false);
  });
});
