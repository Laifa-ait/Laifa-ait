// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  findNearestAlgerianWilaya,
  requestUserAlgerianWilaya,
} from '../utils/realEstateGeolocation';
import { OlmaImmoEmptyState } from '../components/OlmaImmo/OlmaImmoEmptyState';
import { OlmaImmoHero } from '../components/OlmaImmo/OlmaImmoHero';
import { OlmaImmoPropertiesSection } from '../components/OlmaImmo/OlmaImmoPropertiesSection';
import { Property } from '../types/realEstate';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('PHASE 2.6 — Olma Immo Discovery & Polish Tests', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    // Provide ResizeObserver polyfill for jsdom
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

  describe('Algerian Geolocation Resolution (Non-blocking & Haversine)', () => {
    it('accurately resolves Algiers coordinate to Alger wilaya', () => {
      const result = findNearestAlgerianWilaya(36.7538, 3.0588);
      expect(result).not.toBeNull();
      expect(result?.wilaya.name).toBe('Alger');
      expect(result?.distanceKm).toBeLessThan(10);
    });

    it('accurately resolves Oran coordinate to Oran wilaya', () => {
      const result = findNearestAlgerianWilaya(35.6976, -0.6337);
      expect(result).not.toBeNull();
      expect(result?.wilaya.name).toBe('Oran');
      expect(result?.distanceKm).toBeLessThan(15);
    });

    it('safely returns null for invalid or NaN coordinates without throwing', () => {
      expect(findNearestAlgerianWilaya(NaN, 3.05)).toBeNull();
      expect(findNearestAlgerianWilaya(36.75, Infinity)).toBeNull();
    });

    it('requests geolocation and calls onSuccess with nearest wilaya', () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: { latitude: 36.7538, longitude: 3.0588 },
          });
        }),
      };
      // @ts-expect-error Mocking window navigator geolocation
      global.navigator.geolocation = mockGeolocation;

      const onSuccess = vi.fn();
      const onError = vi.fn();

      requestUserAlgerianWilaya(onSuccess, onError);

      expect(onSuccess).toHaveBeenCalled();
      const firstArg = onSuccess.mock.calls[0][0];
      expect(firstArg.wilaya.name).toBe('Alger');
      expect(onError).not.toHaveBeenCalled();
    });

    it('handles denied permission without crashing and calls onError with polite message', () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((_success, error) => {
          error({ code: 1, message: 'User denied geolocation' });
        }),
      };
      // @ts-expect-error Mocking window navigator geolocation
      global.navigator.geolocation = mockGeolocation;

      const onSuccess = vi.fn();
      const onError = vi.fn();

      requestUserAlgerianWilaya(onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('Accès à la géolocalisation refusé.');
    });
  });

  describe('OlmaImmoEmptyState', () => {
    it('renders constructive suggestions and active criteria badges', () => {
      const onReset = vi.fn();
      act(() => {
        root?.render(
          <OlmaImmoEmptyState
            filters={{
              wilaya: 'Constantine',
              listingType: 'sale',
              propertyType: 'apartment',
              minPrice: 10000000,
              maxPrice: 20000000,
            }}
            onResetFilters={onReset}
          />
        );
      });

      expect(container?.textContent).toContain('Aucun bien ne correspond à ces critères');
      expect(container?.textContent).toContain('Wilaya : Constantine');
      expect(container?.textContent).toContain('Achat / Vente');

      const resetButton = container?.querySelector('button');
      expect(resetButton).not.toBeNull();
      act(() => {
        resetButton?.click();
      });
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('OlmaImmoHero Component', () => {
    it('renders Algerian wilayas datalist and provides quick popular destinations', () => {
      const onFilterChange = vi.fn();
      const onSearchSubmit = vi.fn();

      act(() => {
        root?.render(
          <MemoryRouter>
            <OlmaImmoHero
              filters={{}}
              onFilterChange={onFilterChange}
              onSearchSubmit={onSearchSubmit}
            />
          </MemoryRouter>
        );
      });

      const input = container?.querySelector('input[list="hero-algeria-wilayas"]');
      expect(input).not.toBeNull();

      const datalist = container?.querySelector('#hero-algeria-wilayas');
      expect(datalist).not.toBeNull();

      const oranBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('Oran')
      );
      expect(oranBtn).toBeDefined();

      act(() => {
        oranBtn?.click();
      });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ wilaya: 'Oran' })
      );
    });
  });

  describe('OlmaImmoPropertiesSection', () => {
    it('renders empty state when properties array is empty in grid mode', () => {
      const onReset = vi.fn();
      const cardRefs = { current: {} };

      act(() => {
        root?.render(
          <MemoryRouter>
            <OlmaImmoPropertiesSection
              properties={[]}
              mapResults={[]}
              selectedPropertyId={undefined}
              onSelectProperty={vi.fn()}
              viewMode="grid"
              isLoading={false}
              cardRefs={cardRefs}
              onBoundsChange={vi.fn()}
              onResetFilters={onReset}
              filters={{ wilaya: 'Tipaza' }}
            />
          </MemoryRouter>
        );
      });

      expect(container?.textContent).toContain('Aucun bien ne correspond à ces critères');
      expect(container?.textContent).toContain('Wilaya : Tipaza');
    });

    it('renders properties and displays result count', () => {
      const sampleProperty: Property = {
        id: 'prop-test-1',
        title: 'Superbe Villa Moderne avec Piscine',
        description: 'Magnifique villa R+2 à Alger',
        price: 45000000,
        wilaya: 'Alger',
        commune: 'Hydra',
        address: 'Hydra Paradou',
        propertyType: 'villa',
        listingType: 'sale',
        areaSquareMeters: 350,
        rooms: 6,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasActeNotarie: true,
        hasLivretFoncier: true,
        legalPaperType: 'acte_livret',
        ownerId: 'seller-1',
      };

      const onSelectProperty = vi.fn();
      const cardRefs = { current: {} };

      act(() => {
        root?.render(
          <MemoryRouter>
            <OlmaImmoPropertiesSection
              properties={[sampleProperty]}
              mapResults={[]}
              selectedPropertyId="prop-test-1"
              onSelectProperty={onSelectProperty}
              viewMode="split"
              isLoading={false}
              cardRefs={cardRefs}
              onBoundsChange={vi.fn()}
              onResetFilters={vi.fn()}
            />
          </MemoryRouter>
        );
      });

      expect(container?.textContent).toContain('Superbe Villa Moderne avec Piscine');
      expect(container?.textContent).toContain('1 bien disponible');
    });
  });
});
