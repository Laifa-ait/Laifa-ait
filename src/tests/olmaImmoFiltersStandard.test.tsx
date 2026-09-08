// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocationFilterSelects } from '../components/OlmaImmo/filters/LocationFilterSelects';
import { PriceRangeFilter } from '../components/OlmaImmo/filters/PriceRangeFilter';
import { LegalPapersFilter } from '../components/OlmaImmo/filters/LegalPapersFilter';
import { ActiveFilterPills } from '../components/OlmaImmo/filters/ActiveFilterPills';
import { OlmaImmoFilterModal } from '../components/OlmaImmo/filters/OlmaImmoFilterModal';
import { FilterState } from '../components/OlmaImmo/SearchFilters';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OLM-IMMO 2.3 — Filters Standard Component Tests', () => {
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

  it('renders LocationFilterSelects and triggers wilaya selection', async () => {
    const onWilaya = vi.fn();
    const onCommune = vi.fn();

    await act(async () => {
      root?.render(
        <LocationFilterSelects
          wilaya={undefined}
          commune={undefined}
          onWilayaChange={onWilaya}
          onCommuneChange={onCommune}
          idPrefix="test-loc"
        />
      );
    });

    const selects = container?.querySelectorAll('select');
    expect(selects?.length).toBe(2);

    const wilayaSelect = selects?.[0] as HTMLSelectElement;
    expect(wilayaSelect).toBeTruthy();

    await act(async () => {
      wilayaSelect.value = 'Alger';
      wilayaSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onWilaya).toHaveBeenCalledWith('Alger');
  });

  it('renders PriceRangeFilter and validates min > max', async () => {
    const onChange = vi.fn();

    await act(async () => {
      root?.render(
        <PriceRangeFilter
          minPrice={10000000}
          maxPrice={5000000}
          listingType="sale"
          onChange={onChange}
          idPrefix="test-price"
        />
      );
    });

    expect(container?.textContent).toContain('Le prix minimum ne peut pas dépasser le prix maximum');
  });

  it('renders LegalPapersFilter and handles toggling checkboxes', async () => {
    const onToggleActe = vi.fn();
    const onToggleLivret = vi.fn();
    const onSelectPaper = vi.fn();

    await act(async () => {
      root?.render(
        <LegalPapersFilter
          hasActeNotarie={false}
          hasLivretFoncier={true}
          legalPaperType={undefined}
          onToggleActeNotarie={onToggleActe}
          onToggleLivretFoncier={onToggleLivret}
          onSelectLegalPaper={onSelectPaper}
        />
      );
    });

    const checkboxes = container?.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes?.length).toBe(2);

    const acteCheckbox = checkboxes?.[0] as HTMLInputElement;
    await act(async () => {
      acteCheckbox.click();
    });

    expect(onToggleActe).toHaveBeenCalledWith(true);
  });

  it('renders ActiveFilterPills and fires remove and reset handlers', async () => {
    const onRemove = vi.fn();
    const onReset = vi.fn();
    const filters: FilterState = {
      listingType: 'sale',
      wilaya: 'Alger',
      minPrice: 10000000,
      hasActeNotarie: true,
    };

    await act(async () => {
      root?.render(
        <ActiveFilterPills
          filters={filters}
          onRemoveFilter={onRemove}
          onResetAll={onReset}
        />
      );
    });

    expect(container?.textContent).toContain('Achat');
    expect(container?.textContent).toContain('Wilaya: Alger');
    expect(container?.textContent).toContain('Acte Notarié');

    const removeButtons = container?.querySelectorAll('button[aria-label*="Supprimer"]');
    expect(removeButtons?.length).toBeGreaterThan(0);

    await act(async () => {
      (removeButtons?.[1] as HTMLButtonElement)?.click();
    });

    expect(onRemove).toHaveBeenCalledWith('wilaya');

    const resetBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Tout effacer')
    );
    expect(resetBtn).toBeTruthy();

    await act(async () => {
      resetBtn?.click();
    });

    expect(onReset).toHaveBeenCalled();
  });

  it('renders OlmaImmoFilterModal and applies selected filters', async () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    const onClose = vi.fn();
    const filters: FilterState = {
      listingType: 'sale',
      sort: 'recent',
    };

    await act(async () => {
      root?.render(
        <OlmaImmoFilterModal
          isOpen={true}
          onClose={onClose}
          filters={filters}
          onApplyFilters={onApply}
          onResetFilters={onReset}
        />
      );
    });

    expect(container?.textContent).toContain('Filtres de recherche immobilière');

    const louerBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.trim() === 'Louer'
    );
    expect(louerBtn).toBeTruthy();

    await act(async () => {
      louerBtn?.click();
    });

    const applyBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Appliquer')
    );
    expect(applyBtn).toBeTruthy();

    await act(async () => {
      applyBtn?.click();
    });

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        listingType: 'rent_long',
      })
    );
    expect(onClose).toHaveBeenCalled();
  });
});
