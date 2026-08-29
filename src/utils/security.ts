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

  // Check localhost, cloud metadata endpoints, and IPv6 loopback / link-local
  if (
    hostname === "localhost" ||
    hostname === "localhost.localdomain" ||
    hostname === "metadata.google.internal" ||
    hostname === "metadata" ||
    hostname === "instance-data" ||
    hostname === "::1" ||
    hostname === "::" ||
    hostname.startsWith("fe80:") ||
    hostname.startsWith("fc00:") ||
    hostname.startsWith("fd00:")
  ) {
    throw new Error("Accès aux adresses IP privées ou locales strictement interdit (SSRF protection)");
  }

  // Check standard IPv4 private and link-local ranges
  const ipv4Parts = hostname.split(".");
  if (ipv4Parts.length === 4 && ipv4Parts.every((p) => /^\d+$/.test(p))) {
    const [a, b, c, d] = ipv4Parts.map(Number);
    const isInvalidRange = [a, b, c, d].some((n) => n < 0 || n > 255);
    const isPrivateIpv4 =
      a === 0 || // 0.0.0.0/8
      a === 127 || // 127.0.0.0/8 (Loopback)
      a === 10 || // 10.0.0.0/8 (Private Class A)
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 (Private Class B)
      (a === 192 && b === 168) || // 192.168.0.0/16 (Private Class C)
      (a === 169 && b === 254) || // 169.254.0.0/16 (Link-local & Metadata)
      a >= 224; // 224.0.0.0/4 (Multicast & Reserved)

    if (isInvalidRange || isPrivateIpv4) {
      throw new Error("Accès aux adresses IP privées ou locales strictement interdit (SSRF protection)");
    }
  }

  return parsedUrl;
}
