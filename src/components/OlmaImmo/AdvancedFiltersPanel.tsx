import React from 'react';
import { AMENITIES_OPTIONS } from './PropertyImageAndFeaturesForm';
import { LegalPaperType } from '../../types/realEstate';
import { LEGAL_PAPERS_CONFIG } from '../../constants/legalPapers';
import { ShieldCheck } from 'lucide-react';

interface AdvancedFiltersPanelProps {
  roomsFilter: number | 'all';
  setRoomsFilter: (rooms: number | 'all') => void;
  selectedAmenities: string[];
  toggleAmenity: (amenity: string) => void;
  areaRange: [number, number];
  setAreaRange: (range: [number, number]) => void;
  legalPaperFilter?: LegalPaperType | 'all';
  setLegalPaperFilter?: (paper: LegalPaperType | 'all') => void;
  hasActeNotarie?: boolean;
  hasLivretFoncier?: boolean;
  onToggleActeNotarie?: (checked: boolean) => void;
  onToggleLivretFoncier?: (checked: boolean) => void;
  onReset: () => void;
}

export const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  roomsFilter,
  setRoomsFilter,
  selectedAmenities,
  toggleAmenity,
  areaRange,
  setAreaRange,
  legalPaperFilter = 'all',
  setLegalPaperFilter,
  hasActeNotarie,
  hasLivretFoncier,
  onToggleActeNotarie,
  onToggleLivretFoncier,
  onReset,
}) => {
  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      {/* Papiers Fonciers DZ Filter */}
      {setLegalPaperFilter && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Papiers Fonciers (Algérie)
              </label>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-2.5 h-2.5" />
                Juridique DZ
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Cadastre & Notariat</span>
          </div>

          {/* Dedicated Checkbox Filters for "Acte notarié disponible" & "Livret foncier disponible" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:border-emerald-400 cursor-pointer transition select-none">
              <input
                type="checkbox"
                checked={Boolean(hasActeNotarie)}
                onChange={(e) => onToggleActeNotarie?.(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
              />
              <span className="flex-1">Acte notarié disponible</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                Notarié
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:border-[#1a3831] cursor-pointer transition select-none">
              <input
                type="checkbox"
                checked={Boolean(hasLivretFoncier)}
                onChange={(e) => onToggleLivretFoncier?.(e.target.checked)}
                className="w-4 h-4 rounded text-[#1a3831] focus:ring-[#1a3831] border-slate-300 accent-[#1a3831] cursor-pointer"
              />
              <span className="flex-1">Livret foncier disponible</span>
              <span className="text-[10px] font-bold text-[#1a3831] bg-[#f4ecd8] border border-[#e8e2d4] px-1.5 py-0.5 rounded-md">
                Cadastre
              </span>
            </label>
          </div>

          {/* Paper Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setLegalPaperFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                legalPaperFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous les titres
            </button>
            {Object.values(LEGAL_PAPERS_CONFIG).map((paper) => {
              const isSelected = legalPaperFilter === paper.type;
              return (
                <button
                  key={paper.type}
                  type="button"
                  onClick={() => setLegalPaperFilter(paper.type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                    isSelected
                      ? `${paper.badgeBg} ${paper.badgeText} border ${paper.badgeBorder} shadow-xs font-bold`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                  }`}
                  title={paper.description}
                >
                  {paper.isVerifiedLegal && <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />}
                  <span>{paper.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rooms filter */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Nombre de pièces (F)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 1, 2, 3, 4, 5] as const).map((r) => (
            <button
              key={String(r)}
              type="button"
              onClick={() => setRoomsFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                roomsFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'Tous' : `F${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Surface filter */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>Superficie min.</span>
          <span className="text-blue-600 font-extrabold">{areaRange[0]} m²</span>
        </div>
        <input
          type="range"
          min="20"
          max="500"
          step="10"
          value={areaRange[0]}
          onChange={(e) => setAreaRange([Number(e.target.value), areaRange[1]])}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Amenities selection */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Équipements & Commodités
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES_OPTIONS.map((item) => {
            const isSelected = selectedAmenities.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer min-h-[32px] ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
        >
          Réinitialiser tous les filtres
        </button>
      </div>
    </div>
  );
};
