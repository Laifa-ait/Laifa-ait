import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError, z } from "zod";

/**
 * Standard secure resource identifier regex.
 * Allows alphanumeric characters, hyphens, and underscores.
 * Prohibits slashes, spaces, path traversal dots (..), and injection tokens.
 * Length bounded between 1 and 128 characters.
 */
export const SAFE_RESOURCE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

/**
 * Standard UUID v4 regex pattern.
 */
export const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * Zod schema for standard resource ID parameter.
 */
export const resourceIdParamSchema = z.object({
  id: z.string().min(1, "Identifiant requis").max(128, "Identifiant trop long").regex(SAFE_RESOURCE_ID_REGEX, "Format d'identifiant invalide"),
});

export interface ValidateIdOptions {
  /** The parameter name in req.params (defaults to "id") */
  paramName?: string;
  /** Reserved sub-resource route names to prevent wildcard shadowing */
  reservedNames?: string[];
  /** If true, calls next() when matching a reserved name to delegate to downstream route handlers (default: true) */
  passReservedToNext?: boolean;
  /** Regex pattern to validate against (defaults to SAFE_RESOURCE_ID_REGEX) */
  pattern?: RegExp;
}

export const validateRequest = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map(err => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: "Validation request format error" });
    }
  };
};

export const validateQuery = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map(err => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: "Validation query format error" });
    }
  };
};

export const validateParams = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map(err => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: "Validation params format error" });
    }
  };
};

/**
 * Validates wildcard route ID parameters to protect against path traversal,
 * malformed identifiers, and accidental collision/shadowing of named sub-resources.
 */
export const validateIdParam = (options: ValidateIdOptions = {}) => {
  const {
    paramName = "id",
    reservedNames = [],
    passReservedToNext = true,
    pattern = SAFE_RESOURCE_ID_REGEX,
  } = options;

  const reservedSet = new Set(reservedNames.map(name => name.toLowerCase().trim()));

  return (req: Request, res: Response, next: NextFunction) => {
    const rawId = req.params[paramName];

    if (!rawId || typeof rawId !== "string") {
      return res.status(400).json({ error: "Identifiant de ressource requis" });
    }

    const trimmedId = rawId.trim();

    // 1. Intercept reserved sub-resources (anti-collision)
    if (reservedSet.has(trimmedId.toLowerCase())) {
      if (passReservedToNext) {
        return next("route");
      }
      return res.status(404).json({ error: "Ressource non trouvée" });
    }

    // 2. Enforce strict format (regex validation)
    if (!pattern.test(trimmedId)) {
      return res.status(400).json({
        error: "Format d'identifiant de ressource invalide",
        details: `L'identifiant '${paramName}' doit correspondre au format autorisé`,
      });
    }

    return next();
  };
};

