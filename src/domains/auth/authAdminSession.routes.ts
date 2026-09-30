import { Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../middlewares/auth";
import { admin } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";

const authAdminSessionRouter = Router();

authAdminSessionRouter.post("/admin-session", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const idToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : (req.body?.idToken as string | undefined);

  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ error: "Jeton ID manquant." });
  }

  try {
    const expiresIn = 60 * 60 * 1000; // 1 heure
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    res.cookie("admin_session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api",
      maxAge: expiresIn,
    });

    return res.json({ success: true, message: "Session administrateur sécurisée établie." });
  } catch (err: unknown) {
    safeLogger.error("Failed to create admin session cookie", {
      err: err instanceof Error ? err.message : String(err),
    });
    return res.status(401).json({ error: "Échec de création de la session administrateur." });
  }
});

authAdminSessionRouter.delete("/admin-session", async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.uid) {
      await admin.auth().revokeRefreshTokens(req.user.uid).catch(() => null);
    }
  } catch {
    // Ignore error on revocation
  }

  res.clearCookie("admin_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
  });
  return res.json({ success: true, message: "Session administrateur révoquée." });
});

export default authAdminSessionRouter;
