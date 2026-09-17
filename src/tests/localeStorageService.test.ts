import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { LocaleStorageService } from "../services/LocaleStorageService";

describe("LocaleStorageService", () => {
  const testDir = path.join(process.cwd(), "tmp-test-locales");
  const testFile = path.join(testDir, "test.json");

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    LocaleStorageService.clearCache();
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    LocaleStorageService.clearCache();
  });

  it("should write and read json atomically", () => {
    const payload = { hello: "world", count: 42 };
    const success = LocaleStorageService.safeWriteJsonAtomic(testFile, payload);
    expect(success).toBe(true);

    const readBack = LocaleStorageService.safeReadJson(testFile);
    expect(readBack).toEqual(payload);
  });

  it("should recover from corrupted JSON using .bak file", () => {
    const validData = { status: "good", key: "value" };
    LocaleStorageService.safeWriteJsonAtomic(testFile, validData);

    // Create a corrupted version directly in the main file
    fs.writeFileSync(testFile, "{ incomplete json ... broken", "utf8");

    const recovered = LocaleStorageService.safeReadJson(testFile, { fallback: true });
    expect(recovered).toEqual(validData);
  });

  it("should return fallback if file does not exist and no backup", () => {
    const missingFile = path.join(testDir, "non-existent.json");
    const fallback = { empty: true };
    const result = LocaleStorageService.safeReadJson(missingFile, fallback);
    expect(result).toEqual(fallback);
  });

  it("should manage in-memory cache correctly", () => {
    const localeData = { title: "Olmart" };
    LocaleStorageService.setCachedLocale("fr", localeData);

    expect(LocaleStorageService.getCachedLocale("fr")).toEqual(localeData);
    expect(LocaleStorageService.getCachedLocale("ar")).toBeNull();

    LocaleStorageService.clearCache("fr");
    expect(LocaleStorageService.getCachedLocale("fr")).toBeNull();
  });
});
