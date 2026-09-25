// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SuperAppSwitcherModal } from '../components/common/SuperAppSwitcherModal';
import { SuperAppBentoGrid } from '../components/common/SuperAppBentoGrid';
import { SUPER_APP_VERTICALS } from '../data/superAppData';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user-123' },
    userProfile: {
      role: 'buyer',
      capabilities: [],
    },
  }),
}));

describe('SuperAppSwitcherModal & BentoGrid Modern Design Tests', () => {
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
    container = null;
    root = null;
  });

  it('renders modern SuperAppBentoGrid with crystal clear cards, metrics, and active states', () => {
    const onSelect = vi.fn();

    act(() => {
      root?.render(
        <SuperAppBentoGrid
          verticals={SUPER_APP_VERTICALS}
          activeId="immo"
          onSelect={onSelect}
        />
      );
    });

    // Check titles
    expect(container?.textContent).toContain('Olma Marketplace');
    expect(container?.textContent).toContain('Olma Immo');
    expect(container?.textContent).toContain('Olma Bricolage & Pro');
    expect(container?.textContent).toContain('Boutiques Officielles');

    // Check badges
    expect(container?.textContent).toContain('69 Wilayas');
    expect(container?.textContent).toContain('Papiers DZ');
    expect(container?.textContent).toContain('Vérifiés');
    expect(container?.textContent).toContain('Certifié');

    // Check metrics
    expect(container?.textContent).toContain('150K+ Produits');
    expect(container?.textContent).toContain('2 800+ Biens');
    expect(container?.textContent).toContain('950+ Artisans');
    expect(container?.textContent).toContain('420+ Boutiques');

    // Check active indicator on Immo
    expect(container?.textContent).toContain('Actif');
    expect(container?.textContent).toContain('En cours');

    // Check click trigger
    const marketplaceBtn = Array.from(container?.querySelectorAll('button') || []).find(
      (btn) => btn.textContent?.includes('Olma Marketplace')
    );
    expect(marketplaceBtn).toBeDefined();

    act(() => {
      marketplaceBtn?.click();
    });

    expect(onSelect).toHaveBeenCalledWith('/');
  });

  it('renders SuperAppSwitcherModal with header, footer, and close action', () => {
    const onClose = vi.fn();

    act(() => {
      root?.render(
        <MemoryRouter initialEntries={['/immo']}>
          <SuperAppSwitcherModal isOpen={true} onClose={onClose} />
        </MemoryRouter>
      );
    });

    expect(container?.textContent).toContain('Écosystème Olmart');
    expect(container?.textContent).toContain('Super-App DZ');
    expect(container?.textContent).toContain(
      'Basculez instantanément entre vos univers avec votre compte unique'
    );
    expect(container?.textContent).toContain('Compte Unique & Session Unifiée');
    expect(container?.textContent).toContain("69 Wilayas d'Algérie");

    // Close button test
    const closeBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.querySelector('svg.lucide-x')
    );
    expect(closeBtn).toBeDefined();

    act(() => {
      closeBtn?.click();
    });

    expect(onClose).toHaveBeenCalled();
  });
});
