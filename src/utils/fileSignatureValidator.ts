/**
 * Utility to validate file content integrity via Magic Bytes (binary signatures)
 * and enforce extension/MIME type alignment.
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFileContent(
  buffer: Buffer,
  fileName: string,
  declaredMimeType: string
): ValidationResult {
  const mimeLower = declaredMimeType.toLowerCase().trim();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // 1. Verify extension and MIME alignment
  const mimeToExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'application/zip': ['zip'],
    'text/plain': ['txt'],
    'text/csv': ['csv']
  };

  const allowedExtensions = mimeToExtensions[mimeLower];
  if (!allowedExtensions) {
    return {
      isValid: false,
      error: "Type de fichier non supporté dans l'application."
    };
  }

  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: `Incohérence détectée: l'extension .${ext} ne correspond pas au format déclaré ${declaredMimeType}.`
    };
  }

  // 2. Magic Bytes / Signature validation
  let isValidSignature = false;

  if (mimeLower === 'image/jpeg') {
    // JPEG starts with SOI marker: 0xFF, 0xD8
    isValidSignature = buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8;
  } else if (mimeLower === 'image/png') {
    // PNG signature: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    isValidSignature =
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4E &&
      buffer[3] === 0x47;
  } else if (mimeLower === 'image/gif') {
    // GIF signature: GIF87a or GIF89a (0x47, 0x49, 0x46)
    isValidSignature =
      buffer.length >= 3 &&
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46;
  } else if (mimeLower === 'image/webp') {
    // WebP signature: RIFF container with WEBP format
    // Buffer index 0..3: "RIFF" (0x52, 0x49, 0x46, 0x46)
    // Buffer index 8..11: "WEBP" (0x57, 0x45, 0x42, 0x50)
    isValidSignature =
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
  } else if (mimeLower === 'application/pdf') {
    // PDF signature: %PDF (0x25, 0x50, 0x44, 0x46)
    isValidSignature =
      buffer.length >= 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;
  } else if (mimeLower === 'application/zip') {
    // ZIP signature: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    isValidSignature =
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4B &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04;
  } else if (mimeLower === 'text/plain' || mimeLower === 'text/csv') {
    // Plain text and CSV files do not have standard, reliable universal headers.
    // Instead, we scan the first 8000 bytes for null bytes (0x00) which are 
    // highly indicative of compiled/binary files (such as .exe, .sh binaries, .dll, etc.).
    const limit = Math.min(buffer.length, 8000);
    let hasNullByte = false;
    for (let i = 0; i < limit; i++) {
      if (buffer[i] === 0x00) {
        hasNullByte = true;
        break;
      }
    }
    // Also ensure it is not empty or trivially short binary
    isValidSignature = !hasNullByte && buffer.length > 0;
  }

  if (!isValidSignature) {
    return {
      isValid: false,
      error: "Le contenu du fichier ne correspond pas au format déclaré."
    };
  }

  return { isValid: true };
}
