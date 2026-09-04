// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ShopSponsoredBar } from "../components/Shop/ShopSponsoredBar";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Sparkles: () => <span data-testid="sparkles-icon" />,
  ExternalLink: () => <span data-testid="external-link-icon" />,
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
}));

// Mock SponsoredProductCard
vi.mock("../components/Sponsorship/SponsoredProductCard", () => ({
  SponsoredProductCard: ({ item }: { item: { product?: { name?: string } } }) => (
    <div data-testid="sponsored-card">{item?.product?.name}</div>
  ),
}));

describe("ShopSponsoredBar Component", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("should reset onSponsoredProductIdsLoaded to [] on empty response", async () => {
    const onLoaded = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    await act(async () => {
      root?.render(
        <ShopSponsoredBar placement="category" category="Mode" onSponsoredProductIdsLoaded={onLoaded} />
      );
    });

    // onLoaded should be called with [] on start and when empty
    expect(onLoaded).toHaveBeenCalledWith([]);
  });

  it("should reset onSponsoredProductIdsLoaded to [] on HTTP error", async () => {
    const onLoaded = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await act(async () => {
      root?.render(
        <ShopSponsoredBar placement="search" searchQuery="chaussures" onSponsoredProductIdsLoaded={onLoaded} />
      );
    });

    expect(onLoaded).toHaveBeenCalledWith([]);
  });

  it("should reset onSponsoredProductIdsLoaded to [] on network throw", async () => {
    const onLoaded = vi.fn();

    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network disconnect"));

    await act(async () => {
      root?.render(
        <ShopSponsoredBar placement="search" onSponsoredProductIdsLoaded={onLoaded} />
      );
    });

    expect(onLoaded).toHaveBeenCalledWith([]);
  });

  it("should call onSponsoredProductIdsLoaded with [] on unmount", async () => {
    const onLoaded = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            campaignId: "c1",
            placement: "search",
            product: { id: "p1", name: "Produit 1", price: 1000, isSponsored: true },
          },
        ],
      }),
    } as Response);

    await act(async () => {
      root?.render(
        <ShopSponsoredBar placement="search" onSponsoredProductIdsLoaded={onLoaded} />
      );
    });

    expect(onLoaded).toHaveBeenCalledWith(["p1"]);

    // Unmount
    await act(async () => {
      root?.unmount();
      root = null;
    });

    expect(onLoaded).toHaveBeenLastCalledWith([]);
  });
});
