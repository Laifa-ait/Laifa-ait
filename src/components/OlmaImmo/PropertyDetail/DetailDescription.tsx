import React, { useState } from 'react';
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
import { Property } from '../../../types/realEstate';

interface DetailDescriptionProps {
  property: Property;
}

export const DetailDescription: React.FC<DetailDescriptionProps> = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getFeatureIcon = (featureName: string) => {
    const lower = featureName.toLowerCase();
    if (lower.includes('clim') || lower.includes('air')) return <Snowflake className="w-4 h-4 text-sky-600" />;
    if (lower.includes('chauffage') || lower.includes('gaz')) return <Flame className="w-4 h-4 text-amber-600" />;
    if (lower.includes('parking') || lower.includes('garage')) return <Car className="w-4 h-4 text-indigo-600" />;
    if (lower.includes('jardin') || lower.includes('terrasse')) return <Trees className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('eau') || lower.includes('bâche')) return <Droplets className="w-4 h-4 text-blue-600" />;
    if (lower.includes('meubl')) return <Sofa className="w-4 h-4 text-purple-600" />;
    if (lower.includes('ascenseur')) return <Layers className="w-4 h-4 text-[#1a3831]" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  };

  const features = property.features || [];
  const displayedFeatures = showAllFeatures ? features : features.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[#1a3831]" />
          <span>Description du bien</span>
        </h2>

        <div className="relative">
          <p
            className={`text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line ${
              !isExpanded && property.description.length > 300 ? 'line-clamp-4' : ''
            }`}
          >
            {property.description}
          </p>

          {property.description.length > 300 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-xs font-bold text-[#1a3831] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Réduire' : 'Lire la suite'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Amenities & Features */}
      {features.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#1a3831]" />
            <span>Équipements & Prestations ({features.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-[#f0eae0]"
              >
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-[#e8e2d4] shrink-0">
                  {getFeatureIcon(feat)}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{feat}</span>
              </div>
            ))}
          </div>

          {features.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="mt-2 text-xs font-bold text-[#1a3831] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showAllFeatures ? 'Afficher moins' : `Afficher les ${features.length} équipements`}</span>
              {showAllFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
