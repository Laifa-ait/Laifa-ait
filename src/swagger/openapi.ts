import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const openApiRegistry = new OpenAPIRegistry();

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/health",
  summary: "Health and Readiness check",
  responses: {
    200: {
      description: "System is operational",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
            uptime: z.number(),
            firebase: z.string()
          }).openapi("HealthResponse")
        }
      }
    }
  }
});

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Olmart API v1",
      description: "Production API specification for Olmart Marketplace Platform."
    },
    servers: [{ url: "/api/v1" }]
  });
}
