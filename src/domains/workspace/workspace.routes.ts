import { Router, Response, NextFunction } from "express";
import { authenticateToken } from "../../middlewares/auth";
import { strictLimiter } from "../../middlewares/rateLimiters";
import { safeLogger } from "../../utils/logger";
import {
  WorkspaceBusinessError,
  type AuthenticatedWorkspaceRequest,
  type SheetsExportDTO,
  type DriveUploadDTO,
  type SystemUploadKycDTO,
  type CalendarScheduleDTO
} from "./types/workspace.types";
import { WorkspaceService } from "./services/workspace.service";
import { maskSensitiveCell, validateKycFileSignature } from "./utils/workspaceValidation";

const router = Router();

// Re-exports for backward compatibility
export {
  WorkspaceBusinessError,
  maskSensitiveCell,
  validateKycFileSignature,
  WorkspaceService
};
export type {
  AuthenticatedWorkspaceRequest,
  AuthenticatedWorkspaceRequest as AuthenticatedRequest,
  SheetsExportDTO,
  DriveUploadDTO,
  SystemUploadKycDTO,
  CalendarScheduleDTO
};

// Middleware pour extraire le Google Access Token
export const requireGoogleToken = (req: AuthenticatedWorkspaceRequest, res: Response, next: NextFunction) => {
  const token = req.headers["x-google-token"];
  if (!token) {
    return res.status(401).json({ error: "Google access token manquant. Veuillez lier votre compte Google Workspace." });
  }
  req.googleToken = token as string;
  next();
};

/**
 * 1. GOOGLE SHEETS (Export Premium "Canva-like")
 */
router.post("/sheets/export-premium", strictLimiter, authenticateToken, requireGoogleToken, async (req: AuthenticatedWorkspaceRequest, res: Response) => {
  try {
    const result = await WorkspaceService.exportPremiumSheets(req.googleToken!, req.body);
    return res.json({
      success: true,
      ...result
    });
  } catch (err: unknown) {
    if (err instanceof WorkspaceBusinessError) {
      return res.status(err.statusCode).json({ error: err.message, details: err.details });
    }
    const error = err as { code?: number; message?: string };
    safeLogger.error("Erreur Google Sheets Export Premium", { err: error.message || String(err) });
    let errorMsg = "Échec de l'exportation Sheets";
    if (error.code === 401 || error.code === 403) errorMsg = "Accès refusé ou Token expiré. Reconnectez-vous.";
    if (error.code === 429) errorMsg = "Quota de requêtes Google API atteint. Veuillez patienter.";
    
    return res.status(error.code || 500).json({ error: errorMsg, details: error.message });
  }
});

/**
 * 2. GOOGLE DRIVE (User Upload - Admin Backup / Admin Docs)
 */
router.post("/drive/upload", strictLimiter, authenticateToken, requireGoogleToken, async (req: AuthenticatedWorkspaceRequest, res: Response) => {
  try {
    const fileData = await WorkspaceService.uploadUserDrive(req.googleToken!, req.body);
    return res.json({ success: true, file: fileData });
  } catch (err: unknown) {
    if (err instanceof WorkspaceBusinessError) {
      return res.status(err.statusCode).json({ error: err.message, details: err.details });
    }
    const error = err as { code?: number; message?: string };
    safeLogger.error("Erreur Google Drive Upload", { err: error.message || String(err) });
    let errorMsg = "Échec de l'upload Drive";
    if (error.code === 401 || error.code === 403) errorMsg = "Accès refusé ou Token expiré. Reconnectez-vous.";
    if (error.code === 429) errorMsg = "Quota de requêtes Google API atteint. Veuillez patienter.";
    
    return res.status(error.code || 500).json({ error: errorMsg, details: error.message });
  }
});

/**
 * 2b. GOOGLE DRIVE (System Upload - Vendeur KYC)
 */
router.post("/drive/system-upload-kyc", strictLimiter, authenticateToken, async (req: AuthenticatedWorkspaceRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid as string | undefined;
    const callerRole = req.user?.role as string | undefined;

    const result = await WorkspaceService.uploadSystemKyc(callerUid, callerRole, req.body);
    return res.json({
      success: true,
      ...result
    });
  } catch (err: unknown) {
    if (err instanceof WorkspaceBusinessError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    const error = err as { code?: number; message?: string };
    safeLogger.error("Erreur Google Drive System Upload", { err: error.message || String(err) });
    return res.status(error.code || 500).json({ error: "Échec de l'upload KYC system Drive", details: error.message });
  }
});

/**
 * 3. GOOGLE MEET & CALENDAR
 */
router.post("/calendar/schedule", strictLimiter, authenticateToken, requireGoogleToken, async (req: AuthenticatedWorkspaceRequest, res: Response) => {
  try {
    const result = await WorkspaceService.scheduleCalendarMeet(req.googleToken!, req.body);
    return res.json({
      success: true,
      ...result
    });
  } catch (err: unknown) {
    if (err instanceof WorkspaceBusinessError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    const error = err as { code?: number; message?: string };
    safeLogger.error("Erreur Calendar/Meet", { err: error.message || String(err) });
    let errorMsg = "Échec de la création du Meet";
    if (error.code === 401 || error.code === 403) errorMsg = "Accès refusé ou Token expiré. Reconnectez-vous.";
    if (error.code === 429) errorMsg = "Quota de requêtes Google API atteint. Veuillez patienter.";
    
    return res.status(error.code || 500).json({ error: errorMsg, details: error.message });
  }
});

export default router;
