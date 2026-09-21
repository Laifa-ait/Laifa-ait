import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, SlidersHorizontal, RotateCcw, Check, Sparkles, Star, MapPin, Wrench } from 'lucide-react';
import { ALGERIA_WILAYAS } from '../../../constants/wilayas';
import { ArtisanTrade } from '../../../types/artisan';

export interface ArtisanFilterOptions {
  q?: string;
  tradeId?: string;
  wilaya?: string;
  commune?: string;
  availableOnly?: boolean;
  minRating?: number;
  sort?: 'rating' | 'experience' | 'recent';
}

interface OlmaArtisanFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: ArtisanTrade[];
  filters: ArtisanFilterOptions;
  onApplyFilters: (newFilters: ArtisanFilterOptions) => void;
  onResetFilters: () => void;
}

export const OlmaArtisanFilterModal: React.FC<OlmaArtisanFilterModalProps> = ({
  isOpen,
  onClose,
  trades,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [draft, setDraft] = useState<ArtisanFilterOptions>(filters);

  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Filtres & Préférences</h2>
              <p className="text-xs text-slate-500">Affinez votre recherche d'artisans</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Métier */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Wrench className="w-4 h-4 text-slate-500" />
              <span>Corps d'état / Métier</span>
            </label>
            <select
              value={draft.tradeId || ''}
              onChange={(e) => setDraft((p) => ({ ...p, tradeId: e.target.value || undefined }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">Tous les corps d'état</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Wilaya */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Wilaya d'intervention</span>
            </label>
            <select
              value={draft.wilaya || ''}
              onChange={(e) => setDraft((p) => ({ ...p, wilaya: e.target.value || undefined, commune: undefined }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">Toutes les 58 Wilayas</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={w.name}>{w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Disponibilité Immédiate */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <p className="font-bold text-slate-900">Disponible immédiatement</p>
              <p className="text-[11px] text-slate-500">Afficher uniquement les artisans disponibles</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(draft.availableOnly)}
                onChange={(e) => setDraft((p) => ({ ...p, availableOnly: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          {/* Note minimale */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Note minimale</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Toutes', val: undefined },
                { label: '★ 4.0+', val: 4.0 },
                { label: '★ 4.5+', val: 4.5 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, minRating: item.val }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    draft.minRating === item.val
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-500 font-black shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tri */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ordre d'affichage</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'recent', label: 'Récents' },
                { id: 'rating', label: 'Mieux notés' },
                { id: 'experience', label: "D'expérience" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, sort: s.id as 'rating' | 'experience' | 'recent' }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    (draft.sort || 'recent') === s.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-500 font-black shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={() => { setDraft({}); onResetFilters(); onClose(); }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
          <button
            type="button"
            onClick={() => { onApplyFilters(draft); onClose(); }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Appliquer les filtres</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
