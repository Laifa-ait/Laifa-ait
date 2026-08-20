import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

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
