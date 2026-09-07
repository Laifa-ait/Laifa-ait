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

  it('1. renders input element with default attributes', () => {
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
  });

  it('2 & 3. renders label and associates label with input via htmlFor/id', () => {
    act(() => {
      root?.render(<OlmaInput id="custom-user-id" label="Nom complet" />);
    });

    const label = container?.querySelector('label');
    const input = document.getElementById('custom-user-id');
    expect(label).not.toBeNull();
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
    expect(label).not.toBeNull();
    expect(input).not.toBeNull();
    const generatedId = input?.getAttribute('id');
    expect(generatedId).toBeTruthy();
    expect(label?.getAttribute('for')).toBe(generatedId);
  });

  it('4 & 5. supports value, defaultValue and onChange event handler', () => {
    const handleChange = vi.fn();
    act(() => {
      root?.render(
        <OlmaInput
          id="input-change"
          defaultValue="Alger Centre"
          onChange={handleChange}
        />
      );
    });

    const input = document.getElementById('input-change') as HTMLInputElement | null;
    expect(input?.value).toBe('Alger Centre');

    act(() => {
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        nativeInputValueSetter?.call(input, 'Hydra');
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
    const label = container?.querySelector('label');
    expect(label?.textContent).toContain('*');
  });

  it('9. applies disabled state correctly', () => {
    act(() => {
      root?.render(<OlmaInput id="input-dis" disabled placeholder="Indisponible" />);
    });

    const input = document.getElementById('input-dis') as HTMLInputElement | null;
    expect(input?.disabled).toBe(true);
    expect(input?.className).toContain('disabled:cursor-not-allowed');
  });

  it('10, 11 & 12. handles error state with aria-invalid and aria-describedby', () => {
    act(() => {
      root?.render(
        <OlmaInput
          id="input-err"
          label="Prix"
          error="Le prix doit être supérieur à zéro"
        />
      );
    });

    const input = document.getElementById('input-err') as HTMLInputElement | null;
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe('input-err-error');

    const errorMsg = document.getElementById('input-err-error');
    expect(errorMsg).not.toBeNull();
    expect(errorMsg?.getAttribute('role')).toBe('alert');
    expect(errorMsg?.textContent).toContain('Le prix doit être supérieur à zéro');
  });

  it('13. renders description and links via aria-describedby when no error', () => {
    act(() => {
      root?.render(
        <OlmaInput
          id="input-desc"
          label="Superficie"
          description="Indiquez la surface utile en mètres carrés (m²)"
        />
      );
    });

    const input = document.getElementById('input-desc') as HTMLInputElement | null;
    expect(input?.getAttribute('aria-describedby')).toBe('input-desc-desc');
    const desc = document.getElementById('input-desc-desc');
    expect(desc?.textContent).toContain('Indiquez la surface utile en mètres carrés (m²)');
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

    const sm = document.getElementById('input-sm');
    const md = document.getElementById('input-md');
    const lg = document.getElementById('input-lg');

    expect(sm?.className).toContain('min-h-[36px]');
    expect(md?.className).toContain('min-h-[42px]');
    expect(lg?.className).toContain('min-h-[48px]');
  });

  it('15. supports fullWidth prop', () => {
    act(() => {
      root?.render(
        <div>
          <div data-testid="wrapper-full">
            <OlmaInput id="input-full" fullWidth />
          </div>
          <div data-testid="wrapper-auto">
            <OlmaInput id="input-auto" fullWidth={false} />
          </div>
        </div>
      );
    });

    const fullWrapper = container?.querySelector('[data-testid="wrapper-full"] > div');
    const autoWrapper = container?.querySelector('[data-testid="wrapper-auto"] > div');

    expect(fullWrapper?.className).toContain('w-full');
    expect(autoWrapper?.className).toContain('w-auto');
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

    const left = container?.querySelector('[data-testid="left-search"]');
    const right = container?.querySelector('[data-testid="right-clear"]');
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
    const input = document.getElementById('input-icons');
    expect(input?.className).toContain('ps-10');
    expect(input?.className).toContain('pe-10');
  });

  it('17. forwards ref correctly to HTMLInputElement', () => {
    let inputRef: HTMLInputElement | null = null;

    act(() => {
      root?.render(
        <OlmaInput
          ref={(node) => {
            inputRef = node;
          }}
          id="input-ref"
          defaultValue="Initial Focus"
        />
      );
    });

    expect(inputRef).not.toBeNull();
    expect(inputRef?.id).toBe('input-ref');
    expect(inputRef?.value).toBe('Initial Focus');
  });
});
