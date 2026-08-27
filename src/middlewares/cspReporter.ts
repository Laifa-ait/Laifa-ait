import { Request, Response } from "express";
import { db } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";

export interface CspReportDetails {
  "document-uri"?: string;
  "referrer"?: string;
  "violated-directive"?: string;
  "effective-directive"?: string;
  "original-policy"?: string;
  "blocked-uri"?: string;
  "status-code"?: number;
  "script-sample"?: string;
}

export interface CspReportBody {
  "csp-report"?: CspReportDetails;
  blockedURI?: string;
  violatedDirective?: string;
  documentURI?: string;
}

// In-memory cache to prevent database alert flooding for identical domains (10 min TTL)
const recentAlertDomains = new Map<string, number>();
const ALERT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Extracts clean domain hostname from a blocked URI
 */
function extractDomain(uri?: string): string | null {
  if (!uri) return null;
  if (
    uri.startsWith("data:") ||
    uri.startsWith("blob:") ||
    uri.startsWith("inline") ||
    uri.startsWith("eval") ||
    uri === "self" ||
    uri === "about:blank"
  ) {
    return null;
  }

  try {
    const url = new URL(uri);
    return url.hostname;
  } catch {
    // If relative path or raw IP/string
    return uri.split("/")[0].split(":")[0];
  }
}

/**
 * List of known authorized or harmless domains to avoid false positive alarms
 */
const KNOWN_SAFE_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "firebasestorage.googleapis.com",
  "lh3.googleusercontent.com",
  "images.unsplash.com",
  "api.qrserver.com",
  "transparenttextures.com",
  "aistudio.google.com",
  "ai.studio",
  "google.com",
  "googleapis.com",
];

function isKnownDomain(domain: string): boolean {
  return KNOWN_SAFE_DOMAINS.some((safe) => domain === safe || domain.endsWith("." + safe));
}

/**
 * Middleware pour l'analyse des rapports de violation CSP et la génération d'alertes automatiques
 */
export async function handleCspReport(req: Request, res: Response): Promise<void> {
  try {
    const body: CspReportBody = req.body || {};
    const report = body["csp-report"] || {};

    const blockedUri = report["blocked-uri"] || body.blockedURI || "unknown";
    const violatedDirective = report["violated-directive"] || report["effective-directive"] || body.violatedDirective || "unknown";
    const documentUri = report["document-uri"] || body.documentURI || req.headers.referer || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const domain = extractDomain(blockedUri);

    // Standard Olmart Enterprise Logging
    safeLogger.warn("[Olmart Security] ⚠️ Violation CSP interceptée", { documentUri, violatedDirective, blockedUri });

    if (domain && !isKnownDomain(domain)) {
      const now = Date.now();
      const lastAlertTime = recentAlertDomains.get(domain) || 0;

      if (now - lastAlertTime > ALERT_COOLDOWN_MS) {
        recentAlertDomains.set(domain, now);

        const severity: "HIGH" | "MEDIUM" = violatedDirective.includes("script") ? "HIGH" : "MEDIUM";

        safeLogger.error("[Olmart Security] 🚨 ALERTE CRITIQUE : Domaine non autorisé détecté en violation CSP", { domain, violatedDirective });

        // Audit Trail enregistrement Firestore
        try {
          await db.collection("security_alerts").add({
            type: "CSP_UNAUTHORIZED_DOMAIN",
            domain,
            blockedUri,
            violatedDirective,
            documentUri,
            userAgent,
            severity,
            status: "unread",
            createdAt: new Date(),
          });
        } catch (dbErr: unknown) {
          const errMsg = dbErr instanceof Error ? dbErr.message : "Erreur inconnue";
          safeLogger.error("[Olmart Security] ❌ Échec enregistrement alerte Firestore", { err: errMsg });
        }
      }
    }

    // Réponse HTTP 204 No Content standard pour les endpoints CSP report
    res.status(204).end();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    safeLogger.error("[Olmart Security] ❌ Erreur traitement rapport CSP", { err: message });
    res.status(204).end();
  }
}
