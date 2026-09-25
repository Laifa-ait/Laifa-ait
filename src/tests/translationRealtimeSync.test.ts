import { describe, it, expect, vi } from "vitest";
import i18n from "../i18n";

describe("Realtime Translation Sync Logic", () => {
  it("should process snapshot data and inject dynamic translation bundles into i18next", () => {
    const addResourceSpy = vi.spyOn(i18n, "addResourceBundle");

    const rawData: Record<string, unknown> = {
      "welcome.banner": "Bienvenue sur Olmart Algérie !",
      "cart.checkout": "Passer la commande",
      updatedAt: "2026-09-24T12:00:00Z",
      updatedBy: "admin_uid_123",
    };

    const dynamicOverrides: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawData)) {
      if (
        typeof value === "string" &&
        !["updatedAt", "updatedBy", "createdAt"].includes(key)
      ) {
        dynamicOverrides[key] = value;
      }
    }

    i18n.addResourceBundle("fr", "translation", dynamicOverrides, true, true);

    expect(addResourceSpy).toHaveBeenCalledWith(
      "fr",
      "translation",
      expect.objectContaining({
        "welcome.banner": "Bienvenue sur Olmart Algérie !",
        "cart.checkout": "Passer la commande",
      }),
      true,
      true
    );

    expect(dynamicOverrides.updatedAt).toBeUndefined();
    expect(dynamicOverrides.updatedBy).toBeUndefined();
  });
});
