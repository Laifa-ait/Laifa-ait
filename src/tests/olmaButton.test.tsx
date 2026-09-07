// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OlmaButton } from '../components/OlmaImmo/primitives/OlmaButton';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OlmaButton Primitive Suite', () => {
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

  it('renders native button with type="button" by default and applies primary variant', () => {
    act(() => {
      root?.render(<OlmaButton id="btn-default">Confirmer</OlmaButton>);
    });

    const btn = document.getElementById('btn-default') as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    expect(btn?.tagName.toLowerCase()).toBe('button');
    expect(btn?.type).toBe('button');
    expect(btn?.textContent).toContain('Confirmer');
    expect(btn?.className).toContain('bg-[var(--olma-brand-primary)]');
    expect(btn?.className).toContain('text-[var(--olma-brand-highlight)]');
    expect(btn?.className).toContain('rounded-2xl');
  });

  it('supports secondary, outline, ghost, accent, dark, and danger variants', () => {
    act(() => {
      root?.render(
        <div>
          <OlmaButton id="btn-secondary" variant="secondary">Retour</OlmaButton>
          <OlmaButton id="btn-outline" variant="outline">Filtrer</OlmaButton>
          <OlmaButton id="btn-ghost" variant="ghost">Effacer</OlmaButton>
          <OlmaButton id="btn-accent" variant="accent">Réserver</OlmaButton>
          <OlmaButton id="btn-dark" variant="dark">Visiter</OlmaButton>
          <OlmaButton id="btn-danger" variant="danger">Supprimer</OlmaButton>
        </div>
      );
    });

    const secondary = document.getElementById('btn-secondary');
    const outline = document.getElementById('btn-outline');
    const ghost = document.getElementById('btn-ghost');
    const accent = document.getElementById('btn-accent');
    const dark = document.getElementById('btn-dark');
    const danger = document.getElementById('btn-danger');

    expect(secondary?.className).toContain('bg-[var(--olma-surface-default)]');
    expect(outline?.className).toContain('border-[var(--olma-brand-primary)]');
    expect(ghost?.className).toContain('bg-transparent');
    expect(accent?.className).toContain('bg-[var(--olma-brand-accent)]');
    expect(dark?.className).toContain('bg-[var(--olma-brand-primary-dark)]');
    expect(danger?.className).toContain('bg-[var(--olma-semantic-danger-light)]');
  });

  it('supports sm, md, lg, and icon sizes', () => {
    act(() => {
      root?.render(
        <div>
          <OlmaButton id="btn-sm" size="sm">Petit</OlmaButton>
          <OlmaButton id="btn-md" size="md">Moyen</OlmaButton>
          <OlmaButton id="btn-lg" size="lg">Grand</OlmaButton>
          <OlmaButton id="btn-icon" size="icon" aria-label="Fermer">✕</OlmaButton>
        </div>
      );
    });

    const sm = document.getElementById('btn-sm');
    const md = document.getElementById('btn-md');
    const lg = document.getElementById('btn-lg');
    const icon = document.getElementById('btn-icon');

    expect(sm?.className).toContain('min-h-[36px]');
    expect(md?.className).toContain('min-h-[42px]');
    expect(lg?.className).toContain('min-h-[48px]');
    expect(icon?.className).toContain('min-w-[40px]');
  });

  it('supports type="submit" and handles click events', () => {
    const handleClick = vi.fn();
    act(() => {
      root?.render(
        <OlmaButton id="btn-submit" type="submit" onClick={handleClick}>
          Envoyer
        </OlmaButton>
      );
    });

    const btn = document.getElementById('btn-submit') as HTMLButtonElement | null;
    expect(btn?.type).toBe('submit');
    act(() => {
      btn?.click();
    });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state properly', () => {
    const handleClick = vi.fn();
    act(() => {
      root?.render(
        <OlmaButton id="btn-disabled" disabled onClick={handleClick}>
          Désactivé
        </OlmaButton>
      );
    });

    const btn = document.getElementById('btn-disabled') as HTMLButtonElement | null;
    expect(btn?.disabled).toBe(true);
    expect(btn?.getAttribute('aria-disabled')).toBe('true');
    expect(btn?.className).toContain('disabled:cursor-not-allowed');
    act(() => {
      btn?.click();
    });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles loading state with spinner, aria-busy, and loadingText', () => {
    const handleClick = vi.fn();
    act(() => {
      root?.render(
        <OlmaButton
          id="btn-loading"
          loading
          loadingText="Enregistrement..."
          onClick={handleClick}
        >
          Enregistrer
        </OlmaButton>
      );
    });

    const btn = document.getElementById('btn-loading') as HTMLButtonElement | null;
    expect(btn?.disabled).toBe(true);
    expect(btn?.getAttribute('aria-busy')).toBe('true');
    expect(btn?.textContent).toContain('Enregistrement...');
    const spinner = btn?.querySelector('svg.animate-spin');
    expect(spinner).not.toBeNull();
    act(() => {
      btn?.click();
    });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders leftIcon and rightIcon properly when not loading', () => {
    act(() => {
      root?.render(
        <OlmaButton
          id="btn-icons"
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Navigation
        </OlmaButton>
      );
    });

    const btn = document.getElementById('btn-icons');
    expect(btn?.querySelector('[data-testid="left-icon"]')).not.toBeNull();
    expect(btn?.querySelector('[data-testid="right-icon"]')).not.toBeNull();
    expect(btn?.textContent).toContain('Navigation');
  });

  it('supports polymorphic rendering as an anchor link (as="a")', () => {
    act(() => {
      root?.render(
        <OlmaButton id="btn-link" as="a" href="https://olmart.dz">
          Lien Externe
        </OlmaButton>
      );
    });

    const link = document.getElementById('btn-link') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.tagName.toLowerCase()).toBe('a');
    expect(link?.href).toBe('https://olmart.dz/');
    expect(link?.getAttribute('type')).toBeNull();
    expect(link?.className).toContain('bg-[var(--olma-brand-primary)]');
  });

  it('supports fullWidth prop', () => {
    act(() => {
      root?.render(<OlmaButton id="btn-full" fullWidth>Plein Écran</OlmaButton>);
    });

    const btn = document.getElementById('btn-full');
    expect(btn?.className).toContain('w-full');
  });
});
