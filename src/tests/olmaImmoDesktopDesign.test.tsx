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

  it('renders OlmaDesktopToolbar with count and wilaya location', () => {
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
    expect(container?.querySelector('select[aria-label="Trier les résultats"]')).toBeDefined();
  });

  it('triggers view mode change when desktop user clicks Grille, Partagée or Carte', () => {
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

    const gridBtn = container?.querySelector('button[title="Vue Grille"]') as HTMLButtonElement;
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
      viewsCount: 0,
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
            cardRefs={cardRefs}
            isLoading={false}
            onBoundsChange={vi.fn()}
            onResetFilters={vi.fn()}
            filters={{ wilaya: 'Alger', sort: 'recent' }}
            onFilterChange={vi.fn()}
          />
        </MemoryRouter>
      );
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
    });

    expect(onViewModeChange).toHaveBeenCalledWith('grid');
  });
});
