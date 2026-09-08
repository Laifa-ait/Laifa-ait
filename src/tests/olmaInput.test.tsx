// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OlmaInput } from '../components/OlmaImmo/primitives/OlmaInput';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OlmaInput Primitive Suite', () => {
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

  it('1. renders input element with default attributes (scenario 1: no error, no desc)', () => {
    act(() => {
      root?.render(<OlmaInput id="test-input" placeholder="Entrez votre nom" />);
    });

    const input = document.getElementById('test-input') as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input?.tagName.toLowerCase()).toBe('input');
    expect(input?.type).toBe('text');
    expect(input?.placeholder).toBe('Entrez votre nom');
    expect(input?.disabled).toBe(false);
    expect(input?.required).toBe(false);
    expect(input?.getAttribute('aria-invalid')).toBeNull();
    expect(input?.getAttribute('aria-describedby')).toBeNull();
  });

  it('2 & 3. renders label and associates label with input via htmlFor/id', () => {
    act(() => {
      root?.render(<OlmaInput id="custom-user-id" label="Nom complet" />);
    });

    const label = container?.querySelector('label');
    const input = document.getElementById('custom-user-id');
    expect(label?.getAttribute('for')).toBe('custom-user-id');
    expect(label?.textContent).toContain('Nom complet');
    expect(input).not.toBeNull();
  });

  it('generates a stable id if id prop is omitted and links label properly', () => {
    act(() => {
      root?.render(<OlmaInput label="Adresse email" />);
    });

    const label = container?.querySelector('label');
    const input = container?.querySelector('input');
    const generatedId = input?.getAttribute('id');
    expect(generatedId).toBeTruthy();
    expect(label?.getAttribute('for')).toBe(generatedId);
  });

  it('4 & 5. supports value, defaultValue and onChange event handler', () => {
    const handleChange = vi.fn();
    act(() => {
      root?.render(
        <OlmaInput id="input-change" defaultValue="Alger Centre" onChange={handleChange} />
      );
    });

    const input = document.getElementById('input-change') as HTMLInputElement | null;
    expect(input?.value).toBe('Alger Centre');

    act(() => {
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, 'Hydra');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it('6. supports various input types (search, email, tel, number, date)', () => {
    act(() => {
      root?.render(
        <div>
          <OlmaInput id="input-search" type="search" />
          <OlmaInput id="input-email" type="email" />
          <OlmaInput id="input-tel" type="tel" />
          <OlmaInput id="input-number" type="number" min={0} max={100} />
          <OlmaInput id="input-date" type="date" />
        </div>
      );
    });

    expect((document.getElementById('input-search') as HTMLInputElement)?.type).toBe('search');
    expect((document.getElementById('input-email') as HTMLInputElement)?.type).toBe('email');
    expect((document.getElementById('input-tel') as HTMLInputElement)?.type).toBe('tel');
    expect((document.getElementById('input-number') as HTMLInputElement)?.type).toBe('number');
    expect((document.getElementById('input-date') as HTMLInputElement)?.type).toBe('date');
  });

  it('8. renders required indicator and sets native required attribute', () => {
    act(() => {
      root?.render(<OlmaInput id="input-req" label="Téléphone" required />);
    });

    const input = document.getElementById('input-req') as HTMLInputElement | null;
    expect(input?.required).toBe(true);
    expect(container?.querySelector('label')?.textContent).toContain('*');
  });

  it('9. applies disabled state correctly', () => {
    act(() => {
      root?.render(<OlmaInput id="input-dis" disabled placeholder="Indisponible" />);
    });

    const input = document.getElementById('input-dis') as HTMLInputElement | null;
    expect(input?.disabled).toBe(true);
    expect(input?.className).toContain('disabled:cursor-not-allowed');
  });

  it('10, 11 & 12. handles error state with aria-invalid and aria-describedby (scenario 2: error only)', () => {
    act(() => {
      root?.render(<OlmaInput id="input-err" label="Prix" error="Le prix doit être supérieur à zéro" />);
    });

    const input = document.getElementById('input-err') as HTMLInputElement | null;
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe('input-err-error');

    const errorMsg = document.getElementById('input-err-error');
    expect(errorMsg).not.toBeNull();
    expect(errorMsg?.getAttribute('role')).toBe('alert');
    expect(errorMsg?.textContent).toContain('Le prix doit être supérieur à zéro');
    // Ensure no dangling desc element exists
    expect(document.getElementById('input-err-desc')).toBeNull();
  });

  it('13. renders description and links via aria-describedby (scenario 3: description only)', () => {
    act(() => {
      root?.render(
        <OlmaInput id="input-desc" label="Superficie" description="Indiquez la surface utile en mètres carrés (m²)" />
      );
    });

    const input = document.getElementById('input-desc') as HTMLInputElement | null;
    expect(input?.getAttribute('aria-invalid')).toBeNull();
    expect(input?.getAttribute('aria-describedby')).toBe('input-desc-desc');
    const desc = document.getElementById('input-desc-desc');
    expect(desc?.textContent).toContain('Indiquez la surface utile en mètres carrés (m²)');
    // Ensure no error element exists
    expect(document.getElementById('input-desc-error')).toBeNull();
  });

  it('handles error and description together without dangling aria-describedby references (scenario 4)', () => {
    act(() => {
      root?.render(
        <OlmaInput
          id="input-combined"
          label="Prix"
          error="Le prix est invalide"
          description="Indiquez un montant en DZD"
        />
      );
    });

    const input = document.getElementById('input-combined') as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input?.getAttribute('aria-invalid')).toBe('true');

    const ariaDescribedBy = input?.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();

    const referencedIds = ariaDescribedBy ? ariaDescribedBy.split(/\s+/) : [];
    expect(referencedIds.length).toBe(2);

    // Verify all referenced IDs genuinely exist in the DOM
    for (const refId of referencedIds) {
      const referencedElement = document.getElementById(refId);
      expect(referencedElement).not.toBeNull();
    }

    // Verify error node exists with role="alert"
    const errorNode = document.getElementById('input-combined-error');
    expect(errorNode).not.toBeNull();
    expect(errorNode?.getAttribute('role')).toBe('alert');
    expect(errorNode?.textContent).toContain('Le prix est invalide');

    // Verify description node exists and is in the DOM
    const descNode = document.getElementById('input-combined-desc');
    expect(descNode).not.toBeNull();
    expect(descNode?.textContent).toContain('Indiquez un montant en DZD');

    // Verify logical order: error first, description second
    expect(referencedIds[0]).toBe('input-combined-error');
    expect(referencedIds[1]).toBe('input-combined-desc');
  });

  it('14. supports sm, md, and lg sizes', () => {
    act(() => {
      root?.render(
        <div>
          <OlmaInput id="input-sm" size="sm" />
          <OlmaInput id="input-md" size="md" />
          <OlmaInput id="input-lg" size="lg" />
        </div>
      );
    });

    expect(document.getElementById('input-sm')?.className).toContain('min-h-[36px]');
    expect(document.getElementById('input-md')?.className).toContain('min-h-[42px]');
    expect(document.getElementById('input-lg')?.className).toContain('min-h-[48px]');
  });

  it('15. supports fullWidth prop', () => {
    act(() => {
      root?.render(
        <div>
          <div data-testid="wrapper-full"><OlmaInput id="input-full" fullWidth /></div>
          <div data-testid="wrapper-auto"><OlmaInput id="input-auto" fullWidth={false} /></div>
        </div>
      );
    });

    expect(container?.querySelector('[data-testid="wrapper-full"] > div')?.className).toContain('w-full');
    expect(container?.querySelector('[data-testid="wrapper-auto"] > div')?.className).toContain('w-auto');
  });

  it('16. renders leftIcon and rightIcon properly', () => {
    act(() => {
      root?.render(
        <OlmaInput
          id="input-icons"
          leftIcon={<span data-testid="left-search">🔍</span>}
          rightIcon={<span data-testid="right-clear">✕</span>}
        />
      );
    });

    expect(container?.querySelector('[data-testid="left-search"]')).not.toBeNull();
    expect(container?.querySelector('[data-testid="right-clear"]')).not.toBeNull();
    const input = document.getElementById('input-icons');
    expect(input?.className).toContain('ps-10');
    expect(input?.className).toContain('pe-10');
  });

  it('17. forwards ref correctly to HTMLInputElement', () => {
    const inputRef = React.createRef<HTMLInputElement>();
    act(() => {
      root?.render(
        <OlmaInput ref={inputRef} id="input-ref" defaultValue="Initial Focus" />
      );
    });

    expect(inputRef.current).not.toBeNull();
    expect(inputRef.current?.id).toBe('input-ref');
    expect(inputRef.current?.value).toBe('Initial Focus');
  });
});
