import { URL } from "url";

/**
 * Validates external URLs to prevent SSRF (Server-Side Request Forgery) attacks.
 * Rejects non-HTTP(S) protocols and private/loopback IP address ranges.
 */
export function validateExternalUrl(inputUrl: string): URL {
  if (!inputUrl || typeof inputUrl !== "string") {
    throw new Error("URL d'entrée invalide");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    throw new Error("Format d'URL invalide");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Seuls les protocoles HTTP et HTTPS sont autorisés");
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block localhost and standard private IP ranges (IPv4 & IPv6)
  const isPrivate =
    hostname === "localhost" ||
    hostname === "localhost.localdomain" ||
    hostname === "::1" ||
    hostname === "::" ||
    hostname.startsWith("fe80:") ||
    /^(127\.\d+|10\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+|0\.\d+|169\.254\.\d+|224\.\d+|240\.\d+)$/.test(
      hostname
    );

  if (isPrivate) {
    throw new Error("Accès aux adresses IP privées ou locales strictement interdit (SSRF protection)");
  }

  return parsedUrl;
}
