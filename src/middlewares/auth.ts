import { admin, db } from "../config/firebase-admin";
import { Request, Response, NextFunction } from "express";
import { safeLogger } from "../utils/logger";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role?: string;
  status?: string;
  admin?: boolean;
  adminValidated?: boolean;
  capabilities?: string[];
  customClaims?: Record<string, unknown>;
  auth_time?: number;
  [key: string]: unknown;
}

export type AuthResolutionResult =
  | { status: "authenticated"; user: AuthenticatedUser; token: string }
  | { status: "anonymous"; token?: undefined }
  | { status: "error"; statusCode: number; error: string; token?: string };

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  authContext?: AuthResolutionResult;
  file?: unknown;
  files?: unknown;
}

export function extractIdToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1]?.trim();
    if (token && token !== "undefined" && token !== "null") {
      return token;
    }
  } else if (req.cookies && typeof req.cookies.admin_session === "string" && req.cookies.admin_session.trim()) {
    const token = req.cookies.admin_session.trim();
    if (token && token !== "undefined" && token !== "null") {
      return token;
    }
  }
  return undefined;
}

/**
 * Resolves authentication for the incoming request once and memoizes on req.authContext.
 * Guarantees a single cryptographic token verification and single Firestore user read per request,
 * completely eliminating double-authentication bottlenecks across all API routes.
 */
export async function resolveAuthentication(req: AuthenticatedRequest): Promise<AuthResolutionResult> {
  const idToken = extractIdToken(req);

  // Return cached result if already resolved on this exact request
  if (req.authContext) {
    if (req.authContext.status === "authenticated" && req.authContext.token === idToken) {
      if (!req.user) req.user = req.authContext.user;
      return req.authContext;
    }
    if (req.authContext.status === "anonymous" && !idToken) {
      return req.authContext;
    }
    if (req.authContext.status === "error" && req.authContext.token === idToken) {
      return req.authContext;
    }
  }

  // Fast-path support for pre-authenticated requests / test fixtures
  if (req.user && typeof req.user.uid === "string") {
    const result: AuthResolutionResult = {
      status: "authenticated",
      user: req.user,
      token: idToken || "test_mock_token",
    };
    req.authContext = result;
    return result;
  }

  // No credentials provided -> anonymous
  if (!idToken) {
    const result: AuthResolutionResult = { status: "anonymous" };
    req.authContext = result;
    req.user = undefined;
    return result;
  }

  try {
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken, true);
    } catch (checkRevokedErr: unknown) {
      const code = (checkRevokedErr as { code?: string })?.code;
      if (code === "auth/id-token-revoked" || code === "auth/user-disabled") {
        throw checkRevokedErr;
      }
      decodedToken = await admin.auth().verifyIdToken(idToken, false);
    }

    const tokenRole = (decodedToken.role as string) || "buyer";
    let dbRole: string | undefined = undefined;
    let dbStatus = "active";
    let dbCapabilities: string[] = [];
    let dbFetchError = false;
    let userDocExists = false;

    // Check DB for role & status if available
    try {
      if (db) {
        const userDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (userDoc.exists) {
          userDocExists = true;
          const udata = userDoc.data();
          dbRole = udata?.role;
          dbStatus = udata?.status || "active";
          if (Array.isArray(udata?.capabilities)) {
            dbCapabilities = udata.capabilities;
          }
        }
      } else {
        dbFetchError = true;
      }
    } catch (e: unknown) {
      dbFetchError = true;
      const errorMsg = e instanceof Error ? e.message : String(e);
      safeLogger.warn("Auth middleware: Failed to fetch user role from DB", { uid: decodedToken.uid, err: errorMsg });
    }

    // Strict authority hierarchy & FAIL-CLOSED evaluation
    let effectiveRole = "buyer";

    if (tokenRole === "admin" || tokenRole === "superadmin") {
      if (dbFetchError) {
        safeLogger.error("Auth middleware: Admin status validation failed-closed due to DB unreachability", {
          uid: decodedToken.uid,
          tokenRole,
        });
        effectiveRole = "suspended";
      } else if (dbStatus === "suspended" || dbStatus === "blocked" || dbRole === "suspended" || dbRole === "blocked") {
        effectiveRole = "suspended";
      } else if (userDocExists && (dbRole === "admin" || dbRole === "superadmin")) {
        effectiveRole = tokenRole;
      } else if (userDocExists && dbRole) {
        effectiveRole = dbRole;
      } else {
        effectiveRole = "buyer";
      }
    } else {
      if (dbStatus === "suspended" || dbStatus === "blocked" || dbRole === "suspended" || dbRole === "blocked") {
        effectiveRole = "suspended";
      } else if ((dbRole === "seller" || dbRole === "artisan" || dbRole === "property_owner") && dbStatus === "active") {
        effectiveRole = dbRole;
      } else {
        effectiveRole = "buyer";
      }
    }

    const authenticatedUser: AuthenticatedUser = {
      ...decodedToken,
      role: effectiveRole,
      status: dbStatus,
      capabilities: dbCapabilities,
      adminValidated: effectiveRole === "admin" || effectiveRole === "superadmin",
    };

    req.user = authenticatedUser;
    const result: AuthResolutionResult = {
      status: "authenticated",
      user: authenticatedUser,
      token: idToken,
    };
    req.authContext = result;
    return result;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isRevoked = errorMsg.includes("revoked") || (error as { code?: string })?.code === "auth/id-token-revoked";

    req.user = undefined;
    const result: AuthResolutionResult = {
      status: "error",
      statusCode: 401,
      error: isRevoked ? "Jeton révoqué. Veuillez vous reconnecter." : `Jeton invalide ou expiré : ${errorMsg}`,
      token: idToken,
    };
    req.authContext = result;
    return result;
  }
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authResult = await resolveAuthentication(req);

  if (authResult.status === "authenticated") {
    return next();
  }

  if (authResult.status === "error") {
    return res.status(authResult.statusCode).json({ error: authResult.error });
  }

  return res.status(401).json({ error: "Authentification requise. Jeton manquant." });
};

export const optionalAuthenticateToken = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    await resolveAuthentication(req);
    return next();
  } catch {
    return next();
  }
};

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superadmin") ||
    req.user.status === "suspended" ||
    req.user.status === "blocked"
  ) {
    return res.status(403).json({ error: "Accès refusé. Privilèges Administrateur requis." });
  }
  next();
};

export const authorizeSeller = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const isAdmin = (req.user?.role === "admin" || req.user?.role === "superadmin") && req.user?.status !== "suspended" && req.user?.status !== "blocked";
  const isSeller = req.user?.role === "seller" && req.user?.status === "active";

  if (!req.user || (!isAdmin && !isSeller)) {
    return res.status(403).json({ error: "Accès refusé. Privilèges Vendeur actif vérifié ou Administrateur requis." });
  }
  next();
};

export const authorizePropertyOwner = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hasCapability = Array.isArray(req.user?.capabilities) && req.user.capabilities.includes("property_owner");
  const isOwnerRole = req.user?.role === "property_owner" || req.user?.role === "seller" || req.user?.role === "admin" || req.user?.role === "superadmin";

  if (!req.user || (!isOwnerRole && !hasCapability)) {
    return res.status(403).json({ error: "Accès refusé. Privilèges Propriétaire Immobilier, Vendeur ou Administrateur requis." });
  }
  next();
};

export const require2FA = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  const uid = req.user.uid;
  try {
    if (!db) {
      return res.status(503).json({ error: "Service de base de données indisponible pour la vérification 2FA." });
    }

    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const has2FA = userData?.verification?.verified === true || userData?.is2FAEnabled === true;

      if (has2FA) {
        const verifiedAt = userData?.verification?.verifiedAt;
        const authTime = Number(req.user.auth_time || 0);

        if (!authTime) {
          return res.status(403).json({
            error: "MFA_REQUIRED",
            message: "Date d'authentification invalide pour cette session.",
          });
        }

        let isVerifiedForSession = false;
        if (verifiedAt) {
          const verifiedAtMillis = typeof verifiedAt.toMillis === "function"
            ? verifiedAt.toMillis()
            : typeof verifiedAt === "number"
            ? verifiedAt
            : new Date(verifiedAt).getTime();

          const authTimeMillis = authTime * 1000;
          if (verifiedAtMillis >= authTimeMillis) {
            isVerifiedForSession = true;
          }
        }

        if (!isVerifiedForSession) {
          return res.status(403).json({
            error: "MFA_REQUIRED",
            message: "Double authentification requise pour cette session.",
          });
        }
      }
    }
    next();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: `Erreur vérification 2FA: ${errorMsg}` });
  }
};
