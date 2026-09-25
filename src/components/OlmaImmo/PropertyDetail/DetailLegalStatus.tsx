import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileCheck2, FileQuestion, ShieldCheck, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { PublicPropertyDTO, LegalPaperType } from '../../../types/realEstate';
import { LEGAL_PAPER_CONFIGS } from './legalPaperConfigs';

interface DetailLegalStatusProps {
  property: PublicPropertyDTO;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export const DetailLegalStatus: React.FC<DetailLegalStatusProps> = ({
  property,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const [expandedPapers, setExpandedPapers] = useState<Record<string, boolean>>({});
  const [showAllPapers, setShowAllPapers] = useState<boolean>(false);

  const rawKeys = property.legalPapers && property.legalPapers.length > 0
    ? property.legalPapers
    : property.legalPaperType ? [property.legalPaperType] : [];
  const paperKeys = rawKeys.filter((k): k is LegalPaperType => Boolean(k));

  const isVerified = property.isLegalVerified;
  const displayedKeys = showAllPapers ? paperKeys : paperKeys.slice(0, 4);

  const togglePaper = (key: string) => {
    setExpandedPapers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Header compact & rangé */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-2xl shrink-0">
            <FileText className="w-5 h-5 text-[#1E3A8A]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E3A8A] font-['Playfair_Display',serif]">
              {t('immo_legal_title', 'Documents & Statut Foncier')}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t('immo_legal_declared_count', '{{count}} document(s) déclaré(s) au dossier', { count: paperKeys.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Badge vérification globale */}
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('immo_legal_verified', 'Vérifié')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
              <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('immo_legal_declarative', 'Déclaratif')}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleToggle}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 active:scale-95"
            aria-label={isOpen ? t('immo_finance_hide', 'Masquer') : t('immo_finance_show', 'Afficher')}
          >
            <span>{isOpen ? t('immo_finance_hide', 'Masquer') : t('immo_finance_show', 'Afficher')}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          {/* Grille compacte des documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedKeys.map((paperKey, index) => {
              const config = LEGAL_PAPER_CONFIGS[paperKey];
              if (!config) return null;
              const isItemExpanded = expandedPapers[paperKey] ?? (paperKeys.length <= 2);

              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-2xl border transition-all text-left ${
                    isVerified
                      ? 'bg-slate-50/80 border-slate-200 hover:border-blue-300'
                      : 'bg-amber-50/30 border-amber-200/70 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        {t(`immo_doc_${paperKey}_short`, config.short)}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {t(`immo_doc_${paperKey}_title`, config.title)}
                      </h3>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isVerified ? t('immo_legal_verified', 'Vérifié') : t('immo_legal_declarative', 'Déclaratif')}
                    </span>
                  </div>

                  {/* Scope & Conseils juridiques */}
                  {isItemExpanded ? (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-2 text-xs">
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        <strong className="text-slate-800">{t('immo_legal_scope_label', 'Portée légale :')} </strong>
                        {t(`immo_doc_${paperKey}_scope`, config.scope)}
                      </p>
                      <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-100 text-emerald-900 text-[11px] leading-tight">
                        <strong>{t('immo_legal_advice_label', 'Conseil aux acquéreurs :')} </strong>
                        {t(`immo_doc_${paperKey}_advice`, config.buyerAdvice)}
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => togglePaper(paperKey)}
                    className="mt-2 text-[11px] font-bold text-[#1E3A8A] hover:text-[#F59E0B] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isItemExpanded ? t('immo_legal_hide_details', 'Masquer détails') : t('immo_legal_details', 'Détails juridiques')}</span>
                    {isItemExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bouton pour afficher tous les documents si > 4 */}
          {paperKeys.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllPapers(!showAllPapers)}
              className="text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>{showAllPapers ? t('immo_legal_show_less', 'Afficher moins de documents') : t('immo_legal_see_all_docs', 'Voir les {{count}} documents déclarés', { count: paperKeys.length })}</span>
              {showAllPapers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Cadre Légal Notarié & Information Juridique */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 block text-[11px]">
                {t('immo_legal_framework_title', 'Cadre Légal Notarié & Code civil algérien')}
              </span>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('immo_legal_framework_desc', 'En Algérie, tout transfert de propriété immobilière doit obligatoirement être instrumenté par acte notarié et publié à la conservation foncière (Loi 75-74).')}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700 truncate max-w-[80%]">
            {paperKeys.map((k) => LEGAL_PAPER_CONFIGS[k] ? t(`immo_doc_${k}_short`, LEGAL_PAPER_CONFIGS[k].short) : null).filter(Boolean).join(', ')} • {isVerified ? t('immo_legal_verified_by_team', 'Vérifié par l’équipe') : t('immo_legal_owner_declarative', 'Déclaratif propriétaire')}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className="text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline cursor-pointer shrink-0 ml-2"
          >
            {t('immo_finance_unfold', 'Déplier')}
          </button>
        </div>
      )}
    </div>
  );
};
