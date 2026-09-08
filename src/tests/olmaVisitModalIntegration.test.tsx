// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisitRequestModal } from '../components/OlmaImmo/VisitRequestModal';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockApiPost = vi.fn();
vi.mock('../lib/api', () => ({
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    userProfile: {
      displayName: 'Yacine Belkacem',
      phone: '0555987654',
    },
  }),
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

describe('OLM-IMMO 1.6 — VisitRequestModal Design System Integration Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
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

  it('1. renders nothing when isOpen is false', () => {
    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={false}
          onClose={vi.fn()}
          propertyId="prop_123"
          propertyTitle="Villa Dely Ibrahim 450m²"
        />
      );
    });

    expect(container?.innerHTML).toBe('');
  });

  it('2, 3, 4. renders dialog with role="dialog", aria-modal="true" and valid aria-labelledby', () => {
    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={true}
          onClose={vi.fn()}
          propertyId="prop_123"
          propertyTitle="Villa Dely Ibrahim 450m²"
        />
      );
    });

    const dialog = container?.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    const labelledBy = dialog?.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('visit-modal-title');

    const titleEl = document.getElementById('visit-modal-title');
    expect(titleEl).not.toBeNull();
    expect(titleEl?.textContent).toContain('Demander une visite');
  });

  it('5. renders close button with accessible name via OlmaButton ghost', () => {
    const handleClose = vi.fn();
    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={true}
          onClose={handleClose}
          propertyId="prop_123"
          propertyTitle="Villa Dely Ibrahim 450m²"
        />
      );
    });

    const closeBtn = container?.querySelector('button[aria-label="Fermer la boîte de dialogue"]') as HTMLButtonElement | null;
    expect(closeBtn).not.toBeNull();

    act(() => {
      closeBtn?.click();
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('6. renders OlmaInput fields for visitor name, phone and preferred date with labels and icons', () => {
    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={true}
          onClose={vi.fn()}
          propertyId="prop_123"
          propertyTitle="Villa Dely Ibrahim 450m²"
        />
      );
    });

    const nameInput = document.getElementById('visitor-name-input') as HTMLInputElement | null;
    const phoneInput = document.getElementById('visitor-phone-input') as HTMLInputElement | null;
    const dateInput = document.getElementById('visitor-date-input') as HTMLInputElement | null;

    expect(nameInput).not.toBeNull();
    expect(phoneInput).not.toBeNull();
    expect(dateInput).not.toBeNull();

    // Verify initial values populated from auth context
    expect(nameInput?.value).toBe('Yacine Belkacem');
    expect(phoneInput?.value).toBe('0555987654');

    // Verify labels
    const nameLabel = container?.querySelector('label[for="visitor-name-input"]');
    const phoneLabel = container?.querySelector('label[for="visitor-phone-input"]');
    const dateLabel = container?.querySelector('label[for="visitor-date-input"]');

    expect(nameLabel?.textContent).toContain('Votre nom complet');
    expect(phoneLabel?.textContent).toContain('Numéro de téléphone');
    expect(dateLabel?.textContent).toContain('Date souhaitée');
  });

  it('7. renders OlmaSelect field for time slot with accessible label', () => {
    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={true}
          onClose={vi.fn()}
          propertyId="prop_123"
          propertyTitle="Villa Dely Ibrahim 450m²"
        />
      );
    });

    const select = document.getElementById('visitor-timeslot-select') as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    expect(select?.value).toBe('09:00 - 11:00');

    const selectLabel = container?.querySelector('label[for="visitor-timeslot-select"]');
    expect(selectLabel?.textContent).toContain('Créneau horaire');
  });

  it('8. renders primary OlmaButton for form submission', () => {
    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={true}
          onClose={vi.fn()}
          propertyId="prop_123"
          propertyTitle="Villa Dely Ibrahim 450m²"
        />
      );
    });

    const submitBtn = container?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    expect(submitBtn).not.toBeNull();
    expect(submitBtn?.textContent).toContain('Confirmer la demande de visite');
    expect(submitBtn?.disabled).toBe(false);
  });

  it('9. exposes visit type choices with accessible aria-pressed state', () => {
    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={true}
          onClose={vi.fn()}
          propertyId="prop_123"
          propertyTitle="Villa Dely Ibrahim 450m²"
        />
      );
    });

    const buttons = container?.querySelectorAll('div[role="group"] button');
    expect(buttons?.length).toBe(2);

    const inPersonBtn = buttons?.[0] as HTMLButtonElement;
    const virtualBtn = buttons?.[1] as HTMLButtonElement;

    // Initial state: in_person is selected
    expect(inPersonBtn.getAttribute('aria-pressed')).toBe('true');
    expect(virtualBtn.getAttribute('aria-pressed')).toBe('false');

    // Toggle to virtual
    act(() => {
      virtualBtn.click();
    });
    expect(inPersonBtn.getAttribute('aria-pressed')).toBe('false');
    expect(virtualBtn.getAttribute('aria-pressed')).toBe('true');

    // Toggle back to in_person
    act(() => {
      inPersonBtn.click();
    });
    expect(inPersonBtn.getAttribute('aria-pressed')).toBe('true');
    expect(virtualBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('10, 11, 12. handles submission flow, loading state and success state with Olma primitives', async () => {
    mockApiPost.mockResolvedValueOnce({ success: true });

    act(() => {
      root?.render(
        <VisitRequestModal
          isOpen={true}
          onClose={vi.fn()}
          propertyId="prop_456"
          propertyTitle="Duplex Hydra 220m²"
        />
      );
    });

    const form = container?.querySelector('form');
    expect(form).not.toBeNull();

    await act(async () => {
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(mockApiPost).toHaveBeenCalledWith('/api/v1/real-estate/visits', expect.objectContaining({
      propertyId: 'prop_456',
      visitorName: 'Yacine Belkacem',
      visitorPhone: '0555987654',
      timeSlot: expect.stringContaining('09:00 - 11:00'),
    }));
    expect(mockToastSuccess).toHaveBeenCalledWith('Demande de visite transmise au propriétaire !');

    // Verify success state rendered
    const successTitle = document.getElementById('visit-modal-title');
    expect(successTitle?.textContent).toContain('Demande envoyée avec succès');
    expect(container?.textContent).toContain('Duplex Hydra 220m²');
    expect(container?.textContent).toContain('Demande transmise');

    // Verify success close OlmaButton
    const successCloseBtn = container?.querySelector('button:not([aria-label])') as HTMLButtonElement | null;
    expect(successCloseBtn).not.toBeNull();
    expect(successCloseBtn?.textContent).toBe('Fermer');
  });
});
