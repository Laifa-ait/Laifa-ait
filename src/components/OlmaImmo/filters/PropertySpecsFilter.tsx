import React from 'react';
import { Building2, Castle, Home, BedDouble, Store, Trees, Briefcase } from 'lucide-react';
import { PropertyType } from '../../../types/realEstate';
import { OlmaInput } from '../primitives/OlmaInput';

interface PropertySpecsFilterProps {
  propertyType?: PropertyType;
  minRooms?: number;
  minArea?: number;
  onPropertyTypeChange: (type: PropertyType | undefined) => void;
  onMinRoomsChange: (rooms: number | undefined) => void;
  onMinAreaChange: (area: number | undefined) => void;
}

const PROPERTY_TYPES: Array<{
  type: PropertyType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: 'apartment', label: 'Appartement', icon: Building2 },
  { type: 'villa', label: 'Villa', icon: Castle },
  { type: 'house', label: 'Maison', icon: Home },
  { type: 'studio', label: 'Studio', icon: BedDouble },
  { type: 'commercial', label: 'Commerce', icon: Store },
  { type: 'land', label: 'Terrain', icon: Trees },
  { type: 'office', label: 'Bureau', icon: Briefcase },
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
            const Icon = p.icon;
            const isSelected = propertyType === p.type;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => onPropertyTypeChange(isSelected ? undefined : p.type)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rooms & Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-end">
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
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                F{num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <OlmaInput
            id="filter-min-area"
            label="Surface minimale"
            type="number"
            min="0"
            placeholder="Ex: 100"
            value={minArea || ''}
            onChange={(e) => onMinAreaChange(e.target.value ? Number(e.target.value) : undefined)}
            size="md"
            radius="xl"
            fullWidth
            rightIcon={<span className="text-[11px] font-bold text-slate-400">m²</span>}
          />
        </div>
      </div>
    </div>
  );
};
