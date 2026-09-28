import React from 'react';
import { Tag, Key, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ListingType } from '../../../types/realEstate';

interface TransactionTypeFilterProps {
  value?: ListingType;
  onChange: (type: ListingType | undefined) => void;
}

const TRANSACTION_TYPES: Array<{
  type: ListingType;
  key: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: 'sale', key: 'immo_buy', defaultLabel: 'Acheter', icon: Tag },
  { type: 'rent_long', key: 'immo_rent', defaultLabel: 'Louer', icon: Key },
  { type: 'rent_short', key: 'immo_short_stay', defaultLabel: 'Séjour court', icon: Calendar },
];

export const TransactionTypeFilter: React.FC<TransactionTypeFilterProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-[#1E3A8A]" />
        <span>{t('immo_transaction_type', 'Type de transaction')}</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {TRANSACTION_TYPES.map((item) => {
          const Icon = item.icon;
          const isSelected = value === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onChange(isSelected ? undefined : item.type)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{t(item.key, item.defaultLabel)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
