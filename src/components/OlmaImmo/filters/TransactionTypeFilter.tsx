import React from 'react';
import { Tag, Key, Calendar } from 'lucide-react';
import { ListingType } from '../../../types/realEstate';

interface TransactionTypeFilterProps {
  value?: ListingType;
  onChange: (type: ListingType | undefined) => void;
}

const TRANSACTION_TYPES: Array<{
  type: ListingType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: 'sale', label: 'Acheter', icon: Tag },
  { type: 'rent_long', label: 'Louer', icon: Key },
  { type: 'rent_short', label: 'Séjour court', icon: Calendar },
];

export const TransactionTypeFilter: React.FC<TransactionTypeFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-[#1E3A8A]" />
        <span>Type de transaction</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {TRANSACTION_TYPES.map((t) => {
          const Icon = t.icon;
          const isSelected = value === t.type;
          return (
            <button
              key={t.type}
              type="button"
              onClick={() => onChange(isSelected ? undefined : t.type)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
