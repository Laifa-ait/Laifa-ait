import { describe, it, expect } from "vitest";
import express, { Request, Response } from "express";
import request from "supertest";
import {
  validateIdParam,
  validateParams,
  resourceIdParamSchema,
  UUID_V4_REGEX,
} from "../middlewares/validation";

describe("Route Wildcard ID Parameter Validation & Sub-resource Isolation", () => {
  const createApp = () => {
    const app = express();
    app.use(express.json());

    // 1. Wildcard route with reserved sub-resource name delegating to downstream
    app.get(
      "/api/v1/platform-stats/:id",
      validateIdParam({
        reservedNames: ["trending_searches", "aggregates"],
        passReservedToNext: true,
      }),
      (req: Request, res: Response) => {
        res.json({ documentId: req.params.id, source: "wildcard_handler" });
      }
    );

    // Downstream handler for the reserved sub-resource
    app.get("/api/v1/platform-stats/trending_searches", (_req: Request, res: Response) => {
      res.json({ success: true, terms: ["Sneakers", "Smartphones"] });
    });

    // 2. Wildcard route where reserved names strictly 404
    app.get(
      "/api/v1/settings/:id",
      validateIdParam({
        reservedNames: ["categories", "public"],
        passReservedToNext: false,
      }),
      (req: Request, res: Response) => {
        res.json({ setting: req.params.id });
      }
    );

    // 3. Strict UUID v4 route
    app.get(
      "/api/v1/orders/:id",
      validateIdParam({
        pattern: UUID_V4_REGEX,
      }),
      (req: Request, res: Response) => {
        res.json({ orderId: req.params.id });
      }
    );

    // 4. Zod parameter schema route
    app.get(
      "/api/v1/users/:id",
      validateParams(resourceIdParamSchema),
      (req: Request, res: Response) => {
        res.json({ userId: req.params.id });
      }
    );

    return app;
  };

  it("should allow valid slug and alphanumeric document identifiers", async () => {
    const app = createApp();

    const res = await request(app).get("/api/v1/platform-stats/monthly_dec_2026");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ documentId: "monthly_dec_2026", source: "wildcard_handler" });
  });

  it("should delegate reserved sub-resource route to downstream handler when passReservedToNext is true", async () => {
    const app = createApp();

    const res = await request(app).get("/api/v1/platform-stats/trending_searches");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, terms: ["Sneakers", "Smartphones"] });
  });

  it("should return 404 for reserved sub-resource when passReservedToNext is false", async () => {
    const app = createApp();

    const res = await request(app).get("/api/v1/settings/categories");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Ressource non trouvée");
  });

  it("should reject path traversal attempts with 400 Bad Request", async () => {
    const app = createApp();

    const res = await request(app).get("/api/v1/platform-stats/..%2F..%2Fetc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Format d'identifiant de ressource invalide");
  });

  it("should reject malicious punctuation and injection tokens with 400 Bad Request", async () => {
    const app = createApp();

    const resScript = await request(app).get("/api/v1/platform-stats/id%3Cscript%3E");
    expect(resScript.status).toBe(400);
    expect(resScript.body.error).toBe("Format d'identifiant de ressource invalide");

    const resSql = await request(app).get("/api/v1/platform-stats/id;DROP_TABLE");
    expect(resSql.status).toBe(400);
    expect(resSql.body.error).toBe("Format d'identifiant de ressource invalide");

    const resSpecial = await request(app).get("/api/v1/platform-stats/user$admin*role");
    expect(resSpecial.status).toBe(400);
    expect(resSpecial.body.error).toBe("Format d'identifiant de ressource invalide");
  });

  it("should enforce strict UUID format when pattern is configured", async () => {
    const app = createApp();

    // Valid UUID v4
    const validUuid = "123e4567-e89b-42d3-a456-426614174000";
    const resValid = await request(app).get(`/api/v1/orders/${validUuid}`);
    expect(resValid.status).toBe(200);
    expect(resValid.body.orderId).toBe(validUuid);

    // Invalid UUID
    const resInvalid = await request(app).get("/api/v1/orders/not-a-uuid-123");
    expect(resInvalid.status).toBe(400);
    expect(resInvalid.body.error).toBe("Format d'identifiant de ressource invalide");
  });

  it("should validate using Zod parameter schema via validateParams", async () => {
    const app = createApp();

    const resValid = await request(app).get("/api/v1/users/user_abc123");
    expect(resValid.status).toBe(200);
    expect(resValid.body.userId).toBe("user_abc123");

    const resInvalid = await request(app).get("/api/v1/users/invalid@email!user");
    expect(resInvalid.status).toBe(400);
    expect(resInvalid.body.error).toBe("Validation failed");
  });
});
