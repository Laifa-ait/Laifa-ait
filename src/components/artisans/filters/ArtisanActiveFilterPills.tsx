import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { ArtisanFilterOptions } from './OlmaArtisanFilterModal';
import { ArtisanTrade } from '../../../types/artisan';

interface ArtisanActiveFilterPillsProps {
  filters: ArtisanFilterOptions;
  trades: ArtisanTrade[];
  onRemoveFilter: (key: keyof ArtisanFilterOptions) => void;
  onResetAll: () => void;
}

export const ArtisanActiveFilterPills: React.FC<ArtisanActiveFilterPillsProps> = ({
  filters,
  trades,
  onRemoveFilter,
  onResetAll,
}) => {
  const pills: { key: keyof ArtisanFilterOptions; label: string }[] = [];

  if (filters.tradeId) {
    const tradeObj = trades.find((t) => t.id === filters.tradeId);
    pills.push({
      key: 'tradeId',
      label: tradeObj ? tradeObj.name : 'Métier sélectionné',
    });
  }

  if (filters.wilaya) {
    pills.push({
      key: 'wilaya',
      label: `Wilaya: ${filters.wilaya}`,
    });
  }

  if (filters.commune) {
    pills.push({
      key: 'commune',
      label: `Commune: ${filters.commune}`,
    });
  }

  if (filters.q) {
    pills.push({
      key: 'q',
      label: `"${filters.q}"`,
    });
  }

  if (filters.availableOnly) {
    pills.push({
      key: 'availableOnly',
      label: 'Disponible immédiatement',
    });
  }

  if (filters.minRating) {
    pills.push({
      key: 'minRating',
      label: `★ ${filters.minRating}+`,
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {pills.map((pill) => (
          <span
            key={pill.key}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors"
          >
            <span>{pill.label}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter(pill.key)}
              className="p-0.5 rounded-full hover:bg-slate-300/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label={`Supprimer le filtre ${pill.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onResetAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors cursor-pointer ml-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Tout effacer</span>
      </button>
    </div>
  );
};
