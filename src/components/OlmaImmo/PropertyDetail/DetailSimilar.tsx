import React from 'react';
import { useTranslation } from 'react-i18next';
import { PublicPropertyDTO } from '../../../types/realEstate';
import { PropertyCard } from '../PropertyCard';

interface DetailSimilarProps {
  similarProperties: PublicPropertyDTO[];
}

export const DetailSimilar: React.FC<DetailSimilarProps> = ({ similarProperties }) => {
  const { t } = useTranslation();

  if (similarProperties.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] font-['Playfair_Display',serif]">
          {t('immo_similar_title', 'Biens similaires recommandés')}
        </h2>
        <span className="text-xs text-slate-500 font-medium">
          {t('immo_similar_count', '{{count}} annonces', { count: similarProperties.length })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarProperties.map((prop) => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </div>
  );
};
