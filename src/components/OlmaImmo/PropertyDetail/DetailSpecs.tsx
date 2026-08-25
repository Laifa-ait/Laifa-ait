import React from 'react';
import { Bed, Maximize, Bath, Building2 } from 'lucide-react';
import { Property } from '../../../types/realEstate';

interface DetailSpecsProps {
  property: Property;
}

export const DetailSpecs: React.FC<DetailSpecsProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#e8e2d4] shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      <div className="space-y-1 p-2">
        <Bed className="w-5 h-5 text-[#1a3831] mx-auto" />
        <span className="block text-xs text-slate-500 font-medium">Pièces</span>
        <span className="font-bold text-[#1a3831] text-base sm:text-lg">F{property.rooms}</span>
      </div>

      <div className="space-y-1 p-2 sm:border-l border-[#f0eae0]">
        <Maximize className="w-5 h-5 text-[#1a3831] mx-auto" />
        <span className="block text-xs text-slate-500 font-medium">Superficie</span>
        <span className="font-bold text-[#1a3831] text-base sm:text-lg">{property.areaSquareMeters} m²</span>
      </div>

      <div className="space-y-1 p-2 border-t sm:border-t-0 sm:border-l border-[#f0eae0]">
        <Bath className="w-5 h-5 text-[#1a3831] mx-auto" />
        <span className="block text-xs text-slate-500 font-medium">Salles de bain</span>
        <span className="font-bold text-[#1a3831] text-base sm:text-lg">{property.bathrooms || 1}</span>
      </div>

      <div className="space-y-1 p-2 border-t sm:border-t-0 sm:border-l border-[#f0eae0]">
        <Building2 className="w-5 h-5 text-[#1a3831] mx-auto" />
        <span className="block text-xs text-slate-500 font-medium">Catégorie</span>
        <span className="font-bold text-[#1a3831] text-sm sm:text-base capitalize line-clamp-1">
          {property.propertyType}
        </span>
      </div>
    </div>
  );
};
