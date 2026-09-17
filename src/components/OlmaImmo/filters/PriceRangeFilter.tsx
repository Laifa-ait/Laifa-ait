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

  const getCentimesHelper = (daStr: string) => {
    const val = Number(daStr);
    if (!val || isNaN(val) || val <= 0) return null;
    const millionsCentimes = val / 10000;
    if (millionsCentimes >= 1000) {
      const milliards = (millionsCentimes / 1000).toFixed(millionsCentimes % 1000 === 0 ? 0 : 2);
      return `≈ ${milliards} Milliard${Number(milliards) > 1 ? 's' : ''} cts`;
    }
    return `≈ ${Math.round(millionsCentimes).toLocaleString('fr-FR')} Millions cts`;
  };

  const presets =
    listingType === 'rent_long'
      ? [
          { label: '< 50K', min: undefined, max: 50000 },
          { label: '50K - 100K', min: 50000, max: 100000 },
          { label: '100K - 200K', min: 100000, max: 200000 },
          { label: '> 200K', min: 200000, max: undefined },
        ]
      : listingType === 'rent_short'
      ? [
          { label: '< 8K /nuit', min: undefined, max: 8000 },
          { label: '8K - 15K', min: 8000, max: 15000 },
          { label: '15K - 30K', min: 15000, max: 30000 },
          { label: '> 30K /nuit', min: 30000, max: undefined },
        ]
      : [
          { label: '< 15M DA', min: undefined, max: 15000000 },
          { label: '15M - 35M', min: 15000000, max: 35000000 },
          { label: '35M - 60M', min: 35000000, max: 60000000 },
          { label: '> 60M DA', min: 60000000, max: undefined },
        ];

  const handleApplyPreset = (min?: number, max?: number) => {
    const minStr = min !== undefined ? String(min) : '';
    const maxStr = max !== undefined ? String(max) : '';
    setLocalMin(minStr);
    setLocalMax(maxStr);
    validateAndPropagate(minStr, maxStr);
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

      {/* Quick budget presets */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const isSelected =
            (preset.min === undefined ? !localMin : localMin === String(preset.min)) &&
            (preset.max === undefined ? !localMax : localMax === String(preset.max));
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                isSelected ? handleApplyPreset(undefined, undefined) : handleApplyPreset(preset.min, preset.max)
              }
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <OlmaInput
            id={`${idPrefix}-min`}
            label="Prix Min (DA)"
            placeholder="Ex: 5 000 000"
            value={localMin}
            onChange={handleMinChange}
            size="md"
            radius="xl"
            fullWidth
            rightIcon={<span className="text-[11px] font-bold text-slate-400">DA</span>}
            error={error && localMin && localMax && Number(localMin) > Number(localMax) ? error : undefined}
          />
          {localMin && getCentimesHelper(localMin) && (
            <p className="text-[10px] font-medium text-emerald-700 mt-1 px-1">
              {getCentimesHelper(localMin)}
            </p>
          )}
        </div>
        <div>
          <OlmaInput
            id={`${idPrefix}-max`}
            label="Prix Max (DA)"
            placeholder="Ex: 25 000 000"
            value={localMax}
            onChange={handleMaxChange}
            size="md"
            radius="xl"
            fullWidth
            rightIcon={<span className="text-[11px] font-bold text-slate-400">DA</span>}
          />
          {localMax && getCentimesHelper(localMax) && (
            <p className="text-[10px] font-medium text-emerald-700 mt-1 px-1">
              {getCentimesHelper(localMax)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
