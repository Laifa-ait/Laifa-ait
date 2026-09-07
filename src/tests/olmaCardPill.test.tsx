// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OlmaCard } from '../components/OlmaImmo/primitives/OlmaCard';
import { OlmaPill } from '../components/OlmaImmo/primitives/OlmaPill';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Olma Immo Primitives Suite — Card & Pill', () => {
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

  describe('OlmaCard Primitive', () => {
    it('renders children and default card tokens correctly', () => {
      act(() => {
        root?.render(
          <OlmaCard id="test-card">
            <h3>Card Title</h3>
            <p>Card description text</p>
          </OlmaCard>
        );
      });

      const card = document.getElementById('test-card');
      expect(card).not.toBeNull();
      expect(card?.textContent).toContain('Card Title');
      expect(card?.className).toContain('bg-[var(--olma-surface-default)]');
      expect(card?.className).toContain('shadow-[var(--olma-shadow-card)]');
      expect(card?.className).toContain('rounded-[1rem]');
      expect(card?.className).toContain('overflow-hidden');
    });

    it('supports interactive card with subtle hover and focus states', () => {
      act(() => {
        root?.render(
          <OlmaCard id="test-interactive-card" interactive>
            <span>Clickable Card</span>
          </OlmaCard>
        );
      });

      const card = document.getElementById('test-interactive-card');
      expect(card?.className).toContain('cursor-pointer');
      expect(card?.className).toContain('hover:shadow-[var(--olma-shadow-floating)]');
      expect(card?.className).toContain('hover:-translate-y-0.5');
    });

    it('supports custom radius and elevation', () => {
      act(() => {
        root?.render(
          <OlmaCard id="test-card-elevated" radius="2xl" elevation="floating" variant="subtle">
            Elevated
          </OlmaCard>
        );
      });

      const card = document.getElementById('test-card-elevated');
      expect(card?.className).toContain('rounded-[1.25rem]');
      expect(card?.className).toContain('shadow-[var(--olma-shadow-floating)]');
      expect(card?.className).toContain('bg-[var(--olma-surface-subtle)]');
    });

    it('renders as semantic article with custom as prop', () => {
      act(() => {
        root?.render(
          <OlmaCard id="test-card-article" as="article">
            Article Card
          </OlmaCard>
        );
      });

      const card = document.getElementById('test-card-article');
      expect(card?.tagName.toLowerCase()).toBe('article');
    });
  });

  describe('OlmaPill Primitive', () => {
    it('renders label and applies default neutral variant', () => {
      act(() => {
        root?.render(<OlmaPill id="test-pill">À vendre</OlmaPill>);
      });

      const pill = document.getElementById('test-pill');
      expect(pill).not.toBeNull();
      expect(pill?.textContent).toContain('À vendre');
      expect(pill?.className).toContain('rounded-full');
      expect(pill?.className).toContain('bg-[var(--olma-surface-muted)]');
    });

    it('supports brand, accent, success, and warning variants', () => {
      act(() => {
        root?.render(
          <div>
            <OlmaPill id="pill-brand" variant="brand">Vente</OlmaPill>
            <OlmaPill id="pill-accent" variant="accent">Vacances</OlmaPill>
            <OlmaPill id="pill-success" variant="success">Confirmé</OlmaPill>
            <OlmaPill id="pill-warning" variant="warning">En attente</OlmaPill>
          </div>
        );
      });

      const brand = document.getElementById('pill-brand');
      const accent = document.getElementById('pill-accent');
      const success = document.getElementById('pill-success');
      const warning = document.getElementById('pill-warning');

      expect(brand?.className).toContain('bg-[var(--olma-brand-primary)]');
      expect(accent?.className).toContain('bg-[var(--olma-brand-accent)]');
      expect(success?.className).toContain('bg-[var(--olma-semantic-success-light)]');
      expect(warning?.className).toContain('bg-[var(--olma-semantic-warning-light)]');
    });

    it('renders visual dot indicator when dot=true', () => {
      act(() => {
        root?.render(
          <OlmaPill id="pill-with-dot" variant="success" dot>Actif</OlmaPill>
        );
      });

      const pill = document.getElementById('pill-with-dot');
      const dot = pill?.querySelector('span[aria-hidden="true"]');
      expect(dot).not.toBeNull();
      expect(dot?.className).toContain('rounded-full');
      expect(dot?.className).toContain('w-1.5');
      expect(pill?.textContent).toContain('Actif');
    });

    it('supports sm and md sizes with correct padding and text scale', () => {
      act(() => {
        root?.render(
          <div>
            <OlmaPill id="pill-sm" size="sm">Small</OlmaPill>
            <OlmaPill id="pill-md" size="md">Medium</OlmaPill>
          </div>
        );
      });

      const sm = document.getElementById('pill-sm');
      const md = document.getElementById('pill-md');

      expect(sm?.className).toContain('text-[11px]');
      expect(md?.className).toContain('text-xs');
    });
  });

  describe('Composition: OlmaCard + OlmaPill', () => {
    it('composes seamlessly in real estate teaser layout', () => {
      act(() => {
        root?.render(
          <OlmaCard id="teaser-card" variant="default" elevation="card" radius="2xl">
            <div className="p-4 flex items-center justify-between">
              <OlmaPill id="card-badge" variant="brand" size="sm">
                Vente Exclusive
              </OlmaPill>
              <OlmaPill id="card-status" variant="success" size="sm" dot>
                Disponible
              </OlmaPill>
            </div>
            <div className="p-4 pt-0">
              <h4>Villa Hydra</h4>
              <p>55,000,000 DZD</p>
            </div>
          </OlmaCard>
        );
      });

      const card = document.getElementById('teaser-card');
      const badge = document.getElementById('card-badge');
      const status = document.getElementById('card-status');

      expect(card?.contains(badge)).toBe(true);
      expect(card?.contains(status)).toBe(true);
      expect(badge?.textContent).toContain('Vente Exclusive');
      expect(status?.textContent).toContain('Disponible');
    });
  });
});
