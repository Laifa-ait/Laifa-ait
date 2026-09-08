import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import { LegalPaperType } from '../../../types/realEstate';
import { LEGAL_PAPERS_CONFIG } from '../../../constants/legalPapers';

interface LegalPapersFilterProps {
  hasActeNotarie?: boolean;
  hasLivretFoncier?: boolean;
  legalPaperType?: LegalPaperType;
  onToggleActeNotarie: (checked: boolean) => void;
  onToggleLivretFoncier: (checked: boolean) => void;
  onSelectLegalPaper: (paper: LegalPaperType | undefined) => void;
}

export const LegalPapersFilter: React.FC<LegalPapersFilterProps> = ({
  hasActeNotarie,
  hasLivretFoncier,
  legalPaperType,
  onToggleActeNotarie,
  onToggleLivretFoncier,
  onSelectLegalPaper,
}) => {
  return (
    <div className="space-y-3.5 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Garanties Juridiques & Papiers Fonciers DZ</span>
          </label>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBDCB8] text-[#0D281E]">
            Conforme loi foncière
          </span>
        </div>
      </div>

      {/* Main 2 Checkboxes for Algerian Real Estate Core Safety */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <label
          className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer select-none text-xs font-bold ${
            hasActeNotarie
              ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-xs'
              : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:bg-stone-100'
          }`}
        >
          <input
            type="checkbox"
            checked={Boolean(hasActeNotarie)}
            onChange={(e) => onToggleActeNotarie(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-stone-300 accent-emerald-700 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div>Acte notarié disponible</div>
            <div className="text-[10px] font-normal text-stone-500">Enregistré et authentique</div>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg shrink-0">
            Notarié
          </span>
        </label>

        <label
          className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer select-none text-xs font-bold ${
            hasLivretFoncier
              ? 'bg-[#EBDCB8]/40 border-[#0D281E] text-[#0D281E] shadow-xs'
              : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:bg-stone-100'
          }`}
        >
          <input
            type="checkbox"
            checked={Boolean(hasLivretFoncier)}
            onChange={(e) => onToggleLivretFoncier(e.target.checked)}
            className="w-4 h-4 rounded text-[#0D281E] focus:ring-[#0D281E] border-stone-300 accent-[#0D281E] cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div>Livret foncier disponible</div>
            <div className="text-[10px] font-normal text-stone-500">Immatriculation cadastrale</div>
          </div>
          <span className="text-[10px] font-extrabold text-[#0D281E] bg-[#EBDCB8] px-2 py-0.5 rounded-lg shrink-0">
            Cadastre
          </span>
        </label>
      </div>

      {/* Specific Paper Type Selector */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-semibold text-stone-500">Ou sélectionner un titre précis :</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectLegalPaper(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
              !legalPaperType
                ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tous les titres
          </button>
          {Object.values(LEGAL_PAPERS_CONFIG).map((p) => {
            const isSelected = legalPaperType === p.type;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => onSelectLegalPaper(isSelected ? undefined : p.type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5 border ${
                  isSelected
                    ? `${p.badgeBg} ${p.badgeText} ${p.badgeBorder} shadow-xs ring-1 ring-emerald-600/30`
                    : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
                title={p.description}
              >
                {p.isVerifiedLegal && <Award className="w-3 h-3 text-emerald-700 shrink-0" />}
                <span>{p.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
