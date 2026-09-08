// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PropertyPrice,
  PropertyLocation,
  PropertyMeta,
  PropertyFavoriteButton,
} from '../components/OlmaImmo/primitives';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OLM-IMMO 2.2 — Primitives Suite: Price, Location, Meta, Favorite', () => {
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

  describe('PropertyPrice Primitive', () => {
    it('formats prices correctly in DA with Algerian locale', () => {
      act(() => {
        root?.render(<PropertyPrice price={15000000} id="price-sale" />);
      });

      const el = document.getElementById('price-sale');
      expect(el).not.toBeNull();
      expect(el?.textContent).toContain('DA');
      expect(el?.textContent?.replace(/\s/g, '')).toContain('15000000DA');
    });

    it('formats nightly and monthly periods correctly', () => {
      act(() => {
        root?.render(
          <div>
            <PropertyPrice price={8500} period="night" id="price-night" />
            <PropertyPrice price={45000} period="month" id="price-month" />
          </div>
        );
      });

      expect(document.getElementById('price-night')?.textContent).toContain('/ nuit');
      expect(document.getElementById('price-month')?.textContent).toContain('/ mois');
    });

    it('handles zero or missing values gracefully without crash', () => {
      act(() => {
        root?.render(<PropertyPrice price={0} id="price-zero" />);
      });

      expect(document.getElementById('price-zero')?.textContent).toContain('0');
      expect(document.getElementById('price-zero')?.textContent).toContain('DA');
    });

    it('supports light and mineral style variants', () => {
      act(() => {
        root?.render(
          <div>
            <PropertyPrice price={50000} variant="light" id="price-light" />
            <PropertyPrice price={50000} variant="mineral" id="price-mineral" />
          </div>
        );
      });

      expect(document.getElementById('price-light')?.innerHTML).toContain('text-white');
      expect(document.getElementById('price-mineral')?.innerHTML).toContain('text-[#0D281E]');
    });
  });

  describe('PropertyLocation Primitive', () => {
    it('renders commune and wilaya cleanly', () => {
      act(() => {
        root?.render(
          <PropertyLocation
            commune="Hydra"
            wilaya="Alger"
            id="loc-hydra"
          />
        );
      });

      const el = document.getElementById('loc-hydra');
      expect(el?.textContent).toContain('Hydra');
      expect(el?.textContent).toContain('Wilaya de Alger');
    });

    it('renders optional detailed address when requested', () => {
      act(() => {
        root?.render(
          <PropertyLocation
            commune="Oran"
            wilaya="Oran"
            address="Boulevard de l'ALN"
            showAddress
            id="loc-oran"
          />
        );
      });

      expect(document.getElementById('loc-oran')?.textContent).toContain("Boulevard de l'ALN");
    });
  });

  describe('PropertyMeta Primitive', () => {
    it('renders specifications in bar layout', () => {
      act(() => {
        root?.render(
          <PropertyMeta
            rooms={3}
            bathrooms={2}
            areaSquareMeters={120}
            layout="bar"
            id="meta-bar"
          />
        );
      });

      const el = document.getElementById('meta-bar');
      expect(el?.textContent).toContain('3 ch.');
      expect(el?.textContent).toContain('2 sdb');
      expect(el?.textContent).toContain('120 m²');
    });

    it('renders specifications in grid layout for detail views', () => {
      act(() => {
        root?.render(
          <PropertyMeta
            propertyType="apartment"
            rooms={4}
            bathrooms={1}
            areaSquareMeters={95}
            layout="grid"
            id="meta-grid"
          />
        );
      });

      const el = document.getElementById('meta-grid');
      expect(el?.textContent).toContain('Appartement');
      expect(el?.textContent).toContain('F4');
      expect(el?.textContent).toContain('95 m²');
    });
  });

  describe('PropertyFavoriteButton Primitive', () => {
    it('toggles favorite state and triggers callback', () => {
      const handleClick = vi.fn();

      act(() => {
        root?.render(
          <PropertyFavoriteButton
            isFav={false}
            onClick={handleClick}
            id="fav-btn"
          />
        );
      });

      const btn = document.getElementById('fav-btn') as HTMLButtonElement;
      expect(btn.getAttribute('aria-label')).toBe('Ajouter aux favoris');

      act(() => {
        btn.click();
      });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders filled state when isFav is true', () => {
      act(() => {
        root?.render(
          <PropertyFavoriteButton
            isFav={true}
            onClick={() => {}}
            id="fav-active"
          />
        );
      });

      expect(document.getElementById('fav-active')?.getAttribute('aria-label')).toBe('Retirer des favoris');
    });
  });
});
