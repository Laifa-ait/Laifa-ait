// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  PropertyBadge,
  PropertyMedia,
} from '../components/OlmaImmo/primitives';
import { PropertyCard } from '../components/OlmaImmo/PropertyCard';
import { Property } from '../types/realEstate';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OLM-IMMO 2.2 — Badge, Media & PropertyCard Integration', () => {
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

  describe('PropertyBadge Primitive', () => {
    it('maps Algerian legal papers accurately with legal security cues', () => {
      act(() => {
        root?.render(
          <div id="badge-container">
            <PropertyBadge type="legalPaper" value="acte_notarie" />
            <PropertyBadge type="legalPaper" value="livret_foncier" />
          </div>
        );
      });

      const containerEl = document.getElementById('badge-container');
      expect(containerEl?.textContent).toContain('Acte Notarié');
      expect(containerEl?.textContent).toContain('Livret Foncier');
    });

    it('renders verified dossier badge', () => {
      act(() => {
        root?.render(
          <div id="verified-container">
            <PropertyBadge type="verified" />
          </div>
        );
      });

      expect(document.getElementById('verified-container')?.textContent).toContain('Dossier Vérifié');
    });

    it('renders listing types accurately', () => {
      act(() => {
        root?.render(
          <div id="types-container">
            <PropertyBadge type="listingType" value="sale" />
            <PropertyBadge type="listingType" value="rent_short" />
          </div>
        );
      });

      const containerEl = document.getElementById('types-container');
      expect(containerEl?.textContent).toContain('Vente');
      expect(containerEl?.textContent).toContain('Séjour');
    });
  });

  describe('PropertyMedia Primitive', () => {
    it('renders image, overlay slots and photo counter', () => {
      act(() => {
        root?.render(
          <PropertyMedia
            id="media-test"
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600"
            alt="Villa Hydra"
            photoCount={8}
            topBadges={<span id="top-badge">Vente</span>}
            bottomOverlay={<span id="bottom-price">12M DA</span>}
          />
        );
      });

      const media = document.getElementById('media-test');
      expect(media).not.toBeNull();
      expect(document.getElementById('top-badge')).not.toBeNull();
      expect(document.getElementById('bottom-price')).not.toBeNull();
      expect(media?.textContent).toContain('8');
    });

    it('switches images via hover carousel dots', () => {
      const selectImage = vi.fn();
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

      act(() => {
        root?.render(
          <PropertyMedia
            id="media-carousel"
            alt="Villa"
            images={images}
            activeImageIndex={0}
            onSelectImageIndex={selectImage}
          />
        );
      });

      const dots = document.querySelectorAll('button[aria-label^="Photo "]');
      expect(dots.length).toBe(3);

      act(() => {
        (dots[1] as HTMLButtonElement).click();
      });

      expect(selectImage).toHaveBeenCalledWith(1);
    });
  });

  describe('PropertyCard Complete Integration', () => {
    const sampleProperty: Property = {
      id: 'prop-123',
      title: 'Appartement F3 Vue Mer Hydra',
      description: 'Superbe appartement entièrement meublé et sécurisé.',
      listingType: 'rent_long',
      propertyType: 'apartment',
      price: 85000,
      pricePeriod: 'month',
      rooms: 3,
      bathrooms: 1,
      areaSquareMeters: 110,
      location: {
        commune: 'Hydra',
        wilaya: 'Alger',
        address: 'Rue Doudou Mokhtar',
      },
      images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600'],
      legalPapers: ['acte_notarie', 'livret_foncier'],
      isLegalVerified: true,
      ownerId: 'owner-456',
      status: 'published',
      viewsCount: 142,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };

    it('renders with all primitives integrated smoothly', () => {
      act(() => {
        root?.render(
          <MemoryRouter>
            <PropertyCard property={sampleProperty} />
          </MemoryRouter>
        );
      });

      expect(container?.textContent).toContain('Appartement F3 Vue Mer Hydra');
      expect(container?.textContent).toContain('Hydra');
      expect(container?.textContent).toContain('Wilaya de Alger');
      expect(container?.textContent).toContain('3 ch.');
      expect(container?.textContent).toContain('110 m²');
      expect(container?.textContent).toContain('Location');
      expect(container?.textContent).toContain('Acte Notarié');
      expect(container?.textContent).toContain('Consulter le bien');
    });
  });
});
