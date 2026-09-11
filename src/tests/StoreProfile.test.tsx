// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../lib/firebase", () => ({ app: {}, auth: { currentUser: null, onAuthStateChanged: vi.fn() }, db: {}, storage: {} }));
vi.mock("firebase/firestore", () => ({ collection: vi.fn(), query: vi.fn(), where: vi.fn(), getDocs: vi.fn(), doc: vi.fn(), setDoc: vi.fn(), updateDoc: vi.fn(), getDoc: vi.fn() }));
vi.mock("../lib/api", () => ({
  apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn(), apiDelete: vi.fn(),
}));

let mockParams: Record<string, string | undefined> = { sellerId: "seller_123" };
vi.mock("react-router-dom", () => ({ useParams: () => mockParams, useNavigate: () => vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { language: "fr" } }) }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ currentUser: null }) }));
vi.mock("react-hot-toast", () => ({ toast: { loading: vi.fn(), success: vi.fn(), error: vi.fn() } }));
vi.mock("../services/storeRepository", () => ({ checkStoreFollowStatus: vi.fn().mockResolvedValue(false), toggleStoreFollow: vi.fn().mockResolvedValue(true) }));
vi.mock("../components/Store/StoreProfileHeader", () => ({ StoreProfileHeader: ({ storeInfo }: { storeInfo: { shopName: string } }) => <div id="store-profile-header">{storeInfo.shopName}</div> }));
vi.mock("../components/Store/StoreProductsFilter", () => ({ StoreProductsFilter: () => <div id="store-products-filter" /> }));
vi.mock("../components/Shop/SellerCouponBanner", () => ({ SellerCouponBanner: () => <div id="seller-coupon-banner" /> }));
vi.mock("../components/Product/ProductCard", () => ({ ProductCard: ({ product }: { product: { id: string; name: string } }) => <div id={`product-${product.id}`}>{product.name}</div> }));
vi.mock("../components/Store/StoreAboutView", () => ({ StoreAboutView: () => <div id="store-about-view" /> }));
vi.mock("../components/ui/Spinner", () => ({ Spinner: () => <div id="spinner">Loading...</div> }));

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import { StoreProfile } from "../pages/Public/StoreProfile";
import * as apiModule from "../lib/api";
import * as firestoreModule from "firebase/firestore";

describe("StoreProfile & useStoreProfile Targeted Suite", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { sellerId: "seller_123" };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => { root?.unmount(); });
    if (container?.parentNode) container.parentNode.removeChild(container);
    container = null;
    root = null;
  });

  it("1. Consumes { success: true, shop } from /api/v1/public/shops/:sellerId and renders shop", async () => {
    const mockShop = {
      id: "seller_123", sellerId: "seller_123", shopName: "Boutique El Bahdja", shopDescription: "Artisanat algérien",
      wilaya: "Alger", legalStatus: "Auto-entrepreneur", avgPreparationTime: "24h", returnPolicy: "Retours 7j", rating: 4.8,
    };
    vi.mocked(apiModule.apiGet).mockResolvedValueOnce({ success: true, shop: mockShop });
    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce({
      docs: [{ id: "prod_1", data: () => ({ name: "Karakou Traditionnel", category: "Vêtements", status: "active" }) }],
    } as unknown as firestoreModule.QuerySnapshot);

    await act(async () => { root?.render(<StoreProfile />); });

    expect(apiModule.apiGet).toHaveBeenCalledWith("/api/v1/public/shops/seller_123");
    expect(container?.querySelector("#store-profile-header")?.textContent).toContain("Boutique El Bahdja");
    expect(container?.querySelector("#product-prod_1")?.textContent).toContain("Karakou Traditionnel");
    expect(firestoreModule.getDoc).not.toHaveBeenCalled();
  });

  it("2. Distinguishes 404 error and displays 'Boutique Introuvable' without calling Firestore fallbacks", async () => {
    vi.mocked(apiModule.apiGet).mockRejectedValueOnce(Object.assign(new Error("Shop not found"), { status: 404 }));

    await act(async () => { root?.render(<StoreProfile />); });

    expect(apiModule.apiGet).toHaveBeenCalledWith("/api/v1/public/shops/seller_123");
    expect(container?.textContent).toContain("Boutique Introuvable");
    expect(container?.textContent).toContain("Ce vendeur n'existe pas ou la boutique a été fermée.");
    expect(container?.textContent).not.toContain("Erreur de chargement");
    expect(firestoreModule.getDoc).not.toHaveBeenCalled();
  });

  it("3. Distinguishes 500 / Network error and displays 'Erreur de chargement' with retry option", async () => {
    vi.mocked(apiModule.apiGet).mockRejectedValueOnce(Object.assign(new Error("Internal server error"), { status: 500 }));

    await act(async () => { root?.render(<StoreProfile />); });

    expect(apiModule.apiGet).toHaveBeenCalledWith("/api/v1/public/shops/seller_123");
    expect(container?.textContent).toContain("Erreur de chargement");
    expect(container?.textContent).toContain("Impossible de charger les informations de cette boutique");
    expect(container?.textContent).not.toContain("Ce vendeur n'existe pas ou la boutique a été fermée.");
    expect(container?.textContent).toContain("Réessayer");
    expect(firestoreModule.getDoc).not.toHaveBeenCalled();
  });

  it("4. Incoherent API response (e.g. success: false or missing shop) triggers technical serverError, not 404", async () => {
    vi.mocked(apiModule.apiGet).mockResolvedValueOnce({ success: false, error: "Unexpected response format" });

    await act(async () => { root?.render(<StoreProfile />); });

    expect(apiModule.apiGet).toHaveBeenCalledWith("/api/v1/public/shops/seller_123");
    expect(container?.textContent).toContain("Erreur de chargement");
    expect(container?.textContent).toContain("Impossible de charger les informations de cette boutique");
    expect(container?.textContent).not.toContain("Boutique Introuvable");
    expect(container?.textContent).not.toContain("Ce vendeur n'existe pas ou la boutique a été fermée.");
    expect(container?.textContent).toContain("Réessayer");
    expect(firestoreModule.getDoc).not.toHaveBeenCalled();
  });

  it("5. Prevents race condition / late response from overriding current state when sellerId changes", async () => {
    let resolveFirstRequest: ((value: unknown) => void) | null = null;
    const firstRequestPromise = new Promise((resolve) => { resolveFirstRequest = resolve; });

    vi.mocked(apiModule.apiGet).mockImplementationOnce(() => firstRequestPromise as Promise<unknown>);
    await act(async () => { root?.render(<StoreProfile />); });

    mockParams = { sellerId: "seller_456" };
    const mockShop456 = { id: "seller_456", sellerId: "seller_456", shopName: "Boutique Tizi", wilaya: "Tizi Ouzou" };
    vi.mocked(apiModule.apiGet).mockResolvedValueOnce({ success: true, shop: mockShop456 });
    vi.mocked(firestoreModule.getDocs).mockResolvedValueOnce({ docs: [] } as unknown as firestoreModule.QuerySnapshot);

    await act(async () => { root?.render(<StoreProfile />); });
    expect(container?.querySelector("#store-profile-header")?.textContent).toContain("Boutique Tizi");

    await act(async () => {
      if (resolveFirstRequest) {
        resolveFirstRequest({ success: true, shop: { id: "seller_123", sellerId: "seller_123", shopName: "STALE SHOP NAME", wilaya: "Alger" } });
      }
    });

    expect(container?.querySelector("#store-profile-header")?.textContent).toContain("Boutique Tizi");
    expect(container?.textContent).not.toContain("STALE SHOP NAME");
  });

  it("6. Isolates product fetching error: preserves shop profile and displays products error instead of 'Boutique Vide'", async () => {
    const mockShop = { id: "seller_123", sellerId: "seller_123", shopName: "Boutique Oran", wilaya: "Oran" };
    vi.mocked(apiModule.apiGet).mockResolvedValueOnce({ success: true, shop: mockShop });
    vi.mocked(firestoreModule.getDocs).mockRejectedValueOnce(new Error("Firestore index or network error"));

    await act(async () => { root?.render(<StoreProfile />); });

    expect(container?.querySelector("#store-profile-header")?.textContent).toContain("Boutique Oran");
    expect(container?.textContent).not.toContain("Boutique Introuvable");
    expect(container?.textContent).not.toContain("Erreur de chargement");
    expect(container?.textContent).toContain("Impossible de charger les articles");
    expect(container?.textContent).toContain("Une erreur est survenue lors de la récupération des produits de cette boutique.");
    expect(container?.textContent).not.toContain("Boutique Vide");
    expect(container?.textContent).not.toContain("Ce vendeur n'a pas encore ajouté d'articles actifs.");
  });

  it("7. During products fetching, keeps loading state and does not prematurely show 'Boutique Vide'", async () => {
    const mockShop = { id: "seller_123", sellerId: "seller_123", shopName: "Boutique Constantine", wilaya: "Constantine" };
    vi.mocked(apiModule.apiGet).mockResolvedValueOnce({ success: true, shop: mockShop });

    let resolveProducts: ((value: unknown) => void) | null = null;
    const pendingProductsPromise = new Promise((resolve) => { resolveProducts = resolve; });
    vi.mocked(firestoreModule.getDocs).mockImplementationOnce(() => pendingProductsPromise as Promise<firestoreModule.QuerySnapshot>);

    await act(async () => { root?.render(<StoreProfile />); });

    expect(container?.querySelector("#spinner")).not.toBeNull();
    expect(container?.textContent).not.toContain("Boutique Vide");
    expect(container?.textContent).not.toContain("Ce vendeur n'a pas encore ajouté d'articles actifs.");

    await act(async () => {
      if (resolveProducts) {
        resolveProducts({ docs: [] });
      }
    });

    expect(container?.querySelector("#spinner")).toBeNull();
    expect(container?.textContent).toContain("Boutique Constantine");
    expect(container?.textContent).toContain("Boutique Vide");
  });
});
