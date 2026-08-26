// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GlobalSearchModal } from '../components/common/GlobalSearchModal';
import * as apiModule from '../lib/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'no_results_for') return `Aucun résultat pour "${options?.query}"`;
      if (key === 'search_cmd_placeholder') return 'Rechercher un produit...';
      return key;
    },
    i18n: { language: 'fr' },
  }),
}));

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver || (MockResizeObserver as unknown as typeof ResizeObserver);
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = window.HTMLElement.prototype.scrollIntoView || vi.fn();
}

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('GlobalSearchModal Component Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root?.unmount();
      });
      container.remove();
    }
    container = null;
    root = null;
  });

  it('remains closed by default', () => {
    act(() => {
      root?.render(<GlobalSearchModal />);
    });
    expect(document.querySelector('input[placeholder="Rechercher un produit..."]')).toBeNull();
  });

  it('opens on custom window event "open-global-search"', () => {
    act(() => {
      root?.render(<GlobalSearchModal />);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('open-global-search'));
    });

    expect(document.querySelector('input[placeholder="Rechercher un produit..."]')).not.toBeNull();
  });

  it('opens on Ctrl+K keypress and closes on Escape', () => {
    act(() => {
      root?.render(<GlobalSearchModal />);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });
    expect(document.querySelector('input[placeholder="Rechercher un produit..."]')).not.toBeNull();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(document.querySelector('input[placeholder="Rechercher un produit..."]')).toBeNull();
  });

  it('closes when clicking on backdrop', () => {
    act(() => {
      root?.render(<GlobalSearchModal />);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('open-global-search'));
    });

    const backdrop = document.getElementById('global-search-modal-backdrop');
    expect(backdrop).not.toBeNull();

    act(() => {
      backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelector('input[placeholder="Rechercher un produit..."]')).toBeNull();
  });

  it('fetches search results from /api/v1/search and displays products and stores', async () => {
    const mockSearchResponse = {
      products: [
        { id: 'p1', name: 'PC Portable Gamer', price: 150000, category: 'Tech' },
      ],
      stores: [
        { id: 's1', shopName: 'Tech Store Alger', wilaya: 'Alger' },
      ],
    };

    const apiGetSpy = vi.spyOn(apiModule, 'apiGet').mockResolvedValue(mockSearchResponse);

    act(() => {
      root?.render(<GlobalSearchModal />);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('open-global-search'));
    });

    const input = document.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();

    await act(async () => {
      // Simulate typing using native setter for React controlled component
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'Tech');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(apiGetSpy).toHaveBeenCalledWith('/api/v1/search?q=Tech&limit=5');
    expect(document.body.textContent).toContain('PC Portable Gamer');
    expect(document.body.textContent).toContain('Tech Store Alger');
  });

  it('handles empty results properly', async () => {
    vi.spyOn(apiModule, 'apiGet').mockResolvedValue({ products: [], stores: [] });

    act(() => {
      root?.render(<GlobalSearchModal />);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('open-global-search'));
    });

    const input = document.querySelector('input') as HTMLInputElement;

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'Inexistant');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(document.body.textContent).toContain('Aucun résultat pour "Inexistant"');
  });

  it('handles backend API error gracefully without crashing', async () => {
    vi.spyOn(apiModule, 'apiGet').mockRejectedValue(new Error('Network error'));

    act(() => {
      root?.render(<GlobalSearchModal />);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('open-global-search'));
    });

    const input = document.querySelector('input') as HTMLInputElement;

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'ErrorTest');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(document.body.textContent).toContain('Aucun résultat pour "ErrorTest"');
  });
});
