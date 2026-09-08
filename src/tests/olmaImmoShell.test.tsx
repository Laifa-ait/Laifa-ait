// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OlmaImmoShell } from '../components/OlmaImmo/OlmaImmoShell';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    userProfile: null,
    openAuthModal: vi.fn(),
  }),
}));

vi.mock('../context/UIContext', () => ({
  useUI: () => ({
    isCartOpen: false,
    setIsCartOpen: vi.fn(),
    isWishlistOpen: false,
    setIsWishlistOpen: vi.fn(),
    isMobileMenuOpen: false,
    setIsMobileMenuOpen: vi.fn(),
    isSearchOpen: false,
    setIsSearchOpen: vi.fn(),
    isRecentlyViewedOpen: false,
    setIsRecentlyViewedOpen: vi.fn(),
    isStickyBuyBarVisible: false,
    setIsStickyBuyBarVisible: vi.fn(),
  }),
  UIProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}));

vi.mock('../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => true,
}));

describe('OLM-IMMO 2.1 — OlmaImmoShell Component Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
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
    container = null;
    root = null;
  });

  const renderShell = (props: React.ComponentProps<typeof OlmaImmoShell>) => {
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/immo']}>
          <OlmaImmoShell {...props} />
        </MemoryRouter>
      );
    });
  };

  it('1. rend correctement le Shell avec son conteneur racine', () => {
    renderShell({
      children: <div data-testid="test-child">Contenu test</div>,
    });

    const shell = container?.querySelector('[data-testid="olma-immo-shell"]');
    expect(shell).not.toBeNull();
  });

  it('2. garantit la présence stricte de la classe de scope .olma-immo-scope sur la racine', () => {
    renderShell({
      children: <div>Contenu</div>,
    });

    const scopedElement = container?.querySelector('.olma-immo-scope');
    expect(scopedElement).not.toBeNull();
    expect(scopedElement?.getAttribute('data-testid')).toBe('olma-immo-shell');
  });

  it('3. rend fidèlement les children à lintérieur du landmark principal', () => {
    renderShell({
      children: <p id="unique-content">Bienvenue sur Olma Immo Algérie</p>,
    });

    const main = container?.querySelector('#olma-immo-content');
    const child = main?.querySelector('#unique-content');
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe('Bienvenue sur Olma Immo Algérie');
  });

  it('4. gère le Header par défaut (OlmaImmoNavbar) et accepte un Header personnalisé ou null', () => {
    // Par défaut, OlmaImmoNavbar est rendu
    renderShell({
      children: <div>Test</div>,
    });
    expect(container?.textContent).toContain('OLMA');
    expect(container?.textContent).toContain('IMMO');

    // Header personnalisé
    renderShell({
      header: <div id="custom-header">Mon Header Personnalisé</div>,
      children: <div>Test</div>,
    });
    expect(container?.querySelector('#custom-header')).not.toBeNull();
    expect(container?.textContent).toContain('Mon Header Personnalisé');

    // Header désactivé explicitement
    renderShell({
      header: null,
      children: <div>Test sans header</div>,
    });
    expect(container?.querySelector('header')).toBeNull();
    expect(container?.querySelector('#custom-header')).toBeNull();
  });

  it('5. contrôle laffichage de la navigation mobile via showBottomNav', () => {
    // Par défaut showBottomNav=true
    renderShell({
      children: <div>Test BottomNav</div>,
    });
    const defaultNavBtn = container?.querySelector('#olma-immo-bottom-explorer');
    expect(defaultNavBtn).not.toBeNull();

    // showBottomNav=false désactive le rendu
    renderShell({
      showBottomNav: false,
      children: <div>Test sans BottomNav</div>,
    });
    const disabledNavBtn = container?.querySelector('#olma-immo-bottom-explorer');
    expect(disabledNavBtn).toBeNull();
  });

  it('6. fournit le landmark sémantique <main> pour laccessibilité', () => {
    renderShell({
      children: <div>Landmark test</div>,
    });

    const main = container?.querySelector('main');
    expect(main).not.toBeNull();
    expect(main?.tagName.toLowerCase()).toBe('main');
  });

  it('7. attribue lidentifiant stable #olma-immo-content au contenu principal', () => {
    renderShell({
      children: <div>Identifiant test</div>,
    });

    const main = container?.querySelector('#olma-immo-content');
    expect(main).not.toBeNull();
    expect(main?.id).toBe('olma-immo-content');
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('8. gère la prop fullWidth pour basculer entre centrage max-w-7xl et pleine largeur', () => {
    // fullWidth = false (défaut)
    renderShell({
      fullWidth: false,
      children: <div>Contenu contraint</div>,
    });
    const mainConstrained = container?.querySelector('#olma-immo-content');
    expect(mainConstrained?.className).toContain('max-w-7xl');
    expect(mainConstrained?.className).toContain('mx-auto');

    // fullWidth = true
    renderShell({
      fullWidth: true,
      children: <div>Contenu pleine largeur</div>,
    });
    const mainFullWidth = container?.querySelector('#olma-immo-content');
    expect(mainFullWidth?.className).not.toContain('max-w-7xl');
  });

  it('9. applique et fusionne les classes personnalisées sur <main> via cn()', () => {
    renderShell({
      className: 'space-y-12 py-10 my-custom-class',
      children: <div>Custom class</div>,
    });

    const main = container?.querySelector('#olma-immo-content');
    expect(main?.className).toContain('my-custom-class');
    expect(main?.className).toContain('space-y-12');
    expect(main?.className).toContain('py-10');
  });

  it('10. contrôle le padding inférieur : showBottomNav=true réserve pb-20 md:pb-8, showBottomNav=false ne l\'applique pas', () => {
    // showBottomNav = true (défaut)
    renderShell({
      children: <div>Avec padding nav</div>,
    });
    const mainWithPadding = container?.querySelector('#olma-immo-content');
    expect(mainWithPadding?.className).toContain('pb-20');
    expect(mainWithPadding?.className).toContain('md:pb-8');

    // showBottomNav = false
    renderShell({
      showBottomNav: false,
      children: <div>Sans padding nav</div>,
    });
    const mainWithoutPadding = container?.querySelector('#olma-immo-content');
    expect(mainWithoutPadding?.className).not.toContain('pb-20');
    expect(mainWithoutPadding?.className).not.toContain('md:pb-8');
  });

  it('11. fonctionne parfaitement sans régression lorsque Header et BottomNav sont tous deux omis', () => {
    renderShell({
      header: null,
      showBottomNav: false,
      children: <div id="pure-content">Contenu isolé</div>,
    });

    expect(container?.querySelector('header')).toBeNull();
    expect(container?.querySelector('#olma-immo-bottom-explorer')).toBeNull();
    expect(container?.querySelector('#pure-content')).not.toBeNull();
  });

  it('12. fournit un skip-link accessible reliant vers #olma-immo-content', () => {
    renderShell({
      children: <div>Skip link check</div>,
    });

    const skipLink = container?.querySelector('a[href="#olma-immo-content"]');
    expect(skipLink).not.toBeNull();
    expect(skipLink?.textContent).toContain('Passer au contenu immobilier');
  });

  it('13. exporte un composant mémorisé avec un displayName explicite pour React DevTools', () => {
    expect((OlmaImmoShell as { displayName?: string }).displayName).toBe('OlmaImmoShell');
  });

  it('14. structurel : garantit l\'absence de landmarks <main> imbriqués lors du rendu avec Layout sur les routes /immo', async () => {
    const { Layout } = await import('../components/Layout/Layout');
    
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/immo']}>
          <Layout>
            <OlmaImmoShell>
              <div id="immo-page-body">Page Immo</div>
            </OlmaImmoShell>
          </Layout>
        </MemoryRouter>
      );
    });

    const mainElements = container?.querySelectorAll('main');
    expect(mainElements?.length).toBe(1);
    expect(mainElements?.[0]?.id).toBe('olma-immo-content');
    
    // Le conteneur Layout sous /immo est un div et non un main
    const layoutContainer = container?.querySelector('#main-content');
    expect(layoutContainer).not.toBeNull();
    expect(layoutContainer?.tagName.toLowerCase()).toBe('div');
  });

  it('15. non-régression Marketplace : Layout conserve son propre landmark <main id="main-content"> sur les routes hors immo', async () => {
    const { Layout } = await import('../components/Layout/Layout');
    
    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/shop']}>
          <Layout>
            <div id="shop-page-body">Catalogue Marketplace</div>
          </Layout>
        </MemoryRouter>
      );
    });

    const mainElements = container?.querySelectorAll('main');
    expect(mainElements?.length).toBe(1);
    expect(mainElements?.[0]?.id).toBe('main-content');
    expect(container?.querySelector('a[href="#main-content"]')).not.toBeNull();
  });
});
