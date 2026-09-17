// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PublicPropertyDTO } from '../types/realEstate';
import { DetailPropertyAccordion } from '../components/OlmaImmo/PropertyDetail/DetailPropertyAccordion';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const testProperty: PublicPropertyDTO = {
  id: 'prop_test_collapsible',
  title: 'Villa Moderne avec Piscine',
  description: 'Belle villa contemporaine située à Hydra avec vue dégagée.',
  propertyType: 'villa',
  listingType: 'sale',
  price: 45000000,
  areaSquareMeters: 300,
  rooms: 5,
  bathrooms: 3,
  legalPaperType: 'acte_notarie',
  legalPapers: ['acte_notarie', 'livret_foncier'],
  isLegalVerified: true,
  status: 'active',
  contactPhone: '0555112233',
  viewsCount: 50,
  location: {
    address: 'Hydra Résidence',
    commune: 'Hydra',
    wilaya: 'Alger',
    lat: 36.74,
    lng: 3.03,
  },
  features: ['piscine', 'jardin', 'garage'],
  images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z',
};

describe('Olma Immo — Property Detail Merchandise Accordion Pattern', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    (globalThis as unknown as { ResizeObserver: typeof MockResizeObserver }).ResizeObserver = MockResizeObserver;
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
    vi.clearAllMocks();
  });

  it('renders all 5 merchandise-style accordion tabs', () => {
    act(() => {
      root?.render(<DetailPropertyAccordion property={testProperty} />);
    });

    expect(container?.textContent).toContain('Description / prestations');
    expect(container?.textContent).toContain('Caractéristiques / fiche technique');
    expect(container?.textContent).toContain('Documents / statut foncier');
    expect(container?.textContent).toContain('Conditions financières / règlement');
    expect(container?.textContent).toContain('Localisation / quartier');
  });

  it('has initial open section and allows toggling to another section', () => {
    act(() => {
      root?.render(<DetailPropertyAccordion property={testProperty} />);
    });

    // Description is initially open
    expect(container?.textContent).toContain('Belle villa contemporaine');

    // Find the Specs button
    const buttons = container?.querySelectorAll('button');
    const specsButton = Array.from(buttons || []).find((b) =>
      b.textContent?.includes('Caractéristiques / fiche technique')
    );
    expect(specsButton).toBeDefined();

    // Click specs to open it
    act(() => {
      specsButton?.click();
    });

    expect(container?.textContent).toContain('Superficie Habitable');
    expect(container?.textContent).toContain('300 m²');
  });

  it('allows closing an open accordion by clicking it again', () => {
    act(() => {
      root?.render(<DetailPropertyAccordion property={testProperty} />);
    });

    const buttons = container?.querySelectorAll('button');
    const descButton = Array.from(buttons || []).find((b) =>
      b.textContent?.includes('Description / prestations')
    );
    expect(descButton).toBeDefined();

    // Click description to close it
    act(() => {
      descButton?.click();
    });

    // All accordions can be closed (matching Screenshot 3)
    const expandedButtons = container?.querySelectorAll('button[aria-expanded="true"]');
    expect(expandedButtons?.length).toBe(0);
  });

  it('synchronizes with activeTab prop and notifies onTabChange', () => {
    const onTabChange = vi.fn();

    act(() => {
      root?.render(
        <DetailPropertyAccordion
          property={testProperty}
          activeTab="legal"
          onTabChange={onTabChange}
        />
      );
    });

    expect(container?.textContent).toContain('Acte de propriété principal');

    // Click on finance tab
    const buttons = container?.querySelectorAll('button');
    const financeButton = Array.from(buttons || []).find((b) =>
      b.textContent?.includes('Conditions financières')
    );

    act(() => {
      financeButton?.click();
    });

    expect(onTabChange).toHaveBeenCalledWith('finance');
    expect(container?.textContent).toContain('Prix total annoncé');
  });
});
