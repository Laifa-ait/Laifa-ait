import React, { useMemo } from 'react';
import { MapPin, Building } from 'lucide-react';
import { ALGERIA_WILAYAS_58, getCommunesForWilaya } from '../../data/artisanGeo';

interface WilayaCommuneSelectorProps {
  selectedWilaya: string;
  selectedCommune: string;
  onWilayaChange: (wilaya: string, wilayaCode: string) => void;
  onCommuneChange: (commune: string) => void;
  required?: boolean;
  disabled?: boolean;
  wilayaLabel?: string;
  communeLabel?: string;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  allowAllOption?: boolean;
  allOptionLabel?: string;
}

export const WilayaCommuneSelector: React.FC<WilayaCommuneSelectorProps> = ({
  selectedWilaya,
  selectedCommune,
  onWilayaChange,
  onCommuneChange,
  required = false,
  disabled = false,
  wilayaLabel = 'Wilaya (58 Wilayas)',
  communeLabel = 'Commune',
  layout = 'horizontal',
  className = '',
  allowAllOption = false,
  allOptionLabel = 'Toutes les wilayas',
}) => {
  const communes = useMemo(() => {
    if (!selectedWilaya) return [];
    return getCommunesForWilaya(selectedWilaya);
  }, [selectedWilaya]);

  const handleWilayaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      onWilayaChange('', '');
      onCommuneChange('');
      return;
    }

    const found = ALGERIA_WILAYAS_58.find((w) => w.fullName === value || w.name === value);
    const code = found ? found.code : '';
    const name = found ? found.name : value;
    onWilayaChange(name, code);
    onCommuneChange(''); // Reset commune when wilaya changes
  };

  return (
    <div
      className={`${
        layout === 'horizontal' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'
      } ${className}`}
    >
      {/* Wilaya Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>{wilayaLabel}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            id="artisan-select-wilaya"
            value={selectedWilaya}
            onChange={handleWilayaSelect}
            disabled={disabled}
            required={required}
            className="w-full h-11 px-3.5 pr-8 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">{allowAllOption ? allOptionLabel : 'Sélectionner une wilaya...'}</option>
            {ALGERIA_WILAYAS_58.map((w) => (
              <option key={w.code} value={w.name}>
                {w.fullName}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ▼
          </div>
        </div>
      </div>

      {/* Commune Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-amber-500" />
          <span>{communeLabel}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            id="artisan-select-commune"
            value={selectedCommune}
            onChange={(e) => onCommuneChange(e.target.value)}
            disabled={disabled || !selectedWilaya || communes.length === 0}
            required={required}
            className="w-full h-11 px-3.5 pr-8 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedWilaya
                ? 'Choisissez d\'abord une wilaya'
                : allowAllOption
                ? 'Toutes les communes'
                : 'Sélectionner une commune...'}
            </option>
            {communes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ▼
          </div>
        </div>
      </div>
    </div>
  );
};
