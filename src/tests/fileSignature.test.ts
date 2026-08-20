import { describe, it, expect } from "vitest";
import { validateFileContent } from "../utils/fileSignatureValidator";

describe("validateFileContent - Magic Bytes and Format Alignment Validation", () => {
  // TEST 1: PNG valide
  it("should accept a valid PNG with correct header", () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 1, 2, 3]);
    const res = validateFileContent(pngBuffer, "image.png", "image/png");
    expect(res.isValid).toBe(true);
  });

  // TEST 2: JPEG valide
  it("should accept a valid JPEG with correct header", () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0, 16, 0x4A, 0x46, 0x49, 0x46]);
    const res = validateFileContent(jpegBuffer, "photo.jpg", "image/jpeg");
    expect(res.isValid).toBe(true);
  });

  // TEST 3: PDF valide
  it("should accept a valid PDF with correct header", () => {
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
    const res = validateFileContent(pdfBuffer, "document.pdf", "application/pdf");
    expect(res.isValid).toBe(true);
  });

  // TEST 4: PNG renommé depuis un autre type de fichier (corrompu/falsifié)
  it("should reject a file with a .png extension if the signature is invalid", () => {
    const badPngBuffer = Buffer.from("this is just simple text and not a png file at all");
    const res = validateFileContent(badPngBuffer, "malicious.png", "image/png");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Le contenu du fichier ne correspond pas au format déclaré.");
  });

  // TEST 5: PDF déclaré comme PNG
  it("should reject if a valid PDF file is declared as a PNG", () => {
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // PDF content
    const res = validateFileContent(pdfBuffer, "fake_image.png", "image/png"); // PNG declared
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Le contenu du fichier ne correspond pas au format déclaré.");
  });

  // TEST 6: MIME non autorisé
  it("should reject an unsupported MIME type", () => {
    const dummyBuffer = Buffer.from("some dummy data");
    const res = validateFileContent(dummyBuffer, "exec.sh", "application/x-sh");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Type de fichier non supporté");
  });

  // TEST 7: Incohérence extension et MIME
  it("should reject if the extension does not match the MIME type", () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const res = validateFileContent(pngBuffer, "image.jpg", "image/png"); // .jpg vs image/png
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Incohérence détectée");
  });

  // TEST 8: Formats texte avec contenu binaire (renommé ou corrompu)
  it("should reject text/plain files that contain binary null bytes", () => {
    const binaryTextBuffer = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x00, 0x57, 0x6F, 0x72, 0x6C, 0x6D]); // Includes 0x00
    const res = validateFileContent(binaryTextBuffer, "hello.txt", "text/plain");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Le contenu du fichier ne correspond pas au format déclaré.");
  });

  it("should accept valid plain text files", () => {
    const validTextBuffer = Buffer.from("Hello world! This is a simple plain text support message file.");
    const res = validateFileContent(validTextBuffer, "hello.txt", "text/plain");
    expect(res.isValid).toBe(true);
  });
});
