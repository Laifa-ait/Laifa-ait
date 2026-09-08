import React from 'react';
import { PropertyType } from '../../../types/realEstate';

interface PropertySpecsFilterProps {
  propertyType?: PropertyType;
  minRooms?: number;
  minArea?: number;
  onPropertyTypeChange: (type: PropertyType | undefined) => void;
  onMinRoomsChange: (rooms: number | undefined) => void;
  onMinAreaChange: (area: number | undefined) => void;
}

const PROPERTY_TYPES: Array<{ type: PropertyType; label: string }> = [
  { type: 'apartment', label: 'Appartement' },
  { type: 'villa', label: 'Villa' },
  { type: 'house', label: 'Maison' },
  { type: 'studio', label: 'Studio' },
  { type: 'commercial', label: 'Commerce' },
  { type: 'land', label: 'Terrain' },
  { type: 'office', label: 'Bureau' },
];

export const PropertySpecsFilter: React.FC<PropertySpecsFilterProps> = ({
  propertyType,
  minRooms,
  minArea,
  onPropertyTypeChange,
  onMinRoomsChange,
  onMinAreaChange,
}) => {
  return (
    <div className="space-y-4 w-full">
      {/* Property Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
          Type de propriété
        </label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((p) => {
            const isSelected = propertyType === p.type;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => onPropertyTypeChange(isSelected ? undefined : p.type)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E]'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rooms & Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
            Nombre de pièces minimum
          </label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onMinRoomsChange(minRooms === num ? undefined : num)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  minRooms === num
                    ? 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E]'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                F{num}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
            Surface minimale (m²)
          </label>
          <input
            type="number"
            placeholder="Ex: 100"
            min="0"
            value={minArea || ''}
            onChange={(e) => onMinAreaChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-[#FAF8F5] border border-stone-200 text-stone-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D281E]"
          />
        </div>
      </div>
    </div>
  );
};
