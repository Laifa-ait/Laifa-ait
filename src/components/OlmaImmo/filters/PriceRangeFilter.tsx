import React, { useState, useEffect } from 'react';
import { Coins, AlertCircle } from 'lucide-react';
import { ListingType } from '../../../types/realEstate';
import { OlmaInput } from '../primitives/OlmaInput';

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  listingType?: ListingType;
  onChange: (min: number | undefined, max: number | undefined) => void;
  idPrefix?: string;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  listingType = 'sale',
  onChange,
  idPrefix = 'price',
}) => {
  const [localMin, setLocalMin] = useState<string>(minPrice ? String(minPrice) : '');
  const [localMax, setLocalMax] = useState<string>(maxPrice ? String(maxPrice) : '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const minStr = minPrice ? String(minPrice) : '';
    const maxStr = maxPrice ? String(maxPrice) : '';
    setLocalMin(minStr);
    setLocalMax(maxStr);
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      setError('Le prix minimum ne peut pas dépasser le prix maximum');
    } else {
      setError(null);
    }
  }, [minPrice, maxPrice]);

  const validateAndPropagate = (minStr: string, maxStr: string) => {
    const minVal = minStr.trim() === '' ? undefined : Number(minStr);
    const maxVal = maxStr.trim() === '' ? undefined : Number(maxStr);

    if (minVal !== undefined && (isNaN(minVal) || minVal < 0)) {
      setError('Le prix minimum doit être un montant valide (>= 0)');
      return;
    }
    if (maxVal !== undefined && (isNaN(maxVal) || maxVal < 0)) {
      setError('Le prix maximum doit être un montant valide (> 0)');
      return;
    }
    if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
      setError('Le prix minimum ne peut pas dépasser le prix maximum');
      return;
    }

    setError(null);
    onChange(minVal, maxVal);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setLocalMin(val);
    validateAndPropagate(val, localMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setLocalMax(val);
    validateAndPropagate(localMin, val);
  };

  const formatPeriodLabel = () => {
    if (listingType === 'rent_short') return 'par nuit';
    if (listingType === 'rent_long') return 'par mois';
    return 'montant total';
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-amber-600" />
          <span>Budget DZD ({formatPeriodLabel()})</span>
        </label>
        {error && (
          <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OlmaInput
          id={`${idPrefix}-min`}
          label="Prix Min (DA)"
          placeholder="Ex: 5 000 000"
          value={localMin}
          onChange={handleMinChange}
          size="md"
          radius="xl"
          fullWidth
          error={error && localMin && localMax && Number(localMin) > Number(localMax) ? error : undefined}
        />
        <OlmaInput
          id={`${idPrefix}-max`}
          label="Prix Max (DA)"
          placeholder="Ex: 25 000 000"
          value={localMax}
          onChange={handleMaxChange}
          size="md"
          radius="xl"
          fullWidth
        />
      </div>
    </div>
  );
};
