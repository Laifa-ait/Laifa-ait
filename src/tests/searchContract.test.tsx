// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import express from "express";
import { Server } from "http";
import { AddressInfo } from "net";

import router from "../domains/product/product.routes";
import { GlobalSearchModal } from "../components/common/GlobalSearchModal";
import { SearchApiResponse } from "../types/search";
import { ProductSearchService } from "../services/ProductSearchService";

// Mock translation and router for UI rendering
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === "no_results_for") return `Aucun résultat pour "${options?.query}"`;
      if (key === "search_cmd_placeholder") return "Rechercher un produit...";
      if (key === "search_products_section") return "Produits";
      if (key === "search_stores_section") return "Boutiques";
      return key;
    },
    i18n: { language: "fr" },
  }),
}));

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver || (MockResizeObserver as unknown as typeof ResizeObserver);
if (typeof window !== "undefined" && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = window.HTMLElement.prototype.scrollIntoView || vi.fn();
}

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Search API Contract & GlobalSearchModal Integration Suite", () => {
  let server: Server;
  let serverBaseUrl: string;
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  const originalFetch = globalThis.fetch;

  beforeAll(async () => {
    // 1. Setup a real live Express server hosting the real /api/v1/search routes
    const app = express();
    app.use(express.json());
    app.use(router);

    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const address = server.address() as AddressInfo;
        serverBaseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    // 2. Intercept globalThis.fetch to redirect relative /api/v1/search calls to the real running Express server
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (urlStr.startsWith("/api/v1/")) {
        return originalFetch(`${serverBaseUrl}${urlStr}`, init);
      }
      return originalFetch(input, init);
    };
  });

  afterAll(async () => {
    globalThis.fetch = originalFetch;
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root?.unmount();
      });
      container.remove();
    }
    container = null;
    root = null;
  });

  describe("API Contract Schema Validation (/api/v1/search)", () => {
    it("returns conforming schema structure with products, stores, total, page, limit, hasMore", async () => {
      // Mock performSearch backend logic returning real structured data
      const mockResultData: SearchApiResponse = {
        products: [
          {
            id: "prod_contract_1",
            title: "MacBook Pro M3 Max",
            name: "MacBook Pro M3 Max",
            price: 450000,
            category: "Informatique",
            wilaya: "Alger",
            stock: 5,
            sellerId: "seller_contract_1",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as unknown as SearchApiResponse["products"][0],
        ],
        stores: [
          {
            id: "seller_contract_1",
            shopName: "Apple Store Alger",
            displayName: "Apple Store Alger",
            shopDescription: "Boutique officielle produits Apple",
            wilaya: 16,
          },
        ],
        total: 1,
        page: 1,
        limit: 5,
        hasMore: false,
      };

      const performSearchSpy = vi.spyOn(ProductSearchService, "performSearch").mockResolvedValue(mockResultData);

      const response = await fetch(`${serverBaseUrl}/api/v1/search?q=MacBook&limit=5`);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(performSearchSpy).toHaveBeenCalled();
      
      // Validate contract constraints
      expect(Array.isArray(json.products)).toBe(true);
      expect(Array.isArray(json.stores)).toBe(true);
      expect(typeof json.total).toBe("number");
      expect(typeof json.page).toBe("number");
      expect(typeof json.limit).toBe("number");
      expect(typeof json.hasMore).toBe("boolean");

      expect(json.products[0].name).toBe("MacBook Pro M3 Max");
      expect(json.products[0].price).toBe(450000);
      expect(json.stores[0].shopName).toBe("Apple Store Alger");

      performSearchSpy.mockRestore();
    });
  });

  describe("End-to-End Component Contract Integration (GlobalSearchModal <-> /api/v1/search)", () => {
    it("fetches directly from real Express endpoint via apiGet and renders products and stores in UI", async () => {
      const mockResultData: SearchApiResponse = {
        products: [
          {
            id: "contract_p1",
            title: "Perceuse Bosch Pro 18V",
            name: "Perceuse Bosch Pro 18V",
            price: 28000,
            category: "Bricolage",
            wilaya: "Oran",
            stock: 12,
            sellerId: "seller_brico_oran",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as unknown as SearchApiResponse["products"][0],
        ],
        stores: [
          {
            id: "seller_brico_oran",
            shopName: "Quincaillerie Moderne Oran",
            displayName: "Quincaillerie Moderne Oran",
            wilaya: 31,
          },
        ],
        total: 1,
        page: 1,
        limit: 5,
        hasMore: false,
      };

      const performSearchSpy = vi.spyOn(ProductSearchService, "performSearch").mockResolvedValue(mockResultData);

      // Render Modal
      act(() => {
        root?.render(<GlobalSearchModal />);
      });

      // Open Modal
      act(() => {
        window.dispatchEvent(new CustomEvent("open-global-search"));
      });

      const input = document.querySelector("input") as HTMLInputElement;
      expect(input).not.toBeNull();

      // Trigger search debounce and real fetch through the live Express server
      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(input, "Bosch");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 450));
      });

      // Verify DOM reflects live payload from Express server
      expect(document.body.textContent).toContain("Perceuse Bosch Pro 18V");
      expect(document.body.textContent).toContain("Quincaillerie Moderne Oran");
      expect(document.body.textContent).toContain("28,000");

      performSearchSpy.mockRestore();
    });

    it("renders empty state correctly when real endpoint returns 0 matches", async () => {
      const emptyResultData: SearchApiResponse = {
        products: [],
        stores: [],
        total: 0,
        page: 1,
        limit: 5,
        hasMore: false,
      };

      const performSearchSpy = vi.spyOn(ProductSearchService, "performSearch").mockResolvedValue(emptyResultData);

      act(() => {
        root?.render(<GlobalSearchModal />);
      });

      act(() => {
        window.dispatchEvent(new CustomEvent("open-global-search"));
      });

      const input = document.querySelector("input") as HTMLInputElement;
      expect(input).not.toBeNull();

      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(input, "Introuvable999");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 450));
      });

      expect(document.body.textContent).toContain('Aucun résultat pour "Introuvable999"');

      performSearchSpy.mockRestore();
    });

    it("handles 500 error from /api/v1/search endpoint gracefully in UI without crashing", async () => {
      const performSearchSpy = vi.spyOn(ProductSearchService, "performSearch").mockRejectedValue(new Error("Database offline"));

      act(() => {
        root?.render(<GlobalSearchModal />);
      });

      act(() => {
        window.dispatchEvent(new CustomEvent("open-global-search"));
      });

      const input = document.querySelector("input") as HTMLInputElement;
      expect(input).not.toBeNull();

      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(input, "CrashTrigger");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        // Wait long enough for apiGet retry loop (1s + 2s + timeout)
        await new Promise((r) => setTimeout(r, 3500));
      });

      // Handled cleanly, display fallback no results without throwing unhandled exception
      expect(document.body.textContent).toContain('Aucun résultat pour "CrashTrigger"');

      performSearchSpy.mockRestore();
    });
  });
});
