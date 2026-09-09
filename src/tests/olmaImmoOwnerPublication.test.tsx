// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { OwnerHeaderStats } from '../components/OlmaImmo/OwnerDashboard/OwnerHeaderStats';
import { OwnerPropertyCard } from '../components/OlmaImmo/OwnerPropertyCard';
import { OwnerPropertiesList } from '../components/OlmaImmo/OwnerDashboard/OwnerPropertiesList';
import { EditorStepper, StepItem } from '../components/OlmaImmo/PropertyEditor/EditorStepper';
import { EditorStepPreview } from '../components/OlmaImmo/PropertyEditor/EditorStepPreview';
import { StoredProperty } from '../types/realEstate';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OLMA IMMO 2.5 — Owner & Publication Experience', () => {
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

  const sampleProperty: StoredProperty = {
    id: 'prop-owner-1',
    title: 'Appartement F4 Vue Panoramique Bab Ezzouar',
    description: 'Très bel appartement rénové proche commodités.',
    listingType: 'sale',
    propertyType: 'apartment',
    price: 18500000,
    pricePeriod: 'total',
    rooms: 4,
    bathrooms: 2,
    areaSquareMeters: 125,
    features: ['Climatisation', 'Ascenseur'],
    location: {
      lat: 36.721,
      lng: 3.183,
      commune: 'Bab Ezzouar',
      wilaya: 'Alger',
      address: 'Cité Résidentielle',
    },
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'],
    legalPapers: ['acte_notarie_individuel', 'livret_foncier'],
    isLegalVerified: true,
    ownerId: 'owner-789',
    status: 'active',
    viewsCount: 230,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  };

  describe('OwnerHeaderStats', () => {
    it('renders owner KPIs and publish CTA accurately', () => {
      act(() => {
        root?.render(
          <MemoryRouter>
            <OwnerHeaderStats
              propertiesCount={5}
              visitsCount={12}
              bookingsCount={3}
              totalRevenueDZD={1250000}
            />
          </MemoryRouter>
        );
      });

      expect(container?.textContent).toContain('Tableau de bord Annonceur & Propriétaire');
      expect(container?.textContent).toContain('Déposer une annonce');
      expect(container?.textContent).toContain('5');
      expect(container?.textContent).toContain('12');
      expect(container?.textContent).toContain('3');
      expect(container?.textContent).toMatch(/1.*250.*000.*DA/);
    });
  });

  describe('OwnerPropertyCard', () => {
    it('renders property information and triggers status toggle & delete callbacks', () => {
      const handleDelete = vi.fn();
      const handleUpdateStatus = vi.fn();

      act(() => {
        root?.render(
          <MemoryRouter>
            <OwnerPropertyCard
              property={sampleProperty}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
            />
          </MemoryRouter>
        );
      });

      expect(container?.textContent).toContain('Appartement F4 Vue Panoramique Bab Ezzouar');
      expect(container?.textContent).toContain('Bab Ezzouar');
      expect(container?.textContent).toMatch(/18.*500.*000.*DA/);
      expect(container?.textContent).toContain('230 vues');

      // Click status toggle button (Pause when active)
      const pauseButton = container?.querySelector('button[aria-label="Mettre en pause"]') as HTMLButtonElement;
      expect(pauseButton).not.toBeNull();

      act(() => {
        pauseButton?.click();
      });

      expect(handleUpdateStatus).toHaveBeenCalledWith('prop-owner-1', 'paused');

      // Click delete button
      const deleteButton = container?.querySelector('button[aria-label="Supprimer l\'annonce"]') as HTMLButtonElement;
      expect(deleteButton).not.toBeNull();

      act(() => {
        deleteButton?.click();
      });

      expect(handleDelete).toHaveBeenCalledWith('prop-owner-1', 'Appartement F4 Vue Panoramique Bab Ezzouar');
    });
  });

  describe('OwnerPropertiesList', () => {
    it('filters properties by status tab and displays owner cards', () => {
      const propertiesList: StoredProperty[] = [
        sampleProperty,
        {
          ...sampleProperty,
          id: 'prop-owner-2',
          title: 'Villa Hydra en Pause',
          status: 'paused',
        },
      ];

      const handleUpdateStatus = vi.fn();

      act(() => {
        root?.render(
          <MemoryRouter>
            <OwnerPropertiesList
              properties={propertiesList}
              isLoading={false}
              onUpdateStatus={handleUpdateStatus}
            />
          </MemoryRouter>
        );
      });

      expect(container?.textContent).toContain('Toutes les annonces');
      expect(container?.textContent).toContain('Appartement F4 Vue Panoramique Bab Ezzouar');
      expect(container?.textContent).toContain('Villa Hydra en Pause');

      // Click "En pause" tab
      const pauseTab = Array.from(container?.querySelectorAll('button') || []).find((btn) =>
        btn.textContent?.includes('En pause')
      );
      expect(pauseTab).not.toBeUndefined();

      act(() => {
        pauseTab?.click();
      });

      expect(container?.textContent).toContain('Villa Hydra en Pause');
      expect(container?.textContent).not.toContain('Appartement F4 Vue Panoramique Bab Ezzouar');
    });
  });

  describe('EditorStepper & StepPreview', () => {
    it('renders stepper steps and handles step click', () => {
      const steps: StepItem[] = [
        { id: 1, title: 'Transaction', short: '01' },
        { id: 2, title: 'Localisation', short: '02' },
      ];
      const handleStepClick = vi.fn();

      act(() => {
        root?.render(
          <EditorStepper steps={steps} currentStep={2} onStepClick={handleStepClick} />
        );
      });

      expect(container?.textContent).toContain('Transaction');
      expect(container?.textContent).toContain('Localisation');

      const step1Button = container?.querySelectorAll('button')[0] as HTMLButtonElement;
      act(() => {
        step1Button.click();
      });

      expect(handleStepClick).toHaveBeenCalledWith(1);
    });

    it('renders preview with publication notice banner and property details', () => {
      act(() => {
        root?.render(
          <EditorStepPreview
            title="Appartement F4 Bab Ezzouar"
            description="Superbe appartement rénové."
            listingType="sale"
            propertyType="apartment"
            legalPaperType="acte_notarie_individuel"
            location={{
              wilaya: 'Alger',
              commune: 'Bab Ezzouar',
              address: 'Cité Résidentielle',
              lat: 36.721,
              lng: 3.183,
            }}
            price={18500000}
            pricePeriod="total"
            rooms={4}
            areaSquareMeters={125}
            bathrooms={2}
            images={['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800']}
            features={['Climatisation', 'Ascenseur']}
            contactPhone="0550123456"
          />
        );
      });

      expect(container?.textContent).toContain('Aperçu avant publication');
      expect(container?.textContent).toContain('Publication immédiate avec statut actif');
      expect(container?.textContent).toContain('Appartement F4 Bab Ezzouar');
      expect(container?.textContent).toContain('Contact : 0550123456');
    });
  });
});
