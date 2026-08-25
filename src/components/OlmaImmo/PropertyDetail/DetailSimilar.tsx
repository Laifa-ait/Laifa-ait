import React from 'react';
import { Property } from '../../../types/realEstate';
import { PropertyCard } from '../PropertyCard';

interface DetailSimilarProps {
  similarProperties: Property[];
}

export const DetailSimilar: React.FC<DetailSimilarProps> = ({ similarProperties }) => {
  if (similarProperties.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-[#e8e2d4]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
          Biens similaires recommandés
        </h2>
        <span className="text-xs text-slate-500 font-medium">
          {similarProperties.length} annonces
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
