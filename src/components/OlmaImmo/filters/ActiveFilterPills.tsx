import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterState } from '../SearchFilters';
import { LEGAL_PAPERS_CONFIG } from '../../../constants/legalPapers';

interface ActiveFilterPillsProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState) => void;
  onResetAll: () => void;
  className?: string;
}

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
  filters,
  onRemoveFilter,
  onResetAll,
  className = '',
}) => {
  const activeItems: Array<{
    key: keyof FilterState;
    label: string;
    variant: 'brand' | 'accent' | 'highlight' | 'neutral' | 'success';
  }> = [];

  if (filters.listingType) {
    const label =
      filters.listingType === 'sale'
        ? 'Achat'
        : filters.listingType === 'rent_long'
        ? 'Location'
        : 'Séjour';
    activeItems.push({ key: 'listingType', label, variant: 'brand' });
  }

  if (filters.propertyType) {
    const typeLabels: Record<string, string> = {
      apartment: 'Appartement',
      villa: 'Villa',
      house: 'Maison',
      studio: 'Studio',
      commercial: 'Commerce',
      land: 'Terrain',
      office: 'Bureau',
    };
    activeItems.push({
      key: 'propertyType',
      label: typeLabels[filters.propertyType] || filters.propertyType,
      variant: 'neutral',
    });
  }

  if (filters.wilaya) {
    activeItems.push({
      key: 'wilaya',
      label: `Wilaya: ${filters.wilaya}`,
      variant: 'highlight',
    });
  }

  if (filters.commune) {
    activeItems.push({
      key: 'commune',
      label: `Commune: ${filters.commune}`,
      variant: 'highlight',
    });
  }

  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    activeItems.push({
      key: 'minPrice',
      label: `${filters.minPrice.toLocaleString('fr-DZ')} - ${filters.maxPrice.toLocaleString('fr-DZ')} DA`,
      variant: 'accent',
    });
  } else if (filters.minPrice !== undefined) {
    activeItems.push({
      key: 'minPrice',
      label: `≥ ${filters.minPrice.toLocaleString('fr-DZ')} DA`,
      variant: 'accent',
    });
  } else if (filters.maxPrice !== undefined) {
    activeItems.push({
      key: 'maxPrice',
      label: `≤ ${filters.maxPrice.toLocaleString('fr-DZ')} DA`,
      variant: 'accent',
    });
  }

  if (filters.minRooms !== undefined) {
    activeItems.push({
      key: 'minRooms',
      label: `F${filters.minRooms}+`,
      variant: 'neutral',
    });
  }

  if (filters.minArea !== undefined) {
    activeItems.push({
      key: 'minArea',
      label: `≥ ${filters.minArea} m²`,
      variant: 'neutral',
    });
  }

  if (filters.hasActeNotarie) {
    activeItems.push({
      key: 'hasActeNotarie',
      label: 'Acte Notarié',
      variant: 'success',
    });
  }

  if (filters.hasLivretFoncier) {
    activeItems.push({
      key: 'hasLivretFoncier',
      label: 'Livret Foncier',
      variant: 'brand',
    });
  }

  if (filters.legalPaperType) {
    const config = LEGAL_PAPERS_CONFIG[filters.legalPaperType];
    activeItems.push({
      key: 'legalPaperType',
      label: config ? config.shortLabel : filters.legalPaperType,
      variant: 'neutral',
    });
  }

  if (activeItems.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 py-2 ${className}`}>
      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
        Filtres actifs :
      </span>

      {activeItems.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#0D281E] border border-[#E6E0D4] shadow-2xs transition-all hover:border-stone-400"
        >
          <span>{item.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(item.key)}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer transition"
            aria-label={`Supprimer le filtre ${item.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetAll}
        className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer ml-1 py-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Tout effacer ({activeItems.length})</span>
      </button>
    </div>
  );
};
