import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { FilterState } from '../SearchFilters';
import { ListingType, PropertySortOption } from '../../../types/realEstate';
import { LocationFilterSelects } from './LocationFilterSelects';
import { PriceRangeFilter } from './PriceRangeFilter';
import { LegalPapersFilter } from './LegalPapersFilter';
import { PropertySpecsFilter } from './PropertySpecsFilter';

interface OlmaImmoFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
}

export const OlmaImmoFilterModal: React.FC<OlmaImmoFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleResetDraft = () => {
    const clean: FilterState = { sort: 'recent' };
    setDraftFilters(clean);
    onResetFilters();
  };

  const countActiveDraft = [
    draftFilters.listingType,
    draftFilters.propertyType,
    draftFilters.wilaya,
    draftFilters.commune,
    draftFilters.minPrice,
    draftFilters.maxPrice,
    draftFilters.minRooms,
    draftFilters.minArea,
    draftFilters.hasActeNotarie,
    draftFilters.hasLivretFoncier,
    draftFilters.legalPaperType,
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0D281E] text-[#EBDCB8] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="filter-modal-title" className="text-base font-bold text-[#0D281E]">
                Filtres de recherche immobilière
              </h2>
              <p className="text-[11px] text-stone-500">
                Précisez vos critères pour trouver le bien idéal en Algérie
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 cursor-pointer transition"
            aria-label="Fermer la fenêtre des filtres"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {/* 1. Transaction Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Type de transaction
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'sale' as ListingType, label: 'Acheter' },
                { type: 'rent_long' as ListingType, label: 'Louer' },
                { type: 'rent_short' as ListingType, label: 'Séjour court' },
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() =>
                    setDraftFilters({
                      ...draftFilters,
                      listingType: draftFilters.listingType === t.type ? undefined : t.type,
                    })
                  }
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                    draftFilters.listingType === t.type
                      ? 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E] shadow-sm'
                      : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Localisation (Wilaya & Commune) */}
          <LocationFilterSelects
            wilaya={draftFilters.wilaya}
            commune={draftFilters.commune}
            onWilayaChange={(w) => setDraftFilters((prev) => ({ ...prev, wilaya: w }))}
            onCommuneChange={(c) => setDraftFilters((prev) => ({ ...prev, commune: c }))}
            idPrefix="modal-loc"
          />

          {/* 3. Budget DZD */}
          <PriceRangeFilter
            minPrice={draftFilters.minPrice}
            maxPrice={draftFilters.maxPrice}
            listingType={draftFilters.listingType}
            onChange={(min, max) =>
              setDraftFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))
            }
            idPrefix="modal-price"
          />

          {/* 4. Type de bien, Pièces & Surface */}
          <PropertySpecsFilter
            propertyType={draftFilters.propertyType}
            minRooms={draftFilters.minRooms}
            minArea={draftFilters.minArea}
            onPropertyTypeChange={(pt) => setDraftFilters((prev) => ({ ...prev, propertyType: pt }))}
            onMinRoomsChange={(mr) => setDraftFilters((prev) => ({ ...prev, minRooms: mr }))}
            onMinAreaChange={(ma) => setDraftFilters((prev) => ({ ...prev, minArea: ma }))}
          />

          {/* 5. Garanties Foncières & Juridiques DZ */}
          <LegalPapersFilter
            hasActeNotarie={draftFilters.hasActeNotarie}
            hasLivretFoncier={draftFilters.hasLivretFoncier}
            legalPaperType={draftFilters.legalPaperType}
            onToggleActeNotarie={(chk) =>
              setDraftFilters((prev) => ({ ...prev, hasActeNotarie: chk ? true : undefined }))
            }
            onToggleLivretFoncier={(chk) =>
              setDraftFilters((prev) => ({ ...prev, hasLivretFoncier: chk ? true : undefined }))
            }
            onSelectLegalPaper={(paper) =>
              setDraftFilters((prev) => ({ ...prev, legalPaperType: paper }))
            }
          />

          {/* 6. Tri */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Ordre d'affichage
            </label>
            <select
              value={draftFilters.sort || 'recent'}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, sort: e.target.value as PropertySortOption })
              }
              className="w-full bg-[#FAF8F5] border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D281E]"
            >
              <option value="recent">Plus récents en premier</option>
              <option value="price_asc">Prix croissant (DZD)</option>
              <option value="price_desc">Prix décroissant (DZD)</option>
              <option value="popularity">Popularité / Nombre de vues</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDraft}
            className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-stone-200/50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 bg-[#0D281E] hover:bg-[#153e31] text-[#EBDCB8] rounded-full text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-[#EBDCB8]/20"
          >
            <Check className="w-4 h-4 text-amber-400" />
            <span>Appliquer les filtres {countActiveDraft > 0 ? `(${countActiveDraft})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
