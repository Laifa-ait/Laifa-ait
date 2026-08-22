import { admin, db } from "../config/firebase-admin";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    admin?: boolean;
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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const tokenRole = decodedToken.role || "buyer";
    let dbRole = tokenRole;
    let dbCapabilities: string[] = [];

    // Check DB for role if possible
    try {
      if (db) {
        const userDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (userDoc.exists) {
          const udata = userDoc.data();
          dbRole = udata?.role || tokenRole;
          if (Array.isArray(udata?.capabilities)) {
            dbCapabilities = udata.capabilities;
          }
        }
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.warn("Auth middleware: Failed to fetch user role from DB:", errorMsg);
    }

    // Strict authority hierarchy:
    // Administrative privileges REQUIRE cryptographic Custom Claims (tokenRole === 'admin' | 'superadmin').
    // A manipulated Firestore doc alone CANNOT elevate a buyer to admin.
    let effectiveRole = tokenRole;
    if (tokenRole === "admin" || tokenRole === "superadmin") {
      effectiveRole = (dbRole === "suspended" || dbRole === "buyer") ? dbRole : tokenRole;
    } else {
      effectiveRole = (dbRole === "seller" || dbRole === "artisan" || dbRole === "property_owner") ? dbRole : "buyer";
    }

    req.user = { ...decodedToken, role: effectiveRole, capabilities: dbCapabilities };
    next();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const tokenRole = decodedToken.role || "buyer";
    let dbRole = tokenRole;
    let dbCapabilities: string[] = [];

    try {
      if (db) {
        const userDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (userDoc.exists) {
          const udata = userDoc.data();
          dbRole = udata?.role || tokenRole;
          if (Array.isArray(udata?.capabilities)) {
            dbCapabilities = udata.capabilities;
          }
        }
      }
    } catch {
      // Just fail silently for optional auth
    }

    let effectiveRole = tokenRole;
    if (tokenRole === "admin" || tokenRole === "superadmin") {
      effectiveRole = (dbRole === "suspended" || dbRole === "buyer") ? dbRole : tokenRole;
    } else {
      effectiveRole = (dbRole === "seller" || dbRole === "artisan" || dbRole === "property_owner") ? dbRole : "buyer";
    }

    req.user = { ...decodedToken, role: effectiveRole, capabilities: dbCapabilities };
    return next();
  } catch {
    // Treat invalid tokens as anonymous
    return next();
  }
};

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
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
