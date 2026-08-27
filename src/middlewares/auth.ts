import { admin, db } from "../config/firebase-admin";
import { Request, Response, NextFunction } from "express";
import { safeLogger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    status?: string;
    admin?: boolean;
    adminValidated?: boolean;
    customClaims?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise. Jeton manquant." });
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken || idToken === "undefined" || idToken === "null") {
    return res.status(401).json({ error: "Authentification requise. Jeton invalide." });
  }

  try {
    // Check revocation (checkRevoked = true) to immediately reject revoked tokens or disabled accounts
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    const tokenRole = (decodedToken.role as string) || "buyer";
    let dbRole: string | undefined = undefined;
    let dbStatus = "active";
    let dbCapabilities: string[] = [];
    let dbFetchError = false;
    let userDocExists = false;

    // Check DB for role & status if possible
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

    // Strict authority hierarchy & FAIL-CLOSED evaluation:
    // Administrative privileges REQUIRE cryptographic Custom Claims AND active status in Firestore.
    // If Firestore is unavailable (dbFetchError), we FAIL CLOSED: admin privileges are NOT granted.
    let effectiveRole = "buyer";

    if (tokenRole === "admin" || tokenRole === "superadmin") {
      if (dbFetchError) {
        // FAIL-CLOSED: Database unavailable -> cannot validate admin status -> suspend privileges
        safeLogger.error("Auth middleware: Admin status validation failed-closed due to DB unreachability", {
          uid: decodedToken.uid,
          tokenRole,
        });
        effectiveRole = "suspended";
      } else if (dbStatus === "suspended" || dbStatus === "blocked" || dbRole === "suspended" || dbRole === "blocked") {
        // Admin is suspended or blocked in database
        effectiveRole = "suspended";
      } else if (userDocExists && (dbRole === "admin" || dbRole === "superadmin")) {
        // Validated active administrator
        effectiveRole = tokenRole;
      } else if (userDocExists && dbRole) {
        // Admin was downgraded in database (e.g. to buyer or seller)
        effectiveRole = dbRole;
      } else {
        // User doc does not exist or role cannot be confirmed -> fail-closed
        effectiveRole = "buyer";
      }
    } else {
      // Non-admin token roles
      if (dbStatus === "suspended" || dbStatus === "blocked" || dbRole === "suspended" || dbRole === "blocked") {
        effectiveRole = "suspended";
      } else if (dbRole === "seller" || dbRole === "artisan" || dbRole === "property_owner") {
        effectiveRole = dbRole;
      } else {
        effectiveRole = "buyer";
      }
    }

    req.user = {
      ...decodedToken,
      role: effectiveRole,
      status: dbStatus,
      capabilities: dbCapabilities,
      adminValidated: effectiveRole === "admin" || effectiveRole === "superadmin",
    };
    next();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isRevoked = errorMsg.includes("revoked") || (error as { code?: string })?.code === "auth/id-token-revoked";
    if (isRevoked) {
      return res.status(401).json({ error: "Jeton révoqué. Veuillez vous reconnecter." });
    }
    return res.status(401).json({ error: `Jeton invalide ou expiré : ${errorMsg}` });
  }
};

export const optionalAuthenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken || idToken === "undefined" || idToken === "null") {
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    const tokenRole = (decodedToken.role as string) || "buyer";
    let dbRole: string | undefined = undefined;
    let dbStatus = "active";
    let dbCapabilities: string[] = [];
    let dbFetchError = false;
    let userDocExists = false;

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
    } catch {
      dbFetchError = true;
    }

    let effectiveRole = "buyer";
    if (tokenRole === "admin" || tokenRole === "superadmin") {
      if (dbFetchError || dbStatus === "suspended" || dbStatus === "blocked" || dbRole === "suspended" || dbRole === "blocked") {
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
      } else if (dbRole === "seller" || dbRole === "artisan" || dbRole === "property_owner") {
        effectiveRole = dbRole;
      } else {
        effectiveRole = "buyer";
      }
    }

    req.user = {
      ...decodedToken,
      role: effectiveRole,
      status: dbStatus,
      capabilities: dbCapabilities,
      adminValidated: effectiveRole === "admin" || effectiveRole === "superadmin",
    };
    return next();
  } catch {
    // Treat invalid or revoked tokens as anonymous
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
  if (!req.user || (req.user.role !== "seller" && req.user.role !== "admin")) {
    return res.status(403).json({ error: "Accès refusé. Privilèges Vendeur ou Administrateur requis." });
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
    if (db) {
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
    }
    next();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: `Erreur vérification 2FA: ${errorMsg}` });
  }
};
