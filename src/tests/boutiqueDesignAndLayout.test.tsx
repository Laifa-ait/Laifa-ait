// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { StoreBoutiqueNavbar } from '../components/Store/StoreBoutiqueNavbar';
import { StoreTrustBadges } from '../components/Store/StoreTrustBadges';
import { StoreProfileHeader } from '../components/Store/StoreProfileHeader';
import { PublicStoreInfo } from '../pages/Public/StoreProfile';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../components/Navbar', () => ({
  Navbar: () => <div id="global-navbar">Global Navbar</div>,
}));

vi.mock('../components/Footer', () => ({
  Footer: () => <div id="global-footer">Global Footer</div>,
}));

vi.mock('../components/MobileBottomNav', () => ({
  MobileBottomNav: () => <div id="mobile-bottom-nav">Mobile Bottom Nav</div>,
}));

vi.mock('../components/artisans/ArtisanMobileBottomNav', () => ({
  ArtisanMobileBottomNav: () => <div id="artisan-nav">Artisan Nav</div>,
}));

vi.mock('../components/Search/SearchOverlay', () => ({
  SearchOverlay: () => <div id="search-overlay" />,
}));

vi.mock('../components/Cart/CartDrawer', () => ({
  CartDrawer: () => <div id="cart-drawer" />,
}));

vi.mock('../components/Wishlist/WishlistDrawer', () => ({
  WishlistDrawer: () => <div id="wishlist-drawer" />,
}));

vi.mock('../components/Comparator/ComparatorDrawer', () => ({
  ComparatorDrawer: () => <div id="comparator-drawer" />,
}));

vi.mock('../components/RecentlyViewed/RecentlyViewedDrawer', () => ({
  RecentlyViewedDrawer: () => <div id="recently-viewed" />,
}));

vi.mock('../components/Layout/MobileMenu', () => ({
  MobileMenu: () => <div id="mobile-menu" />,
}));

vi.mock('../components/Auth/VerificationModal', () => ({
  VerificationModal: () => <div id="verification-modal" />,
}));

vi.mock('../components/Auth/AuthModal', () => ({
  AuthModal: () => <div id="auth-modal" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'fr' } }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: null }),
}));

vi.mock('../context/CartContext', () => ({
  useCart: () => ({ cart: [{ id: '1', quantity: 2 }] }),
  useOptionalCart: () => ({ cart: [{ id: '1', quantity: 2 }] }),
}));

vi.mock('../context/UIContext', () => ({
  useUI: () => ({ isCartOpen: false, setIsCartOpen: vi.fn(), isSearchOpen: false, isWishlistOpen: false }),
  useOptionalUI: () => ({ isCartOpen: false, setIsCartOpen: vi.fn(), isSearchOpen: false, isWishlistOpen: false }),
}));

describe('Boutique Design & Layout Isolation Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
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
  });

  it('1. Hides global Navbar, Footer and MobileBottomNav on /store/:sellerId', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/store/seller_alpha']}>
          <Layout>
            <div id="store-page-content">Store Page</div>
          </Layout>
        </MemoryRouter>
      );
    });

    expect(container?.querySelector('#store-page-content')).not.toBeNull();
    expect(container?.querySelector('#global-navbar')).toBeNull();
    expect(container?.querySelector('#global-footer')).toBeNull();
    expect(container?.querySelector('#mobile-bottom-nav')).toBeNull();
  });

  it('2. Hides global Navbar, Footer and MobileBottomNav on /boutique/:sellerId', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/boutique/seller_beta']}>
          <Layout>
            <div id="store-page-content">Boutique Page</div>
          </Layout>
        </MemoryRouter>
      );
    });

    expect(container?.querySelector('#store-page-content')).not.toBeNull();
    expect(container?.querySelector('#global-navbar')).toBeNull();
    expect(container?.querySelector('#global-footer')).toBeNull();
    expect(container?.querySelector('#mobile-bottom-nav')).toBeNull();
  });

  it('3. Retains global Navbar and Footer on standard pages like /shop', () => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/shop']}>
          <Layout>
            <div id="shop-content">Shop Page</div>
          </Layout>
        </MemoryRouter>
      );
    });

    expect(container?.querySelector('#shop-content')).not.toBeNull();
    expect(container?.querySelector('#global-navbar')).not.toBeNull();
    expect(container?.querySelector('#global-footer')).not.toBeNull();
  });

  it('4. StoreBoutiqueNavbar renders dedicated boutique brand, back button, and cart badge', () => {
    const mockStore: PublicStoreInfo = {
      id: 'store_1',
      sellerId: 'seller_alpha',
      shopName: 'Maison Chic Alger',
      wilaya: '16 - Alger',
    };

    act(() => {
      root?.render(
        <MemoryRouter>
          <StoreBoutiqueNavbar storeInfo={mockStore} />
        </MemoryRouter>
      );
    });

    expect(container?.textContent).toContain('Maison Chic Alger');
    expect(container?.textContent).toContain('16 - Alger');
    expect(container?.querySelector('button[aria-label="Retour au catalogue"]')).not.toBeNull();
    expect(container?.querySelector('button[aria-label="Panier d\'achat"]')).not.toBeNull();
    expect(container?.textContent).toContain('2');
  });

  it('5. StoreTrustBadges renders 58 wilayas and verified merchant guarantees', () => {
    const mockStore: PublicStoreInfo = {
      id: 'store_1',
      sellerId: 'seller_alpha',
      shopName: 'Maison Chic Alger',
      wilaya: '16 - Alger',
    };

    act(() => {
      root?.render(<StoreTrustBadges storeInfo={mockStore} />);
    });

    expect(container?.textContent).toContain('58 Wilayas');
    expect(container?.textContent).toContain('Livraison à domicile');
    expect(container?.textContent).toContain('Vendeur Vérifié');
    expect(container?.textContent).toContain('Paiement à la livraison');
  });

  it('6. StoreProfileHeader renders clean shop title, follow button, and subscriber stats', () => {
    const mockStore: PublicStoreInfo = {
      id: 'store_1',
      sellerId: 'seller_alpha',
      shopName: 'Maison Chic Alger',
      wilaya: '16 - Alger',
      followersCount: 142,
      rating: 4.9,
    };

    act(() => {
      root?.render(
        <StoreProfileHeader
          storeInfo={mockStore}
          isOwner={false}
          uploadingBanner={false}
          uploadingLogo={false}
          isFollowing={false}
          followLoading={false}
          d={(key) => (key === 'subscribers' ? 'Abonnés' : key)}
          onBannerSelect={vi.fn()}
          onLogoSelect={vi.fn()}
          onFollowToggle={vi.fn()}
        />
      );
    });

    expect(container?.querySelector('h1')?.textContent).toContain('Maison Chic Alger');
    expect(container?.textContent).toContain("S'abonner");
    expect(container?.textContent).toContain('142');
    expect(container?.textContent).toContain('4.9');
  });
});
