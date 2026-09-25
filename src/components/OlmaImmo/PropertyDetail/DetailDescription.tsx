import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Snowflake,
  Flame,
  Car,
  Trees,
  Droplets,
  Layers,
  Sofa,
  CheckCircle2,
} from 'lucide-react';
import { PublicPropertyDTO } from '../../../types/realEstate';

interface DetailDescriptionProps {
  property: PublicPropertyDTO;
  isDescriptionOpen?: boolean;
  onToggleDescriptionOpen?: () => void;
  isFeaturesOpen?: boolean;
  onToggleFeaturesOpen?: () => void;
}

export const DetailDescription: React.FC<DetailDescriptionProps> = ({
  property,
  isDescriptionOpen: controlledDescOpen,
  onToggleDescriptionOpen,
  isFeaturesOpen: controlledFeaturesOpen,
  onToggleFeaturesOpen,
}) => {
  const { t } = useTranslation();
  const [internalDescOpen, setInternalDescOpen] = useState(true);
  const [internalFeaturesOpen, setInternalFeaturesOpen] = useState(true);

  const isDescOpen = controlledDescOpen !== undefined ? controlledDescOpen : internalDescOpen;
  const isFeaturesSectionOpen = controlledFeaturesOpen !== undefined ? controlledFeaturesOpen : internalFeaturesOpen;

  const handleToggleDesc = () => {
    if (onToggleDescriptionOpen) {
      onToggleDescriptionOpen();
    } else {
      setInternalDescOpen(!internalDescOpen);
    }
  };

  const handleToggleFeatures = () => {
    if (onToggleFeaturesOpen) {
      onToggleFeaturesOpen();
    } else {
      setInternalFeaturesOpen(!internalFeaturesOpen);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getFeatureIcon = (featureName: string) => {
    const lower = featureName.toLowerCase();
    if (lower.includes('clim') || lower.includes('air')) return <Snowflake className="w-3.5 h-3.5 text-sky-600" />;
    if (lower.includes('chauffage') || lower.includes('gaz')) return <Flame className="w-3.5 h-3.5 text-amber-600" />;
    if (lower.includes('parking') || lower.includes('garage')) return <Car className="w-3.5 h-3.5 text-indigo-600" />;
    if (lower.includes('jardin') || lower.includes('terrasse') || lower.includes('balcon')) return <Trees className="w-3.5 h-3.5 text-emerald-600" />;
    if (lower.includes('eau') || lower.includes('bâche') || lower.includes('piscine')) return <Droplets className="w-3.5 h-3.5 text-blue-600" />;
    if (lower.includes('meubl')) return <Sofa className="w-3.5 h-3.5 text-purple-600" />;
    if (lower.includes('ascenseur')) return <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const features = property.features || [];
  const displayedFeatures = showAllFeatures ? features : features.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Description */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#1E3A8A] font-['Playfair_Display',serif] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <span>{t('immo_desc_title', 'Description du bien')}</span>
          </h2>

          <button
            type="button"
            onClick={handleToggleDesc}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 active:scale-95"
            aria-label={isDescOpen ? t('immo_desc_hide_aria', 'Masquer la description') : t('immo_desc_show_aria', 'Afficher la description')}
          >
            <span>{isDescOpen ? t('immo_finance_hide', 'Masquer') : t('immo_finance_show', 'Afficher')}</span>
            {isDescOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>

        {isDescOpen ? (
          <div className="relative">
            {property.description?.trim() ? (
              <p
                className={`text-slate-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line ${
                  !isExpanded && property.description.length > 300 ? 'line-clamp-4' : ''
                }`}
              >
                {property.description}
              </p>
            ) : (
              <p className="text-stone-400 italic text-xs">
                {t('immo_desc_empty', "Aucune description détaillée n'a été rédigée pour cette annonce.")}
              </p>
            )}

            {property.description && property.description.length > 300 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? t('immo_desc_collapse', 'Réduire') : t('immo_desc_read_more', 'Lire la suite')}
                className="mt-2 text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isExpanded ? t('immo_desc_collapse', 'Réduire') : t('immo_desc_read_more', 'Lire la suite')}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="truncate max-w-[80%] text-slate-600 italic">
              {property.description?.slice(0, 75) || 'Description...'}...
            </span>
            <button
              type="button"
              onClick={handleToggleDesc}
              className="text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline cursor-pointer shrink-0 ml-2 rtl:mr-2 rtl:ml-0"
            >
              {t('immo_finance_unfold', 'Déplier')}
            </button>
          </div>
        )}
      </div>

      {/* Amenities & Features - Modern Compact Grid */}
      {features.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1E3A8A] font-['Playfair_Display',serif] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>{t('immo_features_title', 'Équipements & Prestations')}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {features.length} {t('immo_elements', 'éléments')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleFeatures}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 active:scale-95"
              aria-label={isFeaturesSectionOpen ? t('immo_features_hide_aria', 'Masquer les équipements') : t('immo_features_show_aria', 'Afficher les équipements')}
            >
              <span>{isFeaturesSectionOpen ? t('immo_finance_hide', 'Masquer') : t('immo_finance_show', 'Afficher')}</span>
              {isFeaturesSectionOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>

          {isFeaturesSectionOpen ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {displayedFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-slate-200 shrink-0">
                      {getFeatureIcon(feat)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate" title={feat}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              {features.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  aria-expanded={showAllFeatures}
                  aria-label={showAllFeatures ? t('immo_features_show_less', 'Afficher moins') : `${t('immo_features_show_less', 'Afficher')} ${features.length}`}
                  className="mt-2 text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showAllFeatures ? t('immo_features_show_less', 'Afficher moins') : `${t('immo_finance_show', 'Afficher')} ${features.length} ${t('immo_elements', 'équipements')}`}</span>
                  {showAllFeatures ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-700 truncate max-w-[80%]">
                {features.slice(0, 4).join(', ')}{features.length > 4 ? ` (+${features.length - 4} ${t('immo_other_items', 'autres')})` : ''}
              </span>
              <button
                type="button"
                onClick={handleToggleFeatures}
                className="text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline cursor-pointer shrink-0 ml-2 rtl:mr-2 rtl:ml-0"
              >
                {t('immo_finance_unfold', 'Déplier')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
