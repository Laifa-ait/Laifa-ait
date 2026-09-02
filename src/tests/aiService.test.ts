import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock("../config/gemini", () => {
  return {
    ai: {
      models: {
        generateContent: mockGenerateContent,
      },
    },
    DEFAULT_GEMINI_MODEL: "gemini-2.0-flash",
  };
});

// Mock fs to avoid actual file system writes during test
vi.mock("fs", () => {
  return {
    default: {
      existsSync: vi.fn(() => true),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
      readFileSync: vi.fn(() => `{"welcome": "Bienvenue"}`),
    },
  };
});

import { AiService } from "../services/AiService";
import fs from "fs";

describe("AiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should translate text successfully when Gemini succeeds", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: `{"en": "Welcome", "ar": "مرحبا"}`,
    });

    const result = await AiService.translateText("Bienvenue", ["en", "ar"]);

    expect(mockGenerateContent).toHaveBeenCalled();
    expect(result).toEqual({
      fr: "Bienvenue",
      en: "Welcome",
      ar: "مرحبا",
    });
  });

  it("should fallback grace when Gemini fails during translateText", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("API Quota Exceeded"));

    const result = await AiService.translateText("Bienvenue", ["en", "ar"]);

    expect(result).toEqual({
      fr: "Bienvenue",
      en: "Bienvenue (en)",
      ar: "Bienvenue (ar)",
    });
  });

  it("should translate single key successfully when Gemini succeeds", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: `{"en": "Hello", "ar": "أهلاً"}`,
    });

    const result = await AiService.translateSingleKey("Bonjour");

    expect(result).toEqual({
      en: "Hello",
      ar: "أهلاً",
    });
  });

  it("should fallback when Gemini fails during translateSingleKey", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("Network Error"));

    const result = await AiService.translateSingleKey("Bonjour");

    expect(result).toEqual({
      en: "Bonjour (EN)",
      ar: "Bonjour (AR)",
    });
  });

  it("should execute dualWrite with security validation", () => {
    const data = { welcome: "Bienvenue" };
    
    // Test with invalid language
    AiService.dualWrite("invalid-lang", data);
    expect(fs.writeFileSync).not.toHaveBeenCalled();

    // Test with valid language
    AiService.dualWrite("en", data);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
