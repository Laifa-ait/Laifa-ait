// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OlmaSelect } from '../components/OlmaImmo/primitives/OlmaSelect';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OlmaSelect Primitive Suite', () => {
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

  it('1. renders select with options children (scenario 1: no error, no desc)', () => {
    act(() => {
      root?.render(
        <OlmaSelect id="select-test" defaultValue="sale">
          <option value="sale">Vente</option>
          <option value="rent">Location</option>
        </OlmaSelect>
      );
    });

    const select = document.getElementById('select-test') as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    expect(select?.tagName.toLowerCase()).toBe('select');
    expect(select?.value).toBe('sale');
    expect(select?.options.length).toBe(2);
    expect(select?.getAttribute('aria-invalid')).toBeNull();
    expect(select?.getAttribute('aria-describedby')).toBeNull();
  });

  it('2. renders label and associates with select', () => {
    act(() => {
      root?.render(
        <OlmaSelect id="select-type" label="Type de transaction">
          <option value="rent_long">Longue durée</option>
        </OlmaSelect>
      );
    });

    const label = container?.querySelector('label');
    const select = document.getElementById('select-type');
    expect(label?.getAttribute('for')).toBe('select-type');
    expect(label?.textContent).toContain('Type de transaction');
    expect(select).not.toBeNull();
  });

  it('3. handles onChange event', () => {
    const handleChange = vi.fn();
    act(() => {
      root?.render(
        <OlmaSelect id="select-change" onChange={handleChange} defaultValue="apt">
          <option value="apt">Appartement</option>
          <option value="villa">Villa</option>
        </OlmaSelect>
      );
    });

    const select = document.getElementById('select-change') as HTMLSelectElement | null;
    act(() => {
      if (select) {
        select.value = 'villa';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('4. handles disabled and required attributes', () => {
    act(() => {
      root?.render(
        <OlmaSelect id="select-dis-req" label="Wilaya" required disabled>
          <option value="16">16 - Alger</option>
        </OlmaSelect>
      );
    });

    const select = document.getElementById('select-dis-req') as HTMLSelectElement | null;
    expect(select?.disabled).toBe(true);
    expect(select?.required).toBe(true);
    expect(container?.querySelector('label')?.textContent).toContain('*');
  });

  it('5. handles error state with aria-invalid and aria-describedby (scenario 2: error only)', () => {
    act(() => {
      root?.render(
        <OlmaSelect id="select-err" label="Wilaya" error="Veuillez choisir une wilaya">
          <option value="">Sélectionner</option>
          <option value="16">Alger</option>
        </OlmaSelect>
      );
    });

    const select = document.getElementById('select-err') as HTMLSelectElement | null;
    expect(select?.getAttribute('aria-invalid')).toBe('true');
    expect(select?.getAttribute('aria-describedby')).toBe('select-err-error');
    const errorMsg = document.getElementById('select-err-error');
    expect(errorMsg?.textContent).toContain('Veuillez choisir une wilaya');
    expect(document.getElementById('select-err-desc')).toBeNull();
  });

  it('6. renders description with aria-describedby (scenario 3: description only)', () => {
    act(() => {
      root?.render(
        <OlmaSelect id="select-desc" label="Papiers fonciers" description="Sélectionnez le statut légal du bien">
          <option value="acte">Acte notarié</option>
        </OlmaSelect>
      );
    });

    const select = document.getElementById('select-desc') as HTMLSelectElement | null;
    expect(select?.getAttribute('aria-invalid')).toBeNull();
    expect(select?.getAttribute('aria-describedby')).toBe('select-desc-desc');
    const desc = document.getElementById('select-desc-desc');
    expect(desc?.textContent).toContain('Sélectionnez le statut légal du bien');
    expect(document.getElementById('select-desc-error')).toBeNull();
  });

  it('handles error and description together without dangling aria-describedby references (scenario 4)', () => {
    act(() => {
      root?.render(
        <OlmaSelect
          id="select-combined"
          label="Wilaya"
          error="Veuillez choisir une wilaya"
          description="Sélectionnez la wilaya du bien"
        >
          <option value="">Sélectionner</option>
          <option value="16">16 - Alger</option>
          <option value="31">31 - Oran</option>
        </OlmaSelect>
      );
    });

    const select = document.getElementById('select-combined') as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    expect(select?.getAttribute('aria-invalid')).toBe('true');

    const ariaDescribedBy = select?.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();

    const referencedIds = ariaDescribedBy ? ariaDescribedBy.split(/\s+/) : [];
    expect(referencedIds.length).toBe(2);

    // Verify all referenced IDs genuinely exist in the DOM
    for (const refId of referencedIds) {
      const referencedElement = document.getElementById(refId);
      expect(referencedElement).not.toBeNull();
    }

    // Verify error node exists with role="alert"
    const errorNode = document.getElementById('select-combined-error');
    expect(errorNode).not.toBeNull();
    expect(errorNode?.getAttribute('role')).toBe('alert');
    expect(errorNode?.textContent).toContain('Veuillez choisir une wilaya');

    // Verify description node exists and is in the DOM
    const descNode = document.getElementById('select-combined-desc');
    expect(descNode).not.toBeNull();
    expect(descNode?.textContent).toContain('Sélectionnez la wilaya du bien');

    // Verify logical order: error first, description second
    expect(referencedIds[0]).toBe('select-combined-error');
    expect(referencedIds[1]).toBe('select-combined-desc');
  });

  it('7. supports sm, md, and lg sizes', () => {
    act(() => {
      root?.render(
        <div>
          <OlmaSelect id="sel-sm" size="sm"><option>1</option></OlmaSelect>
          <OlmaSelect id="sel-md" size="md"><option>2</option></OlmaSelect>
          <OlmaSelect id="sel-lg" size="lg"><option>3</option></OlmaSelect>
        </div>
      );
    });

    expect(document.getElementById('sel-sm')?.className).toContain('min-h-[36px]');
    expect(document.getElementById('sel-md')?.className).toContain('min-h-[42px]');
    expect(document.getElementById('sel-lg')?.className).toContain('min-h-[48px]');
  });

  it('8. supports fullWidth prop on select container', () => {
    act(() => {
      root?.render(
        <div>
          <div data-testid="sel-wrapper-full"><OlmaSelect id="sel-full" fullWidth><option>1</option></OlmaSelect></div>
          <div data-testid="sel-wrapper-auto"><OlmaSelect id="sel-auto" fullWidth={false}><option>2</option></OlmaSelect></div>
        </div>
      );
    });

    expect(container?.querySelector('[data-testid="sel-wrapper-full"] > div')?.className).toContain('w-full');
    expect(container?.querySelector('[data-testid="sel-wrapper-auto"] > div')?.className).toContain('w-auto');
  });

  it('9. forwards ref to HTMLSelectElement', () => {
    const selectRef = React.createRef<HTMLSelectElement>();
    act(() => {
      root?.render(
        <OlmaSelect ref={selectRef} id="sel-ref" defaultValue="hydra">
          <option value="hydra">Hydra</option>
          <option value="kuba">Kouba</option>
        </OlmaSelect>
      );
    });

    expect(selectRef.current).not.toBeNull();
    expect(selectRef.current?.value).toBe('hydra');
  });

  it('10. renders placeholder option correctly', () => {
    act(() => {
      root?.render(
        <OlmaSelect id="sel-placeholder" placeholder="Choisir une commune...">
          <option value="alger">Alger</option>
        </OlmaSelect>
      );
    });

    const select = document.getElementById('sel-placeholder') as HTMLSelectElement | null;
    expect(select?.options[0].textContent).toBe('Choisir une commune...');
    expect(select?.options[0].value).toBe('');
  });

  it('11. renders leftIcon and adds appropriate padding', () => {
    act(() => {
      root?.render(
        <OlmaSelect id="sel-icon" leftIcon={<span data-testid="select-icon">📍</span>}>
          <option value="16">Alger</option>
        </OlmaSelect>
      );
    });

    expect(container?.querySelector('[data-testid="select-icon"]')).not.toBeNull();
    expect(document.getElementById('sel-icon')?.className).toContain('ps-10');
  });
});
