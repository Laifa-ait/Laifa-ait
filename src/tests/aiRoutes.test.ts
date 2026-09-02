import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";

// Mock the auth middleware before importing router
vi.mock("../middlewares/auth", () => {
  return {
    authenticateToken: (req: Request, res: Response, next: NextFunction) => {
      (req as unknown as { user: unknown }).user = { uid: "test-admin", role: "admin", admin: true };
      next();
    },
    authorizeAdmin: (req: Request, res: Response, next: NextFunction) => {
      next();
    },
    authorizeSeller: (req: Request, res: Response, next: NextFunction) => {
      next();
    },
  };
});

// Mock AiService methods
const { mockTranslateText, mockTranslateSingleKey, mockFixFictiveTranslations } = vi.hoisted(() => ({
  mockTranslateText: vi.fn(),
  mockTranslateSingleKey: vi.fn(),
  mockFixFictiveTranslations: vi.fn(),
}));

vi.mock("../services/AiService", () => {
  return {
    AiService: {
      translateText: mockTranslateText,
      translateSingleKey: mockTranslateSingleKey,
      fixFictiveTranslations: mockFixFictiveTranslations,
      dualWrite: vi.fn(),
    },
  };
});

// Mock NodeCache and express-rate-limit
vi.mock("node-cache", () => {
  return {
    default: class {
      get = vi.fn();
      set = vi.fn();
    },
  };
});

vi.mock("express-rate-limit", () => {
  return {
    default: () => (req: Request, res: Response, next: NextFunction) => next(),
  };
});

import aiRouter from "../domains/ai/ai.routes";

describe("AI Domain Routes Integration", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api/v1/ai", aiRouter);
  });

  it("POST /admin/translate-text translates successfully", async () => {
    mockTranslateText.mockResolvedValueOnce({ en: "Welcome", ar: "مرحبا" });

    const response = await request(app)
      .post("/api/v1/ai/admin/translate-text")
      .send({ text: "Bienvenue", targetLangs: ["en", "ar"] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ en: "Welcome", ar: "مرحبا" });
    expect(mockTranslateText).toHaveBeenCalledWith("Bienvenue", ["en", "ar"]);
  });

  it("POST /admin/translate-text falls back gracefully when service fails", async () => {
    mockTranslateText.mockRejectedValueOnce(new Error("Gemini quota exceeded"));

    const response = await request(app)
      .post("/api/v1/ai/admin/translate-text")
      .send({ text: "Bienvenue", targetLangs: ["en", "ar"] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ en: "Bienvenue (en)", ar: "Bienvenue (ar)" });
  });

  it("POST /admin/translate-single-key translates successfully", async () => {
    mockTranslateSingleKey.mockResolvedValueOnce({ en: "Hello", ar: "أهلاً" });

    const response = await request(app)
      .post("/api/v1/ai/admin/translate-single-key")
      .send({ fr: "Bonjour" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ en: "Hello", ar: "أهلاً" });
  });

  it("POST /admin/translate-single-key falls back when service fails", async () => {
    mockTranslateSingleKey.mockRejectedValueOnce(new Error("Gemini Error"));

    const response = await request(app)
      .post("/api/v1/ai/admin/translate-single-key")
      .send({ fr: "Bonjour" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ar: "Bonjour (AR)", en: "Bonjour (EN)" });
  });

  it("POST /admin/translate-fictive runs fix successfully", async () => {
    mockFixFictiveTranslations.mockResolvedValueOnce(5);

    const response = await request(app)
      .post("/api/v1/ai/admin/translate-fictive");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Success", count: 5 });
  });
});
