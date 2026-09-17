import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, SlidersHorizontal, RotateCcw, Check, Sparkles } from 'lucide-react';
import { FilterState } from '../SearchFilters';
import { PropertySortOption } from '../../../types/realEstate';
import { TransactionTypeFilter } from './TransactionTypeFilter';
import { LocationFilterSelects } from './LocationFilterSelects';
import { PriceRangeFilter } from './PriceRangeFilter';
import { LegalPapersFilter } from './LegalPapersFilter';
import { PropertySpecsFilter } from './PropertySpecsFilter';
import { AlgerianTerritoryExplainerCard } from '../common/AlgerianTerritoryExplainer';

interface OlmaImmoFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  portalContainer?: HTMLElement | null;
  usePortal?: boolean;
}

export const OlmaImmoFilterModal: React.FC<OlmaImmoFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  portalContainer,
  usePortal,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters);
    }
  }, [isOpen, filters]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    draftFilters.daira,
    draftFilters.commune,
    draftFilters.minPrice,
    draftFilters.maxPrice,
    draftFilters.minRooms,
    draftFilters.minArea,
    draftFilters.hasActeNotarie,
    draftFilters.hasLivretFoncier,
    draftFilters.legalPaperType,
  ].filter(Boolean).length;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overscroll-contain"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[86vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle */}
        <div className="sm:hidden pt-2 pb-0.5 flex justify-center bg-slate-50 border-b border-slate-100">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 sm:py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-blue-900 text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="filter-modal-title" className="text-base font-bold text-[#1E3A8A]">
                  Filtres de recherche immobilière
                </h2>
                {countActiveDraft > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/60">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    {countActiveDraft} actif{countActiveDraft > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Précisez vos critères pour trouver le bien idéal en Algérie
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200/60 cursor-pointer transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Fermer la fenêtre des filtres"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 divide-y divide-slate-100">
          {/* 1. Transaction Type */}
          <TransactionTypeFilter
            value={draftFilters.listingType}
            onChange={(type) => setDraftFilters((prev) => ({ ...prev, listingType: type }))}
          />

          {/* 2. Localisation (Wilaya, Daïra & Baladia / Commune) */}
          <div className="pt-5 space-y-3">
            <LocationFilterSelects
              wilaya={draftFilters.wilaya}
              daira={draftFilters.daira}
              commune={draftFilters.commune}
              onWilayaChange={(w) =>
                setDraftFilters((prev) => ({ ...prev, wilaya: w, daira: undefined, commune: undefined }))
              }
              onDairaChange={(d) =>
                setDraftFilters((prev) => ({ ...prev, daira: d, commune: undefined }))
              }
              onCommuneChange={(c) => setDraftFilters((prev) => ({ ...prev, commune: c }))}
              idPrefix="modal-loc"
              showHelpButton={false}
            />
            <AlgerianTerritoryExplainerCard compact />
          </div>

          {/* 3. Budget DZD */}
          <div className="pt-5">
            <PriceRangeFilter
              minPrice={draftFilters.minPrice}
              maxPrice={draftFilters.maxPrice}
              listingType={draftFilters.listingType}
              onChange={(min, max) =>
                setDraftFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))
              }
              idPrefix="modal-price"
            />
          </div>

          {/* 4. Type de bien, Pièces & Surface */}
          <div className="pt-5">
            <PropertySpecsFilter
              propertyType={draftFilters.propertyType}
              minRooms={draftFilters.minRooms}
              minArea={draftFilters.minArea}
              onPropertyTypeChange={(pt) => setDraftFilters((prev) => ({ ...prev, propertyType: pt }))}
              onMinRoomsChange={(mr) => setDraftFilters((prev) => ({ ...prev, minRooms: mr }))}
              onMinAreaChange={(ma) => setDraftFilters((prev) => ({ ...prev, minArea: ma }))}
            />
          </div>

          {/* 5. Garanties Foncières & Juridiques DZ */}
          <div className="pt-5">
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
          </div>

          {/* 6. Tri */}
          <div className="space-y-2 pt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Ordre d'affichage
            </label>
            <select
              value={draftFilters.sort || 'recent'}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, sort: e.target.value as PropertySortOption })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="recent">Plus récents en premier</option>
              <option value="price_asc">Prix croissant (DZD)</option>
              <option value="price_desc">Prix décroissant (DZD)</option>
              <option value="popularity">Popularité / Nombre de vues</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 sm:py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDraft}
            className="px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-slate-200/50 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 rounded-full text-xs font-extrabold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-amber-600/20"
          >
            <Check className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Appliquer les filtres {countActiveDraft > 0 ? `(${countActiveDraft})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  const shouldPortal = usePortal !== undefined ? usePortal : (!isTest && typeof document !== 'undefined');

  if (shouldPortal && typeof document !== 'undefined') {
    const target = portalContainer ?? document.body;
    return createPortal(modalContent, target);
  }

  return modalContent;
};
