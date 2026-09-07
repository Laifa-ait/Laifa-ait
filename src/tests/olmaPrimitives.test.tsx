// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OlmaSurface } from '../components/OlmaImmo/primitives/OlmaSurface';
import { OlmaSection } from '../components/OlmaImmo/primitives/OlmaSection';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Olma Immo Primitives Suite — Surface & Section', () => {
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

  describe('OlmaSurface Primitive', () => {
    it('renders children and default classes correctly', () => {
      act(() => {
        root?.render(
          <OlmaSurface id="test-surface">
            <span>Surface Content</span>
          </OlmaSurface>
        );
      });

      const el = document.getElementById('test-surface');
      expect(el).not.toBeNull();
      expect(el?.textContent).toContain('Surface Content');
      expect(el?.className).toContain('bg-[var(--olma-surface-default)]');
      expect(el?.className).toContain('rounded-[1rem]');
    });

    it('applies subtle, muted, raised and dark variants', () => {
      act(() => {
        root?.render(
          <OlmaSurface id="surface-dark" variant="dark" radius="2xl" elevation="card">
            Dark Surface
          </OlmaSurface>
        );
      });

      const el = document.getElementById('surface-dark');
      expect(el?.className).toContain('bg-[var(--olma-surface-dark)]');
      expect(el?.className).toContain('text-[var(--olma-text-inverse)]');
      expect(el?.className).toContain('rounded-[1.25rem]');
      expect(el?.className).toContain('shadow-[var(--olma-shadow-card)]');
    });

    it('supports bordered style with custom border variants', () => {
      act(() => {
        root?.render(
          <OlmaSurface id="surface-bordered" bordered borderVariant="accent">
            Bordered
          </OlmaSurface>
        );
      });

      const el = document.getElementById('surface-bordered');
      expect(el?.className).toContain('border');
      expect(el?.className).toContain('border-[var(--olma-border-accent)]');
    });

    it('renders as semantic article element when as="article" is provided', () => {
      act(() => {
        root?.render(
          <OlmaSurface id="surface-article" as="article">
            Article
          </OlmaSurface>
        );
      });

      const el = document.getElementById('surface-article');
      expect(el?.tagName.toLowerCase()).toBe('article');
    });
  });

  describe('OlmaSection Primitive', () => {
    it('renders children within a max-w-7xl container by default', () => {
      act(() => {
        root?.render(
          <OlmaSection id="test-section">
            <h2>Section Content</h2>
          </OlmaSection>
        );
      });

      const section = document.getElementById('test-section');
      expect(section).not.toBeNull();
      expect(section?.tagName.toLowerCase()).toBe('section');
      const containerDiv = section?.querySelector('.max-w-7xl');
      expect(containerDiv).not.toBeNull();
      expect(containerDiv?.textContent).toContain('Section Content');
    });

    it('renders fluid uncontained layout when container is false', () => {
      act(() => {
        root?.render(
          <OlmaSection id="test-section-fluid" container={false}>
            <span>Fluid Section</span>
          </OlmaSection>
        );
      });

      const section = document.getElementById('test-section-fluid');
      expect(section?.querySelector('.max-w-7xl')).toBeNull();
      expect(section?.textContent).toContain('Fluid Section');
    });

    it('supports custom vertical spacing presets and semantic tag', () => {
      act(() => {
        root?.render(
          <OlmaSection id="test-section-main" as="main" spacing="lg">
            <span>Main Page Section</span>
          </OlmaSection>
        );
      });

      const main = document.getElementById('test-section-main');
      expect(main?.tagName.toLowerCase()).toBe('main');
      expect(main?.className).toContain('py-8 sm:py-12');
    });

    it('composes cleanly with OlmaSurface', () => {
      act(() => {
        root?.render(
          <OlmaSection id="composite-section" spacing="sm">
            <OlmaSurface id="nested-surface" variant="subtle" padding="lg">
              <span>Nested Composition</span>
            </OlmaSurface>
          </OlmaSection>
        );
      });

      const section = document.getElementById('composite-section');
      const surface = document.getElementById('nested-surface');
      expect(section?.contains(surface)).toBe(true);
      expect(surface?.className).toContain('bg-[var(--olma-surface-subtle)]');
    });
  });
});
