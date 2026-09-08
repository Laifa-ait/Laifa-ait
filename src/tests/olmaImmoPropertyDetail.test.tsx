// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Property } from '../types/realEstate';

import { DetailSpecs } from '../components/OlmaImmo/PropertyDetail/DetailSpecs';
import { DetailLegalStatus } from '../components/OlmaImmo/PropertyDetail/DetailLegalStatus';
import { DetailFinancialTerms } from '../components/OlmaImmo/PropertyDetail/DetailFinancialTerms';
import { DetailDescription } from '../components/OlmaImmo/PropertyDetail/DetailDescription';
import { DetailHeader } from '../components/OlmaImmo/PropertyDetail/DetailHeader';
import { DetailMobileActionBar } from '../components/OlmaImmo/PropertyDetail/DetailMobileActionBar';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockProperty: Property = {
  id: 'prop_test_detail',
  title: 'Bel Appartement F4 Vue Mer',
  description:
    'Superbe appartement situé au coeur d’Alger avec vue imprenable sur la baie. Cet espace exceptionnel dispose de grandes baies vitrées lumineuses, de finitions soignées en marbre et d’une cuisine entièrement équipée. Idéalement placé à proximité immédiate des commerces, des écoles réputées et des accès autoroutiers majeurs.',
  propertyType: 'apartment',
  listingType: 'sale',
  price: 32000000,
  areaSquareMeters: 145,
  rooms: 4,
  bathrooms: 2,
  legalPaperType: 'acte_notarie',
  legalPapers: ['acte_notarie', 'livret_foncier'],
  isLegalVerified: true,
  status: 'active',
  ownerId: 'owner_dz_1',
  contactPhone: '0555000000',
  viewsCount: 142,
  location: {
    address: '15 Boulevard Colonel Amirouche',
    commune: 'Alger Centre',
    wilaya: 'Alger',
    lat: 36.7725,
    lng: 3.0594,
  },
  features: ['ascenseur', 'climatisation', 'chauffage_central', 'stationnement'],
  images: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  ],
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z',
};

describe('Olma Immo — Property Detail Components Suite', () => {
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
    vi.clearAllMocks();
  });

  describe('DetailSpecs', () => {
    it('renders specs correctly with non-negative numbers and correct unit labels', () => {
      act(() => {
        root?.render(<DetailSpecs property={mockProperty} />);
      });
      expect(container?.textContent).toContain('145 m²');
      expect(container?.textContent).toContain('F4');
      expect(container?.textContent).toContain('Salles de bain');
      expect(container?.textContent).toContain('2');
    });

    it('handles zero bathrooms gracefully without displaying defaulting values', () => {
      const propWithoutBath = { ...mockProperty, bathrooms: 0 };
      act(() => {
        root?.render(<DetailSpecs property={propWithoutBath} />);
      });
      expect(container?.textContent).not.toContain('Salles de bain');
    });
  });

  describe('DetailLegalStatus', () => {
    it('displays clear distinction between declared and verified papers', () => {
      act(() => {
        root?.render(<DetailLegalStatus property={mockProperty} />);
      });
      expect(container?.textContent).toContain('Documents & Statut Foncier');
      expect(container?.textContent).toContain('Vérifié');
      expect(container?.textContent).toContain('Code civil algérien');
    });

    it('indicates declaratif when papers are not verified', () => {
      const unverified = { ...mockProperty, isLegalVerified: false };
      act(() => {
        root?.render(<DetailLegalStatus property={unverified} />);
      });
      expect(container?.textContent).toContain('Déclaratif');
      expect(container?.textContent).not.toContain("Document vérifié par l'équipe Olmart");
    });
  });

  describe('DetailFinancialTerms', () => {
    it('displays financial terms and provides strict non-transactional reassurance', () => {
      act(() => {
        root?.render(<DetailFinancialTerms property={mockProperty} />);
      });
      expect(container?.textContent).toContain('Conditions Financières & Commerciales');
      expect(container?.textContent).toContain('Prix Ferme');
      expect(container?.textContent).toContain("Aucun acompte n'est perçu en ligne");
    });
  });

  describe('DetailDescription', () => {
    it('renders property description with accessible collapsible toggle when long', () => {
      act(() => {
        root?.render(<DetailDescription property={mockProperty} />);
      });
      expect(container?.textContent).toContain('Superbe appartement situé au coeur d’Alger');

      const toggleBtn = container?.querySelector('button[aria-expanded]') as HTMLButtonElement | null;
      expect(toggleBtn).toBeDefined();
      expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');

      // Click to expand
      act(() => {
        toggleBtn?.click();
      });
      expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true');

      // Click to collapse
      act(() => {
        toggleBtn?.click();
      });
      expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
    });

    it('handles empty description gracefully', () => {
      const propEmpty = { ...mockProperty, description: '' };
      act(() => {
        root?.render(<DetailDescription property={propEmpty} />);
      });
      expect(container?.textContent).toContain("Aucune description détaillée n'a été rédigée");
    });
  });

  describe('DetailHeader', () => {
    it('renders title, location, badges, and action buttons', () => {
      const onFav = vi.fn();
      const onShare = vi.fn();

      act(() => {
        root?.render(
          <MemoryRouter>
            <DetailHeader
              property={mockProperty}
              isFav={false}
              onFavoriteClick={onFav}
              onShare={onShare}
            />
          </MemoryRouter>
        );
      });

      expect(container?.textContent).toContain(mockProperty.title);
      expect(container?.textContent).toContain('Alger Centre');
      expect(container?.textContent).toContain('Alger');

      const shareBtn = container?.querySelector('button[aria-label="Partager l\'annonce"]') as HTMLButtonElement | null;
      expect(shareBtn).toBeDefined();

      act(() => {
        shareBtn?.click();
      });
      expect(onShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('DetailMobileActionBar', () => {
    it('renders floating mobile action bar with price and CTAs', () => {
      const onVisit = vi.fn();
      const onBooking = vi.fn();
      const onChat = vi.fn();

      act(() => {
        root?.render(
          <DetailMobileActionBar
            property={mockProperty}
            ownerProfile={{
              uid: 'owner_1',
              displayName: 'Karim Immo',
              role: 'seller',
              verificationStatus: 'approved',
              shopName: 'Karim Immo',
              joinedAt: '2025-01-01',
            }}
            onOpenVisitModal={onVisit}
            onOpenBookingModal={onBooking}
            onOpenDirectChat={onChat}
          />
        );
      });

      const normalizedText = container?.textContent?.replace(/\s|\u202f/g, ' ') || '';
      expect(normalizedText).toContain('32 000 000 DZD');

      const buttons = container?.querySelectorAll('button');
      const visitBtn = Array.from(buttons || []).find((b) => b.textContent?.includes('Planifier visite'));
      expect(visitBtn).toBeDefined();

      act(() => {
        visitBtn?.click();
      });
      expect(onVisit).toHaveBeenCalledTimes(1);

      const msgBtn = container?.querySelector('button[aria-label="Envoyer un message au propriétaire"]') as HTMLButtonElement | null;
      expect(msgBtn).toBeDefined();

      act(() => {
        msgBtn?.click();
      });
      expect(onChat).toHaveBeenCalledTimes(1);
    });
  });
});
