import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { ALGERIA_WILAYAS } from '../../../constants/wilayas';
import { getCommunesForWilaya } from '../../../data/algerianCommunesDatabase';
import { OlmaSelect } from '../primitives/OlmaSelect';

interface LocationFilterSelectsProps {
  wilaya?: string;
  commune?: string;
  onWilayaChange: (wilaya: string | undefined) => void;
  onCommuneChange: (commune: string | undefined) => void;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'row' | 'col';
  idPrefix?: string;
}

export const LocationFilterSelects: React.FC<LocationFilterSelectsProps> = ({
  wilaya,
  commune,
  onWilayaChange,
  onCommuneChange,
  size = 'md',
  layout = 'row',
  idPrefix = 'filter',
}) => {
  const availableCommunes = useMemo(() => {
    if (!wilaya || wilaya === 'all') return [];
    return getCommunesForWilaya(wilaya);
  }, [wilaya]);

  const handleWilayaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const nextWilaya = val === 'all' || !val ? undefined : val;
    onWilayaChange(nextWilaya);

    // Reset commune when wilaya changes
    if (commune) {
      const isCommuneStillValid = nextWilaya
        ? getCommunesForWilaya(nextWilaya).some((c) => c.name === commune)
        : false;
      if (!isCommuneStillValid) {
        onCommuneChange(undefined);
      }
    }
  };

  const handleCommuneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onCommuneChange(val === 'all' || !val ? undefined : val);
  };

  return (
    <div
      className={
        layout === 'row'
          ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 w-full'
          : 'flex flex-col gap-3 w-full'
      }
    >
      <OlmaSelect
        id={`${idPrefix}-wilaya`}
        label="Wilaya (Algérie)"
        leftIcon={<MapPin className="w-4 h-4 text-emerald-700" />}
        value={wilaya || 'all'}
        onChange={handleWilayaSelect}
        size={size}
        radius="xl"
        fullWidth
      >
        <option value="all">Toutes les wilayas (58)</option>
        {ALGERIA_WILAYAS.map((w) => (
          <option key={w.code} value={w.name}>
            {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ''}
          </option>
        ))}
      </OlmaSelect>

      <OlmaSelect
        id={`${idPrefix}-commune`}
        label={
          <span>
            Commune{' '}
            {wilaya && availableCommunes.length > 0 && (
              <span className="text-[11px] font-normal text-stone-500">
                ({availableCommunes.length} disp.)
              </span>
            )}
          </span>
        }
        value={commune || 'all'}
        onChange={handleCommuneSelect}
        disabled={!wilaya || availableCommunes.length === 0}
        size={size}
        radius="xl"
        fullWidth
      >
        <option value="all">
          {!wilaya
            ? "Sélectionnez d'abord une wilaya"
            : availableCommunes.length === 0
            ? 'Aucune commune trouvée'
            : `Toutes les communes de ${wilaya}`}
        </option>
        {availableCommunes.map((c) => (
          <option key={`${c.name}-${c.postal_code}`} value={c.name}>
            {c.name} {c.name_ar ? `(${c.name_ar})` : ''}
          </option>
        ))}
      </OlmaSelect>
    </div>
  );
};
