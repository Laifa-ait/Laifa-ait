// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { OlmaDesktopToolbar } from '../components/OlmaImmo/OlmaDesktopToolbar';
import { OlmaImmoPropertiesSection } from '../components/OlmaImmo/OlmaImmoPropertiesSection';
import { PublicPropertyDTO } from '../types/realEstate';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Olma Immo Dedicated Desktop PC Design Tests', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
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

  it('renders OlmaDesktopToolbar with count, cadastral status and layout controls', () => {
    const onViewChange = vi.fn();
    const onSplitRatioChange = vi.fn();
    const onFilterChange = vi.fn();

    act(() => {
      root?.render(
        <OlmaDesktopToolbar
          propertiesCount={14}
          activeView="split"
          onViewChange={onViewChange}
          splitRatio="balanced"
          onSplitRatioChange={onSplitRatioChange}
          filters={{ wilaya: 'Alger', sort: 'recent' }}
          onFilterChange={onFilterChange}
        />
      );
    });

    expect(container?.textContent).toContain('14 biens disponibles');
    expect(container?.textContent).toContain('à Alger');
    expect(container?.textContent).toContain('Contrôle Cadastral & Notarié');
    expect(container?.textContent).toContain('Acte notarié & Livret');
    expect(container?.textContent).toContain('Mixte');
    expect(container?.textContent).toContain('Grille');
    expect(container?.textContent).toContain('Carte');
    expect(container?.textContent).toContain('Focus Liste');
    expect(container?.textContent).toContain('Focus Carte');
  });

  it('allows switching split ratio from OlmaDesktopToolbar', () => {
    const onSplitRatioChange = vi.fn();

    act(() => {
      root?.render(
        <OlmaDesktopToolbar
          propertiesCount={5}
          activeView="split"
          onViewChange={vi.fn()}
          splitRatio="balanced"
          onSplitRatioChange={onSplitRatioChange}
        />
      );
    });

    const focusListBtn = Array.from(container?.querySelectorAll('button') || []).find(
      (btn) => btn.textContent?.includes('Focus Liste')
    );
    expect(focusListBtn).toBeDefined();

    act(() => {
      focusListBtn?.click();
    });

    expect(onSplitRatioChange).toHaveBeenCalledWith('focus-list');
  });

  it('triggers view mode change when desktop user clicks Grille or Carte', () => {
    const onViewChange = vi.fn();

    act(() => {
      root?.render(
        <OlmaDesktopToolbar
          propertiesCount={5}
          activeView="split"
          onViewChange={onViewChange}
          splitRatio="balanced"
          onSplitRatioChange={vi.fn()}
        />
      );
    });

    const gridBtn = Array.from(container?.querySelectorAll('button') || []).find(
      (btn) => btn.textContent?.includes('Grille')
    );
    expect(gridBtn).toBeDefined();

    act(() => {
      gridBtn?.click();
    });

    expect(onViewChange).toHaveBeenCalledWith('grid');
  });

  it('supports PC keyboard shortcuts (S, G, M) in OlmaImmoPropertiesSection', () => {
    const onViewModeChange = vi.fn();
    const cardRefs = { current: {} };

    const sampleProperty: PublicPropertyDTO = {
      id: 'prop-pc-1',
      title: 'Penthouse Vue Mer Alger',
      description: 'Superbe penthouse à El Biar',
      price: 65000000,
      location: {
        wilaya: 'Alger',
        commune: 'El Biar',
        address: 'Boulevard Bougara',
        lat: 36.76,
        lng: 3.04,
      },
      propertyType: 'apartment',
      listingType: 'sale',
      areaSquareMeters: 220,
      rooms: 4,
      bathrooms: 2,
      features: ['vue_mer'],
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      legalPapers: ['acte_notarie'],
      status: 'active',
    };

    act(() => {
      root?.render(
        <MemoryRouter>
          <OlmaImmoPropertiesSection
            properties={[sampleProperty]}
            mapResults={[]}
            selectedPropertyId={undefined}
            onSelectProperty={vi.fn()}
            viewMode="split"
            onViewModeChange={onViewModeChange}
            isLoading={false}
            cardRefs={cardRefs}
            onBoundsChange={vi.fn()}
            onResetFilters={vi.fn()}
          />
        </MemoryRouter>
      );
    });

    // Simulate keypress 'g' for Grid
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
    });
    expect(onViewModeChange).toHaveBeenCalledWith('grid');

    // Simulate keypress 'm' for Map
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    });
    expect(onViewModeChange).toHaveBeenCalledWith('map');
  });
});
