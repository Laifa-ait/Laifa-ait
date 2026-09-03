import React, { useState } from 'react';
import { ShieldCheck, Check, Info, X } from 'lucide-react';
import { LegalPaperType } from '../../../types/realEstate';
import { LEGAL_PAPERS_CONFIG } from '../../../constants/legalPapers';

interface EditorStepLegalPapersProps {
  activePapers: LegalPaperType[];
  onTogglePaper: (paperType: LegalPaperType) => void;
}

export const EditorStepLegalPapers: React.FC<EditorStepLegalPapersProps> = ({
  activePapers,
  onTogglePaper,
}) => {
  const [activeTooltipPaper, setActiveTooltipPaper] = useState<LegalPaperType | null>(null);

  return (
    <div className="space-y-5 pt-6 border-t border-[#f0eae0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
              Situation Juridique & Documents du Bien
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              Standard DZ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sélectionnez tous les titres applicables à votre bien (ex: Acte individuel + Livret foncier).
          </p>
        </div>
        <span className="text-xs font-bold text-[#1a3831] bg-[#f4ecd8] px-3 py-1 rounded-xl self-start sm:self-auto border border-[#e8e2d4]">
          {activePapers.length} document{activePapers.length > 1 ? 's' : ''} sélectionné{activePapers.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Sélecteur à puces interactif (Puces rapides) */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 me-1">
          Sélection rapide à puces :
        </span>
        {Object.values(LEGAL_PAPERS_CONFIG).map((paper) => {
          const isSelected = activePapers.includes(paper.type);
          return (
            <button
              key={`chip-${paper.type}`}
              type="button"
              onClick={() => onTogglePaper(paper.type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                isSelected
                  ? 'bg-[#1a3831] text-[#ebdcb8] shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border border-[#e8e2d4] hover:border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
              <span>{paper.shortLabel}</span>
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* Grille détaillée des documents officiels avec infobulles explicatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {Object.values(LEGAL_PAPERS_CONFIG).map((paper) => {
          const isSelected = activePapers.includes(paper.type);
          const isTooltipOpen = activeTooltipPaper === paper.type;
          const PaperIcon = paper.icon;

          return (
            <div
              key={paper.type}
              className={`p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? 'border-[#1a3831] bg-[#f4ecd8]/60 shadow-xs ring-1 ring-[#1a3831]'
                  : 'border-[#e8e2d4] hover:border-slate-300 bg-[#faf8f5]'
              }`}
            >
              {/* Header card: Icon, Badge & Info tooltip trigger */}
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onTogglePaper(paper.type)}
                  className="flex items-center gap-2 cursor-pointer text-left focus:outline-none"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#1a3831] text-[#ebdcb8]' : 'bg-white text-slate-700 border border-[#e8e2d4]'
                  }`}>
                    <PaperIcon className="w-4 h-4" />
                  </div>
                  {paper.isVerifiedLegal && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Titre Vérifiable
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Bouton infobulle explicative */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltipPaper(isTooltipOpen ? null : paper.type);
                    }}
                    title="Afficher l'infobulle explicative sur ce document"
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      isTooltipOpen
                        ? 'bg-[#1a3831] text-white'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {/* Checkbox state */}
                  <button
                    type="button"
                    onClick={() => onTogglePaper(paper.type)}
                    className="cursor-pointer focus:outline-none"
                  >
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#1a3831] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Main clickable area */}
              <button
                type="button"
                onClick={() => onTogglePaper(paper.type)}
                className="cursor-pointer text-left focus:outline-none flex-1"
              >
                <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-[#1a3831]' : 'text-slate-800'}`}>
                  {paper.shortLabel}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                  {paper.description}
                </p>
              </button>

              {/* Infobulle explicative contextuelle */}
              {isTooltipOpen && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-slate-300 shadow-md text-slate-800 text-[11px] space-y-2 z-10 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-bold text-[#1a3831] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Infobulle Juridique DZ
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTooltipPaper(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block">Portée Légale :</span>
                    <span className="text-slate-600 leading-tight block">{paper.legalScope}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-emerald-800 block">Conseil Olmart :</span>
                    <span className="text-slate-600 leading-tight block">{paper.buyerAdvice}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
