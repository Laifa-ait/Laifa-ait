import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { PublicPropertyDTO } from '../../../types/realEstate';
import { PropertyMeta } from '../primitives/PropertyMeta';

interface DetailSpecsProps {
  property: PublicPropertyDTO;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export const DetailSpecs: React.FC<DetailSpecsProps> = ({
  property,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-2xl shrink-0">
            <Layers className="w-5 h-5 text-[#1E3A8A]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E3A8A] font-['Playfair_Display',serif]">
              Caractéristiques & Fiche Technique
            </h2>
            <p className="text-[11px] text-slate-500">
              Superficie, pièces et configuration du bien
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 active:scale-95"
          aria-label={isOpen ? 'Masquer la catégorie Caractéristiques' : 'Afficher la catégorie Caractéristiques'}
        >
          <span>{isOpen ? 'Masquer' : 'Afficher'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </button>
      </div>

      {isOpen ? (
        <PropertyMeta
          propertyType={property.propertyType}
          rooms={property.rooms}
          bathrooms={property.bathrooms}
          areaSquareMeters={property.areaSquareMeters}
          layout="grid"
        />
      ) : (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700">
            {property.areaSquareMeters ? `${property.areaSquareMeters} m²` : ''}
            {property.rooms ? ` • F${property.rooms}` : ''}
            {property.bathrooms ? ` • ${property.bathrooms} SDB` : ''}
            {` • ${property.propertyType}`}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className="text-xs font-bold text-[#1E3A8A] hover:text-[#F59E0B] hover:underline cursor-pointer"
          >
            Afficher les détails
          </button>
        </div>
      )}
    </div>
  );
};

