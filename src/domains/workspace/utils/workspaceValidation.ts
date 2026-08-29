/**
 * Universal server-side sensitive data masking for exports (anti-data leakage of VIP clients)
 */
export function maskSensitiveCell(val: unknown): unknown {
  if (typeof val !== "string") return val;

  // Mask Emails: lai***@gmail.com
  let masked = val.replace(/([a-zA-Z0-9._%+-]{1,3})([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "$1***@$3");

  // Mask Algerian and general phone numbers
  masked = masked.replace(/(?:\+213|00213|[0][567])\s*(\d)\s*[\s\d-]{4,}(\d{2})/g, (match, first, last) => {
    if (match.startsWith('+213')) return '+213 ' + first + '***' + last;
    if (match.startsWith('00213')) return '00213 ' + first + '***' + last;
    return match.substring(0, 2) + '***' + last;
  });

  return masked;
}

/**
 * Validates binary signature (Magic Numbers) for uploaded KYC files
 */
export function validateKycFileSignature(buffer: Buffer, mimeType: string): boolean {
  const isMimePdf = mimeType.toLowerCase() === "application/pdf";
  const isMimePng = mimeType.toLowerCase() === "image/png";
  const isMimeJpeg = mimeType.toLowerCase() === "image/jpeg" || mimeType.toLowerCase() === "image/jpg";

  if (isMimePdf) {
    return buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
  } else if (isMimePng) {
    return buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47; // \x89PNG
  } else if (isMimeJpeg) {
    return buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8; // JPEG SOI
  }

  return false;
}
